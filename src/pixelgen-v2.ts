
import path from 'path';
import fs from 'fs/promises';
import { extractGroundTruth, extractCurrentState } from './ground-truth/extractor';
import { computeStructuredDiff } from './ground-truth/differ';
import { prioritizeChanges } from './ground-truth/prioritizer';
import { applyCSSPatches } from './patcher/css-patcher';
import { validateChanges } from './patcher/validator';
import { rollbackChange } from './patcher/rollback';
import { freezeStructure, verifyStructure } from './structure-freeze';
import { AppliedChange } from './ground-truth/types';
import { compareSites } from './comparator';
import { timestampId, ensureDir } from './utils';
import { config } from './config';
import { capture } from './screenshot';
import { scanBaseAssets, AssetScanResult } from './asset-scan';
import { writeReactBundle, ReactBundle } from './react-host';

// Import from pixelgen-legacy (we will rename pixelgen.ts to pixelgen-legacy.ts)
// For now, we assume pixelgen.ts is still there and we will rename it later.
// But wait, if I rename it later, the import will break if I write this file now with 'pixelgen-legacy'.
// I should use 'pixelgen-legacy' and rely on the rename step.
// However, I need to extract generateInitialSite logic here because it's not exported from pixelgen.ts.

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

const saveJson = async (filePath: string, data: any) => {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

const computeSimilarity = async (baseUrl: string, localUrl: string, device: 'desktop' | 'mobile'): Promise<number> => {
    const result = await compareSites(baseUrl, localUrl, { base: 'base', target: 'current' }, { headless: true }, device);
    return result.diff.similarity;
};

const generateInitialSite = async (baseUrl: string): Promise<{ bundle: ReactBundle; siteDir: string; localUrl: string }> => {
    const jobId = timestampId();
    const runDir = path.join(config.outputDir, 'pixelgen-v2', jobId);
    await ensureDir(runDir);

    // Capture base screenshot (desktop only for V1 of V2)
    const device = 'desktop';
    const captureResult = await capture(baseUrl, {
        device,
        outputDir: path.join(runDir, 'base'),
    });
    const desktopBase = captureResult.path;
    const desktopBaseBuffer = await fs.readFile(desktopBase);
    const desktopBaseDataUrl = `data:image/png;base64,${desktopBaseBuffer.toString('base64')}`;

    // Scan assets
    const assetsScanDir = path.join(runDir, 'base-assets');
    await ensureDir(assetsScanDir);
    let baseAssets: AssetScanResult | undefined;
    try {
        baseAssets = await scanBaseAssets(baseUrl, assetsScanDir, { headless: true });
    } catch (e) {
        console.warn('Asset scan failed:', e);
    }

    // Generate initial code
    const stack = 'react_tailwind';
    const createModel = process.env.GENERATOR_CREATE_MODEL || 'gemini-2.5-pro';

    const createRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/generate-from-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            stack,
            image: desktopBaseDataUrl,
            model: createModel,
            sectionSpecs: baseAssets?.sectionSpecs
        })
    }));

    if (!createRes.ok) {
        throw new Error(`Generator failed: ${createRes.statusText}`);
    }

    const createData = await createRes.json();
    const bundle: ReactBundle = createData.bundle;

    // Write bundle into run directory (will create runDir/site)
    const { localUrl } = await writeReactBundle(runDir, bundle);

    return { bundle, siteDir: runDir, localUrl };
};

export interface PixelGenV2Options {
    baseUrl: string;
    maxIterations?: number;
    targetSimilarity?: number;
    changesPerIteration?: number;
    device?: 'desktop' | 'mobile';
}

export const runPixelGenV2 = async (options: PixelGenV2Options) => {
    const {
        baseUrl,
        maxIterations = 20,
        targetSimilarity = 0.95,
        changesPerIteration = 5,
        device = 'desktop'
    } = options;

    // ========== PHASE 1: Initial Generation ==========
    console.log('[PixelGen v2] Phase 1: Initial generation...');
    const { bundle, siteDir, localUrl } = await generateInitialSite(baseUrl);

    // Freeze structure - extract HTML and create CSS architecture
    const { frozenHtml, baseCss, overridesPath } = await freezeStructure(siteDir);

    // ========== PHASE 2: Extract Ground Truth ==========
    console.log('[PixelGen v2] Phase 2: Extracting ground truth...');
    const groundTruth = await extractGroundTruth(baseUrl, device);
    await saveJson(path.join(siteDir, 'ground-truth.json'), groundTruth);

    // ========== ITERATION LOOP ==========
    let currentSimilarity = 0;
    let iteration = 0;
    const appliedChanges: AppliedChange[] = [];

    while (iteration < maxIterations && currentSimilarity < targetSimilarity) {
        console.log(`[PixelGen v2] Iteration ${iteration}...`);

        // Enforce structure lock before each iteration
        const structureOk = await verifyStructure(siteDir);
        if (!structureOk) {
            throw new Error('HTML structure has changed since freeze; aborting to enforce read-only structure.');
        }

        // ========== PHASE 2 (per iteration): Extract Current State ==========
        const currentState = await extractCurrentState(localUrl, device);
        await saveJson(path.join(siteDir, `iteration-${iteration}`, 'current-state.json'), currentState);

        // ========== PHASE 3: Compute Structured Diff ==========
        const diff = computeStructuredDiff(groundTruth, currentState);
        await saveJson(path.join(siteDir, `iteration-${iteration}`, 'diff.json'), diff);

        if (diff.changes.length === 0) {
            console.log('[PixelGen v2] No differences found. Converged!');
            break;
        }

        // ========== PHASE 4: Prioritize Changes ==========
        const prioritized = prioritizeChanges(diff.changes, changesPerIteration);
        console.log(`[PixelGen v2] Applying ${prioritized.length} changes...`);

        // ========== PHASE 5: Apply Deterministic Patches ==========
        for (const change of prioritized) {
            const patchResult = await applyCSSPatches(overridesPath, [change]);

            // ========== PHASE 6: Validate Each Change ==========
            const validation = await validateChanges(localUrl, [change], device);

            if (validation.regressions.length > 0) {
                console.warn(`[PixelGen v2] Regression detected for ${change.cssSelector}.${change.property}, rolling back...`);
                await rollbackChange(overridesPath, change);
            } else {
                appliedChanges.push({ ...change, iteration, appliedAt: new Date().toISOString() });
                console.log(`[PixelGen v2] ✓ Applied: ${change.cssSelector} { ${change.property}: ${change.expected} }`);
            }
        }

        // Compute new similarity
        currentSimilarity = await computeSimilarity(baseUrl, localUrl, device);
        console.log(`[PixelGen v2] Iteration ${iteration} complete. Similarity: ${(currentSimilarity * 100).toFixed(2)}%`);

        iteration++;
    }

    return {
        finalSimilarity: currentSimilarity,
        iterations: iteration,
        appliedChanges,
        localUrl
    };
};
