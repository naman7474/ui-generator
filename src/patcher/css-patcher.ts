
import fs from 'fs/promises';
import postcss, { Root, Rule } from 'postcss';
import { StyleChange } from '../ground-truth/types';
import { groupChangesBySelector } from '../ground-truth/prioritizer';

/**
 * Apply CSS patches using PostCSS AST manipulation.
 * 
 * This is the DETERMINISTIC core - no LLM involved.
 */
export const applyCSSPatches = async (
    overridesPath: string,
    changes: StyleChange[]
): Promise<{ success: boolean; appliedCount: number; errors: string[] }> => {
    const errors: string[] = [];
    let appliedCount = 0;

    // Read existing overrides (or start fresh)
    let cssContent = '';
    try {
        cssContent = await fs.readFile(overridesPath, 'utf-8');
    } catch {
        cssContent = '/* Auto-generated CSS overrides */\n';
    }

    // Parse with PostCSS
    const root = postcss.parse(cssContent);

    // Group changes by selector for efficiency
    const grouped = groupChangesBySelector(changes);

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
            errors.push(`Failed to apply ${selector}: ${e}`);
        }
    }

    // Write back
    const output = root.toString();
    await fs.writeFile(overridesPath, output, 'utf-8');

    return { success: errors.length === 0, appliedCount, errors };
};

const findRule = (root: Root, selector: string): Rule | undefined => {
    let found: Rule | undefined;

    root.walkRules((rule) => {
        if (rule.selector === selector) {
            found = rule;
        }
    });

    return found;
};

const applyPropertyChange = (rule: Rule, property: string, value: string): void => {
    let found = false;

    // Check if property already exists
    rule.walkDecls(property, (decl) => {
        decl.value = value;
        found = true;
    });

    // If not found, append new declaration
    if (!found) {
        rule.append({ prop: property, value });
    }
};

/**
 * Generate CSS override content without modifying files.
 * Useful for preview/validation before applying.
 */
export const generateCSSOverrides = (changes: StyleChange[]): string => {
    const lines: string[] = ['/* Auto-generated CSS overrides */'];

    const grouped = groupChangesBySelector(changes);

    for (const [selector, selectorChanges] of grouped) {
        lines.push('');
        lines.push(`${selector} {`);

        for (const change of selectorChanges) {
            // Add !important to ensure override takes effect
            lines.push(`  ${change.property}: ${change.expected} !important;`);
        }

        lines.push('}');
    }

    return lines.join('\n');
};

/**
 * Remove a specific change (for rollback).
 */
export const removeOverride = async (
    overridesPath: string,
    change: StyleChange
): Promise<void> => {
    const cssContent = await fs.readFile(overridesPath, 'utf-8');
    const root = postcss.parse(cssContent);

    root.walkRules(change.cssSelector, (rule) => {
        rule.walkDecls(change.property, (decl) => {
            decl.remove();
        });

        // Remove empty rules
        if (rule.nodes?.length === 0) {
            rule.remove();
        }
    });

    await fs.writeFile(overridesPath, root.toString(), 'utf-8');
};
