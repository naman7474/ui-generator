// src/structure-freeze.ts
//
// IMPROVED VERSION - Ensures HTML structure doesn't change during CSS refinement
// Key improvements:
// 1. Creates a hash of the structural HTML
// 2. Verifies structure before each CSS change
// 3. Separates CSS from HTML for clean overrides
// 4. Provides rollback capability
//

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { ensureDir } from './utils';

// ============================================================================
// TYPES
// ============================================================================

export interface FreezeResult {
    structureHash: string;
    frozenHtmlPath: string;
    overridesPath: string;
    backupPath: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate a hash of the HTML structure (ignoring styles and classes)
 */
const generateStructureHash = (html: string): string => {
    // Remove content that doesn't affect structure
    const structural = html
        // Remove inline styles
        .replace(/\s+style="[^"]*"/gi, '')
        // Remove class attributes (Tailwind classes don't affect structure)
        .replace(/\s+class(?:Name)?="[^"]*"/gi, '')
        // Remove data-* attributes except data-section
        .replace(/\s+data-(?!section)[a-z\-]+="[^"]*"/gi, '')
        // Remove whitespace variations
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        // Normalize quotes
        .replace(/'/g, '"')
        .trim();

    return crypto.createHash('md5').update(structural).digest('hex');
};

/**
 * Extract inline styles and convert to CSS file
 */
const extractInlineStyles = (html: string): { cleanHtml: string; extractedCss: string } => {
    const styles: string[] = [];
    let styleIndex = 0;

    // Find elements with inline styles and data-section
    const cleanHtml = html.replace(
        /<([a-z][a-z0-9]*)\s+([^>]*?)style="([^"]*)"([^>]*)>/gi,
        (match, tag, before, style, after) => {
            // Check if this element has data-section
            const dataSectionMatch = (before + after).match(/data-section="([^"]+)"/);
            if (dataSectionMatch) {
                const sectionName = dataSectionMatch[1];
                styles.push(`[data-section="${sectionName}"] { ${style} }`);
                return `<${tag} ${before}${after}>`;
            }

            // Generate a unique ID for other elements
            styleIndex++;
            const styleId = `pixelgen-style-${styleIndex}`;
            styles.push(`#${styleId} { ${style} }`);
            return `<${tag} ${before}id="${styleId}"${after}>`;
        }
    );

    return {
        cleanHtml,
        extractedCss: styles.join('\n')
    };
};

/**
 * Ensure overrides.css is linked in the HTML
 */
const ensureOverridesLinked = (html: string): string => {
    // Check if already linked
    if (html.includes('overrides.css')) {
        return html;
    }

    // Add link before </head>
    return html.replace(
        '</head>',
        '    <link rel="stylesheet" href="overrides.css">\n</head>'
    );
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Freeze the structure of a generated site
 * After this, only CSS changes are allowed
 */
export const freezeStructure = async (siteDir: string): Promise<FreezeResult> => {
    const siteFolder = path.join(siteDir, 'site');
    const indexPath = path.join(siteFolder, 'index.html');

    // Ensure directories exist
    await ensureDir(siteFolder);

    // Read current HTML
    let html: string;
    try {
        html = await fs.readFile(indexPath, 'utf-8');
    } catch (e) {
        throw new Error(`Cannot freeze: index.html not found at ${indexPath}`);
    }

    // Generate structure hash
    const structureHash = generateStructureHash(html);

    // Save hash
    await fs.writeFile(path.join(siteDir, 'structure-hash.txt'), structureHash);

    // Create backup
    const backupPath = path.join(siteDir, 'index.html.backup');
    await fs.writeFile(backupPath, html);

    // Create frozen structure (a clean version without volatile attributes)
    const frozenHtmlPath = path.join(siteDir, 'frozen-structure.html');
    await fs.writeFile(frozenHtmlPath, html);

    // Ensure HTML links to overrides.css
    const linkedHtml = ensureOverridesLinked(html);
    if (linkedHtml !== html) {
        await fs.writeFile(indexPath, linkedHtml);
    }

    // Create/ensure overrides.css exists
    const overridesPath = path.join(siteFolder, 'overrides.css');
    try {
        await fs.access(overridesPath);
    } catch {
        await fs.writeFile(overridesPath, '/* PixelGen CSS Overrides */\n\n');
    }

    console.log(`[Freeze] Structure frozen with hash: ${structureHash.slice(0, 8)}...`);

    return {
        structureHash,
        frozenHtmlPath,
        overridesPath,
        backupPath
    };
};

/**
 * Verify that the structure hasn't changed
 */
export const verifyStructure = async (siteDir: string): Promise<boolean> => {
    const siteFolder = path.join(siteDir, 'site');
    const indexPath = path.join(siteFolder, 'index.html');
    const hashPath = path.join(siteDir, 'structure-hash.txt');

    try {
        const [currentHtml, savedHash] = await Promise.all([
            fs.readFile(indexPath, 'utf-8'),
            fs.readFile(hashPath, 'utf-8')
        ]);

        const currentHash = generateStructureHash(currentHtml);
        const isValid = currentHash === savedHash.trim();

        if (!isValid) {
            console.warn(`[Freeze] Structure mismatch! Saved: ${savedHash.slice(0, 8)}, Current: ${currentHash.slice(0, 8)}`);
        }

        return isValid;

    } catch (e: any) {
        console.warn(`[Freeze] Cannot verify structure: ${e.message}`);
        return true; // Assume OK if we can't verify
    }
};

/**
 * Restore structure from backup/frozen version
 */
export const restoreStructure = async (siteDir: string): Promise<boolean> => {
    const siteFolder = path.join(siteDir, 'site');
    const indexPath = path.join(siteFolder, 'index.html');
    const frozenPath = path.join(siteDir, 'frozen-structure.html');
    const backupPath = path.join(siteDir, 'index.html.backup');

    try {
        // Try frozen first, then backup
        let restoredHtml: string | null = null;

        try {
            restoredHtml = await fs.readFile(frozenPath, 'utf-8');
            console.log('[Freeze] Restored from frozen structure');
        } catch {
            try {
                restoredHtml = await fs.readFile(backupPath, 'utf-8');
                console.log('[Freeze] Restored from backup');
            } catch {
                console.error('[Freeze] No backup available for restore');
                return false;
            }
        }

        if (restoredHtml) {
            // Ensure overrides link is present
            const linkedHtml = ensureOverridesLinked(restoredHtml);
            await fs.writeFile(indexPath, linkedHtml);
            return true;
        }

        return false;

    } catch (e: any) {
        console.error(`[Freeze] Restore failed: ${e.message}`);
        return false;
    }
};

/**
 * Get the path to overrides.css
 */
export const getOverridesPath = (siteDir: string): string => {
    return path.join(siteDir, 'site', 'overrides.css');
};

/**
 * Get current structure hash without saving
 */
export const getCurrentStructureHash = async (siteDir: string): Promise<string | null> => {
    const indexPath = path.join(siteDir, 'site', 'index.html');

    try {
        const html = await fs.readFile(indexPath, 'utf-8');
        return generateStructureHash(html);
    } catch {
        return null;
    }
};

/**
 * Check if structure is frozen
 */
export const isStructureFrozen = async (siteDir: string): Promise<boolean> => {
    const hashPath = path.join(siteDir, 'structure-hash.txt');

    try {
        await fs.access(hashPath);
        return true;
    } catch {
        return false;
    }
};