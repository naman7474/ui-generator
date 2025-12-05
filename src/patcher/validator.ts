
import { chromium } from 'playwright';
import { StyleChange } from '../ground-truth/types';

interface ValidationResult {
    applied: StyleChange[];
    failed: StyleChange[];
    regressions: Array<{
        change: StyleChange;
        before: string;
        after: string;
        issue: string;
    }>;
}

/**
 * Validate that changes were applied correctly and didn't cause regressions.
 */
export const validateChanges = async (
    url: string,
    appliedChanges: StyleChange[],
    device: 'desktop' | 'mobile' = 'desktop',
    baselineStyles?: Map<string, Record<string, string>>
): Promise<ValidationResult> => {
    const result: ValidationResult = {
        applied: [],
        failed: [],
        regressions: []
    };

    const viewport = device === 'mobile'
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 };

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    // Add cache-busting to ensure fresh load
    const cacheBuster = `?cb=${Date.now()}`;
    await page.goto(url + cacheBuster, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Check each applied change
    for (const change of appliedChanges) {
        try {
            const actualValue = await page.evaluate(({ selector, property }) => {
                const el = document.querySelector(selector);
                if (!el) return null;
                return window.getComputedStyle(el).getPropertyValue(property);
            }, { selector: change.cssSelector, property: change.property });

            if (actualValue === null) {
                result.failed.push(change);
                continue;
            }

            // Check if change was applied (allowing some normalization)
            if (valuesMatch(change.expected, actualValue)) {
                result.applied.push(change);
            } else {
                result.failed.push(change);
            }
        } catch (e) {
            result.failed.push(change);
        }
    }

    // Check for regressions on other elements (if baseline provided)
    if (baselineStyles) {
        const regressionChecks = await page.evaluate((props) => {
            const results: any[] = [];
            for (const [selector, expectedStyles] of Object.entries(props)) {
                const el = document.querySelector(selector);
                if (!el) continue;

                const computed = window.getComputedStyle(el);
                for (const [prop, expected] of Object.entries(expectedStyles as Record<string, string>)) {
                    const actual = computed.getPropertyValue(prop);
                    if (actual !== expected) {
                        results.push({ selector, property: prop, expected, actual });
                    }
                }
            }
            return results;
        }, Object.fromEntries(baselineStyles));

        // Filter regressions - only report if not in appliedChanges
        for (const reg of regressionChecks) {
            const wasIntentional = appliedChanges.some(c =>
                c.cssSelector === reg.selector && c.property === reg.property
            );
            if (!wasIntentional) {
                result.regressions.push({
                    change: {
                        stableSelector: '',
                        cssSelector: reg.selector,
                        property: reg.property,
                        expected: reg.expected,
                        actual: reg.actual,
                        tag: '',
                        rect: { x: 0, y: 0, width: 0, height: 0 },
                        priority: 0,
                        category: 'effects'
                    },
                    before: reg.expected,
                    after: reg.actual,
                    issue: `Unintended change: ${reg.property} changed from ${reg.expected} to ${reg.actual}`
                });
            }
        }
    }

    await browser.close();
    return result;
};

const valuesMatch = (expected: string, actual: string): boolean => {
    // Normalize values for comparison
    const normalize = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();

    if (normalize(expected) === normalize(actual)) return true;

    // Try numeric comparison with tolerance
    const expNum = parseFloat(expected);
    const actNum = parseFloat(actual);
    if (!isNaN(expNum) && !isNaN(actNum)) {
        return Math.abs(expNum - actNum) < 1; // 1px tolerance
    }

    return false;
};
