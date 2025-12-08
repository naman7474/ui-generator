// src/ground-truth/differ.ts
//
// FIXED VERSION - Position-based matching
// 
// Key insight: The BASE site doesn't have data-section attributes,
// but the GENERATED site does. So we must match by VISUAL POSITION,
// not by selector strings.
//
// Flow:
// 1. Extract base elements with positions (no data-section)
// 2. Extract generated elements with positions (has data-section)  
// 3. Match by: same tag + similar Y position + similar size
// 4. Use the GENERATED selector to apply CSS fixes
//

import { ElementStyle, StyleChange, GroundTruth, StyleCategory } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface DiffResult {
    changes: StyleChange[];
    matchedCount: number;
    unmatchedCount: number;
    byCategory: Record<string, number>;
}

// Properties safe to change (won't break layout)
const SAFE_PROPERTIES = new Set([
    'color', 'background-color', 'background',
    'border-color', 'border-radius',
    'font-size', 'font-weight', 'font-family',
    'line-height', 'letter-spacing', 'text-align',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'gap', 'opacity', 'box-shadow', 'text-transform', 'text-decoration'
]);

// Properties that are dangerous to change
const DANGEROUS_PROPERTIES = new Set([
    'display', 'position', 'float', 'clear',
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'top', 'right', 'bottom', 'left', 'z-index',
    'overflow', 'overflow-x', 'overflow-y',
    'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
    'grid-template-columns', 'grid-template-rows',
    'transform', 'visibility'
]);

// ============================================================================
// POSITION-BASED ELEMENT MATCHING
// ============================================================================

/**
 * Match elements between base and generated sites by visual position.
 * Returns a map of baseSelector -> { currentSelector, baseEl, currentEl }
 */
export const matchElementsByPosition = (
    baseElements: Map<string, ElementStyle>,
    currentElements: Map<string, ElementStyle>
): Map<string, { currentSelector: string; baseEl: ElementStyle; currentEl: ElementStyle }> => {

    const matches = new Map<string, { currentSelector: string; baseEl: ElementStyle; currentEl: ElementStyle }>();
    const usedCurrentSelectors = new Set<string>();

    // Convert to arrays for easier processing
    const baseArray = Array.from(baseElements.entries());
    const currentArray = Array.from(currentElements.entries());

    // Sort both by Y position for more efficient matching
    baseArray.sort((a, b) => a[1].rect.y - b[1].rect.y);
    currentArray.sort((a, b) => a[1].rect.y - b[1].rect.y);

    // Match each base element to closest current element
    for (const [baseSelector, baseEl] of baseArray) {
        let bestMatch: { selector: string; el: ElementStyle; score: number } | null = null;

        for (const [currentSelector, currentEl] of currentArray) {
            // Skip already used
            if (usedCurrentSelectors.has(currentSelector)) continue;

            // Must be same tag
            if (currentEl.tag !== baseEl.tag) continue;

            // Calculate position similarity score
            const score = calculateMatchScore(baseEl, currentEl);

            if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { selector: currentSelector, el: currentEl, score };
            }
        }

        if (bestMatch && bestMatch.score > 30) { // Minimum threshold - LOWERED from 50
            matches.set(baseSelector, {
                currentSelector: bestMatch.selector,
                baseEl,
                currentEl: bestMatch.el
            });
            usedCurrentSelectors.add(bestMatch.selector);
        }
    }

    console.log(`[Differ] Position-matched ${matches.size}/${baseElements.size} elements`);
    return matches;
};

/**
 * Calculate how well two elements match based on position and size
 */
const calculateMatchScore = (base: ElementStyle, current: ElementStyle): number => {
    // Y position tolerance - INCREASED for generated sites that may have different spacing
    const yTolerance = 400;  // Was 200
    const yDiff = Math.abs(base.rect.y - current.rect.y);
    if (yDiff > yTolerance) return 0;

    // X position tolerance - INCREASED
    const xTolerance = 200;  // Was 100
    const xDiff = Math.abs(base.rect.x - current.rect.x);
    if (xDiff > xTolerance) return 0;

    // Size tolerance - MORE LENIENT (allow 70% difference)
    const widthRatio = Math.min(base.rect.width, current.rect.width) /
        Math.max(base.rect.width, current.rect.width) || 0;
    const heightRatio = Math.min(base.rect.height, current.rect.height) /
        Math.max(base.rect.height, current.rect.height) || 0;

    if (widthRatio < 0.3 || heightRatio < 0.2) return 0;  // Was 0.5 and 0.3

    // Calculate score (higher is better)
    let score = 100;
    score -= yDiff * 0.3;  // Penalize Y difference
    score -= xDiff * 0.2;  // Penalize X difference  
    score += widthRatio * 20;  // Reward similar width
    score += heightRatio * 10; // Reward similar height

    // Bonus for important elements
    if (['h1', 'h2', 'h3', 'button', 'a', 'img'].includes(base.tag)) {
        score += 20;
    }

    return Math.max(0, score);
};

// ============================================================================
// STYLE DIFFERENCE COMPUTATION
// ============================================================================

/**
 * Compute style differences between matched elements
 */
export const computeStructuredDiff = (
    baseGT: GroundTruth,
    currentGT: GroundTruth
): DiffResult => {
    // Match elements by position
    const matches = matchElementsByPosition(baseGT.elements, currentGT.elements);

    const changes: StyleChange[] = [];
    const byCategory: Record<string, number> = {};

    for (const [_baseSelector, { currentSelector, baseEl, currentEl }] of matches) {
        // Compare styles
        for (const [prop, expectedValue] of Object.entries(baseEl.styles)) {
            const actualValue = currentEl.styles[prop];

            // Skip if same
            if (actualValue === expectedValue) continue;

            // Skip if difference is insignificant
            if (!isSignificantDifference(prop, expectedValue, actualValue)) continue;

            // Determine category
            const category = categorizeProperty(prop);
            byCategory[category] = (byCategory[category] || 0) + 1;

            // Use the CURRENT element's selector (the generated site with data-section)
            changes.push({
                selector: currentSelector,  // This will have data-section
                stableSelector: currentSelector,  // For pixelgen key tracking
                cssSelector: currentEl.cssSelector || currentSelector,
                property: prop,
                expected: expectedValue,
                actual: actualValue || '',
                category,
                importance: baseEl.importance || 0,
                section: currentEl.section,
                sectionIndex: currentEl.sectionIndex,
                tag: currentEl.tag,
                rect: currentEl.rect
            });
        }
    }

    console.log(`[Differ] Found ${changes.length} significant differences from ${matches.size} matched elements`);
    console.log(`[Differ] By category:`, JSON.stringify(byCategory));

    return {
        changes,
        matchedCount: matches.size,
        unmatchedCount: baseGT.elements.size - matches.size,
        byCategory
    };
};

/**
 * Check if a style difference is significant enough to fix
 */
const isSignificantDifference = (
    property: string,
    expected: string,
    actual: string | undefined
): boolean => {
    if (!actual) return true;
    if (expected === actual) return false;

    // Numeric comparison with tolerance
    const expectedNum = parseFloat(expected);
    const actualNum = parseFloat(actual);

    if (!isNaN(expectedNum) && !isNaN(actualNum)) {
        const maxVal = Math.max(Math.abs(expectedNum), Math.abs(actualNum), 1);
        const diff = Math.abs(expectedNum - actualNum);

        // Allow 10% tolerance for numeric values
        if (diff / maxVal < 0.1) return false;

        // Sub-pixel differences don't matter
        if (diff < 1 && property.includes('px')) return false;
    }

    // Color comparison with tolerance
    if (property.includes('color') || property === 'background') {
        const rgb1 = parseRGB(expected);
        const rgb2 = parseRGB(actual);

        if (rgb1 && rgb2) {
            const colorDiff = Math.abs(rgb1.r - rgb2.r) +
                Math.abs(rgb1.g - rgb2.g) +
                Math.abs(rgb1.b - rgb2.b);
            // Allow RGB difference of 45 total (15 per channel)
            if (colorDiff <= 45) return false;
        }
    }

    return true;
};

/**
 * Parse RGB color string
 */
const parseRGB = (color: string): { r: number; g: number; b: number } | null => {
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3])
        };
    }
    return null;
};

/**
 * Categorize a CSS property
 */
const categorizeProperty = (property: string): StyleCategory => {
    if (property.includes('color') || property === 'background') return 'color';
    if (property.includes('font') || property.includes('text') || property === 'line-height' || property === 'letter-spacing') return 'typography';
    if (property.includes('margin') || property.includes('padding') || property === 'gap') return 'spacing';
    if (property.includes('border')) return 'border';
    if (property.includes('shadow') || property === 'opacity') return 'effects';
    return 'layout';
};

// ============================================================================
// CHANGE FILTERING AND PRIORITIZATION
// ============================================================================

/**
 * Filter to only safe, high-impact changes
 */
export const filterSafeChanges = (changes: StyleChange[]): StyleChange[] => {
    return changes.filter(change => {
        // Must be a safe property
        if (!SAFE_PROPERTIES.has(change.property)) return false;
        if (DANGEROUS_PROPERTIES.has(change.property)) return false;

        // Skip transparent colors (usually intentional)
        if (change.expected === 'transparent' || change.expected === 'rgba(0, 0, 0, 0)') return false;

        // Skip if setting color to transparent
        if (change.property.includes('color') &&
            (change.expected.includes('rgba(0, 0, 0, 0)') || change.expected === 'transparent')) {
            return false;
        }

        return true;
    });
};

/**
 * Select top changes balanced across categories and sections
 */
export const filterTopChanges = (
    changes: StyleChange[],
    maxChanges: number = 8,
    _prioritizeAboveFold: boolean = true  // Kept for backwards compatibility
): StyleChange[] => {
    // First filter to safe changes
    const safeChanges = filterSafeChanges(changes);

    if (safeChanges.length === 0) return [];

    // Group by section
    const bySection = new Map<string | undefined, StyleChange[]>();
    for (const change of safeChanges) {
        const section = change.section || 'global';
        if (!bySection.has(section)) bySection.set(section, []);
        bySection.get(section)!.push(change);
    }

    // Allocate slots per category (prioritize colors and typography)
    const categorySlots: Record<string, number> = {
        color: 3,
        typography: 2,
        spacing: 2,
        border: 1,
        effects: 0
    };

    const selected: StyleChange[] = [];
    const usedSelectors = new Set<string>(); // Avoid duplicate selectors

    // Sort sections by index (above-fold first)
    const sortedSections = Array.from(bySection.entries())
        .sort((a, b) => {
            const aIndex = a[1][0]?.sectionIndex ?? 999;
            const bIndex = b[1][0]?.sectionIndex ?? 999;
            return aIndex - bIndex;
        });

    // Round-robin through sections and categories
    for (const category of ['color', 'typography', 'spacing', 'border']) {
        const slots = categorySlots[category];
        let added = 0;

        for (const [_section, sectionChanges] of sortedSections) {
            if (added >= slots) break;

            // Find best change of this category in this section
            const categoryChanges = sectionChanges
                .filter(c => c.category === category && !usedSelectors.has(c.cssSelector))
                .sort((a, b) => (b.importance || 0) - (a.importance || 0));

            if (categoryChanges.length > 0) {
                const change = categoryChanges[0];
                selected.push(change);
                usedSelectors.add(change.cssSelector);
                added++;
            }
        }
    }

    // Fill remaining slots with highest importance changes
    const remaining = safeChanges
        .filter(c => !usedSelectors.has(c.cssSelector))
        .sort((a, b) => (b.importance || 0) - (a.importance || 0));

    while (selected.length < maxChanges && remaining.length > 0) {
        const change = remaining.shift()!;
        selected.push(change);
        usedSelectors.add(change.cssSelector);
    }

    return selected;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
    SAFE_PROPERTIES,
    DANGEROUS_PROPERTIES
};