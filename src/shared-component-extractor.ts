// src/shared-component-extractor.ts
//
// Extracts shared components (header, nav, footer) from generated home page
// and enables their reuse across all pages in multi-page generation
//

import * as path from 'path';
import * as fs from 'fs/promises';

// ============================================================================
// TYPES
// ============================================================================

export interface SharedComponent {
    code: string;
    sectionId: string;
    componentName: string;
    assets: string[];  // Relative paths to assets used by this component
}

export interface SharedComponents {
    header: SharedComponent | null;
    footer: SharedComponent | null;
    nav: SharedComponent | null;
    allAssets: string[];  // All assets used by shared components
}

export interface PageContent {
    uniqueSections: string[];  // Section codes for unique content
    componentNames: string[];  // Names of unique section components
}

// ============================================================================
// SHARED COMPONENT DETECTION
// ============================================================================

/**
 * Detect if a section is a shared component (header, nav, footer)
 */
const isSharedSection = (sectionId: string, componentCode: string): 'header' | 'nav' | 'footer' | null => {
    const lowerSectionId = sectionId.toLowerCase();
    const lowerCode = componentCode.toLowerCase();

    // Header detection
    if (
        lowerSectionId.includes('header') ||
        lowerSectionId.includes('navbar') ||
        lowerSectionId.includes('topbar') ||
        (lowerCode.includes('<header') && !lowerCode.includes('</header>'))
    ) {
        return 'header';
    }

    // Footer detection
    if (
        lowerSectionId.includes('footer') ||
        lowerSectionId.includes('bottom') ||
        lowerSectionId.includes('about-us') ||  // Common footer pattern
        (lowerCode.includes('<footer') && !lowerCode.includes('</footer>'))
    ) {
        return 'footer';
    }

    // Nav detection (standalone nav outside header)
    if (
        lowerSectionId.includes('nav') ||
        lowerSectionId.includes('menu') ||
        lowerSectionId.includes('navigation')
    ) {
        return 'nav';
    }

    return null;
};

/**
 * Extract assets referenced in component code
 */
const extractAssets = (code: string): string[] => {
    const assets: string[] = [];

    // Match ./assets/img-X.ext patterns
    const assetPattern = /['"](\.\/assets\/[^'"]+)['"]/g;
    let match;
    while ((match = assetPattern.exec(code)) !== null) {
        if (!assets.includes(match[1])) {
            assets.push(match[1]);
        }
    }

    return assets;
};

// ============================================================================
// COMPONENT EXTRACTION
// ============================================================================

/**
 * Parse App.jsx to extract individual section components
 */
const parseAppSections = (appCode: string): Array<{
    componentName: string;
    sectionId: string;
    code: string;
}> => {
    const sections: Array<{ componentName: string; sectionId: string; code: string }> = [];

    // Pattern to match section components
    // const Section1 = () => { ... };
    const componentPattern = /\/\/\s*=+\s*SECTION\s*(\d+)\s*=+\s*\n(const\s+(Section\d+)\s*=\s*\(\)\s*=>\s*\{[\s\S]*?^\};?)/gm;

    let match;
    while ((match = componentPattern.exec(appCode)) !== null) {
        const componentName = match[3];
        const code = match[2].trim();

        // Extract data-section attribute
        const sectionIdMatch = code.match(/data-section=["']([^"']+)["']/);
        const sectionId = sectionIdMatch ? sectionIdMatch[1] : `section-${match[1]}`;

        sections.push({
            componentName,
            sectionId,
            code
        });
    }

    // Fallback: simpler pattern if SECTION markers not found
    if (sections.length === 0) {
        const simplePattern = /const\s+(Section\d+)\s*=\s*\(\)\s*=>\s*\{[\s\S]*?data-section=["']([^"']+)["'][\s\S]*?^\};?/gm;
        while ((match = simplePattern.exec(appCode)) !== null) {
            sections.push({
                componentName: match[1],
                sectionId: match[2],
                code: match[0].trim()
            });
        }
    }

    return sections;
};

/**
 * Extract shared components from a generated site directory
 */
export const extractSharedComponents = async (siteDir: string): Promise<SharedComponents> => {
    const result: SharedComponents = {
        header: null,
        footer: null,
        nav: null,
        allAssets: []
    };

    // Read App.jsx or App.js
    let appCode = '';
    try {
        appCode = await fs.readFile(path.join(siteDir, 'site', 'App.jsx'), 'utf8');
    } catch {
        try {
            appCode = await fs.readFile(path.join(siteDir, 'site', 'App.js'), 'utf8');
        } catch {
            console.warn('[SharedExtractor] No App.jsx/App.js found');
            return result;
        }
    }

    const sections = parseAppSections(appCode);
    console.log(`[SharedExtractor] Found ${sections.length} sections in App.jsx`);

    for (const section of sections) {
        const sharedType = isSharedSection(section.sectionId, section.code);

        if (sharedType) {
            const assets = extractAssets(section.code);
            const component: SharedComponent = {
                code: section.code,
                sectionId: section.sectionId,
                componentName: section.componentName,
                assets
            };

            if (sharedType === 'header' && !result.header) {
                result.header = component;
                console.log(`[SharedExtractor] ✓ Header: ${section.sectionId}`);
            } else if (sharedType === 'footer' && !result.footer) {
                result.footer = component;
                console.log(`[SharedExtractor] ✓ Footer: ${section.sectionId}`);
            } else if (sharedType === 'nav' && !result.nav) {
                result.nav = component;
                console.log(`[SharedExtractor] ✓ Nav: ${section.sectionId}`);
            }

            result.allAssets.push(...assets);
        }
    }

    // Deduplicate assets
    result.allAssets = Array.from(new Set(result.allAssets));

    console.log(`[SharedExtractor] Extracted: header=${!!result.header}, footer=${!!result.footer}, nav=${!!result.nav}`);
    console.log(`[SharedExtractor] Shared assets: ${result.allAssets.length}`);

    return result;
};

// ============================================================================
// PAGE COMPOSITION
// ============================================================================

/**
 * Compose a complete page by combining shared components with unique content
 */
export const composePageApp = (
    uniqueContent: PageContent,
    shared: SharedComponents,
    pageTitle: string = 'Page'
): string => {
    const allComponents: string[] = [];
    const appChildren: string[] = [];

    // Add header if available
    if (shared.header) {
        // Rename component to SharedHeader
        const headerCode = shared.header.code
            .replace(`const ${shared.header.componentName}`, 'const SharedHeader');
        allComponents.push(`// ========== SHARED HEADER ==========\n${headerCode}`);
        appChildren.push('      <SharedHeader />');
    }

    // Add nav if available (and separate from header)
    if (shared.nav && shared.nav.sectionId !== shared.header?.sectionId) {
        const navCode = shared.nav.code
            .replace(`const ${shared.nav.componentName}`, 'const SharedNav');
        allComponents.push(`// ========== SHARED NAV ==========\n${navCode}`);
        appChildren.push('      <SharedNav />');
    }

    // Add unique content sections
    for (let i = 0; i < uniqueContent.uniqueSections.length; i++) {
        const code = uniqueContent.uniqueSections[i];
        const name = uniqueContent.componentNames[i] || `Content${i + 1}`;
        allComponents.push(`// ========== ${pageTitle.toUpperCase()} CONTENT ${i + 1} ==========\n${code}`);
        appChildren.push(`      <${name} />`);
    }

    // Add footer if available
    if (shared.footer) {
        const footerCode = shared.footer.code
            .replace(`const ${shared.footer.componentName}`, 'const SharedFooter');
        allComponents.push(`// ========== SHARED FOOTER ==========\n${footerCode}`);
        appChildren.push('      <SharedFooter />');
    }

    return `// Generated by PixelGen v2 - Multi-Page with Shared Components
// Page: ${pageTitle}

${allComponents.join('\n\n')}

// ========== MAIN APP ==========
const App = () => {
  return (
    <div className="min-h-screen">
${appChildren.join('\n')}
    </div>
  );
};`;
};

/**
 * Get section IDs that should be skipped (shared sections)
 */
export const getSharedSectionPatterns = (shared: SharedComponents): RegExp[] => {
    const patterns: RegExp[] = [];

    // Match header-like sections by position (first section at y < 200)
    patterns.push(/^section-0$/i);  // Usually first section is header

    // Match by name patterns
    if (shared.header) {
        patterns.push(new RegExp(shared.header.sectionId.replace(/[-_]/g, '[-_]?'), 'i'));
    }
    if (shared.footer) {
        patterns.push(new RegExp(shared.footer.sectionId.replace(/[-_]/g, '[-_]?'), 'i'));
    }
    if (shared.nav) {
        patterns.push(new RegExp(shared.nav.sectionId.replace(/[-_]/g, '[-_]?'), 'i'));
    }

    // Common patterns
    patterns.push(/header/i, /nav(bar|igation)?$/i, /footer/i, /about-us$/i);

    return patterns;
};

/**
 * Check if a section should be skipped (is a shared component)
 */
export const shouldSkipSection = (
    sectionId: string,
    sectionIndex: number,
    totalSections: number,
    patterns: RegExp[]
): boolean => {
    // First section often header
    if (sectionIndex === 0) return true;

    // Last section often footer
    if (sectionIndex === totalSections - 1) return true;

    // Match patterns
    for (const pattern of patterns) {
        if (pattern.test(sectionId)) return true;
    }

    return false;
};

// ============================================================================
// ASSET COPYING
// ============================================================================

/**
 * Copy shared assets from home page to another page directory
 */
export const copySharedAssets = async (
    homeSiteDir: string,
    targetSiteDir: string,
    assetPaths: string[]
): Promise<void> => {
    const targetAssetsDir = path.join(targetSiteDir, 'assets');

    try {
        await fs.mkdir(targetAssetsDir, { recursive: true });
    } catch { }

    for (const assetPath of assetPaths) {
        const filename = path.basename(assetPath);
        const srcPath = path.join(homeSiteDir, 'site', assetPath);
        const destPath = path.join(targetAssetsDir, filename);

        try {
            await fs.copyFile(srcPath, destPath);
        } catch (e) {
            // Asset might not exist, continue
        }
    }

    console.log(`[SharedExtractor] Copied ${assetPaths.length} shared assets to ${targetSiteDir}`);
};
