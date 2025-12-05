// src/patcher/css-patcher.ts
//
// IMPROVED VERSION with:
// 1. !important to override Tailwind utilities
// 2. Validation of selectors
// 3. Atomic writes
// 4. Better error handling

import fs from 'fs/promises';
import postcss, { Root, Rule } from 'postcss';
import { StyleChange } from '../ground-truth/types';

/**
 * Group changes by selector for efficient CSS generation
 */
export const groupChangesBySelector = (
    changes: StyleChange[]
): Map<string, StyleChange[]> => {
    const grouped = new Map<string, StyleChange[]>();

    for (const change of changes) {
        if (!change.cssSelector || change.cssSelector.trim() === '') {
            console.warn(`[CSS Patcher] Skipping change with empty selector: ${change.property}`);
            continue;
        }

        const selector = change.cssSelector.trim();
        const existing = grouped.get(selector) || [];
        existing.push(change);
        grouped.set(selector, existing);
    }

    return grouped;
};

/**
 * Apply CSS patches using PostCSS AST manipulation.
 */
export const applyCSSPatches = async (
    overridesPath: string,
    changes: StyleChange[]
): Promise<{ success: boolean; appliedCount: number; errors: string[] }> => {
    const errors: string[] = [];
    let appliedCount = 0;

    // Filter out invalid changes first
    const validChanges = changes.filter(c => {
        if (!c.cssSelector || c.cssSelector.trim() === '') {
            errors.push(`Empty selector for property ${c.property}`);
            return false;
        }
        if (!c.property || c.property.trim() === '') {
            errors.push(`Empty property`);
            return false;
        }
        if (c.expected === undefined || c.expected === null) {
            errors.push(`No expected value for ${c.cssSelector}.${c.property}`);
            return false;
        }
        return true;
    });

    if (validChanges.length === 0) {
        return { success: false, appliedCount: 0, errors };
    }

    // Read existing overrides (or start fresh)
    let cssContent = '';
    try {
        cssContent = await fs.readFile(overridesPath, 'utf-8');
    } catch {
        cssContent = '/* PixelGen v2 CSS Overrides - Auto-generated */\n\n';
    }

    // Parse with PostCSS
    let root: Root;
    try {
        root = postcss.parse(cssContent);
    } catch (e) {
        console.error('[CSS Patcher] Failed to parse existing CSS, starting fresh');
        root = postcss.parse('/* PixelGen v2 CSS Overrides */\n');
    }

    // Group changes by selector for efficiency
    const grouped = groupChangesBySelector(validChanges);

    for (const [selector, selectorChanges] of grouped) {
        try {
            // Find existing rule or create new one
            let rule = findRule(root, selector);

            if (!rule) {
                rule = postcss.rule({ selector });
                root.append(rule);
            }

            // Apply each property change
            for (const change of selectorChanges) {
                applyPropertyChange(rule, change.property, change.expected);
                appliedCount++;
            }
        } catch (e) {
            const errorMsg = `Failed to apply ${selector}: ${e}`;
            console.error(`[CSS Patcher] ${errorMsg}`);
            errors.push(errorMsg);
        }
    }

    // Write back with atomic operation
    try {
        const output = root.toString();

        // Write to temp file first, then rename (atomic)
        const tempPath = overridesPath + '.tmp';
        await fs.writeFile(tempPath, output, 'utf-8');
        await fs.rename(tempPath, overridesPath);

        console.log(`[CSS Patcher] Wrote ${appliedCount} changes to ${overridesPath}`);
    } catch (e) {
        const errorMsg = `Failed to write CSS file: ${e}`;
        console.error(`[CSS Patcher] ${errorMsg}`);
        errors.push(errorMsg);
        return { success: false, appliedCount: 0, errors };
    }

    return { success: errors.length === 0, appliedCount, errors };
};

/**
 * Find an existing rule by selector
 */
const findRule = (root: Root, selector: string): Rule | undefined => {
    let found: Rule | undefined;

    root.walkRules((rule) => {
        if (rule.selector === selector) {
            found = rule;
        }
    });

    return found;
};

/**
 * Apply a property change to a rule, using !important to override Tailwind
 */
const applyPropertyChange = (rule: Rule, property: string, value: string): void => {
    // Ensure value has !important to override Tailwind utilities
    const importantValue = value.includes('!important') ? value : `${value} !important`;

    let found = false;

    // Check if property already exists
    rule.walkDecls(property, (decl) => {
        decl.value = importantValue;
        found = true;
    });

    // If not found, append new declaration
    if (!found) {
        rule.append({ prop: property, value: importantValue });
    }
};

/**
 * Generate CSS override content as a string (for preview/validation)
 */
export const generateCSSOverrides = (changes: StyleChange[]): string => {
    const grouped = groupChangesBySelector(changes);
    const lines: string[] = ['/* PixelGen v2 CSS Overrides */\n'];

    for (const [selector, selectorChanges] of grouped) {
        lines.push(`${selector} {`);
        for (const change of selectorChanges) {
            const value = change.expected.includes('!important')
                ? change.expected
                : `${change.expected} !important`;
            lines.push(`  ${change.property}: ${value};`);
        }
        lines.push('}\n');
    }

    return lines.join('\n');
};

/**
 * Remove a specific rule from overrides (for rollback)
 */
export const removeRule = async (
    overridesPath: string,
    selector: string,
    property?: string
): Promise<boolean> => {
    try {
        const cssContent = await fs.readFile(overridesPath, 'utf-8');
        const root = postcss.parse(cssContent);

        root.walkRules(selector, (rule) => {
            if (property) {
                // Remove just the property
                rule.walkDecls(property, (decl) => {
                    decl.remove();
                });
                // If rule is now empty, remove it
                if (rule.nodes?.length === 0) {
                    rule.remove();
                }
            } else {
                // Remove entire rule
                rule.remove();
            }
        });

        await fs.writeFile(overridesPath, root.toString(), 'utf-8');
        return true;
    } catch (e) {
        console.error(`[CSS Patcher] Failed to remove rule: ${e}`);
        return false;
    }
};

// Alias for backward compatibility
export const removeOverride = removeRule;