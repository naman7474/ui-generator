// src/ground-truth/differ.ts
//
// IMPROVED VERSION with:
// 1. No empty selectors
// 2. Better fuzzy matching
// 3. Semantic matching by position

import { GroundTruth, StyleChange, StructuredDiff, ElementStyle } from './types';

const categorizeProperty = (prop: string): StyleChange['category'] => {
    if (['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
        'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
        'flex-direction', 'justify-content', 'align-items', 'gap',
        'grid-template-columns', 'grid-template-rows'].includes(prop)) {
        return 'layout';
    }
    if (['margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left'].includes(prop)) {
        return 'spacing';
    }
    if (['font-family', 'font-size', 'font-weight', 'line-height',
        'letter-spacing', 'text-align', 'text-transform', 'text-decoration'].includes(prop)) {
        return 'typography';
    }
    if (['color', 'background-color', 'border-color'].includes(prop)) {
        return 'color';
    }
    return 'effects';
};

/**
 * Normalize CSS values for comparison
 */
const normalizeValue = (value: string): string => {
    if (!value) return '';

    let v = value.trim().toLowerCase();
    v = v.replace(/\s+/g, ' ');

    // Normalize rgb colors
    v = v.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, 'rgb($1,$2,$3)');
    v = v.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*1\s*\)/g, 'rgb($1,$2,$3)');

    // Normalize font-family
    if (v.includes(',')) {
        v = v.replace(/["']/g, '');
    }

    return v;
};

/**
 * Check if two values are significantly different
 */
const isSignificantDifference = (prop: string, expected: string, actual: string): boolean => {
    const normExpected = normalizeValue(expected);
    const normActual = normalizeValue(actual);

    if (normExpected === normActual) return false;

    // Numeric comparison with tolerance
    const expectedNum = parseFloat(expected);
    const actualNum = parseFloat(actual);

    if (!isNaN(expectedNum) && !isNaN(actualNum)) {
        const diff = Math.abs(expectedNum - actualNum);

        // Small values: 2px tolerance
        if (Math.max(expectedNum, actualNum) < 20 && diff <= 2) return false;

        // Larger values: 5% tolerance
        if (diff / Math.max(expectedNum, 1) < 0.05) return false;
    }

    // Color comparison with tolerance
    if (prop.includes('color')) {
        const rgbRegex = /rgb\((\d+),(\d+),(\d+)\)/;
        const expMatch = normExpected.match(rgbRegex);
        const actMatch = normActual.match(rgbRegex);

        if (expMatch && actMatch) {
            const maxDiff = Math.max(
                Math.abs(parseInt(expMatch[1]) - parseInt(actMatch[1])),
                Math.abs(parseInt(expMatch[2]) - parseInt(actMatch[2])),
                Math.abs(parseInt(expMatch[3]) - parseInt(actMatch[3]))
            );
            if (maxDiff <= 10) return false; // 10 per channel tolerance
        }
    }

    return true;
};

/**
 * Generate a fallback CSS selector when cssSelector is missing
 */
const generateFallbackSelector = (element: ElementStyle): string => {
    // Try to build from stableSelector
    if (element.stableSelector) {
        // If stableSelector looks like a valid CSS selector, use it
        if (element.stableSelector.startsWith('body >') ||
            element.stableSelector.startsWith('#') ||
            element.stableSelector.startsWith('[data-section')) {
            return element.stableSelector;
        }
    }

    // Build from tag and section
    if (element.section) {
        return `[data-section="${element.section}"] ${element.tag}`;
    }

    // Last resort: use tag with specificity helpers
    if (element.tag) {
        return `body ${element.tag}`;
    }

    // Absolute last resort
    return '';
};

/**
 * Try to find a matching element using multiple strategies
 */
const fuzzyMatchElement = (
    selector: string,
    elements: Map<string, ElementStyle>,
    baseElement: ElementStyle
): ElementStyle | undefined => {
    // Strategy 1: Match by data-section (most reliable)
    if (baseElement.section) {
        for (const [key, el] of elements) {
            if (el.section === baseElement.section && el.tag === baseElement.tag) {
                // Found same section + same tag
                return el;
            }
        }
    }

    // Strategy 2: Match by selector suffix (last 3 parts)
    const selectorParts = selector.split(' > ');
    for (let depth = Math.min(4, selectorParts.length); depth >= 2; depth--) {
        const suffix = selectorParts.slice(-depth).join(' > ');
        for (const [key, el] of elements) {
            if (key.endsWith(suffix) && el.tag === baseElement.tag) {
                return el;
            }
        }
    }

    // Strategy 3: Match by visual position (bounding box overlap)
    const tolerance = 100; // pixels
    for (const [key, el] of elements) {
        if (el.tag !== baseElement.tag) continue;

        const xOverlap = Math.abs(el.rect.x - baseElement.rect.x) < tolerance;
        const yOverlap = Math.abs(el.rect.y - baseElement.rect.y) < tolerance;
        const widthSimilar = Math.abs(el.rect.width - baseElement.rect.width) < baseElement.rect.width * 0.3;
        const heightSimilar = Math.abs(el.rect.height - baseElement.rect.height) < baseElement.rect.height * 0.3;

        if (xOverlap && yOverlap && widthSimilar && heightSimilar) {
            return el;
        }
    }

    // Strategy 4: Same tag in similar Y position (for major sections)
    if (['section', 'header', 'footer', 'main', 'nav'].includes(baseElement.tag)) {
        const yTolerance = 200;
        for (const [key, el] of elements) {
            if (el.tag === baseElement.tag && Math.abs(el.rect.y - baseElement.rect.y) < yTolerance) {
                return el;
            }
        }
    }

    return undefined;
};

export const computeStructuredDiff = (
    groundTruth: GroundTruth,
    currentState: GroundTruth
): StructuredDiff => {
    const changes: StyleChange[] = [];
    const byCategory: Record<string, number> = {};
    const bySection: Record<string, number> = {};

    let matched = 0;
    let unmatched = 0;
    let fuzzyMatched = 0;

    // Build a usage map to track which current elements have been matched
    const matchedCurrentSelectors = new Set<string>();

    for (const [stableSelector, baseElement] of groundTruth.elements) {
        // Try exact match first
        let currentElement = currentState.elements.get(stableSelector);
        let matchType = 'exact';

        // If no exact match, try fuzzy matching
        if (!currentElement) {
            currentElement = fuzzyMatchElement(stableSelector, currentState.elements, baseElement);
            if (currentElement) {
                fuzzyMatched++;
                matchType = 'fuzzy';
            }
        }

        if (!currentElement) {
            unmatched++;
            if (unmatched <= 20) {
                console.log(`[Differ] No match for: ${stableSelector.slice(0, 80)}...`);
            } else if (unmatched === 21) {
                console.log(`[Differ] ... and more unmatched elements (suppressing further logs)`);
            }
            continue;
        }

        matched++;

        // Determine which CSS selector to use for applying fixes
        // Use the CURRENT element's selector since that's what we're modifying
        let cssSelector = currentElement.cssSelector || generateFallbackSelector(currentElement);

        // If still no selector, skip this element
        if (!cssSelector || cssSelector.trim() === '') {
            console.warn(`[Differ] Skipping element with no valid selector: ${baseElement.tag}`);
            continue;
        }

        // Compare each style property
        for (const [prop, expectedValue] of Object.entries(baseElement.styles)) {
            const actualValue = currentElement.styles[prop] || '';

            if (isSignificantDifference(prop, expectedValue, actualValue)) {
                const category = categorizeProperty(prop);
                const section = baseElement.section || currentElement.section || 'global';

                changes.push({
                    stableSelector,
                    cssSelector, // Now guaranteed to be non-empty
                    property: prop,
                    expected: expectedValue,
                    actual: actualValue,
                    section,
                    tag: baseElement.tag,
                    rect: baseElement.rect,
                    priority: 0,
                    category
                });

                byCategory[category] = (byCategory[category] || 0) + 1;
                bySection[section] = (bySection[section] || 0) + 1;
            }
        }
    }

    const total = matched + unmatched;
    const matchRate = total > 0 ? (matched / total * 100).toFixed(1) : '0';
    console.log(`[Differ] Matched ${matched}/${total} elements (${matchRate}%), ${fuzzyMatched} via fuzzy matching`);
    console.log(`[Differ] Found ${changes.length} style differences`);

    // Log category breakdown
    console.log(`[Differ] By category: ${Object.entries(byCategory).map(([k, v]) => `${k}=${v}`).join(', ')}`);

    return {
        baseUrl: groundTruth.url,
        targetUrl: currentState.url,
        device: groundTruth.device,
        timestamp: new Date().toISOString(),
        changes,
        summary: {
            totalDifferences: changes.length,
            byCategory,
            bySection
        }
    };
};

/**
 * Filter changes to only significant ones
 */
export const filterSignificantChanges = (
    changes: StyleChange[],
    limit: number = 50
): StyleChange[] => {
    // Remove any with empty selectors (safety check)
    const valid = changes.filter(c => c.cssSelector && c.cssSelector.trim() !== '');

    // Sort by visual impact
    const sorted = [...valid].sort((a, b) => {
        const areaA = a.rect.width * a.rect.height;
        const areaB = b.rect.width * b.rect.height;

        const foldA = a.rect.y < 900 ? 1000 : 0;
        const foldB = b.rect.y < 900 ? 1000 : 0;

        const catWeight: Record<string, number> = {
            color: 100,
            layout: 90,
            typography: 80,
            spacing: 70,
            effects: 50
        };
        const catA = catWeight[a.category] || 50;
        const catB = catWeight[b.category] || 50;

        const scoreA = areaA + foldA + catA;
        const scoreB = areaB + foldB + catB;

        return scoreB - scoreA;
    });

    return sorted.slice(0, limit);
};