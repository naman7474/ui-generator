// src/pixelgen-v2.ts
//
// COMPLETE REWRITE with structure-aware generation
//
// Flow:
// 1. Extract DOM structure from target site
// 2. Generate code that MATCHES the structure
// 3. Verify structure match (retry if needed)
// 4. CSS refinement loop (now much more effective)
//

import path from 'path';
import fs from 'fs/promises';
import { extractGroundTruth, extractCurrentState } from './ground-truth/extractor';
import { computeStructuredDiff } from './ground-truth/differ';
import { prioritizeChanges } from './ground-truth/prioritizer';
import { applyCSSPatches } from './patcher/css-patcher';
import { freezeStructure, verifyStructure } from './structure-freeze';
import { AppliedChange, StyleChange } from './ground-truth/types';
import { compareSites } from './comparator';
import { ensureDir } from './utils';
import { generateInitialSiteWithStructure } from './structure-aware-generator';

const saveJson = async (filePath: string, data: any) => {
    await ensureDir(path.dirname(filePath));
    const serializable = JSON.parse(JSON.stringify(data, (key, value) => {
        if (value instanceof Map) {
            return Array.from(value.entries());
        }
        return value;
    }));
    await fs.writeFile(filePath, JSON.stringify(serializable, null, 2));
};

const computeSimilarity = async (baseUrl: string, localUrl: string, device: 'desktop' | 'mobile'): Promise<number> => {
    const result = await compareSites(baseUrl, localUrl, { base: 'base', target: 'current' }, { headless: true }, device);
    return result.diff.similarity;
};

const changeKey = (change: StyleChange): string => {
    return `${change.stableSelector}::${change.property}`;
};

const filterAppliedChanges = (changes: StyleChange[], appliedKeys: Set<string>): StyleChange[] => {
    return changes.filter(c => !appliedKeys.has(changeKey(c)));
};

const filterValidChanges = (changes: StyleChange[]): StyleChange[] => {
    return changes.filter(c => {
        if (!c.cssSelector || c.cssSelector.trim() === '') return false;
        if (!c.property || c.property.trim() === '') return false;
        if (c.expected === undefined || c.expected === null) return false;
        return true;
    });
};

export interface PixelGenV2Options {
    baseUrl: string;
    maxIterations?: number;
    targetSimilarity?: number;
    changesPerIteration?: number;
    device?: 'desktop' | 'mobile';
    structureTargetMatch?: number;  // NEW: target structure match rate
}

export const runPixelGenV2 = async (options: PixelGenV2Options) => {
    const {
        baseUrl,
        maxIterations = 20,
        targetSimilarity = 0.95,
        changesPerIteration = 10,
        device = 'desktop',
        structureTargetMatch = 80  // NEW
    } = options;

    // ========== PHASE 1: Structure-Aware Generation ==========
    console.log('\n[PixelGen v2] ═══════════════════════════════════════════════════════════');
    console.log('[PixelGen v2] PHASE 1: Structure-Aware Initial Generation');
    console.log('[PixelGen v2] ═══════════════════════════════════════════════════════════\n');

    const { siteDir, localUrl, entryPath, structureMatchRate } = await generateInitialSiteWithStructure(baseUrl);

    console.log(`\n[PixelGen v2] Initial generation complete:`);
    console.log(`  - Site directory: ${siteDir}`);
    console.log(`  - Local URL: ${localUrl}`);
    console.log(`  - Structure match: ${structureMatchRate.toFixed(1)}%`);

    // Calculate expected maximum similarity based on structure match
    const expectedMaxSimilarity = Math.min(0.98, (structureMatchRate / 100) + 0.15);
    console.log(`  - Expected max achievable similarity: ${(expectedMaxSimilarity * 100).toFixed(1)}%`);

    if (structureMatchRate < structureTargetMatch) {
        console.log(`\n[PixelGen v2] ⚠ WARNING: Structure match (${structureMatchRate.toFixed(1)}%) below target (${structureTargetMatch}%)`);
        console.log('[PixelGen v2] CSS refinement may have limited effectiveness.\n');
    }

    // ========== PHASE 2: Freeze Structure ==========
    console.log('\n[PixelGen v2] ═══════════════════════════════════════════════════════════');
    console.log('[PixelGen v2] PHASE 2: Freezing Structure');
    console.log('[PixelGen v2] ═══════════════════════════════════════════════════════════\n');

    const { frozenHtml, baseCss, overridesPath } = await freezeStructure(siteDir);
    console.log(`[PixelGen v2] Structure frozen. Overrides path: ${overridesPath}`);

    // ========== PHASE 3: Extract Ground Truth ==========
    console.log('\n[PixelGen v2] ═══════════════════════════════════════════════════════════');
    console.log('[PixelGen v2] PHASE 3: Extracting Ground Truth Styles');
    console.log('[PixelGen v2] ═══════════════════════════════════════════════════════════\n');

    const groundTruth = await extractGroundTruth(baseUrl, device);
    await saveJson(path.join(siteDir, 'ground-truth.json'), {
        ...groundTruth,
        elements: Array.from(groundTruth.elements.entries())
    });
    console.log(`[PixelGen v2] Extracted ${groundTruth.elements.size} elements from target site`);

    // ========== PHASE 4: CSS Refinement Loop ==========
    console.log('\n[PixelGen v2] ═══════════════════════════════════════════════════════════');
    console.log('[PixelGen v2] PHASE 4: CSS Refinement Loop');
    console.log('[PixelGen v2] ═══════════════════════════════════════════════════════════\n');

    const appliedKeys = new Set<string>();
    const appliedChanges: AppliedChange[] = [];
    const similarityHistory: number[] = [];

    // Get initial similarity
    let currentSimilarity = await computeSimilarity(baseUrl, localUrl, device);
    similarityHistory.push(currentSimilarity);
    console.log(`[PixelGen v2] Initial similarity: ${(currentSimilarity * 100).toFixed(2)}%`);

    let iteration = 0;
    let stallCount = 0;
    const MAX_STALL_COUNT = 3;
    let bestSimilarity = currentSimilarity;

    while (iteration < maxIterations && currentSimilarity < targetSimilarity) {
        console.log(`\n[PixelGen v2] ── Iteration ${iteration} ──────────────────────────────────`);

        // Verify structure hasn't changed
        const structureOk = await verifyStructure(siteDir);
        if (!structureOk) {
            console.error('[PixelGen v2] ERROR: HTML structure has changed!');
            break;
        }

        // Extract current state
        const currentState = await extractCurrentState(localUrl, device);

        // Save iteration data
        const iterDir = path.join(siteDir, `iteration-${iteration}`);
        await ensureDir(iterDir);
        await saveJson(path.join(iterDir, 'current-state.json'), {
            ...currentState,
            elements: Array.from(currentState.elements.entries())
        });

        // Compute diff
        const diff = computeStructuredDiff(groundTruth, currentState);
        await saveJson(path.join(iterDir, 'diff.json'), diff);

        if (diff.changes.length === 0) {
            console.log('[PixelGen v2] ✓ No more differences found!');
            break;
        }

        // Filter and prioritize changes
        let validChanges = filterValidChanges(diff.changes);
        let newChanges = filterAppliedChanges(validChanges, appliedKeys);

        console.log(`[PixelGen v2] Changes: ${diff.changes.length} total → ${validChanges.length} valid → ${newChanges.length} new`);

        if (newChanges.length === 0) {
            console.log('[PixelGen v2] No new changes to apply. Exiting loop.');
            break;
        }

        // Prioritize with stall handling
        const skipCount = stallCount * changesPerIteration;
        const prioritized = prioritizeChanges(newChanges, changesPerIteration + skipCount).slice(skipCount);

        if (prioritized.length === 0) {
            console.log('[PixelGen v2] No more changes to try. Exiting loop.');
            break;
        }

        console.log(`[PixelGen v2] Applying ${prioritized.length} changes...`);

        // Apply changes
        let appliedThisIteration = 0;
        for (const change of prioritized) {
            if (!change.cssSelector || change.cssSelector.trim() === '') {
                console.warn(`[PixelGen v2] Skipping change with empty selector`);
                appliedKeys.add(changeKey(change)); // Mark as tried
                continue;
            }

            const patchResult = await applyCSSPatches(overridesPath, [change]);

            if (patchResult.success && patchResult.appliedCount > 0) {
                appliedKeys.add(changeKey(change));
                appliedChanges.push({
                    ...change,
                    iteration,
                    appliedAt: new Date().toISOString()
                });
                appliedThisIteration++;
                console.log(`  ✓ ${change.cssSelector.slice(0, 40)}... { ${change.property}: ${String(change.expected).slice(0, 20)}... }`);
            } else {
                appliedKeys.add(changeKey(change)); // Mark as tried to avoid loops
            }
        }

        console.log(`[PixelGen v2] Applied ${appliedThisIteration}/${prioritized.length} changes`);

        // Save overrides snapshot
        try {
            const overridesContent = await fs.readFile(overridesPath, 'utf-8');
            await fs.writeFile(path.join(iterDir, 'overrides.css'), overridesContent);
        } catch (e) { }

        // Compute new similarity
        const previousSimilarity = currentSimilarity;
        currentSimilarity = await computeSimilarity(baseUrl, localUrl, device);
        similarityHistory.push(currentSimilarity);

        const improvement = currentSimilarity - previousSimilarity;

        console.log(`[PixelGen v2] Similarity: ${(currentSimilarity * 100).toFixed(2)}% (${improvement >= 0 ? '+' : ''}${(improvement * 100).toFixed(2)}%)`);

        // Track best
        if (currentSimilarity > bestSimilarity) {
            bestSimilarity = currentSimilarity;
        }

        // Stall detection
        if (improvement <= 0.005) { // Less than 0.5% improvement
            stallCount++;
            console.log(`[PixelGen v2] ⚠ Stall ${stallCount}/${MAX_STALL_COUNT}`);
        } else {
            stallCount = 0;
        }

        // Check if we've hit our ceiling
        if (currentSimilarity >= expectedMaxSimilarity * 0.95) {
            console.log(`[PixelGen v2] Approaching expected maximum (${(expectedMaxSimilarity * 100).toFixed(1)}%), stopping.`);
            break;
        }

        await saveJson(path.join(iterDir, 'summary.json'), {
            iteration,
            similarity: currentSimilarity,
            improvement,
            appliedThisIteration,
            totalApplied: appliedChanges.length,
            stallCount
        });

        iteration++;
    }

    // ========== FINAL SUMMARY ==========
    console.log('\n[PixelGen v2] ═══════════════════════════════════════════════════════════');
    console.log('[PixelGen v2] FINAL SUMMARY');
    console.log('[PixelGen v2] ═══════════════════════════════════════════════════════════\n');

    console.log(`Structure Match Rate: ${structureMatchRate.toFixed(1)}%`);
    console.log(`Iterations Completed: ${iteration}`);
    console.log(`Final Visual Similarity: ${(currentSimilarity * 100).toFixed(2)}%`);
    console.log(`Best Similarity Achieved: ${(bestSimilarity * 100).toFixed(2)}%`);
    console.log(`Total CSS Changes Applied: ${appliedChanges.length}`);
    console.log(`Target Similarity: ${(targetSimilarity * 100).toFixed(2)}%`);
    console.log(`Target Reached: ${currentSimilarity >= targetSimilarity ? '✓ YES' : '✗ NO'}`);
    console.log(`\nSimilarity Progress: ${similarityHistory.map(s => (s * 100).toFixed(1) + '%').join(' → ')}`);

    // Save final report
    await saveJson(path.join(siteDir, 'final-report.json'), {
        baseUrl,
        localUrl,
        structureMatchRate,
        finalSimilarity: currentSimilarity,
        bestSimilarity,
        iterations: iteration,
        appliedChanges,
        similarityHistory,
        targetSimilarity,
        reachedTarget: currentSimilarity >= targetSimilarity,
        expectedMaxSimilarity
    });

    return {
        finalSimilarity: currentSimilarity,
        structureMatchRate,
        iterations: iteration,
        appliedChanges,
        localUrl,
        siteDir
    };
};