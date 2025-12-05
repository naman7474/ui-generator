
import { chromium, Page } from 'playwright';
import { ElementStyle, GroundTruth } from './types';

const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 }
};

// CSS properties we care about for visual matching
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

/**
 * Generate a stable selector that can match elements across base and generated sites.
 * 
 * Strategy:
 * 1. If element has data-section, use it as anchor
 * 2. Use semantic hierarchy: section > heading level > tag + position
 * 3. Include text content hash for disambiguation
 */
const generateStableSelector = (el: Element, ancestors: Element[]): string => {
    const parts: string[] = [];

    // Find nearest section anchor
    const sectionAncestor = ancestors.find(a =>
        a.hasAttribute('data-section') ||
        ['HEADER', 'FOOTER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE'].includes(a.tagName)
    );

    if (sectionAncestor) {
        const sectionName = sectionAncestor.getAttribute('data-section') ||
            sectionAncestor.tagName.toLowerCase();
        parts.push(`[section:${sectionName}]`);
    }

    // Add semantic tag path
    const semanticPath = ancestors
        .filter(a => ['HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FOOTER'].includes(a.tagName))
        .map(a => a.tagName.toLowerCase())
        .join('/');
    if (semanticPath) {
        parts.push(`[path:${semanticPath}]`);
    }

    // Add element info
    parts.push(`[tag:${el.tagName.toLowerCase()}]`);

    // Add text content hash (first 50 chars)
    const text = (el.textContent || '').trim().slice(0, 50);
    if (text) {
        const textHash = simpleHash(text);
        parts.push(`[text:${textHash}]`);
    }

    // Add position among siblings of same type
    const parent = el.parentElement;
    if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
        if (siblings.length > 1) {
            const index = siblings.indexOf(el);
            parts.push(`[nth:${index}]`);
        }
    }

    return parts.join('');
};

const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(0, 8);
};

/**
 * Generate a CSS selector that can be used to apply styles.
 * This should be specific enough to target the element but not brittle.
 */
const generateCSSSelector = (el: Element): string => {
    // Priority 1: ID
    if (el.id) {
        return `#${CSS.escape(el.id)}`;
    }

    // Priority 2: data-section + tag + nth-of-type
    const section = el.closest('[data-section]');
    if (section) {
        const sectionName = section.getAttribute('data-section');
        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
            const nth = siblings.indexOf(el) + 1;
            return `[data-section="${sectionName}"] ${el.tagName.toLowerCase()}:nth-of-type(${nth})`;
        }
    }

    // Priority 3: Class-based selector
    if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(/\s+/).filter(c =>
            c && !c.startsWith('_') && !c.match(/^[a-z]{6,}$/) // Filter CSS modules hashes
        );
        if (classes.length > 0) {
            return `${el.tagName.toLowerCase()}.${classes.slice(0, 2).join('.')}`;
        }
    }

    // Fallback: tag + nth-child path
    const path: string[] = [];
    let current: Element | null = el;
    while (current && current !== document.body) {
        const parent: Element | null = current.parentElement;
        if (parent) {
            const index = Array.from(parent.children).indexOf(current) + 1;
            path.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
        }
        current = parent;
    }
    return path.slice(-3).join(' > '); // Last 3 levels only
};

export const extractGroundTruth = async (
    url: string,
    device: 'desktop' | 'mobile' = 'desktop'
): Promise<GroundTruth> => {
    const browser = await chromium.launch({ headless: true });
    const viewport = VIEWPORTS[device];
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Let animations settle

    const elements = await page.evaluate((styleProps) => {
        const results: any[] = [];

        const processElement = (el: Element, ancestors: Element[] = []) => {
            // Skip invisible elements
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') {
                return;
            }

            const rect = el.getBoundingClientRect();
            // Skip elements with no dimensions (unless they're containers)
            if (rect.width === 0 && rect.height === 0 && el.children.length === 0) {
                return;
            }

            // Skip script/style/meta elements
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(el.tagName)) {
                return;
            }

            // Extract computed styles
            const styles: Record<string, string> = {};
            for (const prop of styleProps) {
                styles[prop] = style.getPropertyValue(prop);
            }

            // Get section context
            const sectionEl = el.closest('[data-section]') ||
                el.closest('header, footer, nav, main, section, article');
            const section = sectionEl?.getAttribute('data-section') ||
                sectionEl?.tagName.toLowerCase();

            // Generate selectors (done in browser context)
            const stableSelector = generateStableSelector(el, ancestors);
            const cssSelector = generateCSSSelector(el);

            results.push({
                stableSelector,
                cssSelector,
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || '').trim().slice(0, 100),
                section,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                styles
            });

            // Process children
            for (const child of Array.from(el.children)) {
                processElement(child, [...ancestors, el]);
            }
        };

        // Helper functions need to be defined inside evaluate
        const generateStableSelector = (el: Element, ancestors: Element[]): string => {
            // ... (same implementation as above, but inline)
            const parts: string[] = [];
            const sectionAncestor = ancestors.find(a =>
                a.hasAttribute('data-section') ||
                ['HEADER', 'FOOTER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE'].includes(a.tagName)
            );
            if (sectionAncestor) {
                const sectionName = sectionAncestor.getAttribute('data-section') ||
                    sectionAncestor.tagName.toLowerCase();
                parts.push(`[section:${sectionName}]`);
            }
            parts.push(`[tag:${el.tagName.toLowerCase()}]`);
            const text = (el.textContent || '').trim().slice(0, 50);
            if (text) {
                let hash = 0;
                for (let i = 0; i < text.length; i++) {
                    hash = ((hash << 5) - hash) + text.charCodeAt(i);
                    hash = hash & hash;
                }
                parts.push(`[text:${Math.abs(hash).toString(36).slice(0, 8)}]`);
            }
            const parent = el.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
                if (siblings.length > 1) {
                    parts.push(`[nth:${siblings.indexOf(el)}]`);
                }
            }
            return parts.join('');
        };

        const generateCSSSelector = (el: Element): string => {
            if (el.id) return `#${el.id}`;
            const section = el.closest('[data-section]');
            if (section) {
                const sectionName = section.getAttribute('data-section');
                const parent = el.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
                    const nth = siblings.indexOf(el) + 1;
                    return `[data-section="${sectionName}"] ${el.tagName.toLowerCase()}:nth-of-type(${nth})`;
                }
            }
            if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(/\s+/).filter(c => c && !c.startsWith('_'));
                if (classes.length > 0) {
                    return `${el.tagName.toLowerCase()}.${classes.slice(0, 2).join('.')}`;
                }
            }
            return el.tagName.toLowerCase();
        };

        processElement(document.body);
        return results;
    }, STYLE_PROPERTIES);

    await browser.close();

    const elementMap = new Map<string, ElementStyle>();
    for (const el of elements) {
        elementMap.set(el.stableSelector, el);
    }

    return {
        url,
        device,
        viewport,
        extractedAt: new Date().toISOString(),
        elements: elementMap
    };
};

export const extractCurrentState = extractGroundTruth; // Same function, different URL
