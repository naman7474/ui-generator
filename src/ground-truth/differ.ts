
import { GroundTruth, StyleChange, StructuredDiff } from './types';

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

const isSignificantDifference = (prop: string, expected: string, actual: string): boolean => {
    // Skip if identical
    if (expected === actual) return false;

    // Normalize and compare
    const normalizeValue = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalizeValue(expected) === normalizeValue(actual)) return false;

    // For numeric values, check if difference is significant
    const expectedNum = parseFloat(expected);
    const actualNum = parseFloat(actual);

    if (!isNaN(expectedNum) && !isNaN(actualNum)) {
        const diff = Math.abs(expectedNum - actualNum);

        // For small values (< 10), allow 1px tolerance
        if (expectedNum < 10 && diff <= 1) return false;

        // For larger values, allow 2% tolerance
        if (diff / Math.max(expectedNum, 1) < 0.02) return false;
    }

    // For colors, normalize to rgb and compare
    if (prop.includes('color')) {
        const normalizeColor = (c: string) => {
            // Convert hex to rgb, normalize rgb format
            // This is simplified - production would use a color library
            return c.replace(/\s/g, '').toLowerCase();
        };
        if (normalizeColor(expected) === normalizeColor(actual)) return false;
    }

    return true;
};

export const computeStructuredDiff = (
    groundTruth: GroundTruth,
    currentState: GroundTruth
): StructuredDiff => {
    const changes: StyleChange[] = [];
    const byCategory: Record<string, number> = {};
    const bySection: Record<string, number> = {};

    // Iterate through ground truth elements
    for (const [stableSelector, baseElement] of groundTruth.elements) {
        const currentElement = currentState.elements.get(stableSelector);

        // Skip if element not found in current state (structural difference)
        if (!currentElement) {
            console.warn(`Element not found in current state: ${stableSelector}`);
            continue;
        }

        // Compare each style property
        for (const [prop, expectedValue] of Object.entries(baseElement.styles)) {
            const actualValue = currentElement.styles[prop] || '';

            if (isSignificantDifference(prop, expectedValue, actualValue)) {
                const category = categorizeProperty(prop);
                const section = baseElement.section || 'global';

                changes.push({
                    stableSelector,
                    cssSelector: baseElement.cssSelector,
                    property: prop,
                    expected: expectedValue,
                    actual: actualValue,
                    section,
                    tag: baseElement.tag,
                    rect: baseElement.rect,
                    priority: 0, // Will be computed in prioritization phase
                    category
                });

                byCategory[category] = (byCategory[category] || 0) + 1;
                bySection[section] = (bySection[section] || 0) + 1;
            }
        }
    }

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
