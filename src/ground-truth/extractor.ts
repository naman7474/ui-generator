// src/ground-truth/extractor.ts
//
// FIXED VERSION - Position-based extraction
// 
// This extracts elements with their visual positions so they can be
// matched across different sites (base vs generated) even when the
// HTML structure differs.
//

import { chromium, Page } from 'playwright';
import { ElementStyle, GroundTruth } from './types';

const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 }
};

// Properties to extract
const STYLE_PROPERTIES = [
    // Colors (high impact)
    'color', 'background-color', 'background', 'border-color',

    // Typography (high impact)
    'font-family', 'font-size', 'font-weight', 'line-height',
    'letter-spacing', 'text-align', 'text-transform', 'text-decoration',

    // Spacing (medium impact)
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'gap',

    // Borders (medium impact)
    'border-width', 'border-style', 'border-radius',

    // Layout (low priority - dangerous to change)
    'display', 'flex-direction', 'justify-content', 'align-items',

    // Effects
    'opacity', 'box-shadow'
];

// Elements to skip
const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD', 'TITLE',
    'PATH', 'CIRCLE', 'RECT', 'LINE', 'G', 'DEFS', 'USE', 'CLIPPATH',
    'LINEARGRADIENT', 'RADIALGRADIENT', 'STOP', 'MASK', 'PATTERN',
    'BR', 'HR', 'WBR', 'SVG'
]);

// Important tags for matching
const IMPORTANT_TAGS = new Set([
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'P', 'SPAN', 'A', 'BUTTON',
    'IMG', 'DIV', 'SECTION', 'HEADER', 'FOOTER', 'NAV',
    'UL', 'OL', 'LI'
]);

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
        await page.waitForTimeout(1500);
    } catch (e) {
        console.warn(`[Extractor] Navigation warning: ${e}`);
    }

    const elements = await page.evaluate((args: { styleProps: string[], skipTags: string[], importantTags: string[] }) => {
        const { styleProps, skipTags, importantTags } = args;
        const skipTagsSet = new Set(skipTags);
        const importantTagsSet = new Set(importantTags);

        const results: Array<{
            selector: string;
            cssSelector: string;
            tag: string;
            section?: string;
            sectionIndex?: number;
            rect: { x: number; y: number; width: number; height: number };
            styles: Record<string, string>;
            importance: number;
            textContent?: string;
        }> = [];

        let elementIndex = 0;

        /**
         * Generate a unique selector based on position and structure
         * This doesn't rely on data-section existing
         */
        const generateSelector = (el: Element, idx: number): string => {
            const tag = el.tagName.toLowerCase();
            const rect = el.getBoundingClientRect();

            // Create position-based ID for matching
            const yBucket = Math.floor(rect.y / 50) * 50;  // 50px buckets
            const xBucket = Math.floor(rect.x / 50) * 50;

            return `${tag}@y${yBucket}x${xBucket}#${idx}`;
        };

        /**
         * Generate CSS selector for applying styles
         * Prefers data-section if available, falls back to structural
         */
        const generateCSSSelector = (el: Element): string => {
            // Check for data-section (generated site will have this)
            const sectionEl = el.closest('[data-section]');
            if (sectionEl) {
                const sectionName = sectionEl.getAttribute('data-section');
                const pathFromSection = getPathFromAncestor(el, sectionEl);
                if (pathFromSection) {
                    return `[data-section="${sectionName}"] ${pathFromSection}`;
                }
                return `[data-section="${sectionName}"]`;
            }

            // Check for ID
            if (el.id && el.id.length < 30 && !el.id.match(/^[a-f0-9]{8,}$/i)) {
                return `#${el.id}`;
            }

            // Fall back to structural selector
            return getPathFromBody(el);
        };

        const getPathFromAncestor = (el: Element, ancestor: Element): string => {
            if (el === ancestor) return '';

            const parts: string[] = [];
            let current: Element | null = el;
            let depth = 0;

            while (current && current !== ancestor && depth < 6) {
                const parentEl: Element | null = current.parentElement;
                if (!parentEl) break;

                const tag = current.tagName.toLowerCase();
                if (['svg', 'path', 'g'].includes(tag)) {
                    current = parentEl;
                    continue;
                }

                const siblings = Array.from(parentEl.children).filter(
                    (c: Element) => c.tagName === current!.tagName
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

            return parts.join(' > ');
        };

        const getPathFromBody = (el: Element): string => {
            const parts: string[] = [];
            let current: Element | null = el;
            let depth = 0;

            while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML' && depth < 6) {
                const parentEl: Element | null = current.parentElement;
                if (!parentEl) break;

                const tag = current.tagName.toLowerCase();
                if (['svg', 'path', 'g'].includes(tag)) {
                    current = parentEl;
                    continue;
                }

                const siblings = Array.from(parentEl.children).filter(
                    (c: Element) => c.tagName === current!.tagName
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

            return parts.length > 0 ? `body > ${parts.join(' > ')}` : 'body';
        };

        const calculateImportance = (el: Element, rect: DOMRect): number => {
            let score = 0;

            // Above the fold
            if (rect.top < window.innerHeight) score += 50;
            if (rect.top < 500) score += 30;  // Very top of page

            // Important tags
            if (importantTagsSet.has(el.tagName)) score += 20;

            // Headings
            if (/^H[1-6]$/.test(el.tagName)) {
                score += 40 - parseInt(el.tagName[1]) * 5;
            }

            // Size (larger = more important)
            const area = rect.width * rect.height;
            if (area > 100000) score += 20;
            else if (area > 10000) score += 10;

            // Buttons and links
            if (el.tagName === 'BUTTON' || el.tagName === 'A') score += 15;

            return score;
        };

        const getSectionInfo = (el: Element): { section?: string; sectionIndex?: number } => {
            const sectionEl = el.closest('[data-section]');
            if (!sectionEl) return {};

            const section = sectionEl.getAttribute('data-section') || undefined;
            const allSections = document.querySelectorAll('[data-section]');
            const sectionIndex = Array.from(allSections).indexOf(sectionEl);

            return { section, sectionIndex: sectionIndex >= 0 ? sectionIndex : undefined };
        };

        const processElement = (el: Element): void => {
            if (skipTagsSet.has(el.tagName)) return;

            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') return;
            if (parseFloat(style.opacity) === 0) return;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
            if (rect.bottom < -100) return;

            // Generate selectors
            const selector = generateSelector(el, elementIndex++);
            const cssSelector = generateCSSSelector(el);

            // Extract styles
            const styles: Record<string, string> = {};
            for (const prop of styleProps) {
                const value = style.getPropertyValue(prop);
                if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
                    styles[prop] = value;
                }
            }

            const { section, sectionIndex } = getSectionInfo(el);

            // Get text content for matching (truncated)
            const text = el.textContent?.trim().slice(0, 50) || undefined;

            results.push({
                selector,
                cssSelector,
                tag: el.tagName.toLowerCase(),
                section,
                sectionIndex,
                rect: {
                    x: Math.round(rect.x),
                    y: Math.round(rect.y + window.scrollY),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                },
                styles,
                importance: calculateImportance(el, rect),
                textContent: text
            });

            // Process children
            for (const child of Array.from(el.children)) {
                processElement(child);
            }
        };

        processElement(document.body);

        // Sort by importance
        results.sort((a, b) => b.importance - a.importance);

        return results;
    }, {
        styleProps: STYLE_PROPERTIES,
        skipTags: Array.from(SKIP_TAGS),
        importantTags: Array.from(IMPORTANT_TAGS)
    });

    await browser.close();

    // Build element map using position-based selector as key
    const elementMap = new Map<string, ElementStyle>();

    for (const el of elements) {
        elementMap.set(el.selector, {
            stableSelector: el.selector,
            cssSelector: el.cssSelector,
            tag: el.tag,
            section: el.section,
            sectionIndex: el.sectionIndex,
            rect: el.rect,
            styles: el.styles,
            importance: el.importance
        } as ElementStyle);
    }

    console.log(`[Extractor] Extracted ${elementMap.size} elements`);

    return {
        url,
        device,
        viewport,
        extractedAt: new Date().toISOString(),
        elements: elementMap
    };
};

// Alias
export const extractCurrentState = extractGroundTruth;

/**
 * Legacy fuzzy matcher - now handled by differ's matchElementsByPosition
 */
export const fuzzyMatchElements = (
    baseElements: Map<string, ElementStyle>,
    currentElements: Map<string, ElementStyle>
): Map<string, string> => {
    // Import the position-based matcher from differ
    const matches = new Map<string, string>();
    const usedCurrent = new Set<string>();

    const baseArray = Array.from(baseElements.entries());
    const currentArray = Array.from(currentElements.entries());

    for (const [baseKey, baseEl] of baseArray) {
        let bestMatch: { key: string; score: number } | null = null;

        for (const [currentKey, currentEl] of currentArray) {
            if (usedCurrent.has(currentKey)) continue;
            if (currentEl.tag !== baseEl.tag) continue;

            // Position matching
            const yDiff = Math.abs(currentEl.rect.y - baseEl.rect.y);
            const xDiff = Math.abs(currentEl.rect.x - baseEl.rect.x);

            if (yDiff > 200 || xDiff > 100) continue;

            const widthRatio = Math.min(baseEl.rect.width, currentEl.rect.width) /
                Math.max(baseEl.rect.width, currentEl.rect.width) || 0;

            if (widthRatio < 0.5) continue;

            const score = 100 - yDiff * 0.3 - xDiff * 0.2 + widthRatio * 20;

            if (!bestMatch || score > bestMatch.score) {
                bestMatch = { key: currentKey, score };
            }
        }

        if (bestMatch && bestMatch.score > 50) {
            matches.set(baseKey, bestMatch.key);
            usedCurrent.add(bestMatch.key);
        }
    }

    console.log(`[Extractor] Fuzzy matched ${matches.size}/${baseElements.size} elements`);
    return matches;
};

export const serializeGroundTruth = (gt: GroundTruth): object => ({
    ...gt,
    elements: Array.from(gt.elements.entries())
});

export const deserializeGroundTruth = (data: any): GroundTruth => ({
    ...data,
    elements: new Map(data.elements)
});