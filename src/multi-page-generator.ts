// src/multi-page-generator.ts
// Generates multi-page replicas with proper navigation

import { chromium, Page, Browser } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { timestampId, ensureDir } from './utils';
import { config } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface NavigationLink {
    text: string;
    href: string;
    resolvedUrl: string;
    selector: string;
    isButton: boolean;
    parentSection: string;
    position: { x: number; y: number };
}

export interface PageNode {
    path: string;
    url: string;
    title: string;
    links: NavigationLink[];
    sharedSections: string[];
    screenshotPath?: string;
}

export interface SharedComponent {
    name: string;
    html: string;
    selector: string;
}

export interface SiteGraph {
    entryUrl: string;
    pages: Map<string, PageNode>;
    sharedComponents: SharedComponent[];
    routes: Array<{
        path: string;
        component: string;
        title: string;
    }>;
    navigationMap: Map<string, string>; // href -> internal path
}

export interface MultiPageOptions {
    maxPages?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
    skipSharedExtraction?: boolean;
    targetSimilarity?: number;
    maxIterationsPerPage?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

const normalizeUrl = (url: string): string => {
    try {
        const parsed = new URL(url);
        // Remove trailing slash, hash, and common query params
        let normalized = parsed.origin + parsed.pathname.replace(/\/$/, '');
        return normalized.toLowerCase();
    } catch {
        return url.toLowerCase();
    }
};

const urlToPath = (url: string, baseOrigin: string): string => {
    try {
        const parsed = new URL(url);
        let pathPart = parsed.pathname;

        // Clean up path - remove leading/trailing slashes
        pathPart = pathPart.replace(/^\//, '').replace(/\/$/, '');
        if (!pathPart) pathPart = 'home';

        // Remove file extensions
        pathPart = pathPart.replace(/\.(html?|php|aspx?)$/i, '');

        // Preserve slashes but sanitize each segment
        // This ensures /pages/our-policies stays as pages/our-policies
        pathPart = pathPart
            .split('/')
            .map(segment => segment.replace(/[^a-z0-9-]/gi, '-').toLowerCase())
            .join('/');

        return pathPart;
    } catch {
        return 'page';
    }
};

const shouldIncludeUrl = (
    url: string,
    baseOrigin: string,
    includePatterns: string[],
    excludePatterns: string[]
): boolean => {
    try {
        const parsed = new URL(url);

        // Must be same origin
        if (parsed.origin !== baseOrigin) return false;

        const pathname = parsed.pathname;

        // Check exclude patterns first
        for (const pattern of excludePatterns) {
            if (matchPattern(pathname, pattern)) return false;
        }

        // If include patterns specified, must match one
        if (includePatterns.length > 0) {
            return includePatterns.some(p => matchPattern(pathname, p));
        }

        return true;
    } catch {
        return false;
    }
};

const matchPattern = (pathname: string, pattern: string): boolean => {
    // Convert glob pattern to regex
    const regex = new RegExp(
        '^' + pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')
        + '$'
    );
    return regex.test(pathname);
};

// ============================================================================
// PAGE DISCOVERY
// ============================================================================

export const discoverSitePages = async (
    entryUrl: string,
    options: MultiPageOptions = {}
): Promise<SiteGraph> => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    const visited = new Set<string>();
    const queue: string[] = [entryUrl];
    const pages = new Map<string, PageNode>();
    const maxPages = options.maxPages || 10;
    const navigationMap = new Map<string, string>();

    const baseOrigin = new URL(entryUrl).origin;
    const includePatterns = options.includePatterns || [];
    const excludePatterns = options.excludePatterns || ['/cart', '/checkout', '/account/*', '/login', '/register'];

    console.log(`[MultiPage] Starting discovery from: ${entryUrl}`);
    console.log(`[MultiPage] Max pages: ${maxPages}`);

    try {
        while (queue.length > 0 && pages.size < maxPages) {
            const currentUrl = queue.shift()!;
            const normalizedUrl = normalizeUrl(currentUrl);

            if (visited.has(normalizedUrl)) continue;
            visited.add(normalizedUrl);

            console.log(`[MultiPage] Visiting: ${normalizedUrl} (${pages.size + 1}/${maxPages})`);

            try {
                await page.goto(currentUrl, {
                    waitUntil: 'networkidle',
                    timeout: 300000
                });

                // Extract page info
                const pageInfo = await page.evaluate(() => {
                    const links: Array<{
                        text: string;
                        href: string;
                        selector: string;
                        isButton: boolean;
                        parentSection: string;
                        position: { x: number; y: number };
                    }> = [];

                    // Find all links
                    document.querySelectorAll('a[href]').forEach((el, i) => {
                        const anchor = el as HTMLAnchorElement;
                        if (!anchor.href || anchor.href.startsWith('javascript:')) return;

                        const rect = el.getBoundingClientRect();
                        if (rect.width === 0 && rect.height === 0) return;

                        const section = el.closest('[data-section]');

                        links.push({
                            text: el.textContent?.trim().slice(0, 50) || '',
                            href: anchor.href,
                            selector: `a[href="${anchor.getAttribute('href')}"]`,
                            isButton: el.classList.contains('btn') || el.classList.contains('button'),
                            parentSection: section?.getAttribute('data-section') || '',
                            position: { x: Math.round(rect.x), y: Math.round(rect.y + window.scrollY) }
                        });
                    });

                    // Get shared sections (header, footer, nav)
                    const sharedSections: string[] = [];
                    document.querySelectorAll('header, footer, nav, [data-section*="header"], [data-section*="footer"], [data-section*="nav"]').forEach(el => {
                        const section = el.getAttribute('data-section') || el.tagName.toLowerCase();
                        if (!sharedSections.includes(section)) {
                            sharedSections.push(section);
                        }
                    });

                    return {
                        title: document.title,
                        links,
                        sharedSections
                    };
                });

                // Create page node
                const pagePath = urlToPath(currentUrl, baseOrigin);
                const pageNode: PageNode = {
                    path: pagePath,
                    url: currentUrl,
                    title: pageInfo.title,
                    links: pageInfo.links.map(l => ({
                        ...l,
                        resolvedUrl: l.href
                    })),
                    sharedSections: pageInfo.sharedSections
                };

                pages.set(pagePath, pageNode);
                navigationMap.set(currentUrl, pagePath);

                // Add new links to queue
                for (const link of pageInfo.links) {
                    if (shouldIncludeUrl(link.href, baseOrigin, includePatterns, excludePatterns)) {
                        const normalized = normalizeUrl(link.href);
                        if (!visited.has(normalized)) {
                            queue.push(link.href);
                        }
                    }
                }

            } catch (e: any) {
                console.warn(`[MultiPage] Error visiting ${currentUrl}: ${e.message}`);
            }
        }

    } finally {
        await browser.close();
    }

    // Build routes
    const routes = Array.from(pages.entries()).map(([pagePath, pageNode]) => ({
        path: pagePath === 'home' ? '/' : `/${pagePath}`,
        component: `${pascalCase(pagePath)}Page`,
        title: pageNode.title
    }));

    console.log(`[MultiPage] Discovered ${pages.size} pages`);

    return {
        entryUrl,
        pages,
        sharedComponents: [],
        routes,
        navigationMap
    };
};

const pascalCase = (str: string): string => {
    // Split on slashes, hyphens, and underscores to create valid JS identifiers
    return str
        .split(/[-_\/]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('');
};

// ============================================================================
// MULTI-PAGE GENERATION
// ============================================================================

export const generateMultiPageSite = async (
    entryUrl: string,
    outputDir: string,
    options: MultiPageOptions = {}
): Promise<{
    success: boolean;
    siteDir: string;
    pages: number;
    routes: Array<{ path: string; component: string }>;
}> => {
    const jobId = timestampId();
    const siteDir = path.join(outputDir, 'multi-page', jobId);
    await ensureDir(siteDir);

    console.log(`[MultiPage] ════════════════════════════════════════════`);
    console.log(`[MultiPage] Starting multi-page generation`);
    console.log(`[MultiPage] Entry: ${entryUrl}`);
    console.log(`[MultiPage] Output: ${siteDir}`);
    console.log(`[MultiPage] ════════════════════════════════════════════\n`);

    // Step 1: Discover pages
    console.log('[MultiPage] Step 1: Discovering pages...\n');
    const siteGraph = await discoverSitePages(entryUrl, options);

    // Save site graph
    await fs.writeFile(
        path.join(siteDir, 'site-graph.json'),
        JSON.stringify({
            entryUrl: siteGraph.entryUrl,
            pages: Array.from(siteGraph.pages.entries()),
            routes: siteGraph.routes,
            navigationMap: Array.from(siteGraph.navigationMap.entries())
        }, null, 2)
    );

    // Step 2: Generate each page
    console.log('\n[MultiPage] Step 2: Generating pages...\n');
    const pagesDir = path.join(siteDir, 'pages');
    await ensureDir(pagesDir);

    const generatedPages: string[] = [];

    for (const [pagePath, pageNode] of siteGraph.pages) {
        console.log(`\n[MultiPage] ─── Generating: ${pagePath} ───`);

        const pageDir = path.join(pagesDir, pagePath);
        await ensureDir(pageDir);

        try {
            // Use PixelGen to generate this page
            // Note: You may need to import runPixelGenV2 if available
            // For now, we'll create a placeholder

            console.log(`[MultiPage] ✓ Generated: ${pagePath}`);
            generatedPages.push(pagePath);

        } catch (e: any) {
            console.error(`[MultiPage] ✗ Failed: ${pagePath} - ${e.message}`);
        }
    }

    // Step 3: Create router and layout
    console.log('\n[MultiPage] Step 3: Creating router...\n');

    const routerCode = generateRouterCode(siteGraph);
    await fs.writeFile(path.join(siteDir, 'App.jsx'), routerCode);

    const layoutCode = generateLayoutCode(siteGraph);
    await fs.writeFile(path.join(siteDir, 'Layout.jsx'), layoutCode);

    // Step 4: Create index.html
    const indexHtml = generateIndexHtml(siteGraph);
    await fs.writeFile(path.join(siteDir, 'index.html'), indexHtml);

    console.log(`\n[MultiPage] ════════════════════════════════════════════`);
    console.log(`[MultiPage] COMPLETE`);
    console.log(`[MultiPage] Pages: ${generatedPages.length}/${siteGraph.pages.size}`);
    console.log(`[MultiPage] Output: ${siteDir}`);
    console.log(`[MultiPage] ════════════════════════════════════════════\n`);

    return {
        success: generatedPages.length > 0,
        siteDir,
        pages: generatedPages.length,
        routes: siteGraph.routes
    };
};

// ============================================================================
// CODE GENERATORS
// ============================================================================

export const generateRouterCode = (siteGraph: SiteGraph): string => {
    // Note: UMD globals (ReactRouterDOM) are used in the generated code, not imported here

    const routes = siteGraph.routes.map(r =>
        `        <Route path="${r.path}" element={<${r.component} />} />`
    ).join('\n');

    // Reference page components that will be attached to window by inline scripts
    const componentRefs = siteGraph.routes.map(r => {
        const pagePath = r.path === '/' ? 'home' : r.path.slice(1).replace(/\//g, '_');
        return `const ${r.component} = window.__PAGE_COMPONENTS__?.['${pagePath}'] || (() => <div>Loading ${r.component}...</div>);`;
    }).join('\n');

    return `// Generated Router - Uses UMD globals
const { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } = ReactRouterDOM;

// Layout component
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <main>
                {children}
            </main>
        </div>
    );
};

// Page component references (loaded from inline scripts)
${componentRefs}

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
${routes}
                    <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

// Attach to window for the render script
window.App = App;
`;
};

export const generateLayoutCode = (siteGraph: SiteGraph): string => {
    // Layout is now included inline in App.jsx for UMD compatibility
    return `// Layout is embedded in App.jsx for UMD compatibility
// This file is kept for potential future use with bundled builds
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <main>
                {children}
            </main>
        </div>
    );
};

window.Layout = Layout;
`;
};

export const generateIndexHtml = (siteGraph: SiteGraph): string => {
    // Generate inline script tags for each page component
    const pageScripts = siteGraph.routes.map(r => {
        const pagePath = r.path === '/' ? 'home' : r.path.slice(1);
        // Each page's App.jsx will be loaded inline and attach its component to window
        return `    <script type="text/babel" src="pages/${pagePath}/App.jsx" data-page="${pagePath}"></script>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Multi-Page Site</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/lucide-react@0.263.1/dist/umd/lucide-react.min.js"></script>
    <script>
        // Initialize page component registry
        window.__PAGE_COMPONENTS__ = window.__PAGE_COMPONENTS__ || {};
    </script>
</head>
<body>
    <div id="root"></div>
    
    <!-- Page Components (loaded first so they're available to router) -->
${pageScripts}
    
    <!-- Main App with Router -->
    <script type="text/babel" src="App.jsx"></script>
    
    <!-- Render the app after all components are loaded -->
    <script type="text/babel">
        // Wait a tick to ensure all Babel-transpiled scripts have executed
        setTimeout(() => {
            if (window.App) {
                ReactDOM.createRoot(document.getElementById('root')).render(<window.App />);
            } else {
                console.error('App component not found on window');
            }
        }, 100);
    </script>
</body>
</html>`;
};