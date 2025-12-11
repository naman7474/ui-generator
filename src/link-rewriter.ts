// src/link-rewriter.ts
//
// Extracts navigation links from source pages and rewrites
// generated code to use correct internal routes
//

import { Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs/promises';

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractedLink {
    text: string;
    href: string;
    resolvedUrl: string;
    position: { x: number; y: number };
    section: 'header' | 'nav' | 'footer' | 'hero' | 'content' | 'unknown';
    type: 'nav-item' | 'cta' | 'footer-link' | 'inline-link' | 'button';
    selector: string;
    isExternal: boolean;
}

export interface RouteInfo {
    path: string;       // e.g., "/about"
    title: string;      // e.g., "About Us"
    keywords: string[]; // e.g., ["about", "us", "company"]
}

export interface LinkMapping {
    originalText: string;
    originalHref: string;
    targetRoute: string;
    matchConfidence: number;   // 0-1
    matchedBy: 'exact-text' | 'fuzzy-text' | 'href-path' | 'section-default' | 'external';
}

// ============================================================================
// LINK EXTRACTION
// ============================================================================

/**
 * Extract all navigation links from a page with context about their location and type
 */
export const extractNavigationLinks = async (page: Page): Promise<ExtractedLink[]> => {
    return page.evaluate(() => {
        const links: ExtractedLink[] = [];

        // Helper to detect section type from element's context
        const detectSection = (el: Element): ExtractedLink['section'] => {
            // Check ancestors for semantic elements
            let current: Element | null = el;
            while (current) {
                const tag = current.tagName.toLowerCase();
                if (tag === 'header') return 'header';
                if (tag === 'nav') return 'nav';
                if (tag === 'footer') return 'footer';

                // Check data attributes and classes
                const section = current.getAttribute('data-section')?.toLowerCase() || '';
                const className = current.className?.toString().toLowerCase() || '';
                const id = current.id?.toLowerCase() || '';

                if (/header|navbar|topbar/.test(section + className + id)) return 'header';
                if (/footer|bottom/.test(section + className + id)) return 'footer';
                if (/hero|banner|jumbotron/.test(section + className + id)) return 'hero';
                if (/nav|menu/.test(section + className + id)) return 'nav';

                current = current.parentElement;
            }

            // Fallback based on position
            const rect = el.getBoundingClientRect();
            if (rect.top < 100) return 'header';
            if (rect.top > window.innerHeight - 200) return 'footer';
            if (rect.top < window.innerHeight * 0.5 && rect.height > 50) return 'hero';

            return 'content';
        };

        // Helper to detect link type
        const detectType = (el: Element, section: ExtractedLink['section']): ExtractedLink['type'] => {
            const tag = el.tagName.toLowerCase();
            const className = el.className?.toString().toLowerCase() || '';

            // Button-like elements
            if (tag === 'button') return 'button';
            if (/btn|button|cta/.test(className)) return 'cta';

            // Based on section
            if (section === 'header' || section === 'nav') return 'nav-item';
            if (section === 'footer') return 'footer-link';
            if (section === 'hero' && /btn|button|cta|primary|action/.test(className)) return 'cta';

            return 'inline-link';
        };

        // Helper to check if URL is external
        const isExternal = (href: string): boolean => {
            if (!href) return false;
            if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;
            if (href.startsWith('#')) return false;
            if (href.startsWith('/')) return false;

            try {
                const url = new URL(href, window.location.origin);
                return url.origin !== window.location.origin;
            } catch {
                return false;
            }
        };

        // Helper to build a unique selector
        const buildSelector = (el: Element): string => {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const classes = Array.from(el.classList).slice(0, 2).map(c => `.${c}`).join('');
            const href = el.getAttribute('href');

            if (id) return `${tag}${id}`;
            if (href && tag === 'a') return `a[href="${href}"]`;
            return `${tag}${classes}`;
        };

        // Find all anchor elements
        document.querySelectorAll('a[href]').forEach(el => {
            const anchor = el as HTMLAnchorElement;
            const href = anchor.getAttribute('href') || '';

            // Skip empty, javascript:, and anchor-only links
            if (!href || href === '#' || href.startsWith('javascript:')) return;

            // Skip invisible elements
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;

            const section = detectSection(el);
            const type = detectType(el, section);
            const text = el.textContent?.trim().slice(0, 100) || '';

            // Skip links with no meaningful text (likely icon-only)
            if (!text && !el.querySelector('img, svg')) return;

            links.push({
                text,
                href,
                resolvedUrl: anchor.href,
                position: { x: Math.round(rect.x), y: Math.round(rect.y + window.scrollY) },
                section,
                type,
                selector: buildSelector(el),
                isExternal: isExternal(href)
            });
        });

        // Find button elements that might be navigation
        document.querySelectorAll('button').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;

            const text = el.textContent?.trim().slice(0, 100) || '';
            if (!text) return;

            const section = detectSection(el);

            // Only include buttons with navigation-like text
            const navKeywords = /shop|buy|view|explore|learn|get started|contact|about|services|products/i;
            if (!navKeywords.test(text)) return;

            links.push({
                text,
                href: '',
                resolvedUrl: '',
                position: { x: Math.round(rect.x), y: Math.round(rect.y + window.scrollY) },
                section,
                type: 'button',
                selector: buildSelector(el),
                isExternal: false
            });
        });

        return links;
    });
};

// ============================================================================
// LINK MATCHING
// ============================================================================

/**
 * Normalize text for fuzzy matching
 */
const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Extract keywords from text
 */
const extractKeywords = (text: string): string[] => {
    return normalizeText(text)
        .split(' ')
        .filter(w => w.length > 2);
};

/**
 * Calculate text similarity score (0-1)
 */
const textSimilarity = (text1: string, text2: string): number => {
    const norm1 = normalizeText(text1);
    const norm2 = normalizeText(text2);

    if (norm1 === norm2) return 1.0;
    if (!norm1 || !norm2) return 0;

    // Check if one contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;

    // Keyword overlap
    const kw1 = new Set(extractKeywords(text1));
    const kw2 = new Set(extractKeywords(text2));

    if (kw1.size === 0 || kw2.size === 0) return 0;

    const intersection = Array.from(kw1).filter(k => kw2.has(k)).length;
    const union = new Set(Array.from(kw1).concat(Array.from(kw2))).size;

    return intersection / union;
};

/**
 * Extract path hints from a URL
 */
const extractPathHints = (url: string): string[] => {
    try {
        const parsed = new URL(url);
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        return pathParts.map(p => p.replace(/[-_]/g, ' ').toLowerCase());
    } catch {
        return [];
    }
};

/**
 * Build link mappings from extracted links to internal routes
 */
export const buildLinkMappings = (
    extractedLinks: ExtractedLink[],
    routes: RouteInfo[]
): LinkMapping[] => {
    const mappings: LinkMapping[] = [];

    for (const link of extractedLinks) {
        // Skip if already external
        if (link.isExternal) {
            mappings.push({
                originalText: link.text,
                originalHref: link.href,
                targetRoute: link.href,  // Keep original
                matchConfidence: 1.0,
                matchedBy: 'external'
            });
            continue;
        }

        let bestMatch: RouteInfo | undefined;
        let bestScore = 0;
        let matchedBy: LinkMapping['matchedBy'] = 'section-default';

        // Try exact text match first
        for (const route of routes) {
            const score = textSimilarity(link.text, route.title);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = route;
                matchedBy = score === 1.0 ? 'exact-text' : 'fuzzy-text';
            }

            // Also check against route keywords
            for (const kw of route.keywords) {
                if (normalizeText(link.text).includes(kw)) {
                    const kwScore = 0.7;
                    if (kwScore > bestScore) {
                        bestScore = kwScore;
                        bestMatch = route;
                        matchedBy = 'fuzzy-text';
                    }
                }
            }
        }

        // Try matching by href path
        if (link.href) {
            const pathHints = extractPathHints(link.resolvedUrl || link.href);
            for (const route of routes) {
                const routePath = route.path.replace(/^\//, '').toLowerCase();
                for (const hint of pathHints) {
                    if (hint === routePath || routePath.includes(hint)) {
                        const hrefScore = 0.9;
                        if (hrefScore > bestScore) {
                            bestScore = hrefScore;
                            bestMatch = route;
                            matchedBy = 'href-path';
                        }
                    }
                }
            }
        }

        // Section-based defaults if no good match
        if (bestScore < 0.5 && routes.length > 0) {
            if (link.section === 'hero' && link.type === 'cta') {
                // Hero CTAs often go to main products/services
                const productRoute = routes.find(r =>
                    /product|shop|service|pricing/i.test(r.title + r.path)
                );
                if (productRoute) {
                    bestMatch = productRoute;
                    bestScore = 0.4;
                    matchedBy = 'section-default';
                }
            }

            // Default to home if nothing else
            if (!bestMatch) {
                bestMatch = routes.find(r => r.path === '/') || routes[0];
                bestScore = 0.2;
                matchedBy = 'section-default';
            }
        }

        mappings.push({
            originalText: link.text,
            originalHref: link.href,
            targetRoute: bestMatch?.path || '/',
            matchConfidence: bestScore,
            matchedBy
        });
    }

    return mappings;
};

// ============================================================================
// LINK REWRITING
// ============================================================================

/**
 * Rewrite navigation links in generated site files
 */
export const rewriteNavigationLinksOnDisk = async (
    siteDir: string,
    mappings: LinkMapping[]
): Promise<{ rewritten: number; files: string[] }> => {
    const exts = new Set(['.html', '.js', '.jsx', '.tsx']);
    const modifiedFiles: string[] = [];
    let totalRewritten = 0;

    const walk = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await walk(fullPath);
                continue;
            }

            if (!exts.has(path.extname(entry.name).toLowerCase())) continue;

            let content = await fs.readFile(fullPath, 'utf8');
            let changed = false;
            let fileRewrites = 0;

            for (const mapping of mappings) {
                // Skip external links
                if (mapping.matchedBy === 'external') continue;

                // Skip low-confidence matches
                if (mapping.matchConfidence < 0.3) continue;

                const text = mapping.originalText;
                if (!text) continue;

                // Pattern 1: href="#" with matching text nearby
                // <a href="#">About</a> -> <a href="/about">About</a>
                const hrefHashPattern = new RegExp(
                    `(href=["'])(#|javascript:void\\(0\\))(["'][^>]*>\\s*)(${escapeRegex(text)})`,
                    'gi'
                );
                if (hrefHashPattern.test(content)) {
                    content = content.replace(hrefHashPattern, `$1${mapping.targetRoute}$3$4`);
                    changed = true;
                    fileRewrites++;
                }

                // Pattern 2: Link component with to="#" and matching text
                // <Link to="#">About</Link> -> <Link to="/about">About</Link>
                const linkToPattern = new RegExp(
                    `(<Link[^>]*\\s+to=["'])(#|/?)["']([^>]*>\\s*)(${escapeRegex(text)})`,
                    'gi'
                );
                if (linkToPattern.test(content)) {
                    content = content.replace(linkToPattern, `$1${mapping.targetRoute}"$3$4`);
                    changed = true;
                    fileRewrites++;
                }

                // Pattern 3: Button onClick that looks like navigation
                // This is harder to fix automatically, so we'll just log it
            }

            if (changed) {
                await fs.writeFile(fullPath, content, 'utf8');
                modifiedFiles.push(path.relative(siteDir, fullPath));
                totalRewritten += fileRewrites;
            }
        }
    };

    await walk(siteDir);

    return {
        rewritten: totalRewritten,
        files: modifiedFiles
    };
};

/**
 * Escape special regex characters
 */
const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Convert site graph routes to RouteInfo format
 */
export const routesFromSiteGraph = (routes: Array<{ path: string; title: string }>): RouteInfo[] => {
    return routes.map(r => ({
        path: r.path,
        title: r.title,
        keywords: extractKeywords(r.title)
    }));
};

/**
 * Generate a summary of link mappings for logging
 */
export const summarizeMappings = (mappings: LinkMapping[]): string => {
    const byType = {
        'exact-text': 0,
        'fuzzy-text': 0,
        'href-path': 0,
        'section-default': 0,
        'external': 0
    };

    for (const m of mappings) {
        byType[m.matchedBy]++;
    }

    const avgConfidence = mappings.length > 0
        ? mappings.reduce((sum, m) => sum + m.matchConfidence, 0) / mappings.length
        : 0;

    return [
        `Total: ${mappings.length} links`,
        `Exact: ${byType['exact-text']}`,
        `Fuzzy: ${byType['fuzzy-text']}`,
        `Path: ${byType['href-path']}`,
        `Default: ${byType['section-default']}`,
        `External: ${byType['external']}`,
        `Avg Confidence: ${(avgConfidence * 100).toFixed(0)}%`
    ].join(' | ');
};
