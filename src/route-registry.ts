// src/route-registry.ts
//
// Centralized route management for multi-page generation.
// Maps original URLs to generated routes before generation starts,
// enabling accurate link handling during code generation.
//

import { config } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface RouteEntry {
    originalUrl: string;
    normalizedUrl: string;
    route: string;           // e.g., '/products' or '/about-us'
    componentName: string;   // e.g., 'ProductsPage' or 'AboutUsPage'
    pageTitle?: string;
    isGenerated: boolean;    // Whether this page will be generated
}

export interface LinkReplacement {
    to: string;              // The route or URL to use
    isInternal: boolean;     // Whether this is an internal route
    isExternal: boolean;     // Whether this points to external site
    behavior: 'route' | 'external' | 'placeholder' | 'disabled';
}

// ============================================================================
// ROUTE REGISTRY
// ============================================================================

export class RouteRegistry {
    // Original URL → RouteEntry
    private urlToEntryMap = new Map<string, RouteEntry>();
    // Route → component name
    private routeToComponent = new Map<string, string>();
    // Base origin for the site
    private baseOrigin: string;
    // Link behavior configuration
    private linkBehavior: 'external' | 'placeholder' | 'disable';

    constructor(entryUrl: string, linkBehavior?: 'external' | 'placeholder' | 'disable') {
        this.baseOrigin = new URL(entryUrl).origin;
        this.linkBehavior = linkBehavior ?? config.multiPage.linkBehavior;
    }

    /**
     * Register a page that will be generated
     */
    registerPage(
        originalUrl: string,
        options?: { title?: string; isGenerated?: boolean }
    ): RouteEntry {
        const normalized = this.normalizeUrl(originalUrl);

        // Check if already registered
        const existing = this.urlToEntryMap.get(normalized);
        if (existing) {
            // Update generation status if needed
            if (options?.isGenerated !== undefined) {
                existing.isGenerated = options.isGenerated;
            }
            return existing;
        }

        const route = this.urlToRoutePath(originalUrl);
        const componentName = this.routeToComponentName(route);

        const entry: RouteEntry = {
            originalUrl,
            normalizedUrl: normalized,
            route,
            componentName,
            pageTitle: options?.title,
            isGenerated: options?.isGenerated ?? true,
        };

        this.urlToEntryMap.set(normalized, entry);
        this.routeToComponent.set(route, componentName);

        return entry;
    }

    /**
     * Register multiple pages from discovered URLs
     */
    registerPages(pages: Array<{ url: string; title?: string }>): void {
        for (const page of pages) {
            this.registerPage(page.url, { title: page.title, isGenerated: true });
        }
    }

    /**
     * Get route for a URL, returns null if not registered
     */
    getRoute(url: string): string | null {
        const normalized = this.normalizeUrl(url);
        const entry = this.urlToEntryMap.get(normalized);
        return entry?.route ?? null;
    }

    /**
     * Get route entry for a URL
     */
    getEntry(url: string): RouteEntry | null {
        const normalized = this.normalizeUrl(url);
        return this.urlToEntryMap.get(normalized) ?? null;
    }

    /**
     * Get component name for a route
     */
    getComponentName(route: string): string | null {
        return this.routeToComponent.get(route) ?? null;
    }

    /**
     * Determine how to handle a link href
     */
    getLinkReplacement(href: string): LinkReplacement {
        // Handle empty or javascript: links
        if (!href || href.startsWith('javascript:') || href.startsWith('#')) {
            return {
                to: href,
                isInternal: false,
                isExternal: false,
                behavior: 'disabled',
            };
        }

        // Parse the href
        let parsed: URL;
        try {
            parsed = new URL(href, this.baseOrigin);
        } catch {
            return {
                to: href,
                isInternal: false,
                isExternal: false,
                behavior: 'disabled',
            };
        }

        // External link (different origin)
        if (parsed.origin !== this.baseOrigin) {
            return {
                to: href,
                isInternal: false,
                isExternal: true,
                behavior: 'external',
            };
        }

        // Check if this URL is registered
        const normalized = this.normalizeUrl(href);
        const entry = this.urlToEntryMap.get(normalized);

        if (entry?.isGenerated) {
            // Internal link to a generated page
            return {
                to: entry.route,
                isInternal: true,
                isExternal: false,
                behavior: 'route',
            };
        }

        // Link to a page that won't be generated
        switch (this.linkBehavior) {
            case 'external':
                return {
                    to: href,
                    isInternal: false,
                    isExternal: false,
                    behavior: 'external',
                };
            case 'placeholder':
                return {
                    to: `/not-found?from=${encodeURIComponent(parsed.pathname)}`,
                    isInternal: true,
                    isExternal: false,
                    behavior: 'placeholder',
                };
            case 'disable':
                return {
                    to: '#',
                    isInternal: false,
                    isExternal: false,
                    behavior: 'disabled',
                };
        }
    }

    /**
     * Get all registered routes
     */
    getAllRoutes(): RouteEntry[] {
        return Array.from(this.urlToEntryMap.values());
    }

    /**
     * Get all routes that will be generated
     */
    getGeneratedRoutes(): RouteEntry[] {
        return this.getAllRoutes().filter(r => r.isGenerated);
    }

    /**
     * Export as JSON for persistence
     */
    toJSON(): object {
        return {
            baseOrigin: this.baseOrigin,
            linkBehavior: this.linkBehavior,
            routes: Array.from(this.urlToEntryMap.entries()),
        };
    }

    /**
     * Restore from JSON
     */
    static fromJSON(data: any): RouteRegistry {
        const registry = new RouteRegistry(data.baseOrigin, data.linkBehavior);
        for (const [key, entry] of data.routes) {
            registry.urlToEntryMap.set(key, entry);
            registry.routeToComponent.set(entry.route, entry.componentName);
        }
        return registry;
    }

    /**
     * Get a route map for LLM prompts
     * Returns a simple object mapping original paths to generated routes
     */
    getRouteMapForPrompt(): Record<string, string> {
        const map: Record<string, string> = {};
        for (const entry of this.getGeneratedRoutes()) {
            try {
                const url = new URL(entry.originalUrl);
                map[url.pathname] = entry.route;
            } catch {
                // Skip invalid URLs
            }
        }
        return map;
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private normalizeUrl(url: string): string {
        try {
            const parsed = new URL(url, this.baseOrigin);
            // Remove trailing slash, hash, and query params for matching
            let normalized = parsed.origin + parsed.pathname.replace(/\/$/, '');
            return normalized.toLowerCase();
        } catch {
            return url.toLowerCase();
        }
    }

    private urlToRoutePath(url: string): string {
        try {
            const parsed = new URL(url, this.baseOrigin);
            let pathname = parsed.pathname;

            // Clean up path
            pathname = pathname.replace(/^\//, '').replace(/\/$/, '');

            // Home page
            if (!pathname || pathname === 'index.html') {
                return '/';
            }

            // Remove file extensions
            pathname = pathname.replace(/\.(html?|php|aspx?)$/i, '');

            // Sanitize: keep only alphanumeric and hyphens
            pathname = pathname
                .split('/')
                .map(segment => segment.replace(/[^a-z0-9-]/gi, '-').toLowerCase())
                .join('/');

            return '/' + pathname;
        } catch {
            return '/page';
        }
    }

    private routeToComponentName(route: string): string {
        if (route === '/') {
            return 'HomePage';
        }

        // Convert /about-us/team to AboutUsTeamPage
        const parts = route
            .replace(/^\//, '')
            .split('/')
            .map(part =>
                part
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join('')
            );

        return parts.join('') + 'Page';
    }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a route registry from discovered pages
 */
export const createRouteRegistry = (
    entryUrl: string,
    discoveredPages: Array<{ url: string; title?: string }>,
    linkBehavior?: 'external' | 'placeholder' | 'disable'
): RouteRegistry => {
    const registry = new RouteRegistry(entryUrl, linkBehavior);
    registry.registerPages(discoveredPages);
    return registry;
};

/**
 * Generate React Router route definitions from registry
 */
export const generateRouteDefinitions = (registry: RouteRegistry): string => {
    const routes = registry.getGeneratedRoutes();
    const imports = routes.map(r =>
        `import ${r.componentName} from './pages/${r.route === '/' ? 'home' : r.route.slice(1)}/App';`
    ).join('\n');

    const routeElements = routes.map(r =>
        `        <Route path="${r.route}" element={<${r.componentName} />} />`
    ).join('\n');

    return `// Generated Routes
${imports}

const routes = (
    <Routes>
${routeElements}
        <Route path="*" element={<NotFound />} />
    </Routes>
);
`;
};
