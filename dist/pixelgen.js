"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPixelGen = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const utils_1 = require("./utils");
const storage_1 = require("./storage");
const config_1 = require("./config");
const screenshot_1 = require("./screenshot");
const react_host_1 = require("./react-host");
const comparator_1 = require("./comparator");
const llm_feedback_1 = require("./llm-feedback");
const asset_scan_1 = require("./asset-scan");
const playwright_1 = require("playwright");
const crypto_1 = __importDefault(require("crypto"));
const GENERATOR_API_URL = process.env.GENERATOR_API_URL || 'http://localhost:8000';
const withRetry = async (fn, retries = 2, baseDelayMs = 500) => {
    let lastErr;
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        }
        catch (e) {
            lastErr = e;
            if (i === retries)
                break;
            const delay = baseDelayMs * Math.pow(2, i);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw lastErr;
};
const runPixelGen = async (options) => {
    const jobId = (0, utils_1.timestampId)();
    const runDir = path_1.default.join(config_1.config.outputDir, 'pixelgen', jobId);
    await (0, utils_1.ensureDir)(runDir);
    const devices = options.devices || ['desktop', 'mobile'];
    const minSimilarity = options.minSimilarity ?? 0.90;
    const maxIterations = options.maxIterations ?? 5;
    const stack = options.stack || 'react_tailwind';
    // Convergence settings
    const STALL_THRESHOLD = 0.005; // 0.5% improvement required
    const STALL_ITERATIONS = 2; // Stop if no improvement for 2 consecutive iterations
    const iterations = [];
    let currentBundle;
    let stopReason = '';
    // Track best similarity to detect stalls
    let bestSimilarity = 0;
    let stallCounter = 0;
    // Iteration 0: Capture Base & Create Initial Bundle
    console.log(`[PixelGen] Starting run ${jobId} for ${options.baseUrl}`);
    // Capture base screenshots
    const baseScreenshots = {};
    for (const device of devices) {
        const result = await (0, screenshot_1.capture)(options.baseUrl, {
            device,
            fullPage: options.fullPage,
            outputDir: path_1.default.join(runDir, 'iteration-00', device, 'base'), // Temp location or just use return path
        });
        // Move to structured path
        const targetPath = path_1.default.join(runDir, 'iteration-00', device, 'base.png');
        await (0, utils_1.ensureDir)(path_1.default.dirname(targetPath));
        await promises_1.default.rename(result.path, targetPath);
        baseScreenshots[device] = targetPath;
    }
    // Generate initial code (using desktop base screenshot)
    const desktopBase = baseScreenshots['desktop'] || Object.values(baseScreenshots)[0];
    const desktopBaseBuffer = await promises_1.default.readFile(desktopBase);
    const desktopBaseDataUrl = `data:image/png;base64,${desktopBaseBuffer.toString('base64')}`;
    console.log('[PixelGen] Requesting initial generation...');
    // Multi-turn chat with generator is optional; default to single-shot unless enabled via env
    const useChat = (process.env.GENERATOR_USE_CHAT || '').toLowerCase() === 'true';
    const chatHistory = [];
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
        body: JSON.stringify(Object.assign({ stack, image: desktopBaseDataUrl, model: createModel }, useChat ? { history: chatHistory } : {}))
    }));
    if (!createRes.ok) {
        let detail = '';
        try {
            detail = await createRes.text();
        }
        catch { }
        throw new Error(`Generator failed: ${createRes.status} ${createRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
    }
    const createData = await createRes.json();
    currentBundle = createData.bundle;
    // Scan base URL assets (fonts/images/typography) once and reuse across iterations
    console.log('[PixelGen] Scanning base site assets (fonts/images/typography)...');
    const assetsScanDir = path_1.default.join(runDir, 'base-assets');
    await (0, utils_1.ensureDir)(assetsScanDir);
    let baseAssets;
    try {
        baseAssets = await (0, asset_scan_1.scanBaseAssets)(options.baseUrl, assetsScanDir, { fullPage: options.fullPage, headless: options.headless });
        console.log('[PixelGen] Asset scan complete.');
    }
    catch (e) {
        console.warn('[PixelGen] Asset scan failed:', e instanceof Error ? e.message : String(e));
    }
    // Loop
    let noImprovementStreak = 0;
    let prevBest = 0;
    for (let i = 0; i <= maxIterations; i++) {
        const iterDir = path_1.default.join(runDir, `iteration-${String(i).padStart(2, '0')}`);
        await (0, utils_1.ensureDir)(iterDir);
        // Write bundle with compile-fix fallback
        let localUrl;
        let entryPath;
        try {
            const r = await (0, react_host_1.writeReactBundle)(iterDir, currentBundle);
            localUrl = r.localUrl;
            entryPath = r.entryPath;
        }
        catch (e) {
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
                body: JSON.stringify(Object.assign({ stack, currentBundle, instructions, images: [desktopBaseDataUrl], model: updateModel }, useChat ? { history: chatHistory } : {}))
            }));
            if (!updateRes.ok) {
                let detail = '';
                try {
                    detail = await updateRes.text();
                }
                catch { }
                throw new Error(`Update (compile) failed: ${updateRes.status} ${updateRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
            }
            const updateData = await updateRes.json();
            currentBundle = updateData.bundle;
            if (useChat) {
                try {
                    chatHistory.push({ role: 'user', content: instructions });
                    capHistory();
                }
                catch { }
            }
            const r2 = await (0, react_host_1.writeReactBundle)(iterDir, currentBundle);
            localUrl = r2.localUrl;
            entryPath = r2.entryPath;
        }
        // Inject base assets (fonts + typography) into the generated app
        try {
            if (baseAssets) {
                const entryDir = path_1.default.dirname(entryPath);
                await (0, asset_scan_1.injectAssetsIntoHtml)(entryPath, entryDir, baseAssets);
            }
        }
        catch (e) {
            console.warn('[PixelGen] Asset injection failed:', e instanceof Error ? e.message : String(e));
        }
        // Preflight: load the app, capture console/page errors, and auto-fix before comparing
        // After iteration 0, enforce base assets via CSP
        try {
            if (baseAssets && i > 0)
                await (0, asset_scan_1.injectCspForAssets)(entryPath);
        }
        catch { }
        const preflightMaxAttempts = Number(process.env.PREFLIGHT_MAX_ATTEMPTS || 3);
        let lastHealth;
        let lastHealthSig;
        // Build enforcement allowlists from base assets
        const allowedImageSuffixes = baseAssets ? baseAssets.assets.images.map(im => '/' + im.localPath.replace(/\\/g, '/')) : [];
        const allowedFontTokens = baseAssets?.fontFamilies || [];
        const allowedColors = baseAssets?.palette ? [...(baseAssets.palette.colors || []), ...(baseAssets.palette.backgrounds || [])] : [];
        for (let attempt = 0; attempt < preflightMaxAttempts; attempt++) {
            const health = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
            lastHealth = health;
            // Save diagnostics
            await promises_1.default.writeFile(path_1.default.join(iterDir, `preflight-${attempt}.json`), JSON.stringify(health, null, 2));
            // Opportunistic auto-repair 1: fetch missing fonts from base site and rewrite to local paths
            try {
                const repair = await autoRepairMissingFonts(health, options.baseUrl, entryPath, 2);
                if (repair.changed) {
                    const recheck = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
                    lastHealth = recheck;
                    await promises_1.default.writeFile(path_1.default.join(iterDir, `preflight-${attempt}-after-repair.json`), JSON.stringify(recheck, null, 2));
                    if (recheck.healthy) {
                        if (attempt > 0)
                            console.log(`[PixelGen] Preflight recovered after auto-repair.`);
                        break;
                    }
                }
                if (repair.failed.length) {
                    // Persist missing assets for visibility
                    await promises_1.default.writeFile(path_1.default.join(iterDir, `missing-fonts.json`), JSON.stringify(repair.failed, null, 2));
                }
            }
            catch (e) {
                console.warn('[PixelGen] Auto-repair of missing fonts failed:', e instanceof Error ? e.message : String(e));
            }
            // Opportunistic auto-repair 2: fix icon misimports from 'react' -> 'lucide-react' directly in site files
            try {
                const repairedIcons = await autoRepairIconImports(entryPath);
                if (repairedIcons) {
                    const recheck2 = await preflightCheck(localUrl, { allowedImageSuffixes, allowedFontTokens, allowedColors });
                    lastHealth = recheck2;
                    await promises_1.default.writeFile(path_1.default.join(iterDir, `preflight-${attempt}-after-icon-repair.json`), JSON.stringify(recheck2, null, 2));
                    if (recheck2.healthy) {
                        if (attempt > 0)
                            console.log(`[PixelGen] Preflight recovered after icon import repair.`);
                        break;
                    }
                }
            }
            catch (e) {
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
                    console.warn('[PixelGen] Preflight errors unchanged after auto-repairs; skipping LLM update to save cost.');
                    break;
                }
                lastHealthSig = sig;
            }
            catch { }
            console.log('[PixelGen] Preflight issues detected; requesting code fix...');
            let instructions = buildDiagnosticsFixPrompt(lastHealth, baseAssets);
            // If we previously failed to fetch any font URLs, make it explicit for the model
            try {
                const missPath = path_1.default.join(iterDir, `missing-fonts.json`);
                const exists = await promises_1.default.access(missPath).then(() => true).catch(() => false);
                if (exists) {
                    const failed = JSON.parse(await promises_1.default.readFile(missPath, 'utf8'));
                    if (failed && failed.length) {
                        instructions += `\n\nMISSING FONT URLS (fetch failed, do not reference these):\n- ${failed.join('\n- ')}`;
                        instructions += `\n\nReplace @font-face src urls with local './assets/fonts/*.woff2' captured in the bundle; if unavailable, remove those @font-face entries or use already-allowed font-family tokens from base assets (${(baseAssets?.fontFamilies || []).slice(0, 5).join(', ')}) without external URLs.`;
                    }
                }
            }
            catch { }
            const updateRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign({ stack, currentBundle, instructions, images: (health.screenshotDataUrl ? [health.screenshotDataUrl] : [desktopBaseDataUrl]), model: updateModel }, useChat ? { history: chatHistory } : {}))
            }));
            if (!updateRes.ok) {
                let detail = '';
                try {
                    detail = await updateRes.text();
                }
                catch { }
                throw new Error(`Update (preflight) failed: ${updateRes.status} ${updateRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
            }
            const updateData = await updateRes.json();
            currentBundle = updateData.bundle;
            if (useChat) {
                try {
                    chatHistory.push({ role: 'user', content: instructions });
                    capHistory();
                }
                catch { }
            }
            const rewritten = await (0, react_host_1.writeReactBundle)(iterDir, currentBundle);
            // Re-inject assets again after update
            try {
                if (baseAssets) {
                    const entryDir2 = path_1.default.dirname(rewritten.entryPath);
                    await (0, asset_scan_1.injectAssetsIntoHtml)(rewritten.entryPath, entryDir2, baseAssets);
                }
            }
            catch (e) {
                console.warn('[PixelGen] Asset re-injection failed:', e instanceof Error ? e.message : String(e));
            }
        }
        if (lastHealth && !lastHealth.healthy) {
            throw new Error('Preflight failed after maximum attempts; aborting compare. Check preflight diagnostics JSON for details.');
        }
        console.log(`[PixelGen] Iteration ${i} hosted at ${localUrl}`);
        // Compare
        const deviceArtifacts = [];
        const similarities = {};
        for (const device of devices) {
            const baseSrc = baseScreenshots[device];
            // Copy base to iter dir for completeness
            const baseDest = path_1.default.join(iterDir, device, 'base.png');
            await (0, utils_1.ensureDir)(path_1.default.dirname(baseDest));
            await promises_1.default.copyFile(baseSrc, baseDest);
            const comparison = await (0, comparator_1.compareSites)(options.baseUrl, // We use baseUrl for comparison to get accurate diff against live site? 
            // Wait, compareSites captures both. But we already have base. 
            // Actually compareSites captures both live. 
            // Optimization: We should probably use the captured base image if possible, but compareSites logic is coupled to capturing.
            // For now, let's let compareSites capture both to ensure consistent viewport/rendering environment.
            localUrl, { base: 'base', target: 'target' }, {
                outputDir: path_1.default.join(iterDir, device),
                viewport: device === 'mobile' ? { width: 375, height: 667, deviceScaleFactor: 2 } : { width: 1280, height: 720, deviceScaleFactor: 1 },
                fullPage: options.fullPage,
                threshold: options.threshold
            }, device);
            similarities[device] = comparison.diff.similarity;
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
        // Calculate average similarity for convergence check
        const avgSimilarity = Object.values(similarities).reduce((a, b) => a + b, 0) / devices.length;
        console.log(`[PixelGen] Iteration ${i} average similarity: ${avgSimilarity.toFixed(4)}`);
        // Check success
        const allPassed = devices.every(d => similarities[d] >= minSimilarity);
        if (allPassed) {
            stopReason = 'Threshold met';
            break;
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
        }
        else {
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
            }
            else {
                stallCounter++;
                console.log(`[PixelGen] Convergence stall detected (${stallCounter}/${STALL_ITERATIONS})`);
                if (stallCounter >= STALL_ITERATIONS) {
                    stopReason = 'Convergence stalled';
                    break;
                }
            }
        }
        else {
            bestSimilarity = avgSimilarity;
        }
        // Prepare Feedback & Update
        console.log(`[PixelGen] Generating feedback for iteration ${i}...`);
        const instructions = await (0, llm_feedback_1.buildFeedback)(deviceArtifacts);
        // Save feedback
        await promises_1.default.writeFile(path_1.default.join(iterDir, 'fix-prompt.md'), instructions);
        console.log(`[PixelGen] Requesting update...`);
        // Collect images for update (one per device)
        const updateImages = [];
        for (const art of deviceArtifacts) {
            const baseBuf = await promises_1.default.readFile(art.basePath);
            const targetBuf = await promises_1.default.readFile(art.targetPath);
            const diffBuf = await promises_1.default.readFile(art.diffPath);
            updateImages.push(`data:image/png;base64,${baseBuf.toString('base64')}`);
            updateImages.push(`data:image/png;base64,${targetBuf.toString('base64')}`);
            updateImages.push(`data:image/png;base64,${diffBuf.toString('base64')}`);
        }
        const updateRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/update-from-diff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.assign({ stack, currentBundle, instructions, images: updateImages, model: updateModel }, useChat ? { history: chatHistory } : {}))
        }));
        if (!updateRes.ok) {
            let detail = '';
            try {
                detail = await updateRes.text();
            }
            catch { }
            throw new Error(`Update failed: ${updateRes.status} ${updateRes.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`);
        }
        const updateData = await updateRes.json();
        currentBundle = updateData.bundle;
        if (useChat) {
            try {
                chatHistory.push({ role: 'user', content: instructions });
                capHistory();
            }
            catch { }
        }
    }
    let artifactsUrl = (0, utils_1.getLocalArtifactUrl)(`pixelgen/${jobId}`);
    try {
        const maybeUrl = await storage_1.storage.artifactsUrl(runDir);
        if (maybeUrl)
            artifactsUrl = maybeUrl;
    }
    catch { }
    const summary = {
        jobId,
        artifactsUrl,
        iterations,
        finalLocalUrl: iterations[iterations.length - 1].localUrl,
        stopReason
    };
    await promises_1.default.writeFile(path_1.default.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2));
    return summary;
};
exports.runPixelGen = runPixelGen;
const preflightCheck = async (url, enforcement) => {
    const browser = await playwright_1.chromium.launch({ headless: true });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const logs = [];
    const pageErrors = [];
    const networkErrors = [];
    page.on('console', (msg) => {
        const t = msg.type();
        const level = t === 'error' ? 'error' : (t === 'warning' || t === 'warn' ? 'warn' : 'log');
        // capture only log/warn/error
        if (level === 'log' || level === 'warn' || level === 'error') {
            logs.push({ type: level, text: msg.text() });
        }
    });
    page.on('pageerror', (err) => {
        pageErrors.push(err.message || String(err));
    });
    page.on('response', (res) => {
        try {
            const status = res.status();
            if (status >= 400) {
                // capture common static asset failures
                networkErrors.push({ url: res.url(), status, type: res.request().resourceType() });
            }
        }
        catch { }
    });
    let shot;
    // Hoist violations outside try/catch so we can always include diagnostics
    let violations = { images: [], fonts: [], colors: [] };
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForLoadState('load', { timeout: 10000 }).catch(() => { });
        // Give React time to mount and run effects
        await page.waitForTimeout(1000);
        const buf = await page.screenshot({ fullPage: false }).catch(() => undefined);
        if (buf && Buffer.isBuffer(buf)) {
            shot = `data:image/png;base64,${buf.toString('base64')}`;
        }
        // Asset enforcement check inside the page
        const assets = await page.evaluate((rules) => {
            const images = [];
            const fonts = [];
            const colors = [];
            const allowedImgSuffixes = new Set(rules?.allowedImageSuffixes || []);
            const allowedFontTokens = (rules?.allowedFontTokens || []);
            const allowedColors = new Set((rules?.allowedColors || []));
            // images: <img> and common background-image urls
            for (const img of Array.from(document.images)) {
                try {
                    const url = new URL(img.currentSrc || img.src, location.href);
                    const path = url.pathname;
                    const ok = Array.from(allowedImgSuffixes).some((s) => path.endsWith(s));
                    if (!ok)
                        images.push(path);
                }
                catch { }
            }
            const sampleBgNodes = Array.from(document.querySelectorAll('*')).slice(0, 300);
            for (const el of sampleBgNodes) {
                const bg = getComputedStyle(el).getPropertyValue('background-image');
                const urls = (bg.match(/url\(([^)]+)\)/g) || []).map((m) => m.replace(/^url\((.*)\)$/, '$1').replace(/^["']|["']$/g, ''));
                for (const u of urls) {
                    try {
                        const p = new URL(u, location.href).pathname;
                        const ok = Array.from(allowedImgSuffixes).some((s) => p.endsWith(s));
                        if (!ok)
                            images.push(p);
                    }
                    catch { }
                }
            }
            // fonts/colors: sample common elements
            const sels = ['body', 'h1', 'h2', 'h3', 'p', 'a', 'button'];
            for (const sel of sels) {
                const el = document.querySelector(sel);
                if (!el)
                    continue;
                const cs = getComputedStyle(el);
                const ff = cs.getPropertyValue('font-family');
                if (ff) {
                    const tokens = ff.split(',').map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
                    const ok = tokens.some(t => allowedFontTokens.includes(t));
                    if (!ok)
                        fonts.push(ff);
                }
                const color = cs.getPropertyValue('color');
                const bgc = cs.getPropertyValue('background-color');
                const okColor = !allowedColors.size || allowedColors.has(color);
                const okBg = !allowedColors.size || allowedColors.has(bgc);
                if (!okColor)
                    colors.push(color);
                if (!okBg)
                    colors.push(bgc);
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
    }
    catch (e) {
        pageErrors.push(e instanceof Error ? e.message : String(e));
    }
    finally {
        await context.close();
        await browser.close();
    }
    // Heuristics for health
    const hasSevereConsole = logs.some((l) => l.type === 'error');
    const hasPageErrors = pageErrors.length > 0;
    // Ignore favicon 404s; they are benign and we try to inject one
    const netIssues = networkErrors.filter((n) => !/favicon\.ico/i.test(n.url));
    const healthy = !hasSevereConsole && !hasPageErrors;
    return { url, healthy, console: logs, pageErrors, networkErrors: netIssues, screenshotDataUrl: shot, assetViolations: violations };
};
const buildDiagnosticsFixPrompt = (diag, base) => {
    const lines = [];
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
        if (base.logoCandidate)
            lines.push(`- Logo image: ${base.logoCandidate}`);
        if (base.heroCandidate)
            lines.push(`- Hero image: ${base.heroCandidate}`);
        // Keep at most a few image hints to reduce token size
        if (base.imageHints && base.imageHints.length > 0) {
            const top = base.imageHints.slice(0, 8).map(h => h.localPath || h.url).filter(Boolean);
            if (top.length)
                lines.push(`- Representative images available: ${top.join(', ')}`);
        }
        if (base.fontFamilies && base.fontFamilies.length)
            lines.push(`- Allowed font families: ${base.fontFamilies.join(', ')}`);
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
        const seen = new Set();
        for (const m of diag.console) {
            const key = `${m.type}:${m.text}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            lines.push(`- [${m.type}] ${m.text}`);
            if (seen.size >= 12)
                break; // cap
        }
    }
    if (diag.pageErrors.length) {
        lines.push('\nPage errors:');
        const unique = Array.from(new Set(diag.pageErrors)).slice(0, 10);
        for (const e of unique)
            lines.push(`- ${e}`);
    }
    if (diag.networkErrors.length) {
        lines.push('\nNetwork errors:');
        const uniq = [];
        const seen = new Set();
        for (const n of diag.networkErrors) {
            const k = `${n.status}:${n.type}:${n.url}`;
            if (!seen.has(k)) {
                seen.add(k);
                uniq.push(`- ${n.status} ${n.type} ${n.url}`);
            }
            if (uniq.length >= 12)
                break;
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
const autoRepairIconImports = async (entryPath) => {
    const siteDir = path_1.default.dirname(entryPath);
    // scan .js files only in this site dir
    const files = [];
    const walk = async (dir) => {
        const ents = await promises_1.default.readdir(dir, { withFileTypes: true });
        for (const e of ents) {
            const p = path_1.default.join(dir, e.name);
            if (e.isDirectory())
                await walk(p);
            else if (e.isFile() && p.endsWith('.js'))
                files.push(p);
        }
    };
    await walk(siteDir);
    const allowedReactUpper = new Set(['Fragment', 'StrictMode', 'Suspense', 'Profiler']);
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    const lucideImport = dev ? 'https://esm.sh/lucide-react?dev' : 'https://esm.sh/lucide-react';
    let changedAny = false;
    for (const f of files) {
        let code = await promises_1.default.readFile(f, 'utf8');
        let before = code;
        const applyFix = (input) => {
            let out = input;
            // regex for default+named and named-only
            const reDefaultAndNamed = /import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\3)\s*;?/g;
            const reNamedOnly = /import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\2)\s*;?/g;
            const matches = [];
            const collect = (regex, hasDefault) => {
                let m;
                while ((m = regex.exec(out)) !== null) {
                    const names = hasDefault ? m[2] : m[1];
                    const q = hasDefault ? m[3] : m[2];
                    const spec = hasDefault ? m[4] : m[3];
                    const specLc = spec.toLowerCase();
                    if (!/\breact(?!-dom)/.test(specLc))
                        continue;
                    matches.push({ full: m[0], hasDefault, defIdent: hasDefault ? m[1] : undefined, names, q, spec, start: m.index, end: m.index + m[0].length });
                }
            };
            collect(reDefaultAndNamed, true);
            collect(reNamedOnly, false);
            if (!matches.length)
                return out;
            matches.sort((a, b) => b.start - a.start);
            for (const m of matches) {
                const parts = m.names.split(',').map(s => s.trim()).filter(Boolean);
                const keep = [];
                const toIcons = [];
                for (const p of parts) {
                    const base = p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim();
                    if (/^[A-Z]/.test(base) && !allowedReactUpper.has(base))
                        toIcons.push(p);
                    else
                        keep.push(p);
                }
                if (!toIcons.length)
                    continue;
                let replacement = '';
                if (m.hasDefault && keep.length)
                    replacement = `import ${m.defIdent}, { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
                else if (m.hasDefault && !keep.length)
                    replacement = `import ${m.defIdent} from ${m.q}${m.spec}${m.q};`;
                else if (!m.hasDefault && keep.length)
                    replacement = `import { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
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
                }
                else {
                    out = `import { ${icons.join(', ')} } from '${lucideImport}';\n` + out;
                }
            }
            return out;
        };
        code = applyFix(code);
        if (code !== before) {
            changedAny = true;
            await promises_1.default.writeFile(f, code, 'utf8');
        }
    }
    return changedAny;
};
// Attempt to fetch missing font files reported during preflight and rewrite fonts.css to point to local copies
const autoRepairMissingFonts = async (diag, baseUrl, entryPath, retries = 1) => {
    if (!diag || !diag.networkErrors?.length)
        return { changed: false, failed: [] };
    const siteDir = path_1.default.dirname(entryPath);
    const fontsCssPath = path_1.default.join(siteDir, 'fonts.css');
    let fontsCss = '';
    try {
        fontsCss = await promises_1.default.readFile(fontsCssPath, 'utf8');
    }
    catch {
        return { changed: false, failed: [] }; // nothing to patch
    }
    const toFix = diag.networkErrors
        .map(n => {
        try {
            return new URL(n.url);
        }
        catch {
            return null;
        }
    })
        .filter(Boolean)
        .map(u => u)
        .filter(u => /\.(woff2?|ttf|otf)(?:$|\?|#)/i.test(u.pathname));
    if (!toFix.length)
        return { changed: false, failed: [] };
    let changed = false;
    const failed = [];
    await promises_1.default.mkdir(path_1.default.join(siteDir, 'assets', 'fonts'), { recursive: true }).catch(() => { });
    for (const u of toFix) {
        const pathname = u.pathname; // e.g., /kilrr/fonts/din-1.woff2
        // Build remote absolute URL from base site
        let remote;
        try {
            remote = new URL(pathname, baseUrl);
        }
        catch {
            continue;
        }
        let ok = false;
        let lastErr;
        for (let r = 0; r <= Math.max(0, retries); r++) {
            try {
                const res = await fetch(remote.toString());
                if (!res.ok) {
                    lastErr = `HTTP ${res.status}`;
                }
                else {
                    const buf = Buffer.from(await res.arrayBuffer());
                    const extMatch = pathname.match(/\.([a-z0-9]+)(?:$|\?|#)/i);
                    const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '.woff2';
                    const name = `retry-${crypto_1.default.createHash('sha1').update(remote.toString()).digest('hex').slice(0, 10)}${ext}`;
                    const localRel = path_1.default.join('assets', 'fonts', name);
                    const localFsPath = path_1.default.join(siteDir, localRel);
                    await promises_1.default.writeFile(localFsPath, buf);
                    const localUrlForCss = `./${localRel.replace(/\\/g, '/')}`;
                    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const candidates = [pathname, remote.toString()];
                    for (const c of candidates) {
                        const re = new RegExp(`url\\((['"])${esc(c)}\\1\\)`, 'g');
                        const reNoQuote = new RegExp(`url\\(${esc(c)}\\)`, 'g');
                        const before = fontsCss;
                        fontsCss = fontsCss.replace(re, `url('${localUrlForCss}')`).replace(reNoQuote, `url('${localUrlForCss}')`);
                        if (fontsCss !== before)
                            changed = true;
                    }
                    ok = true;
                    break;
                }
            }
            catch (e) {
                lastErr = e?.message || String(e);
            }
            await new Promise(res => setTimeout(res, 200 * (r + 1)));
        }
        if (!ok) {
            failed.push(remote.toString());
        }
    }
    if (changed) {
        await promises_1.default.writeFile(fontsCssPath, fontsCss, 'utf8');
        return { changed: true, failed };
    }
    return { changed: false, failed };
};
