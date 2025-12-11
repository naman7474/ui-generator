// src/multi-page-orchestrator.ts
//
// Orchestrates multi-page website generation by:
// 1. Discovering pages from entry URL
// 2. Generating each page using PixelGen V2
// 3. Assembling a multi-page React app with routing
//

import path from 'path';
import fs from 'fs/promises';
import { timestampId, ensureDir } from './utils';
import { config } from './config';
import { runPixelGenV2, PixelGenV2Options } from './pixelgen-v2';
import {
    discoverSitePages,
    SiteGraph,
    PageNode,
    MultiPageOptions,
    generateRouterCode,
    generateLayoutCode,
    generateIndexHtml
} from './multi-page-generator';
import {
    routesFromSiteGraph,
    buildLinkMappings,
    rewriteNavigationLinksOnDisk,
    summarizeMappings,
    ExtractedLink
} from './link-rewriter';
import {
    extractSharedComponents,
    composePageApp,
    copySharedAssets,
    SharedComponents,
    PageContent
} from './shared-component-extractor';
import {
    RouteRegistry,
    createRouteRegistry,
    generateRouteDefinitions,
} from './route-registry';
import {
    AssetRegistry,
    detectAssetType,
} from './asset-registry';

// ============================================================================
// TYPES
// ============================================================================

export interface MultiPageOrchestrationOptions {
    entryUrl: string;
    maxPages?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
    targetSimilarity?: number;
    maxIterationsPerPage?: number;
    device?: 'desktop' | 'mobile';
    skipSharedExtraction?: boolean;
}

export interface PageResult {
    path: string;
    url: string;
    success: boolean;
    similarity: number;
    siteDir: string;
    localUrl: string;
    error?: string;
}

export interface MultiPageResult {
    success: boolean;
    jobId: string;
    siteDir: string;
    entryLocalUrl: string;
    pages: PageResult[];
    siteGraph: {
        entryUrl: string;
        routes: Array<{ path: string; component: string; title: string }>;
        pageCount: number;
    };
    summary: {
        totalPages: number;
        successfulPages: number;
        averageSimilarity: number;
        minSimilarity: number;
        maxSimilarity: number;
    };
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

export const runMultiPageGeneration = async (
    options: MultiPageOrchestrationOptions
): Promise<MultiPageResult> => {
    const {
        entryUrl,
        maxPages = config.multiPage.maxPages,
        includePatterns = [],
        excludePatterns = config.multiPage.defaultExcludePatterns,
        targetSimilarity = config.multiPage.targetSimilarity,
        maxIterationsPerPage = 10,
        device = 'desktop',
    } = options;

    const jobId = timestampId();
    const multiPageDir = path.join(config.outputDir, 'multi-page', jobId);
    await ensureDir(multiPageDir);

    console.log('\n[MultiPage] ═══════════════════════════════════════════════════════════');
    console.log('[MultiPage] MULTI-PAGE WEBSITE GENERATION');
    console.log('[MultiPage] ═══════════════════════════════════════════════════════════\n');
    console.log(`[MultiPage] Entry URL: ${entryUrl}`);
    console.log(`[MultiPage] Max Pages: ${maxPages}`);
    console.log(`[MultiPage] Target Similarity: ${(targetSimilarity * 100).toFixed(0)}%`);
    console.log(`[MultiPage] Device: ${device}`);
    console.log(`[MultiPage] Output: ${multiPageDir}\n`);

    // ========== PHASE 1: Discover Pages ==========
    console.log('[MultiPage] ─── Phase 1: Discovering Pages ───\n');

    const discoveryOptions: MultiPageOptions = {
        maxPages,
        includePatterns,
        excludePatterns,
    };

    let siteGraph: SiteGraph;
    try {
        siteGraph = await discoverSitePages(entryUrl, discoveryOptions);
        console.log(`[MultiPage] Discovered ${siteGraph.pages.size} pages\n`);

        // Save site graph
        await fs.writeFile(
            path.join(multiPageDir, 'site-graph.json'),
            JSON.stringify({
                entryUrl: siteGraph.entryUrl,
                pages: Array.from(siteGraph.pages.entries()),
                routes: siteGraph.routes,
                navigationMap: Array.from(siteGraph.navigationMap.entries())
            }, null, 2)
        );
    } catch (e: any) {
        console.error(`[MultiPage] ✗ Discovery failed: ${e.message}`);
        throw e;
    }

    // ========== PHASE 1.5: Build Route Registry ==========
    console.log('[MultiPage] ─── Phase 1.5: Building Route Registry ───\n');

    // Create route registry from discovered pages
    const discoveredPagesList = Array.from(siteGraph.pages.entries()).map(([, node]) => ({
        url: node.url,
        title: node.title,
    }));

    const routeRegistry = createRouteRegistry(
        entryUrl,
        discoveredPagesList,
        config.multiPage.linkBehavior
    );

    console.log(`[MultiPage] Registered ${routeRegistry.getAllRoutes().length} routes`);

    // Save route registry for debugging
    await fs.writeFile(
        path.join(multiPageDir, 'route-registry.json'),
        JSON.stringify(routeRegistry.toJSON(), null, 2)
    );

    // Create asset registry for shared assets
    const assetRegistry = new AssetRegistry(multiPageDir);

    // Log route map summary
    const routeMap = routeRegistry.getRouteMapForPrompt();
    console.log('[MultiPage] Route Map:');
    for (const [pathname, route] of Object.entries(routeMap)) {
        console.log(`  ${pathname} → ${route}`);
    }
    console.log('');

    // ========== PHASE 2: Generate Home Page & Extract Shared Components ==========
    console.log('[MultiPage] ─── Phase 2: Generating Home Page & Extracting Shared Components ───\n');

    const pagesDir = path.join(multiPageDir, 'pages');
    await ensureDir(pagesDir);

    const pageResults: PageResult[] = [];
    const pagesArray = Array.from(siteGraph.pages.entries());

    // Find home page (first entry or path === 'home' or '/')
    const homeEntry = pagesArray.find(([p]) => p === 'home' || p === '/') || pagesArray[0];
    if (!homeEntry) {
        throw new Error('No pages discovered');
    }

    const [homePath, homeNode] = homeEntry;
    let sharedComponents: SharedComponents | null = null;
    let homeResult: PageResult | null = null;

    // Generate home page fully
    console.log(`\n[MultiPage] ══ Generating Home Page: ${homePath} ══`);
    console.log(`[MultiPage] URL: ${homeNode.url}\n`);

    const homeDir = path.join(pagesDir, homePath);
    await ensureDir(homeDir);

    try {
        const pixelGenOptions: PixelGenV2Options = {
            baseUrl: homeNode.url,
            maxIterations: maxIterationsPerPage,
            targetSimilarity,
            device,
            routeMap: routeRegistry.getRouteMapForPrompt(),
        };

        const result = await runPixelGenV2(pixelGenOptions);

        if (result.siteDir) {
            const srcSiteDir = path.join(result.siteDir, 'site');
            const destSiteDir = path.join(homeDir, 'site');
            await copyDir(srcSiteDir, destSiteDir);
        }

        homeResult = {
            path: homePath,
            url: homeNode.url,
            success: result.success,
            similarity: result.finalSimilarity,
            siteDir: homeDir,
            localUrl: result.localUrl,
        };
        pageResults.push(homeResult);

        console.log(`[MultiPage] ✓ Home page: ${(result.finalSimilarity * 100).toFixed(1)}% similarity`);

        // Extract shared components from home page
        if (result.siteDir) {
            console.log('\n[MultiPage] Extracting shared components from home page...');
            sharedComponents = await extractSharedComponents(result.siteDir);
        }

    } catch (e: any) {
        console.error(`[MultiPage] ✗ Home page failed: ${e.message}`);
        pageResults.push({
            path: homePath,
            url: homeNode.url,
            success: false,
            similarity: 0,
            siteDir: homeDir,
            localUrl: '',
            error: e.message,
        });
    }

    // ========== PHASE 2.5: Generate Other Pages with Shared Components ==========
    console.log('\n[MultiPage] ─── Phase 2.5: Generating Other Pages with Shared Components ───\n');

    const otherPages = pagesArray.filter(([p]) => p !== homePath);
    let pageIndex = 1;

    for (const [pagePath, pageNode] of otherPages) {
        pageIndex++;
        console.log(`\n[MultiPage] ══ Page ${pageIndex}/${siteGraph.pages.size}: ${pagePath} ══`);
        console.log(`[MultiPage] URL: ${pageNode.url}\n`);

        const pageDir = path.join(pagesDir, pagePath);
        await ensureDir(pageDir);

        try {
            // Generate the page
            const pixelGenOptions: PixelGenV2Options = {
                baseUrl: pageNode.url,
                maxIterations: maxIterationsPerPage,
                targetSimilarity,
                device,
                routeMap: routeRegistry.getRouteMapForPrompt(),
            };

            const result = await runPixelGenV2(pixelGenOptions);

            // Copy generated site to page directory
            if (result.siteDir) {
                const srcSiteDir = path.join(result.siteDir, 'site');
                const destSiteDir = path.join(pageDir, 'site');
                await copyDir(srcSiteDir, destSiteDir);

                // If we have shared components, compose the page with them
                if (sharedComponents && (sharedComponents.header || sharedComponents.footer)) {
                    console.log(`[MultiPage] Composing ${pagePath} with shared header/footer...`);

                    // Copy shared assets from home page
                    if (homeResult && sharedComponents.allAssets.length > 0) {
                        await copySharedAssets(
                            homeResult.siteDir,
                            destSiteDir,
                            sharedComponents.allAssets
                        );
                    }

                    // Read the generated App.jsx for this page
                    let pageAppCode = '';
                    try {
                        pageAppCode = await fs.readFile(path.join(destSiteDir, 'App.jsx'), 'utf8');
                    } catch {
                        try {
                            pageAppCode = await fs.readFile(path.join(destSiteDir, 'App.js'), 'utf8');
                        } catch { }
                    }

                    // Extract unique content sections (skip first and last - they're likely header/footer duplicates)
                    if (pageAppCode) {
                        const uniqueContent = extractUniqueContent(pageAppCode);

                        if (uniqueContent.uniqueSections.length > 0) {
                            const composedApp = composePageApp(
                                uniqueContent,
                                sharedComponents,
                                pagePath
                            );

                            // Write the composed App.jsx
                            await fs.writeFile(
                                path.join(destSiteDir, 'App.jsx'),
                                composedApp,
                                'utf8'
                            );
                            console.log(`[MultiPage] ✓ Composed ${pagePath} with shared components`);
                        }
                    }
                }
            }

            pageResults.push({
                path: pagePath,
                url: pageNode.url,
                success: result.success,
                similarity: result.finalSimilarity,
                siteDir: pageDir,
                localUrl: result.localUrl,
            });

            console.log(`[MultiPage] ✓ ${pagePath}: ${(result.finalSimilarity * 100).toFixed(1)}% similarity`);

        } catch (e: any) {
            console.error(`[MultiPage] ✗ ${pagePath}: ${e.message}`);
            pageResults.push({
                path: pagePath,
                url: pageNode.url,
                success: false,
                similarity: 0,
                siteDir: pageDir,
                localUrl: '',
                error: e.message,
            });
        }
    }

    // ========== PHASE 3: Assemble Multi-Page App ==========
    console.log('\n[MultiPage] ─── Phase 3: Assembling Multi-Page App ───\n');

    const assembledDir = path.join(multiPageDir, 'assembled');
    await ensureDir(assembledDir);

    try {
        // Generate router code
        const routerCode = generateRouterCode(siteGraph);
        await fs.writeFile(path.join(assembledDir, 'App.jsx'), routerCode);

        // Generate layout
        const layoutCode = generateLayoutCode(siteGraph);
        await fs.writeFile(path.join(assembledDir, 'Layout.jsx'), layoutCode);

        // Generate index.html
        const indexHtml = generateIndexHtml(siteGraph);
        await fs.writeFile(path.join(assembledDir, 'index.html'), indexHtml);

        // Copy and transform individual page components for UMD compatibility
        for (const result of pageResults) {
            if (result.success) {
                const srcApp = path.join(result.siteDir, 'site', 'App.jsx');
                const srcJs = path.join(result.siteDir, 'site', 'App.js');
                const destDir = path.join(assembledDir, 'pages', result.path);
                await ensureDir(destDir);

                // Normalize the page path for the registry key (e.g., 'blog' or 'pages_our-policies')
                const registryKey = result.path.replace(/\//g, '_');

                try {
                    let appCode = '';
                    try {
                        appCode = await fs.readFile(srcApp, 'utf8');
                    } catch {
                        appCode = await fs.readFile(srcJs, 'utf8');
                    }

                    // Transform ES6 exports to window.__PAGE_COMPONENTS__ registration
                    // Remove ES6 import statements (they won't work with Babel standalone)
                    appCode = appCode.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');
                    appCode = appCode.replace(/^import\s+['"].*?['"];?\s*$/gm, '');

                    // Remove export default statement and capture the component name
                    appCode = appCode.replace(/export\s+default\s+(\w+);?\s*$/gm, '');
                    appCode = appCode.replace(/export\s+default\s+/g, '');

                    // Add registration at the end - find the App component and register it
                    const componentMatch = appCode.match(/const\s+(App|[A-Z][a-zA-Z]*Page)\s*=/);
                    const componentName = componentMatch ? componentMatch[1] : 'App';

                    // Wrap in an IIFE to avoid global scope pollution
                    const wrappedCode = `// Page: ${result.path}
// Auto-registered to window.__PAGE_COMPONENTS__['${registryKey}']
(function() {
    // Use React from global scope (loaded via UMD)
    const React = window.React;
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    
${appCode.trim()}

    // Register the component
    window.__PAGE_COMPONENTS__ = window.__PAGE_COMPONENTS__ || {};
    window.__PAGE_COMPONENTS__['${registryKey}'] = ${componentName};
})();
`;

                    await fs.writeFile(path.join(destDir, 'App.jsx'), wrappedCode, 'utf8');
                    console.log(`[MultiPage] ✓ Transformed ${result.path}/App.jsx for UMD`);
                } catch (e: any) {
                    console.warn(`[MultiPage] Could not transform App for ${result.path}: ${e.message}`);
                }
            }
        }

        console.log('[MultiPage] ✓ Multi-page app assembled');

    } catch (e: any) {
        console.error(`[MultiPage] ⚠ Assembly warning: ${e.message}`);
    }

    // ========== PHASE 3.5: Rewrite Navigation Links with Route Registry ==========
    console.log('\\n[MultiPage] ─── Phase 3.5: Rewriting Navigation Links ───\\n');

    try {
        // Use the route registry for more accurate link rewriting
        console.log('[MultiPage] Using Route Registry for link rewriting...');

        // Convert site graph routes to RouteInfo format (fallback)
        const routeInfos = routesFromSiteGraph(siteGraph.routes);

        // Collect all extracted links from discovered pages
        const allLinks: ExtractedLink[] = [];
        for (const [, pageNode] of siteGraph.pages) {
            for (const link of pageNode.links) {
                allLinks.push({
                    text: link.text,
                    href: link.href,
                    resolvedUrl: link.resolvedUrl,
                    position: link.position,
                    section: link.parentSection as any || 'unknown',
                    type: link.isButton ? 'button' : 'nav-item',
                    selector: link.selector,
                    isExternal: link.href.startsWith('http') && !link.href.includes(new URL(entryUrl).hostname)
                });
            }
        }

        // Build link mappings using both route registry and heuristic matching
        const mappings = buildLinkMappings(allLinks, routeInfos);

        // Enhance mappings with route registry data
        for (const mapping of mappings) {
            const replacement = routeRegistry.getLinkReplacement(mapping.originalHref);
            if (replacement.behavior === 'route') {
                // Override with route registry's accurate mapping
                mapping.targetRoute = replacement.to;
                mapping.matchConfidence = 1.0;
                mapping.matchedBy = 'exact-text'; // High confidence
            }
        }

        console.log(`[MultiPage] ${summarizeMappings(mappings)}`);

        // Rewrite links in assembled directory
        const rewriteResult = await rewriteNavigationLinksOnDisk(assembledDir, mappings);

        if (rewriteResult.rewritten > 0) {
            console.log(`[MultiPage] ✓ Rewrote ${rewriteResult.rewritten} links in ${rewriteResult.files.length} files`);
        } else {
            console.log('[MultiPage] ℹ No placeholder links found to rewrite');
        }

        // Also rewrite links in individual page directories
        for (const result of pageResults) {
            if (result.success && result.siteDir) {
                const pageRewrite = await rewriteNavigationLinksOnDisk(
                    path.join(result.siteDir, 'site'),
                    mappings
                );
                if (pageRewrite.rewritten > 0) {
                    console.log(`[MultiPage]   └─ ${result.path}: ${pageRewrite.rewritten} links`);
                }
            }
        }

    } catch (e: any) {
        console.warn(`[MultiPage] ⚠ Link rewriting warning: ${e.message}`);
    }

    // ========== PHASE 3.6: Save Asset Manifest ==========
    try {
        await assetRegistry.saveManifest(path.join(multiPageDir, 'assets-manifest.json'));
        const manifest = assetRegistry.getManifest();
        if (manifest.stats.total > 0) {
            console.log(`[MultiPage] ✓ Saved asset manifest (${manifest.stats.total} assets)`);
        }
    } catch (e: any) {
        console.warn(`[MultiPage] ⚠ Asset manifest warning: ${e.message}`);
    }

    // ========== PHASE 4: Generate Summary ==========
    console.log('\n[MultiPage] ─── Phase 4: Summary ───\n');

    const successfulPages = pageResults.filter(p => p.success);
    const similarities = successfulPages.map(p => p.similarity);

    const summary = {
        totalPages: pageResults.length,
        successfulPages: successfulPages.length,
        averageSimilarity: similarities.length > 0
            ? similarities.reduce((a, b) => a + b, 0) / similarities.length
            : 0,
        minSimilarity: similarities.length > 0 ? Math.min(...similarities) : 0,
        maxSimilarity: similarities.length > 0 ? Math.max(...similarities) : 0,
    };

    // Save summary
    await fs.writeFile(
        path.join(multiPageDir, 'summary.json'),
        JSON.stringify({
            jobId,
            entryUrl,
            summary,
            pages: pageResults,
            routes: siteGraph.routes,
        }, null, 2)
    );

    console.log('[MultiPage] ═══════════════════════════════════════════════════════════');
    console.log('[MultiPage] MULTI-PAGE GENERATION COMPLETE');
    console.log('[MultiPage] ═══════════════════════════════════════════════════════════\n');
    console.log(`[MultiPage] Total Pages: ${summary.totalPages}`);
    console.log(`[MultiPage] Successful: ${summary.successfulPages}/${summary.totalPages}`);
    console.log(`[MultiPage] Average Similarity: ${(summary.averageSimilarity * 100).toFixed(1)}%`);
    console.log(`[MultiPage] Range: ${(summary.minSimilarity * 100).toFixed(1)}% - ${(summary.maxSimilarity * 100).toFixed(1)}%`);
    console.log(`[MultiPage] Output: ${multiPageDir}\n`);

    // Determine entry local URL (first successful page or assembled app)
    const entryLocalUrl = successfulPages.length > 0
        ? successfulPages[0].localUrl
        : `file://${path.join(assembledDir, 'index.html')}`;

    return {
        success: summary.successfulPages > 0,
        jobId,
        siteDir: multiPageDir,
        entryLocalUrl,
        pages: pageResults,
        siteGraph: {
            entryUrl: siteGraph.entryUrl,
            routes: siteGraph.routes,
            pageCount: siteGraph.pages.size,
        },
        summary,
    };
};

// ============================================================================
// HELPERS
// ============================================================================

async function copyDir(src: string, dest: string): Promise<void> {
    try {
        await ensureDir(dest);
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await copyDir(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    } catch (e: any) {
        // Directory might not exist
        console.warn(`[MultiPage] Could not copy ${src}: ${e.message}`);
    }
}

/**
 * Extract unique content sections from page App.jsx (skip header/footer)
 */
function extractUniqueContent(appCode: string): PageContent {
    const result: PageContent = {
        uniqueSections: [],
        componentNames: []
    };

    // Pattern to match section components
    const componentPattern = /\/\/\s*=+\s*SECTION\s*(\d+)\s*=+\s*\n(const\s+(Section\d+)\s*=\s*\(\)\s*=>\s*\{[\s\S]*?^\};?)/gm;

    const sections: Array<{ index: number; name: string; code: string; sectionId: string }> = [];

    let match;
    while ((match = componentPattern.exec(appCode)) !== null) {
        const index = parseInt(match[1], 10);
        const code = match[2].trim();
        const name = match[3];

        // Extract data-section
        const sectionIdMatch = code.match(/data-section=["']([^"']+)["']/);
        const sectionId = sectionIdMatch ? sectionIdMatch[1] : '';

        sections.push({ index, name, code, sectionId });
    }

    // Fallback: simpler pattern
    if (sections.length === 0) {
        const simplePattern = /const\s+(Section\d+)\s*=\s*\(\)\s*=>\s*\{[\s\S]*?data-section=["']([^"']+)["'][\s\S]*?^\};?/gm;
        while ((match = simplePattern.exec(appCode)) !== null) {
            sections.push({
                index: sections.length,
                name: match[1],
                code: match[0].trim(),
                sectionId: match[2]
            });
        }
    }

    // Filter out header/footer sections (usually first and last)
    const isShared = (sectionId: string, index: number, total: number): boolean => {
        // First section is usually header
        if (index === 0) return true;
        // Last section is usually footer
        if (index === total - 1) return true;
        // Check by name patterns
        if (/header|nav|footer|about-us/i.test(sectionId)) return true;
        return false;
    };

    for (const section of sections) {
        if (!isShared(section.sectionId, section.index, sections.length)) {
            result.uniqueSections.push(section.code);
            result.componentNames.push(section.name);
        }
    }

    // If we filtered everything, keep at least one section
    if (result.uniqueSections.length === 0 && sections.length > 0) {
        // Take the middle sections
        const middle = Math.floor(sections.length / 2);
        result.uniqueSections.push(sections[middle].code);
        result.componentNames.push(sections[middle].name);
    }

    return result;
}

// Export for server usage
export { discoverSitePages } from './multi-page-generator';
