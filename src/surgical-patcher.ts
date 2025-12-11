// src/surgical-patcher.ts
//
// SURGICAL CSS PATCHING WITH VALIDATION
//
// This module implements single-change-at-a-time CSS patching with:
// 1. Per-change similarity measurement
// 2. Automatic rollback on regression
// 3. Impact-based change prioritization
// 4. Cumulative improvement tracking
//

import path from 'path';
import fs from 'fs/promises';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { StyleDifference } from './ground-truth/position-matcher';
import { ensureDir } from './utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ScoredChange {
    change: StyleDifference;
    impactScore: number;
    pixelImpact: number;
    category: 'critical' | 'high' | 'medium' | 'low';
    cssRule: string;
}

export interface PatchResult {
    success: boolean;
    applied: boolean;
    change: ScoredChange;
    similarityBefore: number;
    similarityAfter: number;
    improvement: number;
    rolledBack: boolean;
    reason?: string;
}

export interface PatchingSession {
    startSimilarity: number;
    endSimilarity: number;
    totalImprovement: number;
    results: PatchResult[];
    appliedCount: number;
    rolledBackCount: number;
    skippedCount: number;
}

// ============================================================================
// CHANGE SCORING AND PRIORITIZATION
// ============================================================================

export const scoreAndPrioritizeChanges = (
    changes: StyleDifference[],
    screenDimensions: { width: number; height: number }
): ScoredChange[] => {
    const screenArea = screenDimensions.width * screenDimensions.height;

    return changes.map(change => {
        let impactScore = 0;

        // 1. Base importance from property type
        impactScore += change.importance;

        // 2. Element area multiplier (larger elements have more impact)
        const elementArea = change.baseElement.rect.width * change.baseElement.rect.height;
        const areaMult = 1 + Math.min((elementArea / screenArea) * 3, 1);
        impactScore *= areaMult;

        // 3. Value difference magnitude
        const valueDiff = calculateValueDifference(change.expected, change.actual);
        impactScore *= (1 + valueDiff * 0.5);

        // 4. Category bonus
        if (change.category === 'layout') {
            impactScore *= 1.3;
        } else if (change.category === 'color') {
            impactScore *= 1.2;
        }

        // 5. Depth penalty (deeper elements have less global impact)
        impactScore *= (1 / Math.log2(change.baseElement.depth + 2));

        // Estimate pixel impact
        const pixelImpact = estimatePixelImpact(change, elementArea);

        // Category classification
        const category: 'critical' | 'high' | 'medium' | 'low' =
            impactScore > 200 ? 'critical' :
                impactScore > 100 ? 'high' :
                    impactScore > 50 ? 'medium' : 'low';

        // Generate CSS rule
        const cssRule = generateCSSRule(change);

        return {
            change,
            impactScore,
            pixelImpact,
            category,
            cssRule
        };
    }).sort((a, b) => b.impactScore - a.impactScore);
};

const calculateValueDifference = (expected: string, actual: string): number => {
    const expNum = parseFloat(expected);
    const actNum = parseFloat(actual);

    if (!isNaN(expNum) && !isNaN(actNum)) {
        if (expNum === 0) return actNum === 0 ? 0 : 1;
        return Math.min(Math.abs(expNum - actNum) / Math.max(Math.abs(expNum), 1), 2);
    }

    // Color difference
    if (expected.startsWith('#') && actual.startsWith('#')) {
        return colorDifference(expected, actual);
    }

    return expected === actual ? 0 : 0.5;
};

const colorDifference = (hex1: string, hex2: string): number => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return 0.5;

    const diff = Math.abs(rgb1.r - rgb2.r) + Math.abs(rgb1.g - rgb2.g) + Math.abs(rgb1.b - rgb2.b);
    return Math.min(diff / 765, 1); // Max diff is 255*3
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return null;
    return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16)
    };
};

const estimatePixelImpact = (change: StyleDifference, elementArea: number): number => {
    const { property } = change;

    // Layout changes affect the entire element and potentially children
    if (['display', 'position', 'width', 'height', 'flex-direction'].includes(property)) {
        return elementArea * 1.5;
    }

    // Background affects the entire element
    if (property === 'background-color') {
        return elementArea;
    }

    // Spacing affects element and surroundings
    if (property.startsWith('margin') || property.startsWith('padding')) {
        return elementArea * 0.8;
    }

    // Text properties affect text area only
    if (['color', 'font-size', 'font-weight'].includes(property)) {
        return elementArea * 0.6;
    }

    return elementArea * 0.4;
};

// ============================================================================
// CSS RULE GENERATION
// ============================================================================

const generateCSSRule = (change: StyleDifference): string => {
    const { cssSelector, property, expected, actual, baseElement } = change;

    // Build the most specific selector possible
    let selector = cssSelector;

    // Add section context if available
    if (baseElement.sectionRole) {
        const sectionSelector = `[data-section="${baseElement.sectionRole}"]`;
        if (!selector.includes(sectionSelector)) {
            selector = `${sectionSelector} ${selector}`;
        }
    }

    // Clean up selector
    selector = selector
        .replace(/\s+/g, ' ')
        .trim();

    return `
/* Fix: ${property} 
   From: ${actual}
   To:   ${expected}
   Element: ${baseElement.tag} at (${baseElement.rect.x}, ${baseElement.rect.y})
*/
${selector} {
    ${property}: ${expected} !important;
}`;
};

// ============================================================================
// SIMILARITY MEASUREMENT
// ============================================================================

const measureSimilarity = async (
    baseUrl: string,
    targetUrl: string,
    device: 'desktop' | 'mobile' = 'desktop'
): Promise<{ similarity: number; diffPixels: number }> => {
    const viewport = device === 'mobile'
        ? { width: 375, height: 667 }
        : { width: 1280, height: 720 };

    const browser = await chromium.launch({ headless: true });

    try {
        const context = await browser.newContext({ viewport });

        // Capture base screenshot
        const basePage = await context.newPage();
        await basePage.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await basePage.waitForTimeout(500);
        const baseBuffer = await basePage.screenshot({ type: 'png' });
        await basePage.close();

        // Capture target screenshot
        const targetPage = await context.newPage();
        await targetPage.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await targetPage.waitForTimeout(500);
        const targetBuffer = await targetPage.screenshot({ type: 'png' });
        await targetPage.close();

        // Compare with pixelmatch
        const basePng = PNG.sync.read(baseBuffer);
        const targetPng = PNG.sync.read(targetBuffer);

        const width = Math.min(basePng.width, targetPng.width);
        const height = Math.min(basePng.height, targetPng.height);

        // Crop to same size
        const crop = (png: PNG): PNG => {
            const out = new PNG({ width, height });
            for (let y = 0; y < height; y++) {
                const srcStart = y * png.width * 4;
                const srcSlice = png.data.subarray(srcStart, srcStart + width * 4);
                const dstStart = y * width * 4;
                out.data.set(srcSlice, dstStart);
            }
            return out;
        };

        const baseCropped = crop(basePng);
        const targetCropped = crop(targetPng);
        const diff = new PNG({ width, height });

        const diffPixels = pixelmatch(
            baseCropped.data,
            targetCropped.data,
            diff.data,
            width,
            height,
            { threshold: 0.1 }
        );

        const totalPixels = width * height;
        const similarity = 1 - (diffPixels / totalPixels);

        return { similarity, diffPixels };

    } finally {
        await browser.close();
    }
};

// ============================================================================
// SURGICAL PATCHING
// ============================================================================

export const applySurgicalPatches = async (
    siteDir: string,
    localUrl: string,
    baseUrl: string,
    scoredChanges: ScoredChange[],
    options: {
        maxChangesPerIteration?: number;
        minImprovementThreshold?: number;
        regressionThreshold?: number;
        device?: 'desktop' | 'mobile';
        verbose?: boolean;
    } = {}
): Promise<PatchingSession> => {
    const {
        maxChangesPerIteration = 5,
        minImprovementThreshold = 0.001,
        regressionThreshold = -0.003,
        device = 'desktop',
        verbose = true
    } = options;

    const overridesPath = path.join(siteDir, 'site', 'overrides.css');

    // Ensure overrides file exists
    await ensureDir(path.dirname(overridesPath));
    const initialOverrides = await fs.readFile(overridesPath, 'utf-8').catch(() => '/* PixelGen CSS Overrides */\n');

    // Measure initial similarity
    const initialResult = await measureSimilarity(baseUrl, localUrl, device);
    let currentSimilarity = initialResult.similarity;
    let currentOverrides = initialOverrides;

    if (verbose) {
        console.log(`[SurgicalPatch] Starting similarity: ${(currentSimilarity * 100).toFixed(2)}%`);
        console.log(`[SurgicalPatch] Processing ${Math.min(scoredChanges.length, maxChangesPerIteration)} changes`);
    }

    const session: PatchingSession = {
        startSimilarity: currentSimilarity,
        endSimilarity: currentSimilarity,
        totalImprovement: 0,
        results: [],
        appliedCount: 0,
        rolledBackCount: 0,
        skippedCount: 0
    };

    // Process changes one at a time
    const changesToProcess = scoredChanges.slice(0, maxChangesPerIteration);
    const appliedSelectors = new Set<string>();

    for (let i = 0; i < changesToProcess.length; i++) {
        const scoredChange = changesToProcess[i];
        const { change, cssRule, category } = scoredChange;

        // Skip if we've already applied a change to this selector
        if (appliedSelectors.has(change.cssSelector)) {
            if (verbose) {
                console.log(`[SurgicalPatch] Skipping duplicate selector: ${change.cssSelector}`);
            }
            session.skippedCount++;
            continue;
        }

        if (verbose) {
            console.log(`\n[SurgicalPatch] Change ${i + 1}/${changesToProcess.length}: ${change.property}`);
            console.log(`  Selector: ${change.cssSelector}`);
            console.log(`  Category: ${category}`);
            console.log(`  ${change.actual} → ${change.expected}`);
        }

        // Backup current state
        const backup = currentOverrides;
        const beforeSimilarity = currentSimilarity;

        // Apply the change
        currentOverrides = currentOverrides + '\n' + cssRule;
        await fs.writeFile(overridesPath, currentOverrides);

        // Wait for browser to pick up changes
        await new Promise(r => setTimeout(r, 400));

        // Measure new similarity
        const newResult = await measureSimilarity(baseUrl, localUrl, device);
        const newSimilarity = newResult.similarity;
        const improvement = newSimilarity - beforeSimilarity;

        if (verbose) {
            console.log(`  Result: ${(beforeSimilarity * 100).toFixed(2)}% → ${(newSimilarity * 100).toFixed(2)}% (${improvement >= 0 ? '+' : ''}${(improvement * 100).toFixed(3)}%)`);
        }

        // Decide whether to keep or rollback
        let applied = false;
        let rolledBack = false;
        let reason = '';

        if (improvement < regressionThreshold) {
            // REGRESSION: Rollback
            if (verbose) {
                console.log(`  ⚠ REGRESSION detected! Rolling back...`);
            }
            currentOverrides = backup;
            await fs.writeFile(overridesPath, currentOverrides);
            rolledBack = true;
            reason = `Regression: ${(improvement * 100).toFixed(3)}%`;
            session.rolledBackCount++;
        } else if (improvement < minImprovementThreshold && improvement >= 0) {
            // NEUTRAL: Keep but note as minimal improvement
            if (verbose) {
                console.log(`  ○ Minimal improvement, keeping change`);
            }
            applied = true;
            currentSimilarity = newSimilarity;
            appliedSelectors.add(change.cssSelector);
            session.appliedCount++;
            reason = 'Minimal improvement';
        } else {
            // IMPROVEMENT: Keep
            if (verbose) {
                console.log(`  ✓ Improvement! Keeping change`);
            }
            applied = true;
            currentSimilarity = newSimilarity;
            appliedSelectors.add(change.cssSelector);
            session.appliedCount++;
        }

        session.results.push({
            success: !rolledBack,
            applied,
            change: scoredChange,
            similarityBefore: beforeSimilarity,
            similarityAfter: applied ? newSimilarity : beforeSimilarity,
            improvement: applied ? improvement : 0,
            rolledBack,
            reason
        });
    }

    session.endSimilarity = currentSimilarity;
    session.totalImprovement = currentSimilarity - session.startSimilarity;

    if (verbose) {
        console.log(`\n[SurgicalPatch] Session Summary:`);
        console.log(`  Start: ${(session.startSimilarity * 100).toFixed(2)}%`);
        console.log(`  End: ${(session.endSimilarity * 100).toFixed(2)}%`);
        console.log(`  Improvement: ${session.totalImprovement >= 0 ? '+' : ''}${(session.totalImprovement * 100).toFixed(3)}%`);
        console.log(`  Applied: ${session.appliedCount}, Rolled back: ${session.rolledBackCount}, Skipped: ${session.skippedCount}`);
    }

    return session;
};

// ============================================================================
// BATCH PATCHING WITH GROUPING
// ============================================================================

export const applyBatchPatches = async (
    siteDir: string,
    localUrl: string,
    baseUrl: string,
    scoredChanges: ScoredChange[],
    options: {
        batchSize?: number;
        maxBatches?: number;
        device?: 'desktop' | 'mobile';
        verbose?: boolean;
    } = {}
): Promise<PatchingSession[]> => {
    const {
        batchSize = 5,
        maxBatches = 5,
        device = 'desktop',
        verbose = true
    } = options;

    const sessions: PatchingSession[] = [];
    let remainingChanges = [...scoredChanges];

    for (let batch = 0; batch < maxBatches && remainingChanges.length > 0; batch++) {
        if (verbose) {
            console.log(`\n[SurgicalPatch] ═══════════════════════════════════════`);
            console.log(`[SurgicalPatch] Batch ${batch + 1}/${maxBatches}`);
            console.log(`[SurgicalPatch] ═══════════════════════════════════════`);
        }

        const batchChanges = remainingChanges.slice(0, batchSize);
        remainingChanges = remainingChanges.slice(batchSize);

        const session = await applySurgicalPatches(
            siteDir,
            localUrl,
            baseUrl,
            batchChanges,
            { device, verbose, maxChangesPerIteration: batchSize }
        );

        sessions.push(session);

        // Stop if no improvement in this batch
        if (session.totalImprovement <= 0 && session.appliedCount === 0) {
            if (verbose) {
                console.log(`[SurgicalPatch] No improvement in batch, stopping early`);
            }
            break;
        }
    }

    // Summary
    if (verbose) {
        const totalImprovement = sessions.reduce((sum, s) => sum + s.totalImprovement, 0);
        const totalApplied = sessions.reduce((sum, s) => sum + s.appliedCount, 0);
        const totalRolledBack = sessions.reduce((sum, s) => sum + s.rolledBackCount, 0);

        console.log(`\n[SurgicalPatch] ═══════════════════════════════════════`);
        console.log(`[SurgicalPatch] FINAL SUMMARY`);
        console.log(`[SurgicalPatch] ═══════════════════════════════════════`);
        console.log(`  Batches completed: ${sessions.length}`);
        console.log(`  Total applied: ${totalApplied}`);
        console.log(`  Total rolled back: ${totalRolledBack}`);
        console.log(`  Total improvement: ${totalImprovement >= 0 ? '+' : ''}${(totalImprovement * 100).toFixed(3)}%`);
        console.log(`  Start → End: ${(sessions[0]?.startSimilarity * 100).toFixed(2)}% → ${(sessions[sessions.length - 1]?.endSimilarity * 100).toFixed(2)}%`);
    }

    return sessions;
};

// ============================================================================
// CATEGORY-BASED PATCHING
// ============================================================================

export const applyCategoryPatches = async (
    siteDir: string,
    localUrl: string,
    baseUrl: string,
    scoredChanges: ScoredChange[],
    options: {
        categoryOrder?: Array<'critical' | 'high' | 'medium' | 'low'>;
        maxPerCategory?: number;
        device?: 'desktop' | 'mobile';
        verbose?: boolean;
    } = {}
): Promise<PatchingSession[]> => {
    const {
        categoryOrder = ['critical', 'high', 'medium'],
        maxPerCategory = 5,
        device = 'desktop',
        verbose = true
    } = options;

    const sessions: PatchingSession[] = [];

    for (const category of categoryOrder) {
        const categoryChanges = scoredChanges
            .filter(c => c.category === category)
            .slice(0, maxPerCategory);

        if (categoryChanges.length === 0) continue;

        if (verbose) {
            console.log(`\n[SurgicalPatch] ═══════════════════════════════════════`);
            console.log(`[SurgicalPatch] Category: ${category.toUpperCase()}`);
            console.log(`[SurgicalPatch] Changes: ${categoryChanges.length}`);
            console.log(`[SurgicalPatch] ═══════════════════════════════════════`);
        }

        const session = await applySurgicalPatches(
            siteDir,
            localUrl,
            baseUrl,
            categoryChanges,
            { device, verbose, maxChangesPerIteration: categoryChanges.length }
        );

        sessions.push(session);
    }

    return sessions;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    scoreAndPrioritizeChanges,
    applySurgicalPatches,
    applyBatchPatches,
    applyCategoryPatches
};