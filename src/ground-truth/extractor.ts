// src/ground-truth/extractor.ts
// 
// DROP-IN REPLACEMENT - TypeScript-compliant version
//

import { chromium } from 'playwright';
import { ElementStyle, GroundTruth } from './types';

const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 }
};

const STYLE_PROPERTIES = [
    // Layout
    'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap',
    'grid-template-columns', 'grid-template-rows',

    // Spacing
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',

    // Typography
    'font-family', 'font-size', 'font-weight', 'line-height',
    'letter-spacing', 'text-align', 'text-transform', 'text-decoration',

    // Colors
    'color', 'background-color', 'border-color',

    // Borders
    'border-width', 'border-style', 'border-radius',

    // Effects
    'opacity', 'box-shadow', 'transform'
];

export const extractGroundTruth = async (
    url: string,
    device: 'desktop' | 'mobile' = 'desktop'
): Promise<GroundTruth> => {
    const browser = await chromium.launch({ headless: true });
    const viewport = VIEWPORTS[device];
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500); // Let animations settle
    } catch (e) {
        console.warn(`[Extractor] Navigation warning: ${e}`);
    }

    const elements = await page.evaluate((styleProps: string[]) => {
        const results: Array<{
            stableSelector: string;
            cssSelector: string;
            tag: string;
            section?: string;
            rect: { x: number; y: number; width: number; height: number };
            styles: Record<string, string>;
        }> = [];
        const processedSelectors = new Set<string>();

        /**
         * Generate a STRUCTURAL selector that works across different sites.
         */
        const generateStructuralSelector = (el: Element): string => {
            // Priority 1: data-section is our best anchor
            const dataSection = el.getAttribute('data-section');
            if (dataSection) {
                return `[data-section="${dataSection}"]`;
            }

            // Priority 2: Stable IDs (not random/dynamic ones)
            if (el.id) {
                const isStableId = el.id.length < 20 &&
                    !el.id.match(/^[a-f0-9]{8,}$/i) &&
                    !el.id.includes(':') &&
                    !el.id.match(/^_/);
                if (isStableId) {
                    return `#${el.id}`;
                }
            }

            // Priority 3: Build structural path from body
            const parts: string[] = [];
            let current: Element | null = el;
            let depth = 0;
            const MAX_DEPTH = 6;

            while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML' && depth < MAX_DEPTH) {
                const parentEl: Element | null = current.parentElement;
                if (!parentEl) break;

                const tag = current.tagName.toLowerCase();

                // Skip SVG internals - they're too granular
                if (['svg', 'path', 'circle', 'rect', 'line', 'g', 'defs', 'use'].includes(tag)) {
                    current = parentEl;
                    continue;
                }

                // Count position among same-tag siblings
                const currentTag = current.tagName;
                const siblings = Array.from(parentEl.children).filter((c: Element) =>
                    c.tagName === currentTag
                );
                const index = siblings.indexOf(current) + 1;

                if (siblings.length > 1) {
                    parts.unshift(`${tag}:nth-of-type(${index})`);
                } else {
                    parts.unshift(tag);
                }

                current = parentEl;
                depth++;
            }

            if (parts.length === 0) {
                return 'body';
            }

            return `body > ${parts.join(' > ')}`;
        };

        /**
         * Generate a CSS selector suitable for applying overrides.
         */
        const generateCSSSelector = (el: Element): string => {
            // Priority 1: ID
            if (el.id && !el.id.match(/^[a-f0-9]{8,}$/i)) {
                return `#${el.id}`;
            }

            // Priority 2: data-section scoped
            const section = el.closest('[data-section]');
            if (section) {
                const sectionName = section.getAttribute('data-section');
                const tag = el.tagName.toLowerCase();
                const parentEl: Element | null = el.parentElement;
                if (parentEl) {
                    const elTag = el.tagName;
                    const siblings = Array.from(parentEl.children).filter((c: Element) => c.tagName === elTag);
                    const nth = siblings.indexOf(el) + 1;
                    if (siblings.length > 1) {
                        return `[data-section="${sectionName}"] ${tag}:nth-of-type(${nth})`;
                    }
                    return `[data-section="${sectionName}"] ${tag}`;
                }
            }

            // Priority 3: Semantic class names (filter out Tailwind utilities)
            if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(/\s+/).filter((c: string) => {
                    if (!c || c.length < 3) return false;
                    // Skip Tailwind-like utility classes
                    if (c.match(/^(bg|text|p|m|w|h|flex|grid|border|rounded|shadow|font|leading)-/)) return false;
                    // Skip arbitrary value classes
                    if (c.includes('[') || c.includes(':')) return false;
                    // Skip hash-like classes (CSS modules)
                    if (c.match(/^[a-z]{1,3}[A-Z0-9]/)) return false;
                    if (c.match(/^_/)) return false;
                    return true;
                });

                if (classes.length > 0) {
                    const tag = el.tagName.toLowerCase();
                    return `${tag}.${classes.slice(0, 2).join('.')}`;
                }
            }

            // Priority 4: Structural path (fallback)
            const parts: string[] = [];
            let current: Element | null = el;
            let depth = 0;

            while (current && current.tagName !== 'BODY' && depth < 4) {
                const parentEl: Element | null = current.parentElement;
                if (!parentEl) break;

                const tag = current.tagName.toLowerCase();
                const siblings = Array.from(parentEl.children);
                const index = siblings.indexOf(current) + 1;

                parts.unshift(`${tag}:nth-child(${index})`);
                current = parentEl;
                depth++;
            }

            return parts.join(' > ');
        };

        const processElement = (el: Element): void => {
            // Skip non-visual elements
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD', 'TITLE'].includes(el.tagName)) {
                return;
            }

            // Skip SVG internals (too granular)
            if (['PATH', 'CIRCLE', 'RECT', 'LINE', 'G', 'DEFS', 'USE', 'CLIPPATH', 'LINEARGRADIENT'].includes(el.tagName)) {
                return;
            }

            const style = window.getComputedStyle(el);

            // Skip invisible elements
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return;
            }

            const rect = el.getBoundingClientRect();

            // Skip elements with no dimensions (unless they're containers)
            if (rect.width === 0 && rect.height === 0 && el.children.length === 0) {
                return;
            }

            // Skip off-screen elements (likely hidden)
            if (rect.bottom < 0 || rect.top > window.innerHeight * 3) {
                return;
            }

            // Generate selectors
            const stableSelector = generateStructuralSelector(el);

            // Skip duplicates
            if (processedSelectors.has(stableSelector)) {
                return;
            }
            processedSelectors.add(stableSelector);

            const cssSelector = generateCSSSelector(el);

            // Extract computed styles
            const styles: Record<string, string> = {};
            for (const prop of styleProps) {
                const value = style.getPropertyValue(prop);
                if (value) {
                    styles[prop] = value;
                }
            }

            // Get section context
            const sectionEl = el.closest('[data-section]');
            const sectionName = sectionEl?.getAttribute('data-section') || undefined;

            results.push({
                stableSelector,
                cssSelector,
                tag: el.tagName.toLowerCase(),
                section: sectionName,
                rect: {
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                },
                styles
            });

            // Process children
            for (const child of Array.from(el.children)) {
                processElement(child);
            }
        };

        processElement(document.body);
        return results;
    }, STYLE_PROPERTIES);

    await browser.close();

    // Build element map
    const elementMap = new Map<string, ElementStyle>();
    let duplicates = 0;

    for (const el of elements) {
        if (elementMap.has(el.stableSelector)) {
            duplicates++;
            continue;
        }
        elementMap.set(el.stableSelector, el as ElementStyle);
    }

    console.log(`[Extractor] Extracted ${elementMap.size} unique elements from ${url} (${duplicates} duplicates skipped)`);

    return {
        url,
        device,
        viewport,
        extractedAt: new Date().toISOString(),
        elements: elementMap
    };
};

export const extractCurrentState = extractGroundTruth;

/**
 * Helper to serialize GroundTruth for JSON storage
 */
export const serializeGroundTruth = (gt: GroundTruth): object => {
    return {
        ...gt,
        elements: Array.from(gt.elements.entries())
    };
};

/**
 * Helper to deserialize GroundTruth from JSON
 */
export const deserializeGroundTruth = (data: {
    url: string;
    device: 'desktop' | 'mobile';
    viewport: { width: number; height: number };
    extractedAt: string;
    elements: Array<[string, ElementStyle]>
}): GroundTruth => {
    return {
        ...data,
        elements: new Map(data.elements)
    };
};