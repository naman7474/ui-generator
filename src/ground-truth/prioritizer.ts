// src/ground-truth/prioritizer.ts
//
// IMPROVED VERSION with:
// 1. Validation of selectors
// 2. Diversity (not all changes from same element)
// 3. Better scoring

import { StyleChange } from './types';

/**
 * Property impact scores - how visually impactful is changing this property?
 */
const PROPERTY_IMPACT: Record<string, number> = {
    // High impact - layout
    'display': 100,
    'position': 90,
    'width': 85,
    'height': 85,
    'flex-direction': 80,
    'grid-template-columns': 80,
    'justify-content': 75,
    'align-items': 75,

    // High impact - colors
    'background-color': 90,
    'color': 85,
    'border-color': 60,

    // Medium impact - spacing
    'padding-top': 50,
    'padding-right': 50,
    'padding-bottom': 50,
    'padding-left': 50,
    'margin-top': 45,
    'margin-right': 45,
    'margin-bottom': 45,
    'margin-left': 45,
    'gap': 50,

    // Medium impact - typography
    'font-size': 70,
    'font-weight': 60,
    'font-family': 55,
    'line-height': 40,
    'text-align': 45,

    // Lower impact - borders/effects
    'border-width': 40,
    'border-radius': 35,
    'box-shadow': 30,
    'opacity': 50,
    'transform': 30,

    // Default
    'default': 25
};

/**
 * Category weights
 */
const CATEGORY_WEIGHT: Record<string, number> = {
    'layout': 100,
    'color': 90,
    'typography': 70,
    'spacing': 60,
    'effects': 40
};

/**
 * Calculate priority score for a change
 */
const calculatePriority = (change: StyleChange): number => {
    let score = 0;

    // Property impact
    const propImpact = PROPERTY_IMPACT[change.property] || PROPERTY_IMPACT['default'];
    score += propImpact;

    // Category weight
    const catWeight = CATEGORY_WEIGHT[change.category] || 50;
    score += catWeight * 0.5;

    // Element size and position scoring (only if rect is available)
    if (change.rect) {
        // Element size (larger elements are more visually important)
        const area = (change.rect?.width ?? 0) * (change.rect?.height ?? 0);
        const areaScore = Math.min(100, Math.sqrt(area) / 10);
        score += areaScore;

        // Above-the-fold bonus (y < 900px)
        if ((change.rect?.y ?? Infinity) < 900) {
            score += 50;
        }

        // Very top of page bonus
        if ((change.rect?.y ?? Infinity) < 200) {
            score += 30;
        }

        // Penalize very small elements
        if (area < 100) {
            score -= 30;
        }

        // Penalize off-screen elements
        if ((change.rect?.y ?? 0) > 2000) {
            score -= 40;
        }
    }

    return score;
};

/**
 * Validate a change has required fields
 */
const isValidChange = (change: StyleChange): boolean => {
    if (!change.cssSelector || change.cssSelector.trim() === '') {
        return false;
    }
    if (!change.property || change.property.trim() === '') {
        return false;
    }
    if (change.expected === undefined || change.expected === null || change.expected === '') {
        return false;
    }
    // Skip changes where expected equals actual (shouldn't happen but let's be safe)
    if (change.expected === change.actual) {
        return false;
    }
    return true;
};

/**
 * Prioritize changes and return top N with diversity
 */
export const prioritizeChanges = (
    changes: StyleChange[],
    limit: number = 10
): StyleChange[] => {
    // Filter out invalid changes
    const validChanges = changes.filter(isValidChange);

    if (validChanges.length === 0) {
        console.log('[Prioritizer] No valid changes to prioritize');
        return [];
    }

    // Score all changes
    const scored = validChanges.map(change => ({
        change,
        score: calculatePriority(change)
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Select with diversity - don't take all changes from the same selector
    const selected: StyleChange[] = [];
    const selectorCounts = new Map<string, number>();
    const MAX_PER_SELECTOR = 3; // Max changes per element

    for (const { change, score } of scored) {
        if (selected.length >= limit) break;

        const count = selectorCounts.get(change.cssSelector) || 0;
        if (count >= MAX_PER_SELECTOR) {
            continue; // Skip, already have enough for this element
        }

        selected.push(change);
        selectorCounts.set(change.cssSelector, count + 1);
    }

    // If we didn't get enough due to diversity constraints, fill in
    if (selected.length < limit) {
        for (const { change } of scored) {
            if (selected.length >= limit) break;
            if (!selected.includes(change)) {
                selected.push(change);
            }
        }
    }

    console.log(`[Prioritizer] Selected ${selected.length} changes from ${selectorCounts.size} unique selectors`);

    // Log top changes for debugging
    for (let i = 0; i < Math.min(5, selected.length); i++) {
        const c = selected[i];
        console.log(`[Prioritizer] #${i + 1}: ${c.cssSelector.slice(0, 40)}... { ${c.property}: ${c.expected.slice(0, 20)}... }`);
    }

    return selected;
};

/**
 * Group changes by their CSS selector
 */
export const groupChangesBySelector = (
    changes: StyleChange[]
): Map<string, StyleChange[]> => {
    const grouped = new Map<string, StyleChange[]>();

    for (const change of changes) {
        if (!change.cssSelector) continue;

        const existing = grouped.get(change.cssSelector) || [];
        existing.push(change);
        grouped.set(change.cssSelector, existing);
    }

    return grouped;
};

/**
 * Group changes by section
 */
export const groupChangesBySection = (
    changes: StyleChange[]
): Map<string, StyleChange[]> => {
    const grouped = new Map<string, StyleChange[]>();

    for (const change of changes) {
        const section = change.section || 'global';
        const existing = grouped.get(section) || [];
        existing.push(change);
        grouped.set(section, existing);
    }

    return grouped;
};