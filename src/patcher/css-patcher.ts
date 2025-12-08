// src/patcher/css-patcher.ts
//
// IMPROVED VERSION - More reliable CSS patching
// Key improvements:
// 1. Validate selectors before applying
// 2. Deduplicate rules
// 3. Better error handling
// 4. Support for complex selectors
// 5. Includes removeOverride for rollback support
//

import fs from 'fs/promises';
import path from 'path';
import { StyleChange } from '../ground-truth/types';

// ============================================================================
// TYPES
// ============================================================================

export interface PatchResult {
    success: boolean;
    appliedCount: number;
    skippedCount: number;
    errors: string[];
}

// ============================================================================
// SELECTOR VALIDATION
// ============================================================================

/**
 * Validate a CSS selector is safe to use
 */
const isValidSelector = (selector: string): boolean => {
    if (!selector || typeof selector !== 'string') return false;

    // Must have some content
    if (selector.trim().length < 2) return false;

    // Block dangerous selectors
    const dangerous = [
        /^\s*\*\s*$/,           // Universal selector alone
        /^html\s*$/i,           // Just html
        /^body\s*$/i,           // Just body (without child)
        /^#root\s*$/i,          // Just #root
        /^#app\s*$/i,           // Just #app
        /^:root\s*$/i,          // Just :root
    ];

    for (const pattern of dangerous) {
        if (pattern.test(selector)) return false;
    }

    // Must have valid CSS selector characters
    if (!/^[\w\s\-\.\#\[\]=\"\'\:\>\+\~\*\(\)]+$/.test(selector)) {
        return false;
    }

    return true;
};

/**
 * Validate a property name is safe
 */
const isValidProperty = (property: string): boolean => {
    if (!property || typeof property !== 'string') return false;

    // Must be a valid CSS property name
    if (!/^[a-z\-]+$/i.test(property)) return false;

    // Block dangerous properties for broad selectors
    const dangerous = new Set([
        'position', 'top', 'right', 'bottom', 'left',
        'display', 'visibility', 'overflow',
        'height', 'width', 'min-height', 'max-height',
        'transform', 'z-index', 'float', 'clear'
    ]);

    return !dangerous.has(property.toLowerCase());
};

/**
 * Check if a value is safe to apply
 */
const isValidValue = (value: string): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value !== 'string') value = String(value);

    // Must have some content
    if (value.trim().length === 0) return false;

    // Block suspicious values
    if (/expression\s*\(/i.test(value)) return false;  // IE expression
    if (/javascript\s*:/i.test(value)) return false;   // JS injection
    if (/url\s*\(\s*["']?data:/i.test(value)) return false;  // Data URLs (except small ones)

    // Block absurdly large values
    const numMatch = value.match(/(\d+)(px|em|rem|vh|vw|%)?/);
    if (numMatch) {
        const num = parseInt(numMatch[1]);
        if (num > 5000) return false;  // Likely a bug
    }

    return true;
};

// ============================================================================
// CSS MANIPULATION
// ============================================================================

/**
 * Parse existing CSS to find rules
 */
const parseExistingRules = (css: string): Map<string, Map<string, string>> => {
    const rules = new Map<string, Map<string, string>>();

    // Simple CSS parser (handles most common cases)
    const rulePattern = /([^{}]+)\s*\{([^}]*)\}/g;
    let match;

    while ((match = rulePattern.exec(css)) !== null) {
        const selector = match[1].trim();
        const declarations = match[2];

        if (!rules.has(selector)) {
            rules.set(selector, new Map());
        }

        // Parse declarations
        const declPattern = /([^:;]+)\s*:\s*([^;]+)/g;
        let declMatch;

        while ((declMatch = declPattern.exec(declarations)) !== null) {
            const prop = declMatch[1].trim();
            const val = declMatch[2].trim().replace(/\s*!important\s*$/, '');
            rules.get(selector)!.set(prop, val);
        }
    }

    return rules;
};

/**
 * Serialize rules back to CSS
 */
const serializeRules = (rules: Map<string, Map<string, string>>): string => {
    const lines: string[] = [];

    for (const [selector, declarations] of rules) {
        if (declarations.size === 0) continue;

        lines.push(`${selector} {`);
        for (const [prop, val] of declarations) {
            lines.push(`  ${prop}: ${val} !important;`);
        }
        lines.push('}');
        lines.push('');
    }

    return lines.join('\n');
};

/**
 * Normalize a selector for deduplication
 */
const normalizeSelector = (selector: string): string => {
    return selector
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*>\s*/g, ' > ')
        .replace(/\s*:\s*/g, ':')
        .toLowerCase();
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Apply a single CSS change
 */
export const applySingleChange = async (
    overridesPath: string,
    change: StyleChange
): Promise<{ success: boolean; error?: string }> => {
    // Validate inputs
    if (!isValidSelector(change.cssSelector)) {
        return { success: false, error: `Invalid selector: ${change.cssSelector}` };
    }

    if (!isValidProperty(change.property)) {
        return { success: false, error: `Blocked property: ${change.property}` };
    }

    if (!isValidValue(change.expected)) {
        return { success: false, error: `Invalid value: ${change.expected}` };
    }

    try {
        // Read existing CSS
        let existingCSS = '';
        try {
            existingCSS = await fs.readFile(overridesPath, 'utf-8');
        } catch {
            // File doesn't exist yet
        }

        // Parse existing rules
        const rules = parseExistingRules(existingCSS);

        // Add/update the rule
        const normalizedSelector = normalizeSelector(change.cssSelector);

        // Find matching selector (case-insensitive)
        let targetSelector = change.cssSelector;
        for (const [existing] of rules) {
            if (normalizeSelector(existing) === normalizedSelector) {
                targetSelector = existing;
                break;
            }
        }

        if (!rules.has(targetSelector)) {
            rules.set(targetSelector, new Map());
        }

        rules.get(targetSelector)!.set(change.property, change.expected);

        // Serialize and write
        const newCSS = `/* PixelGen CSS Overrides */\n\n${serializeRules(rules)}`;
        await fs.writeFile(overridesPath, newCSS);

        return { success: true };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Apply multiple CSS changes at once (more efficient)
 */
export const applyCSSPatches = async (
    overridesPath: string,
    changes: StyleChange[]
): Promise<PatchResult> => {
    const errors: string[] = [];
    let appliedCount = 0;
    let skippedCount = 0;

    if (!changes || changes.length === 0) {
        return { success: true, appliedCount: 0, skippedCount: 0, errors: [] };
    }

    try {
        // Read existing CSS
        let existingCSS = '';
        try {
            existingCSS = await fs.readFile(overridesPath, 'utf-8');
        } catch {
            // File doesn't exist yet
        }

        // Parse existing rules
        const rules = parseExistingRules(existingCSS);

        // Apply each change
        for (const change of changes) {
            // Validate
            if (!isValidSelector(change.cssSelector)) {
                errors.push(`Invalid selector: ${change.cssSelector?.slice(0, 50)}`);
                skippedCount++;
                continue;
            }

            if (!isValidProperty(change.property)) {
                errors.push(`Blocked property: ${change.property}`);
                skippedCount++;
                continue;
            }

            if (!isValidValue(change.expected)) {
                errors.push(`Invalid value for ${change.property}`);
                skippedCount++;
                continue;
            }

            // Find or create rule
            const normalizedSelector = normalizeSelector(change.cssSelector);
            let targetSelector = change.cssSelector;

            for (const [existing] of rules) {
                if (normalizeSelector(existing) === normalizedSelector) {
                    targetSelector = existing;
                    break;
                }
            }

            if (!rules.has(targetSelector)) {
                rules.set(targetSelector, new Map());
            }

            rules.get(targetSelector)!.set(change.property, change.expected);
            appliedCount++;
        }

        // Serialize and write
        const newCSS = `/* PixelGen CSS Overrides - ${appliedCount} rules */\n\n${serializeRules(rules)}`;
        await fs.writeFile(overridesPath, newCSS);

        return {
            success: appliedCount > 0,
            appliedCount,
            skippedCount,
            errors
        };

    } catch (e: any) {
        return {
            success: false,
            appliedCount: 0,
            skippedCount: changes.length,
            errors: [e.message]
        };
    }
};

/**
 * Remove a specific override (for rollback support)
 */
export const removeOverride = async (
    overridesPath: string,
    selector: string,
    property?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        let existingCSS = '';
        try {
            existingCSS = await fs.readFile(overridesPath, 'utf-8');
        } catch {
            return { success: true }; // Nothing to remove
        }

        const rules = parseExistingRules(existingCSS);
        const normalizedTarget = normalizeSelector(selector);

        let found = false;
        for (const [existingSelector, declarations] of rules) {
            if (normalizeSelector(existingSelector) === normalizedTarget) {
                if (property) {
                    // Remove specific property
                    if (declarations.has(property)) {
                        declarations.delete(property);
                        found = true;
                    }
                    // Remove selector if no properties left
                    if (declarations.size === 0) {
                        rules.delete(existingSelector);
                    }
                } else {
                    // Remove entire selector
                    rules.delete(existingSelector);
                    found = true;
                }
                break;
            }
        }

        if (!found) {
            return { success: true }; // Nothing to remove
        }

        const newCSS = `/* PixelGen CSS Overrides */\n\n${serializeRules(rules)}`;
        await fs.writeFile(overridesPath, newCSS);

        return { success: true };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Append raw CSS (for LLM-generated CSS)
 */
export const appendRawCSS = async (
    overridesPath: string,
    css: string,
    comment?: string
): Promise<{ success: boolean; ruleCount: number; error?: string }> => {
    try {
        // Read existing
        let existing = '';
        try {
            existing = await fs.readFile(overridesPath, 'utf-8');
        } catch {
            existing = '/* PixelGen CSS Overrides */\n';
        }

        // Validate the CSS minimally
        const braceCount = (css.match(/\{/g) || []).length;
        const closeBraceCount = (css.match(/\}/g) || []).length;

        if (braceCount !== closeBraceCount) {
            return { success: false, ruleCount: 0, error: 'Unbalanced braces in CSS' };
        }

        // Append
        const separator = comment ? `\n\n/* ${comment} */\n` : '\n\n';
        const newContent = existing + separator + css.trim() + '\n';

        await fs.writeFile(overridesPath, newContent);

        return { success: true, ruleCount: braceCount };

    } catch (e: any) {
        return { success: false, ruleCount: 0, error: e.message };
    }
};

/**
 * Get current rule count
 */
export const getRuleCount = async (overridesPath: string): Promise<number> => {
    try {
        const css = await fs.readFile(overridesPath, 'utf-8');
        return (css.match(/\{/g) || []).length;
    } catch {
        return 0;
    }
};

/**
 * Clear all overrides
 */
export const clearOverrides = async (overridesPath: string): Promise<void> => {
    await fs.writeFile(overridesPath, '/* PixelGen CSS Overrides */\n');
};

/**
 * Backup current overrides
 */
export const backupOverrides = async (overridesPath: string): Promise<string> => {
    try {
        const content = await fs.readFile(overridesPath, 'utf-8');
        const backupPath = overridesPath + '.backup';
        await fs.writeFile(backupPath, content);
        return backupPath;
    } catch {
        return '';
    }
};

/**
 * Restore from backup
 */
export const restoreOverrides = async (overridesPath: string): Promise<boolean> => {
    try {
        const backupPath = overridesPath + '.backup';
        const content = await fs.readFile(backupPath, 'utf-8');
        await fs.writeFile(overridesPath, content);
        return true;
    } catch {
        return false;
    }
};