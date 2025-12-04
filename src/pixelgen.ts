import path from 'path';
import fs from 'fs/promises';
import { timestampId, ensureDir, getLocalArtifactUrl } from './utils';
import { storage } from './storage';
import { config } from './config';
import { capture } from './screenshot';
import { writeReactBundle, ReactBundle } from './react-host';
import { compareSites } from './comparator';
import { buildFeedback, buildSectionFeedback } from './llm-feedback';
import { DeviceArtifacts } from './gemini';
import { scanBaseAssets, injectAssetsIntoHtml, injectCspForAssets, AssetScanResult } from './asset-scan';
import { chromium } from 'playwright';
import crypto from 'crypto';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export type PixelGenOptions = {
    baseUrl: string;
    stack?: string;
    devices?: ('desktop' | 'mobile')[];
    minSimilarity?: number;
    maxIterations?: number;
    fullPage?: boolean;
    headless?: boolean;
    threshold?: number;
};

export type IterationResult = {
    i: number;
    similarities: Record<string, number>;
    localUrl: string;
};

export type RunSummary = {
    jobId: string;
    artifactsUrl: string;
    iterations: IterationResult[];
    finalLocalUrl: string;
    stopReason: string;
};

const GENERATOR_API_URL = process.env.GENERATOR_API_URL || 'http://localhost:8000';

const withRetry = async <T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 500): Promise<T> => {
    let lastErr: any;
    for (let i = 0; i <= retries; i++) {
        try { return await fn(); } catch (e) {
            lastErr = e;
            if (i === retries) break;
            const delay = baseDelayMs * Math.pow(2, i);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw lastErr;
};

export const runPixelGen = async (options: PixelGenOptions): Promise<RunSummary> => {
    const jobId = timestampId();
    const runDir = path.join(config.outputDir, 'pixelgen', jobId);
    await ensureDir(runDir);

    const devices = options.devices || ['desktop', 'mobile'];
    // Phased iteration configuration
    const DESKTOP_PHASE_ITERS = Number(process.env.GENERATOR_DESKTOP_ITERS || 2);
    const MOBILE_PHASE_ITERS = Number(process.env.GENERATOR_MOBILE_ITERS || 2);
    const JOINT_PHASE_ITERS = Number(process.env.GENERATOR_JOINT_ITERS || 2);
    type Phase = 'desktop' | 'mobile' | 'joint';
    let phase: Phase = 'desktop';
    let phaseRemaining = DESKTOP_PHASE_ITERS;
    const minSimilarity = options.minSimilarity ?? 0.90;
    const maxIterations = options.maxIterations ?? 5;
    const stack = options.stack || 'react_tailwind';

    // Convergence settings
    const STALL_THRESHOLD = 0.005; // 0.5% improvement required
    const STALL_ITERATIONS = 2;    // Stop if no improvement for 2 consecutive iterations

    const iterations: IterationResult[] = [];
    let currentBundle: ReactBundle | undefined;
    // Track best-so-far bundle and scores to prevent regressions on locked metrics
    let bestBundle: ReactBundle | undefined;
    const bestScores: Record<'desktop'|'mobile', { pixelmatch: number; ssim: number }> = {
        desktop: { pixelmatch: 0, ssim: 0 },
        mobile: { pixelmatch: 0, ssim: 0 },
    };
    const pixelLocked: Record<'desktop'|'mobile', boolean> = { desktop: false, mobile: false };
    const ssimLocked: Record<'desktop'|'mobile', boolean> = { desktop: false, mobile: false };
    const LOCK_EPSILON = Number(process.env.LOCK_EPSILON || 0.001);
    let structureLock: string[] | undefined;
    let stopReason = '';

    // Track best similarity to detect stalls
    let bestSimilarity = 0;
    let stallCounter = 0;

    // Iteration 0: Capture Base & Create Initial Bundle
    console.log(`[PixelGen] Starting run ${jobId} for ${options.baseUrl}`);

    // Capture base screenshots
    const baseScreenshots: Record<string, string> = {};
    for (const device of devices) {
        const result = await capture(options.baseUrl, {
            device,
            fullPage: options.fullPage,
            outputDir: path.join(runDir, 'iteration-00', device, 'base'), // Temp location or just use return path
        });
        // Move to structured path
        const targetPath = path.join(runDir, 'iteration-00', device, 'base.png');
        await ensureDir(path.dirname(targetPath));
        await fs.rename(result.path, targetPath);
        baseScreenshots[device] = targetPath;
    }

    // Generate initial code (using desktop base screenshot)
    const desktopBase = baseScreenshots['desktop'] || Object.values(baseScreenshots)[0];
    const desktopBaseBuffer = await fs.readFile(desktopBase);
    const desktopBaseDataUrl = `data:image/png;base64,${desktopBaseBuffer.toString('base64')}`;

    // Scan base URL assets (fonts/images/typography) once and reuse across iterations.
    // We do this BEFORE the initial generate so we can pass sectionSpecs to the generator.
    console.log('[PixelGen] Scanning base site assets (fonts/images/typography)...');
    const assetsScanDir = path.join(runDir, 'base-assets');
    await ensureDir(assetsScanDir);
    let baseAssets: AssetScanResult | undefined;
    try {
        baseAssets = await scanBaseAssets(options.baseUrl, assetsScanDir, { fullPage: options.fullPage, headless: options.headless });
        console.log('[PixelGen] Asset scan complete.');
    } catch (e) {
        console.warn('[PixelGen] Asset scan failed:', e instanceof Error ? e.message : String(e));
    }

    console.log('[PixelGen] Requesting initial generation...');
    // Multi-turn chat with generator is optional; default to single-shot unless enabled via env
    const useChat = (process.env.GENERATOR_USE_CHAT || '').toLowerCase() === 'true';
    // Maintain chat history if enabled to keep a single multi-turn conversation with the generator
    type ChatMessage = { role: 'assistant' | 'user'; content: any };
    const chatHistory: ChatMessage[] = [];
    const capHistory = () => {
        const MAX_TURNS = 8; // keep last 8 turns (~4 iterations of user-only turns)
        if (chatHistory.length > MAX_TURNS) {
            chatHistory.splice(0, chatHistory.length - MAX_TURNS);
        }
    };
    const createModel = process.env.GENERATOR_CREATE_MODEL || 'gemini-3-pro-preview';
    const updateModel = process.env.GENERATOR_UPDATE_MODEL || 'gemini-2.5-flash';
    const createRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/generate-from-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ stack, image: desktopBaseDataUrl, model: createModel, sectionSpecs: baseAssets?.sectionSpecs }, useChat ? { history: chatHistory } : {}))
    }));

    if (!createRes.ok) {
        let detail = '';
        try { detail = await createRes.text(); } catch { }
        throw new Error(`Generator failed: ${createRes.status} ${createRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
    }

    const createData = await createRes.json();
    currentBundle = createData.bundle;

    // Loop
    let noImprovementStreak = 0;
    let prevBest = 0;
    for (let i = 0; i <= maxIterations; i++) {
        const iterDir = path.join(runDir, `iteration-${String(i).padStart(2, '0')}`);
        await ensureDir(iterDir);

        // Write bundle with compile-fix fallback
        let localUrl: string;
        let entryPath: string;
        try {
            const r = await writeReactBundle(iterDir, currentBundle!);
            localUrl = r.localUrl; entryPath = r.entryPath;
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.warn('[PixelGen] Bundle compile failed; requesting code fix...', errMsg);
            const instructions = [
                'You are a senior React/TypeScript engineer.',
                'Fix the compile/transpile errors so the code transpiles with esbuild JSX/TSX to ESM.',
                'Do not change design; just correct syntax/exports/imports.',
                'Error message from the bundler:',
                '---',
                errMsg,
                '---',
            ].join('\n');
            const updateRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign({ stack, currentBundle, instructions, images: [desktopBaseDataUrl], model: updateModel, sectionSpecs: baseAssets?.sectionSpecs }, useChat ? { history: chatHistory } : {}))
            }));
            if (!updateRes.ok) {
                let detail = '';
                try { detail = await updateRes.text(); } catch { }
                throw new Error(`Update (compile) failed: ${updateRes.status} ${updateRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
            }
            const updateData = await updateRes.json();
            currentBundle = updateData.bundle;
            if (useChat) { try { chatHistory.push({ role: 'user', content: instructions }); capHistory(); } catch { } }
            const r2 = await writeReactBundle(iterDir, currentBundle!);
            localUrl = r2.localUrl; entryPath = r2.entryPath;
        }

        // Inject base assets (fonts + typography) into the generated app
        try {
            if (baseAssets) {
                const entryDir = path.dirname(entryPath);
                await injectAssetsIntoHtml(entryPath, entryDir, baseAssets);
            }
        } catch (e) {
            console.warn('[PixelGen] Asset injection failed:', e instanceof Error ? e.message : String(e));
        }

        // Preflight: load the app, capture console/page errors, and auto-fix before comparing
        // After iteration 0, enforce base assets via CSP
        try { if (baseAssets && i > 0) await injectCspForAssets(entryPath); } catch { }
        const preflightMaxAttempts = Number(process.env.PREFLIGHT_MAX_ATTEMPTS || 3);
        let lastHealth: PreflightResult | undefined;
        let lastHealthSig: string | undefined;
        // Build enforcement allowlists from base assets
        const allowedImageSuffixes = baseAssets ? baseAssets.assets.images.map(im => '/' + im.localPath.replace(/\\/g, '/')) : [];
        const allowedFontTokens = baseAssets?.fontFamilies || [];
        const allowedColors = baseAssets?.palette ? [...(baseAssets.palette.colors || []), ...(baseAssets.palette.backgrounds || [])] : [];
        for (let attempt = 0; attempt < preflightMaxAttempts; attempt++) {
            const health = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
            lastHealth = health;
            // Save diagnostics
            await fs.writeFile(path.join(iterDir, `preflight-${attempt}.json`), JSON.stringify(health, null, 2));

            // Opportunistic auto-repair 1: fetch missing fonts from base site and rewrite to local paths
            try {
                const repair = await autoRepairMissingFonts(health, options.baseUrl, entryPath, 2);
                if (repair.changed) {
                    const recheck = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
                    lastHealth = recheck;
                    await fs.writeFile(path.join(iterDir, `preflight-${attempt}-after-repair.json`), JSON.stringify(recheck, null, 2));
                    if (recheck.healthy) {
                        if (attempt > 0) console.log(`[PixelGen] Preflight recovered after auto-repair.`);
                        break;
                    }
                }
                if (repair.failed.length) {
                    // Persist missing assets for visibility
                    await fs.writeFile(path.join(iterDir, `missing-fonts.json`), JSON.stringify(repair.failed, null, 2));
                }
            } catch (e) {
                console.warn('[PixelGen] Auto-repair of missing fonts failed:', e instanceof Error ? e.message : String(e));
            }

            // Opportunistic auto-repair 2: fix icon misimports from 'react' -> 'lucide-react' directly in site files
            try {
                const repairedIcons = await autoRepairIconImports(entryPath);
                if (repairedIcons) {
                    const recheck2 = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
                    lastHealth = recheck2;
                    await fs.writeFile(path.join(iterDir, `preflight-${attempt}-after-icon-repair.json`), JSON.stringify(recheck2, null, 2));
                    if (recheck2.healthy) {
                        if (attempt > 0) console.log(`[PixelGen] Preflight recovered after icon import repair.`);
                        break;
                    }
                }
            } catch (e) {
                console.warn('[PixelGen] Auto-repair of icon imports failed:', e instanceof Error ? e.message : String(e));
            }

            if (health.healthy) {
                if (attempt > 0) {
                    console.log(`[PixelGen] Preflight recovered after ${attempt} fix attempt(s).`);
                }
                break;
            }

            // If the error signature hasn't changed after local auto-repairs, skip costly LLM call
            try {
                const sig = JSON.stringify({ pe: health.pageErrors, ce: health.console.filter(c => c.type === 'error').map(c => c.text), ne: health.networkErrors.map(n => `${n.status}:${n.type}:${n.url}`) });
                if (lastHealthSig && lastHealthSig === sig) {
                    console.warn('[PixelGen] Preflight errors unchanged after auto-repairs; attempting compile-only fix instead of repeating LLM.');
                    // Attempt a minimal compile/runtime fix without re-asking for full changes
                    const compileOnly = [
                        'You are a senior React/TypeScript engineer.',
                        'Fix ONLY the compile/runtime errors shown below so the page renders without exceptions.',
                        'Do not change design or behavior; only correct syntax, JSX, exports/imports and trivial runtime issues.',
                        'Errors:',
                        ...((health.pageErrors || []).map(e => `- ${e}`)),
                        ...((health.console || []).filter(c => c.type === 'error').slice(0, 6).map(c => `- console.error: ${c.text}`)),
                    ].join('\n');
                    const compileRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(Object.assign({ stack, currentBundle, instructions: compileOnly, images: (health.screenshotDataUrl ? [health.screenshotDataUrl] : []), model: updateModel, sectionSpecs: baseAssets?.sectionSpecs }, useChat ? { history: chatHistory } : {}))
                    }));
                    if (compileRes.ok) {
                        const data = await compileRes.json();
                        currentBundle = data.bundle;
                        if (useChat) { try { chatHistory.push({ role: 'user', content: compileOnly }); capHistory(); } catch { } }
                        try {
                            const rewritten2 = await writeReactBundle(iterDir, currentBundle!);
                            if (baseAssets) {
                                const entryDir2 = path.dirname(rewritten2.entryPath);
                                await injectAssetsIntoHtml(rewritten2.entryPath, entryDir2, baseAssets);
                            }
                        } catch (e) {
                            console.warn('[PixelGen] Compile-only fix did not produce a compilable bundle:', e instanceof Error ? e.message : String(e));
                        }
                        const recheck = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
                        lastHealth = recheck;
                        await fs.writeFile(path.join(iterDir, `preflight-${attempt}-after-compile-only.json`), JSON.stringify(recheck, null, 2));
                        if (recheck.healthy) {
                            console.log('[PixelGen] Preflight recovered after compile-only fix.');
                            break;
                        }
                        // If still unhealthy, continue to next attempt without breaking early
                        lastHealthSig = sig; // keep signature; we may still do LLM fix below
                    } else {
                        let detail = '';
                        try { detail = await compileRes.text(); } catch { }
                        console.warn(`Compile-only update request failed: ${compileRes.status} ${compileRes.statusText}${detail ? ` - ${detail.slice(0, 300)}` : ''}`);
                    }
                }
                lastHealthSig = sig;
            } catch { }

            console.log('[PixelGen] Preflight issues detected; requesting code fix...');
            let instructions = buildDiagnosticsFixPrompt(lastHealth!, baseAssets);
            // If we previously failed to fetch any font URLs, make it explicit for the model
            try {
                const missPath = path.join(iterDir, `missing-fonts.json`);
                const exists = await fs.access(missPath).then(() => true).catch(() => false);
                if (exists) {
                    const failed: string[] = JSON.parse(await fs.readFile(missPath, 'utf8'));
                    if (failed && failed.length) {
                        instructions += `\n\nMISSING FONT URLS (fetch failed, do not reference these):\n- ${failed.join('\n- ')}`;
                        instructions += `\n\nReplace @font-face src urls with local './assets/fonts/*.woff2' captured in the bundle; if unavailable, remove those @font-face entries or use already-allowed font-family tokens from base assets (${(baseAssets?.fontFamilies || []).slice(0, 5).join(', ')}) without external URLs.`;
                    }
                }
            } catch { }
            const updateRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign({ stack, currentBundle, instructions, images: (health.screenshotDataUrl ? [health.screenshotDataUrl] : [desktopBaseDataUrl]), model: updateModel, sectionSpecs: baseAssets?.sectionSpecs }, useChat ? { history: chatHistory } : {}))
            }));
            if (!updateRes.ok) {
                let detail = '';
                try { detail = await updateRes.text(); } catch { }
                throw new Error(`Update (preflight) failed: ${updateRes.status} ${updateRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
            }
            const updateData = await updateRes.json();
            currentBundle = updateData.bundle;
            if (useChat) { try { chatHistory.push({ role: 'user', content: instructions }); capHistory(); } catch { } }
            let rewritten;
            try {
                rewritten = await writeReactBundle(iterDir, currentBundle!);
            } catch (e) {
                const errMsg = e instanceof Error ? e.message : String(e);
                console.warn('[PixelGen] Bundle compile failed after preflight-fix; requesting compile-only fix...', errMsg);
                const compileOnly = [
                    'You are a senior React/TypeScript engineer.',
                    'Fix ONLY compile/transpile errors so the code transpiles with esbuild JSX/TSX to ESM.',
                    'Do not change design or behavior; only correct syntax/exports/imports/JSX.',
                    'Error message from the bundler:',
                    '---',
                    errMsg,
                    '---',
                ].join('\n');
                const fixRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.assign({ stack, currentBundle, instructions: compileOnly, images: (lastHealth?.screenshotDataUrl ? [lastHealth!.screenshotDataUrl] : []), model: updateModel, sectionSpecs: baseAssets?.sectionSpecs }, useChat ? { history: chatHistory } : {}))
                }));
                if (!fixRes.ok) {
                    let detail = '';
                    try { detail = await fixRes.text(); } catch { }
                    throw new Error(`Update (compile-only) failed: ${fixRes.status} ${fixRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
                }
                const fixData = await fixRes.json();
                currentBundle = fixData.bundle;
                if (useChat) { try { chatHistory.push({ role: 'user', content: compileOnly }); capHistory(); } catch { } }
                rewritten = await writeReactBundle(iterDir, currentBundle!);
            }
            // Re-inject assets again after update
            try {
                if (baseAssets) {
                    const entryDir2 = path.dirname(rewritten.entryPath);
                    await injectAssetsIntoHtml(rewritten.entryPath, entryDir2, baseAssets);
                }
            } catch (e) {
                console.warn('[PixelGen] Asset re-injection failed:', e instanceof Error ? e.message : String(e));
            }
        }
        if (lastHealth && !lastHealth.healthy) {
            throw new Error('Preflight failed after maximum attempts; aborting compare. Check preflight diagnostics JSON for details.');
        }
        console.log(`[PixelGen] Iteration ${i} hosted at ${localUrl}`);
        // Record baseline structure on first iteration; enforce in subsequent iterations
        try {
            if (i === 0 && lastHealth?.sectionOrder && lastHealth.sectionOrder.length) {
                structureLock = lastHealth.sectionOrder.slice();
                await fs.writeFile(path.join(runDir, 'structure-lock.json'), JSON.stringify({ sectionOrder: structureLock }, null, 2));
                console.log(`[PixelGen] Structure lock captured (${structureLock.length} sections).`);
            } else if (i > 0 && structureLock && lastHealth?.sectionOrder) {
                const a = JSON.stringify(structureLock);
                const b = JSON.stringify(lastHealth.sectionOrder);
                if (a !== b) {
                    console.warn('[PixelGen] Structure change detected vs lock; reverting to previous best and skipping update.');
                    if (bestBundle) {
                        const rewritten = await writeReactBundle(iterDir, bestBundle);
                        try { if (baseAssets) { await injectAssetsIntoHtml(rewritten.entryPath, path.dirname(rewritten.entryPath), baseAssets); } } catch {}
                        const recheck = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
                        lastHealth = recheck;
                    }
                }
            }
        } catch {}

        // Compare (phase-aware)
        const deviceArtifacts: DeviceArtifacts[] = [];
        const similarities: Record<string, number> = {};
        const deviceScores: Record<'desktop'|'mobile', { pixelmatch: number; ssim: number }> = {} as any;
        const activeDevices: ('desktop' | 'mobile')[] = phase === 'desktop' ? ['desktop'] : phase === 'mobile' ? ['mobile'] : devices;

        const similarityMetric = (process.env.SIMILARITY_METRIC || 'pixelmatch').toLowerCase();
        for (const device of activeDevices) {
            const baseSrc = baseScreenshots[device];
            // Copy base to iter dir for completeness
            const baseDest = path.join(iterDir, device, 'base.png');
            await ensureDir(path.dirname(baseDest));
            await fs.copyFile(baseSrc, baseDest);

            const comparison = await compareSites(
                options.baseUrl, // We use baseUrl for comparison to get accurate diff against live site? 
                // Wait, compareSites captures both. But we already have base. 
                // Actually compareSites captures both live. 
                // Optimization: We should probably use the captured base image if possible, but compareSites logic is coupled to capturing.
                // For now, let's let compareSites capture both to ensure consistent viewport/rendering environment.
                localUrl,
                { base: 'base', target: 'target' },
                {
                    outputDir: path.join(iterDir, device),
                    viewport: device === 'mobile' ? { width: 375, height: 667, deviceScaleFactor: 2 } : { width: 1280, height: 720, deviceScaleFactor: 1 },
                    fullPage: options.fullPage,
                    threshold: options.threshold
                },
                device
            );

            const pixelSim = comparison.diff.similarity;
            let ssimSim = pixelSim;
            try { ssimSim = await computeSSIMOnPaths(comparison.base.screenshotPath, comparison.target.screenshotPath); } catch {}
            deviceScores[device] = { pixelmatch: pixelSim, ssim: ssimSim };
            console.log(`[PixelGen] ${device} similarity → pixelmatch=${pixelSim.toFixed(4)} ssim=${ssimSim.toFixed(4)}`);
            const use = similarityMetric === 'pixelmatch' ? pixelSim : ssimSim;
            similarities[device] = use;

            if (comparison.styleDiff) {
                deviceArtifacts.push({
                    device,
                    basePath: comparison.base.screenshotPath,
                    targetPath: comparison.target.screenshotPath,
                    diffPath: comparison.diff.diffPath,
                    differences: comparison.styleDiff.differences
                });
            }
        }

        iterations.push({ i, similarities, localUrl });

        // Calculate average similarity for convergence check (phase-aware denominator)
        const pxMin = Number(process.env.PIXELMATCH_MIN_SIMILARITY || 0.92);
        const ssimGood = Number(process.env.SSIM_MIN_SIMILARITY || 0.95);
        const ssimDone = Number(process.env.SSIM_DONE_SIMILARITY || 0.98);
        const avgSimilarity = Object.values(similarities).reduce((a, b) => a + b, 0) / (Object.keys(similarities).length || 1);
        console.log(`[PixelGen] Iteration ${i} average similarity (${similarityMetric}): ${avgSimilarity.toFixed(4)}`);

        // Initialize best baseline on first iteration
        if (i === 0) {
            bestScores.desktop = deviceScores.desktop || bestScores.desktop;
            bestScores.mobile = deviceScores.mobile || bestScores.mobile;
            bestBundle = currentBundle;
        }

        // Lock metrics once thresholds are reached; do not allow regressions beyond epsilon
        (['desktop','mobile'] as const).forEach((d) => {
            const sc = deviceScores[d];
            if (!sc) return;
            if (sc.pixelmatch >= pxMin) pixelLocked[d] = true;
            if (sc.ssim >= ssimGood) ssimLocked[d] = true;
        });

        // Detect regression against best-so-far on any locked metric
        let regressed = false;
        (['desktop','mobile'] as const).forEach((d) => {
            const sc = deviceScores[d];
            if (!sc) return;
            if (pixelLocked[d] && sc.pixelmatch < (bestScores[d].pixelmatch - LOCK_EPSILON)) regressed = true;
            if (ssimLocked[d] && sc.ssim < (bestScores[d].ssim - LOCK_EPSILON)) regressed = true;
        });
        if (regressed) {
            console.warn('[PixelGen] Regression detected on a locked metric; reverting to previous best bundle and skipping update this iteration.');
            if (bestBundle) currentBundle = bestBundle;
            // Skip update prompts; proceed to next iteration
            continue;
        }

        // If no regression, update best when any device metric improves
        let improved = false;
        (['desktop','mobile'] as const).forEach((d) => {
            const sc = deviceScores[d];
            if (!sc) return;
            if (sc.pixelmatch > bestScores[d].pixelmatch + LOCK_EPSILON) { bestScores[d].pixelmatch = sc.pixelmatch; improved = true; }
            if (sc.ssim > bestScores[d].ssim + LOCK_EPSILON) { bestScores[d].ssim = sc.ssim; improved = true; }
        });
        if (improved) {
            bestBundle = currentBundle;
        }

        // Phase progress logic
        let phasePassed = false;
        if (similarityMetric === 'hybrid') {
            if (phase === 'desktop') phasePassed = (deviceScores.desktop?.ssim ?? 0) >= ssimGood;
            else if (phase === 'mobile') phasePassed = (deviceScores.mobile?.ssim ?? 0) >= ssimGood;
            else phasePassed = devices.every(d => (deviceScores[d as 'desktop'|'mobile']?.ssim ?? 0) >= ssimDone) && devices.every(d => (deviceScores[d as 'desktop'|'mobile']?.pixelmatch ?? 0) >= pxMin);
        } else if (similarityMetric === 'ssim') {
            if (phase === 'desktop') phasePassed = (deviceScores.desktop?.ssim ?? 0) >= ssimGood;
            else if (phase === 'mobile') phasePassed = (deviceScores.mobile?.ssim ?? 0) >= ssimGood;
            else phasePassed = devices.every(d => (deviceScores[d as 'desktop'|'mobile']?.ssim ?? 0) >= ssimDone);
        } else {
            if (phase === 'desktop') phasePassed = (deviceScores.desktop?.pixelmatch ?? 0) >= pxMin;
            else if (phase === 'mobile') phasePassed = (deviceScores.mobile?.pixelmatch ?? 0) >= pxMin;
            else phasePassed = devices.every(d => (deviceScores[d as 'desktop'|'mobile']?.pixelmatch ?? 0) >= pxMin);
        }

        if (phasePassed || phaseRemaining <= 0) {
            if (phase === 'desktop') { phase = 'mobile'; phaseRemaining = MOBILE_PHASE_ITERS; console.log('[PixelGen] Switching phase -> mobile'); }
            else if (phase === 'mobile') { phase = 'joint'; phaseRemaining = JOINT_PHASE_ITERS; console.log('[PixelGen] Switching phase -> joint'); }
            else { stopReason = 'Threshold met'; break; }
        } else {
            phaseRemaining -= 1;
        }

        if (i === maxIterations) {
            stopReason = 'Max iterations reached';
            break;
        }

        // Convergence stall detection: if best similarity improves < 0.5 percentage points twice consecutively, stop
        const bestNow = Math.min(...devices.map(d => similarities[d]));
        const improvement = bestNow - prevBest;
        if (improvement < 0.005) {
            noImprovementStreak += 1;
        } else {
            noImprovementStreak = 0;
        }
        prevBest = Math.max(prevBest, bestNow);
        if (noImprovementStreak >= 2) {
            stopReason = 'Convergence stalled';
            break;
        }

        // Check for stall
        if (i > 0) {
            if (avgSimilarity > bestSimilarity + STALL_THRESHOLD) {
                bestSimilarity = avgSimilarity;
                stallCounter = 0; // Reset counter if we improved
            } else {
                stallCounter++;
                console.log(`[PixelGen] Convergence stall detected (${stallCounter}/${STALL_ITERATIONS})`);
                if (stallCounter >= STALL_ITERATIONS) {
                    stopReason = 'Convergence stalled';
                    break;
                }
            }
        } else {
            bestSimilarity = avgSimilarity;
        }

        // Section-wise comparison and targeted fixes
        const sectionMin = minSimilarity; // can be tuned independently if needed
        let targetedUpdateIssued = false;
        let decision: 'regression-skip' | 'section-update' | 'global-update' | 'none' = 'none';
        if (baseAssets?.sectionSpecs && baseAssets.sectionSpecs.length) {
            const worst: { device: 'desktop'|'mobile'; name: string; score: number; basePath: string; targetPath: string; diffPath: string } | null = await (async () => {
                let best: any = null;
                for (const dev of activeDevices) {
                    const results = await captureSectionScreenshotsForDevice(options.baseUrl, localUrl, dev, baseAssets.sectionSpecs!, path.join(iterDir, dev, 'sections'));
                    for (const r of results) {
                        const score = similarityMetric === 'pixelmatch' ? r.similarity : (r.ssim ?? r.similarity);
                        if (!best || score < best.score) best = { device: dev, name: r.name, score, basePath: r.basePath, targetPath: r.targetPath, diffPath: r.diffPath };
                    }
                }
                return best;
            })();

            if (worst && worst.score < sectionMin) {
                targetedUpdateIssued = true;
                const sectionSpec = baseAssets.sectionSpecs.find(s => s.name === worst.name);
                const focus = `Fix ONLY the "${worst.name}" section on ${worst.device}. Do not change any other sections.`;
                const instructions = await buildSectionFeedback({
                    sectionName: worst.name,
                    device: worst.device,
                    basePath: worst.basePath,
                    targetPath: worst.targetPath,
                    diffPath: worst.diffPath,
                    sectionSpec,
                    structureOrder: structureLock,
                });
                await fs.writeFile(path.join(iterDir, `fix-prompt-section-${worst.name.replace(/\s+/g, '_')}-${worst.device}.md`), instructions);
                console.log(`[PixelGen] Section-targeted update for ${worst.name} (${worst.device}), score=${worst.score.toFixed(4)} (${similarityMetric})`);
                decision = 'section-update';

                const updateImages: string[] = [];
                const baseBuf = await fs.readFile(worst.basePath);
                const targetBuf = await fs.readFile(worst.targetPath);
                const diffBuf = await fs.readFile(worst.diffPath);
                updateImages.push(`data:image/png;base64,${baseBuf.toString('base64')}`);
                updateImages.push(`data:image/png;base64,${targetBuf.toString('base64')}`);
                updateImages.push(`data:image/png;base64,${diffBuf.toString('base64')}`);

                const updateRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.assign({ stack, currentBundle, instructions, images: updateImages, model: updateModel, sectionSpecs: baseAssets?.sectionSpecs }, useChat ? { history: chatHistory } : {}))
                }));
                if (!updateRes.ok) {
                    let detail = '';
                    try { detail = await updateRes.text(); } catch { }
                    throw new Error(`Update failed: ${updateRes.status} ${updateRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
                }
                const updateData = await updateRes.json();
                currentBundle = updateData.bundle;
                if (useChat) { try { chatHistory.push({ role: 'user', content: instructions }); capHistory(); } catch { } }
            }
        }

        if (!targetedUpdateIssued) {
            // Prepare Feedback & Update (global)
            let focus = '';
            if (phase === 'desktop') {
                focus = 'Focus ONLY on Desktop structure, content, and major layout. Ignore mobile responsiveness for now.';
            } else if (phase === 'mobile') {
                focus = 'Focus ONLY on Mobile responsiveness and layout. Do not regress Desktop layout.';
            } else {
                focus = 'Focus on pixel-perfect polish for BOTH Desktop and Mobile. Fix minor alignment, spacing, and typography issues.';
            }
            console.log(`[PixelGen] Generating feedback for iteration ${i} (Phase: ${phase})...`);
            const instructions = await buildFeedback(deviceArtifacts, focus, { targetDevice: phase === 'joint' ? undefined : phase, sectionSpecs: baseAssets?.sectionSpecs, structureOrder: structureLock });
            await fs.writeFile(path.join(iterDir, 'fix-prompt.md'), instructions);

            console.log(`[PixelGen] Requesting update...`);
            // Collect images for update (one per active device)
            const updateImages: string[] = [];
            for (const art of deviceArtifacts) {
                const baseBuf = await fs.readFile(art.basePath);
                const targetBuf = await fs.readFile(art.targetPath);
                const diffBuf = await fs.readFile(art.diffPath);
                updateImages.push(`data:image/png;base64,${baseBuf.toString('base64')}`);
                updateImages.push(`data:image/png;base64,${targetBuf.toString('base64')}`);
                updateImages.push(`data:image/png;base64,${diffBuf.toString('base64')}`);
            }

            const updateRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign({ stack, currentBundle, instructions, images: updateImages, model: updateModel, sectionSpecs: baseAssets?.sectionSpecs }, useChat ? { history: chatHistory } : {}))
            }));

            if (!updateRes.ok) {
                let detail = '';
                try { detail = await updateRes.text(); } catch { }
                throw new Error(`Update failed: ${updateRes.status} ${updateRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
            }

            const updateData = await updateRes.json();
            currentBundle = updateData.bundle;
            if (useChat) { try { chatHistory.push({ role: 'user', content: instructions }); capHistory(); } catch { } }
            decision = 'global-update';
        }

        // Iteration summary log (one compact line)
        const ds = deviceScores.desktop ? `D(pm=${deviceScores.desktop.pixelmatch.toFixed(3)},ssim=${deviceScores.desktop.ssim.toFixed(3)})` : 'D(-)';
        const ms = deviceScores.mobile ? `M(pm=${deviceScores.mobile.pixelmatch.toFixed(3)},ssim=${deviceScores.mobile.ssim.toFixed(3)})` : 'M(-)';
        const locks = `locks:D(pm=${pixelLocked.desktop?'Y':'n'},ssim=${ssimLocked.desktop?'Y':'n'}),M(pm=${pixelLocked.mobile?'Y':'n'},ssim=${ssimLocked.mobile?'Y':'n'})`;
        console.log(`[PixelGen] Iteration ${i} summary -> phase=${phase}, devices=${activeDevices.join(',')}, ${ds}, ${ms}, ${locks}, decision=${decision}`);
    }

    let artifactsUrl = getLocalArtifactUrl(`pixelgen/${jobId}`);
    try {
        const maybeUrl = await storage.artifactsUrl(runDir);
        if (maybeUrl) artifactsUrl = maybeUrl;
    } catch { }

    const summary: RunSummary = {
        jobId,
        artifactsUrl,
        iterations,
        finalLocalUrl: iterations[iterations.length - 1].localUrl,
        stopReason
    };

    await fs.writeFile(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2));

    return summary;
};

// Capture per-section screenshots for a given device on base and local pages and compute similarity via pixelmatch
const captureSectionScreenshotsForDevice = async (
    baseUrl: string,
    localUrl: string,
    device: 'desktop' | 'mobile',
    sectionSpecs: NonNullable<AssetScanResult['sectionSpecs']>,
    outDir: string,
) => {
    await ensureDir(outDir);
    const viewport = device === 'mobile' ? { width: 375, height: 667, deviceScaleFactor: 2 } : { width: 1280, height: 720, deviceScaleFactor: 1 };
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.deviceScaleFactor, isMobile: device === 'mobile', hasTouch: device === 'mobile' });
    const basePage = await context.newPage();
    const localPage = await context.newPage();
    const navTimeout = Number(process.env.NAVIGATION_TIMEOUT_MS || 120000);
    await basePage.goto(baseUrl, { waitUntil: 'networkidle', timeout: navTimeout }).catch(() => undefined);
    await localPage.goto(localUrl, { waitUntil: 'load', timeout: navTimeout }).catch(() => undefined);

    const results: Array<{ name: string; basePath: string; targetPath: string; diffPath: string; similarity: number; ssim?: number }> = [];
    for (const spec of sectionSpecs) {
        const safeName = spec.name.replace(/[^a-z0-9_-]+/gi, '_');
        const secDir = path.join(outDir, safeName);
        await ensureDir(secDir);

        const baseEl = await findSectionElement(basePage, spec, false);
        const localEl = await findSectionElement(localPage, spec, true);
        if (!baseEl || !localEl) {
            continue;
        }
        const basePath = path.join(secDir, 'base.png');
        const targetPath = path.join(secDir, 'target.png');
        await baseEl.screenshot({ path: basePath });
        await localEl.screenshot({ path: targetPath });

        const { diffPath, similarity, ssim } = await pixelmatchDiff(basePath, targetPath, path.join(secDir, 'diff.png'));
        results.push({ name: spec.name, basePath, targetPath, diffPath, similarity, ssim });
    }

    await context.close();
    await browser.close();
    return results;
};

// Find a section element on a page using either data-section attribute, selector, or heading fallback
const findSectionElement = async (page: any, spec: { name: string; selector?: string; heading?: string }, preferDataAttr: boolean) => {
    const dataSelector = `[data-section="${(spec.name || '').replace(/"/g, '\\"')}"]`;
    let handle = null;
    if (preferDataAttr) {
        try { handle = await page.$(dataSelector); } catch {}
        if (handle) return handle;
    }
    if (spec.selector) {
        try {
            const locator = page.locator(spec.selector).first();
            const count = await page.locator(spec.selector).count();
            if (count > 0) {
                handle = await locator.elementHandle();
                if (handle) return handle;
            }
        } catch {}
    }
    if (spec.heading && spec.heading.length > 0) {
        try {
            const jsHandle = await page.evaluateHandle((h: string) => {
                const H = (h || '').toLowerCase();
                const head = Array.from(document.querySelectorAll('h1,h2,h3')) as HTMLElement[];
                const hit = head.find(el => (el.textContent || '').toLowerCase().includes(H));
                const container = hit ? (hit.closest('section,header,footer,main,div') as HTMLElement | null) : null;
                return container || hit || null;
            }, spec.heading);
            if (jsHandle && jsHandle.asElement) {
                const el = jsHandle.asElement();
                if (el) return el;
            }
        } catch {}
    }
    return null;
};

// Compute pixelmatch similarity and write a diff image
const pixelmatchDiff = async (aPath: string, bPath: string, diffOutPath: string) => {
    const [aBuf, bBuf] = await Promise.all([fs.readFile(aPath), fs.readFile(bPath)]);
    const aPng = PNG.sync.read(aBuf);
    const bPng = PNG.sync.read(bBuf);
    const width = Math.min(aPng.width, bPng.width);
    const height = Math.min(aPng.height, bPng.height);
    const crop = (src: PNG) => {
        const out = new PNG({ width, height });
        for (let y = 0; y < height; y++) {
            const srcStart = y * src.width * 4;
            const srcSlice = src.data.subarray(srcStart, srcStart + width * 4);
            const dstStart = y * width * 4;
            out.data.set(srcSlice, dstStart);
        }
        return out;
    };
    const aClip = crop(aPng);
    const bClip = crop(bPng);
    const diff = new PNG({ width, height });
    const diffPixels = pixelmatch(aClip.data, bClip.data, diff.data, width, height, { threshold: Number(process.env.PIXELMATCH_THRESHOLD || 0.1) });
    await fs.writeFile(diffOutPath, PNG.sync.write(diff));
    const similarity = width * height === 0 ? 0 : 1 - diffPixels / (width * height);
    // Also compute SSIM as a perceptual metric
    const ssim = computeSSIMFromPNGs(aClip, bClip);
    return { diffPath: diffOutPath, similarity, ssim };
};

// Global SSIM over a grayscale conversion (fast approximation; windowed MSSIM can be added later)
const computeSSIMFromPNGs = (a: PNG, b: PNG): number => {
    // Try robust SSIM via ssim.js if available
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ssimLib = require('ssim.js');
        if (ssimLib && typeof ssimLib.ssim === 'function') {
            const imgA = { data: new Uint8ClampedArray(a.data.buffer), width: a.width, height: a.height };
            const imgB = { data: new Uint8ClampedArray(b.data.buffer), width: b.width, height: b.height };
            const res = ssimLib.ssim(imgA, imgB, { windowSize: 8 });
            const m = typeof res === 'object' && res !== null && 'mssim' in res ? res.mssim : Number(res);
            if (Number.isFinite(m)) return Math.max(0, Math.min(1, Number(m)));
        }
    } catch {}
    const width = Math.min(a.width, b.width);
    const height = Math.min(a.height, b.height);
    let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;
    const N = width * height;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const ax = a.data[idx], ay = a.data[idx + 1], az = a.data[idx + 2];
            const bx = b.data[idx], by = b.data[idx + 1], bz = b.data[idx + 2];
            const gA = 0.299 * ax + 0.587 * ay + 0.114 * az;
            const gB = 0.299 * bx + 0.587 * by + 0.114 * bz;
            sumX += gA; sumY += gB;
            sumX2 += gA * gA; sumY2 += gB * gB; sumXY += gA * gB;
        }
    }
    if (N === 0) return 0;
    const muX = sumX / N;
    const muY = sumY / N;
    const varX = sumX2 / N - muX * muX;
    const varY = sumY2 / N - muY * muY;
    const covXY = sumXY / N - muX * muY;
    const L = 255;
    const K1 = 0.01, K2 = 0.03;
    const C1 = (K1 * L) * (K1 * L);
    const C2 = (K2 * L) * (K2 * L);
    const numerator = (2 * muX * muY + C1) * (2 * covXY + C2);
    const denominator = (muX * muX + muY * muY + C1) * (varX + varY + C2);
    const ssim = denominator === 0 ? 0 : numerator / denominator;
    // clamp to [0,1]
    return Math.max(0, Math.min(1, ssim));
};

const computeSSIMOnPaths = async (aPath: string, bPath: string): Promise<number> => {
    const [aBuf, bBuf] = await Promise.all([fs.readFile(aPath), fs.readFile(bPath)]);
    const aPng = PNG.sync.read(aBuf);
    const bPng = PNG.sync.read(bBuf);
    return computeSSIMFromPNGs(aPng, bPng);
};

type PreflightResult = {
    url: string;
    healthy: boolean;
    console: Array<{ type: 'log' | 'warn' | 'error'; text: string }>;
    pageErrors: string[];
    networkErrors: Array<{ url: string; status: number; type: string }>; // only failing ones
    screenshotDataUrl?: string;
    assetViolations?: {
        images: string[];
        fonts: string[];
        colors: string[];
    };
    sectionOrder?: string[];
};

const preflightCheck = async (
    url: string,
    enforcement?: { allowedImageSuffixes?: string[]; allowedFontTokens?: string[]; allowedColors?: string[] }
): Promise<PreflightResult> => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const logs: PreflightResult['console'] = [];
    const pageErrors: string[] = [];
    const networkErrors: PreflightResult['networkErrors'] = [];

    page.on('console', (msg) => {
        const t: any = msg.type();
        const level: 'log' | 'warn' | 'error' = t === 'error' ? 'error' : (t === 'warning' || t === 'warn' ? 'warn' : 'log');
        // capture only log/warn/error
        if (level === 'log' || level === 'warn' || level === 'error') {
            logs.push({ type: level, text: msg.text() });
        }
    });
    page.on('pageerror', (err) => {
        const msg = (err && (err as any).message) || String(err);
        const stk = (err && (err as any).stack) ? String((err as any).stack) : '';
        pageErrors.push(stk ? `${msg}\n${stk}` : msg);
    });
    page.on('response', (res) => {
        try {
            const status = res.status();
            if (status >= 400) {
                // capture common static asset failures
                networkErrors.push({ url: res.url(), status, type: res.request().resourceType() });
            }
        } catch { }
    });

    let shot: string | undefined;
    let sections: string[] | undefined;
    // Hoist violations outside try/catch so we can always include diagnostics
    let violations: { images: string[]; fonts: string[]; colors: string[] } = { images: [], fonts: [], colors: [] };
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
        await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => { });
        // Give React time to mount and run effects
        await page.waitForTimeout(1000);
        const buf = await page.screenshot({ fullPage: false }).catch(() => undefined as unknown as Buffer);
        if (buf && Buffer.isBuffer(buf)) {
            shot = `data:image/png;base64,${buf.toString('base64')}`;
        }
        try {
            sections = await page.evaluate(() => Array.from(document.querySelectorAll('[data-section]')).map(el => (el.getAttribute('data-section') || '').trim()).filter(Boolean));
        } catch {}
        // Asset enforcement check inside the page
        const assets = await page.evaluate((rules) => {
            const images: string[] = [];
            const fonts: string[] = [];
            const colors: string[] = [];
            const allowedImgSuffixes = new Set(rules?.allowedImageSuffixes || []);
            const allowedFontTokens = (rules?.allowedFontTokens || []) as string[];
            const allowedColors = new Set((rules?.allowedColors || []) as string[]);

            // images: <img> and common background-image urls
            for (const img of Array.from(document.images)) {
                try {
                    const url = new URL((img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src, location.href);
                    const path = url.pathname;
                    const ok = Array.from(allowedImgSuffixes).some((s) => path.endsWith(s));
                    if (!ok) images.push(path);
                } catch { }
            }
            const sampleBgNodes = Array.from(document.querySelectorAll('*')).slice(0, 300) as HTMLElement[];
            for (const el of sampleBgNodes) {
                const bg = getComputedStyle(el).getPropertyValue('background-image');
                const urls = (bg.match(/url\(([^)]+)\)/g) || []).map((m) => m.replace(/^url\((.*)\)$/, '$1').replace(/^["']|["']$/g, ''));
                for (const u of urls) {
                    try {
                        const p = new URL(u, location.href).pathname;
                        const ok = Array.from(allowedImgSuffixes).some((s) => p.endsWith(s));
                        if (!ok) images.push(p);
                    } catch { }
                }
            }

            // fonts/colors: sample common elements
            const sels = ['body', 'h1', 'h2', 'h3', 'p', 'a', 'button'];
            for (const sel of sels) {
                const el = document.querySelector(sel) as HTMLElement | null;
                if (!el) continue;
                const cs = getComputedStyle(el);
                const ff = cs.getPropertyValue('font-family');
                if (ff) {
                    const tokens = ff.split(',').map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
                    const ok = tokens.some(t => allowedFontTokens.includes(t));
                    if (!ok) fonts.push(ff);
                }
                const color = cs.getPropertyValue('color');
                const bgc = cs.getPropertyValue('background-color');
                const okColor = !allowedColors.size || allowedColors.has(color);
                const okBg = !allowedColors.size || allowedColors.has(bgc);
                if (!okColor) colors.push(color);
                if (!okBg) colors.push(bgc);
            }

            return { images, fonts, colors };
        }, enforcement || {});

        // Collect asset violations for diagnostics (do not mark page unhealthy solely due to these)
        if (assets) {
            violations = {
                images: Array.from(new Set(assets.images)),
                fonts: Array.from(new Set(assets.fonts)),
                colors: Array.from(new Set(assets.colors)),
            };
        }
        // NOTE: Do not fail preflight solely due to asset violations. Treat these as diagnostics
        // for the update prompt instead of forcing retries. Many color/font differences are benign
        // and will converge during the visual diff stage.
    } catch (e) {
        pageErrors.push(e instanceof Error ? e.message : String(e));
    } finally {
        await context.close();
        await browser.close();
    }

    // Heuristics for health
    const hasSevereConsole = logs.some((l) => l.type === 'error');
    const hasPageErrors = pageErrors.length > 0;
    // Ignore favicon 404s; they are benign and we try to inject one
    const netIssues = networkErrors.filter((n) => !/favicon\.ico/i.test(n.url));
    const healthy = !hasSevereConsole && !hasPageErrors;
    return { url, healthy, console: logs, pageErrors, networkErrors: netIssues, screenshotDataUrl: shot, assetViolations: violations, sectionOrder: sections };
};

const buildDiagnosticsFixPrompt = (diag: PreflightResult, base?: AssetScanResult): string => {
    const lines: string[] = [];
    lines.push('You are a senior React engineer. Fix the runtime/logic issues preventing the app from rendering without errors.');
    lines.push('Do not change the functional intent or design; only correct invalid React usage, props, and component render logic.');
    lines.push('If lucide-react icons are used, ensure they are rendered as elements like <ShoppingCart /> not passed as objects or children.');
    lines.push("Do not import icons from 'react'; import named icons from 'lucide-react' (or equivalent) and reference them directly in JSX.");
    lines.push('If createRoot is used, import it: `import { createRoot } from "react-dom/client"` and use `createRoot(container).render(<App />)`; do not rely on ReactDOM.render.');
    lines.push('Ensure there is exactly one copy of React at runtime: normalize all imports to `https://esm.sh/react@18?dev` and `https://esm.sh/react-dom@18/client?dev` and avoid mixing CDN specifiers.');
    lines.push('Also fix any missing exports, invalid hooks usage, or JSX typos shown by the console.');
    if (base) {
        lines.push('\nSTRICT ASSET CONSTRAINTS (mandatory after iteration 0):');
        lines.push('- Use only images from ./assets/images (already provided). Do not load external images.');
        if (base.logoCandidate) lines.push(`- Logo image: ${base.logoCandidate}`);
        if (base.heroCandidate) lines.push(`- Hero image: ${base.heroCandidate}`);
        // Keep at most a few image hints to reduce token size
        if (base.imageHints && base.imageHints.length > 0) {
            const top = base.imageHints.slice(0, 8).map(h => h.localPath || h.url).filter(Boolean) as string[];
            if (top.length) lines.push(`- Representative images available: ${top.join(', ')}`);
        }
        if (base.fontFamilies && base.fontFamilies.length) lines.push(`- Allowed font families: ${base.fontFamilies.join(', ')}`);
        if (base.palette && (base.palette.colors?.length || base.palette.backgrounds?.length)) {
            const set = Array.from(new Set([...(base.palette.colors || []), ...(base.palette.backgrounds || [])]));
            lines.push(`- Allowed colors only (no deviations): ${set.slice(0, 20).join(', ')}${set.length > 20 ? ' ...' : ''}`);
        }
        lines.push('- If any asset/colour/font deviates, change the code to reference the provided assets and palette until it matches.');

        // Provide compact section → image mapping hints (limit to a few key sections and one image each)
        if (base.sectionHints && base.sectionHints.length) {
            const priority = ['Header', 'Hero', 'Products', 'Gallery', 'Features', 'Footer'];
            const picked = base.sectionHints
                .sort((a, b) => priority.indexOf(a.name) - priority.indexOf(b.name))
                .slice(0, 6)
                .map(s => ({
                    section: s.name,
                    heading: s.heading,
                    selector: s.selector,
                    images: (s.images || []).slice(0, 1).map(im => ({ kind: im.kind, path: im.localPath || im.url, alt: im.alt }))
                }));
            lines.push('\nSECTION IMAGE HINTS (concise):');
            lines.push('```json');
            lines.push(JSON.stringify(picked, null, 2));
            lines.push('```');
            lines.push('Map hero/banner to the hero image; header/nav to logo; products/galleries/features to the nearest relevant image.');
        }
    }
    lines.push('Here are diagnostics captured from the browser:');
    if (diag.console.length) {
        lines.push('\nConsole messages:');
        const seen = new Set<string>();
        for (const m of diag.console) {
            const key = `${m.type}:${m.text}`;
            if (seen.has(key)) continue; seen.add(key);
            lines.push(`- [${m.type}] ${m.text}`);
            if (seen.size >= 12) break; // cap
        }
    }
    if (diag.pageErrors.length) {
        lines.push('\nPage errors:');
        const unique = Array.from(new Set(diag.pageErrors)).slice(0, 10);
        for (const e of unique) lines.push(`- ${e}`);
    }
    if (diag.networkErrors.length) {
        lines.push('\nNetwork errors:');
        const uniq: string[] = [];
        const seen = new Set<string>();
        for (const n of diag.networkErrors) {
            const k = `${n.status}:${n.type}:${n.url}`;
            if (!seen.has(k)) { seen.add(k); uniq.push(`- ${n.status} ${n.type} ${n.url}`); }
            if (uniq.length >= 12) break;
        }
        lines.push(...uniq);
    }
    // Include asset violations (images/fonts/colors) as guidance but not blockers
    if (diag.assetViolations && (diag.assetViolations.images.length || diag.assetViolations.fonts.length || diag.assetViolations.colors.length)) {
        lines.push('\nAsset violations detected (not fatal, fix to match base):');
        if (diag.assetViolations.images.length) {
            const imgs = diag.assetViolations.images.slice(0, 10).map(p => `- image not from allowed set: ${p}`);
            lines.push(...imgs);
        }
        if (diag.assetViolations.fonts.length) {
            const f = diag.assetViolations.fonts.slice(0, 10).map(ff => `- font-family not in allowed tokens: ${ff}`);
            lines.push(...f);
        }
        if (diag.assetViolations.colors.length) {
            const c = diag.assetViolations.colors.slice(0, 12).map(cc => `- color outside palette: ${cc}`);
            lines.push(...c);
        }
    }
    lines.push('\nUpdate the code to eliminate these errors so the page renders without exceptions.');
    return lines.join('\n');
};

// Patch site JS files in-place to correct imports like: import { Icon } from 'react' -> from 'lucide-react'
const autoRepairIconImports = async (entryPath: string): Promise<boolean> => {
    const siteDir = path.dirname(entryPath);
    // scan .js files only in this site dir
    const files: string[] = [];
    const walk = async (dir: string) => {
        const ents = await fs.readdir(dir, { withFileTypes: true });
        for (const e of ents) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.isFile() && p.endsWith('.js')) files.push(p);
        }
    };
    await walk(siteDir);

    const allowedReactUpper = new Set(['Fragment', 'StrictMode', 'Suspense', 'Profiler']);
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    const lucideImport = dev ? 'https://esm.sh/lucide-react?dev&target=es2018' : 'https://esm.sh/lucide-react?target=es2018';
    let changedAny = false;

    for (const f of files) {
        let code = await fs.readFile(f, 'utf8');
        let before = code;

        const applyFix = (input: string): string => {
            let out = input;
            // regex for default+named and named-only
            const reDefaultAndNamed = /import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\3)\s*;?/g;
            const reNamedOnly = /import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\2)\s*;?/g;

            type Match = { full: string; hasDefault: boolean; defIdent?: string; names: string; q: string; spec: string; start: number; end: number };
            const matches: Match[] = [];
            const collect = (regex: RegExp, hasDefault: boolean) => {
                let m: RegExpExecArray | null;
                while ((m = regex.exec(out)) !== null) {
                    const names = hasDefault ? m[2] : m[1];
                    const q = hasDefault ? m[3] : m[2];
                    const spec = hasDefault ? m[4] : m[3];
                    const specLc = spec.toLowerCase();
                    if (!/\breact(?!-dom)/.test(specLc)) continue;
                    matches.push({ full: m[0], hasDefault, defIdent: hasDefault ? m[1] : undefined, names, q, spec, start: m.index, end: m.index + m[0].length });
                }
            };
            collect(reDefaultAndNamed, true);
            collect(reNamedOnly, false);
            if (!matches.length) return out;
            matches.sort((a, b) => b.start - a.start);
            for (const m of matches) {
                const parts = m.names.split(',').map(s => s.trim()).filter(Boolean);
                const keep: string[] = [];
                const toIcons: string[] = [];
                for (const p of parts) {
                    const base = p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim();
                    if (/^[A-Z]/.test(base) && !allowedReactUpper.has(base)) toIcons.push(p); else keep.push(p);
                }
                if (!toIcons.length) continue;
                let replacement = '';
                if (m.hasDefault && keep.length) replacement = `import ${m.defIdent}, { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
                else if (m.hasDefault && !keep.length) replacement = `import ${m.defIdent} from ${m.q}${m.spec}${m.q};`;
                else if (!m.hasDefault && keep.length) replacement = `import { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
                out = out.slice(0, m.start) + (replacement ? replacement + '\n' : '') + out.slice(m.end);
                const icons = toIcons.map(s => s.trim());
                const lucideRe = /(^|\n)\s*import\s*{\s*([^}]*?)\s*}\s*from\s*(["'])([^"']*lucide-react[^"']*)\3\s*;?/;
                const m2 = out.match(lucideRe);
                if (m2) {
                    const before = m2[0];
                    const currentNames = m2[2].split(',').map(s => s.trim()).filter(Boolean);
                    const merged = Array.from(new Set([...currentNames, ...icons]));
                    const after = `${m2[1]}import { ${merged.join(', ')} } from ${m2[3]}${m2[4]}${m2[3]};`;
                    out = out.replace(before, after);
                } else {
                    out = `import { ${icons.join(', ')} } from '${lucideImport}';\n` + out;
                }
            }
            return out;
        };

        code = applyFix(code);
        if (code !== before) {
            changedAny = true;
            await fs.writeFile(f, code, 'utf8');
        }
    }

    return changedAny;
};

// Attempt to fetch missing font files reported during preflight and rewrite fonts.css to point to local copies
const autoRepairMissingFonts = async (diag: PreflightResult, baseUrl: string, entryPath: string, retries = 1): Promise<{ changed: boolean; failed: string[] }> => {
    if (!diag || !diag.networkErrors?.length) return { changed: false, failed: [] };
    const siteDir = path.dirname(entryPath);
    const fontsCssPath = path.join(siteDir, 'fonts.css');
    let fontsCss = '';
    try {
        fontsCss = await fs.readFile(fontsCssPath, 'utf8');
    } catch {
        return { changed: false, failed: [] }; // nothing to patch
    }

    const toFix = diag.networkErrors
        .map(n => {
            try { return new URL(n.url); } catch { return null as any; }
        })
        .filter(Boolean)
        .map(u => u as URL)
        .filter(u => /\.(woff2?|ttf|otf)(?:$|\?|#)/i.test(u.pathname));

    if (!toFix.length) return { changed: false, failed: [] };

    let changed = false;
    const failed: string[] = [];
    await fs.mkdir(path.join(siteDir, 'assets', 'fonts'), { recursive: true }).catch(() => { });

    for (const u of toFix) {
        const pathname = u.pathname; // e.g., /kilrr/fonts/din-1.woff2
        // Build remote absolute URL from base site
        let remote: URL;
        try { remote = new URL(pathname, baseUrl); } catch { continue; }
        let ok = false;
        let lastErr: any;
        for (let r = 0; r <= Math.max(0, retries); r++) {
            try {
                const res = await fetch(remote.toString());
                if (!res.ok) { lastErr = `HTTP ${res.status}`; }
                else {
                    const buf = Buffer.from(await res.arrayBuffer());
                    const extMatch = pathname.match(/\.([a-z0-9]+)(?:$|\?|#)/i);
                    const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '.woff2';
                    const name = `retry-${crypto.createHash('sha1').update(remote.toString()).digest('hex').slice(0, 10)}${ext}`;
                    const localRel = path.join('assets', 'fonts', name);
                    const localFsPath = path.join(siteDir, localRel);
                    await fs.writeFile(localFsPath, buf);
                    const localUrlForCss = `./${localRel.replace(/\\/g, '/')}`;
                    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const candidates = [pathname, remote.toString()];
                    for (const c of candidates) {
                        const re = new RegExp(`url\\((['"])${esc(c)}\\1\\)`, 'g');
                        const reNoQuote = new RegExp(`url\\(${esc(c)}\\)`, 'g');
                        const before = fontsCss;
                        fontsCss = fontsCss.replace(re, `url('${localUrlForCss}')`).replace(reNoQuote, `url('${localUrlForCss}')`);
                        if (fontsCss !== before) changed = true;
                    }
                    ok = true;
                    break;
                }
            } catch (e: any) {
                lastErr = e?.message || String(e);
            }
            await new Promise(res => setTimeout(res, 200 * (r + 1)));
        }
        if (!ok) {
            failed.push(remote.toString());
        }
    }

    if (changed) {
        await fs.writeFile(fontsCssPath, fontsCss, 'utf8');
        return { changed: true, failed };
    }
    return { changed: false, failed };
};
