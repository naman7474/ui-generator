// src/structure-extractor.ts
//
// Extracts the semantic DOM structure from any website.
// This structure is passed to the LLM to ensure generated code matches.
//

import { chromium, Page, ElementHandle } from 'playwright';

/**
 * Represents a node in the extracted DOM structure
 */
export interface StructureNode {
    // Core identity
    tag: string;
    role: string;  // semantic role: header, nav, hero, products, footer, etc.

    // Identification
    id?: string;
    dataSection?: string;
    ariaLabel?: string;

    // Class analysis
    semanticClasses: string[];  // Meaningful classes like "hero", "nav", "footer"

    // Content hints
    headingText?: string;       // Text of h1-h6 if present
    buttonTexts: string[];      // Text of buttons
    linkCount: number;
    imageCount: number;
    hasForm: boolean;

    // Layout analysis
    layout: 'flex-row' | 'flex-col' | 'grid' | 'block' | 'inline';
    gridColumns?: number;
    childCount: number;

    // Visual properties (for matching)
    rect: { x: number; y: number; width: number; height: number };
    isFullWidth: boolean;
    isAboveFold: boolean;

    // Nested structure
    children: StructureNode[];

    // Depth in tree (for limiting extraction)
    depth: number;
}

/**
 * Configuration for structure extraction
 */
export interface ExtractionConfig {
    maxDepth: number;           // How deep to traverse (default: 6)
    minElementSize: number;     // Ignore elements smaller than this (default: 20)
    includeText: boolean;       // Include text content hints (default: true)
    viewport: { width: number; height: number };
}

const DEFAULT_CONFIG: ExtractionConfig = {
    maxDepth: 6,
    minElementSize: 20,
    includeText: true,
    viewport: { width: 1440, height: 900 }
};

/**
 * Semantic role detection based on tag, class, and content
 */
const detectRole = (
    tag: string,
    id: string,
    classes: string[],
    ariaLabel: string,
    headingText: string,
    rect: { y: number; height: number },
    viewportHeight: number
): string => {
    const classStr = classes.join(' ').toLowerCase();
    const idLower = (id || '').toLowerCase();
    const labelLower = (ariaLabel || '').toLowerCase();
    const headingLower = (headingText || '').toLowerCase();

    // Tag-based roles
    if (tag === 'header') return 'header';
    if (tag === 'nav') return 'navigation';
    if (tag === 'footer') return 'footer';
    if (tag === 'main') return 'main';
    if (tag === 'aside') return 'sidebar';
    if (tag === 'article') return 'article';
    if (tag === 'form') return 'form';

    // Class/ID based detection
    if (/hero|banner|jumbotron|splash/i.test(classStr + idLower)) return 'hero';
    if (/nav|menu|navigation/i.test(classStr + idLower)) return 'navigation';
    if (/footer|foot/i.test(classStr + idLower)) return 'footer';
    if (/header|head/i.test(classStr + idLower)) return 'header';
    if (/product|shop|item|card/i.test(classStr + idLower)) return 'products';
    if (/testimonial|review|quote/i.test(classStr + idLower)) return 'testimonials';
    if (/feature|benefit/i.test(classStr + idLower)) return 'features';
    if (/pricing|price|plan/i.test(classStr + idLower)) return 'pricing';
    if (/faq|question|accordion/i.test(classStr + idLower)) return 'faq';
    if (/contact|form/i.test(classStr + idLower)) return 'contact';
    if (/about|team|story/i.test(classStr + idLower)) return 'about';
    if (/gallery|portfolio|showcase/i.test(classStr + idLower)) return 'gallery';
    if (/cta|call-to-action|action/i.test(classStr + idLower)) return 'cta';
    if (/newsletter|subscribe|signup/i.test(classStr + idLower)) return 'newsletter';
    if (/logo|brand/i.test(classStr + idLower)) return 'logo';
    if (/social|share/i.test(classStr + idLower)) return 'social';
    if (/comparison|compare|vs/i.test(classStr + idLower)) return 'comparison';
    if (/stats|numbers|counter/i.test(classStr + idLower)) return 'stats';

    // Heading-based detection
    if (/product|shop/i.test(headingLower)) return 'products';
    if (/testimonial|review|customer|said/i.test(headingLower)) return 'testimonials';
    if (/feature|benefit|why/i.test(headingLower)) return 'features';
    if (/faq|question|ask/i.test(headingLower)) return 'faq';
    if (/pricing|price|plan/i.test(headingLower)) return 'pricing';

    // Position-based heuristics
    if (tag === 'section') {
        if (rect.y < viewportHeight * 0.5) return 'hero-section';
        return 'section';
    }

    // Default
    if (tag === 'div') return 'container';
    return 'element';
};

/**
 * Extract semantic class names (filter out utility classes)
 */
const extractSemanticClasses = (classes: string[]): string[] => {
    return classes.filter(c => {
        if (!c || c.length < 3) return false;

        // Skip Tailwind utilities
        if (/^(bg|text|p|m|w|h|flex|grid|border|rounded|shadow|font|leading|tracking|gap|space|items|justify|self|place|order|col|row|overflow|z|opacity|transition|duration|ease|transform|scale|rotate|translate|skew|origin|cursor|select|resize|list|appearance|outline|ring|fill|stroke)-/.test(c)) {
            return false;
        }

        // Skip responsive prefixes
        if (/^(sm|md|lg|xl|2xl):/.test(c)) return false;

        // Skip state prefixes
        if (/^(hover|focus|active|disabled|visited|first|last|odd|even|group|peer):/.test(c)) return false;

        // Skip hash-like classes (CSS modules, styled-components)
        if (/^[a-z]{1,3}[A-Z0-9]/.test(c)) return false;
        if (/^_/.test(c)) return false;
        if (/^css-/.test(c)) return false;
        if (/[A-Za-z0-9]{6,}$/.test(c) && c.length > 10) return false;

        return true;
    });
};

/**
 * Detect layout type from computed styles
 */
const detectLayout = (styles: CSSStyleDeclaration): StructureNode['layout'] => {
    const display = styles.display;
    const flexDirection = styles.flexDirection;

    if (display === 'grid') return 'grid';
    if (display === 'flex') {
        return flexDirection === 'column' ? 'flex-col' : 'flex-row';
    }
    if (display === 'inline' || display === 'inline-block') return 'inline';
    return 'block';
};

/**
 * Main extraction function - runs in browser context
 */
const extractStructureInBrowser = (config: ExtractionConfig): StructureNode | null => {
    const viewportHeight = config.viewport.height;
    const viewportWidth = config.viewport.width;

    const processElement = (el: Element, depth: number): StructureNode | null => {
        if (depth > config.maxDepth) return null;

        const tag = el.tagName.toLowerCase();

        // Skip non-visual elements
        if (['script', 'style', 'noscript', 'meta', 'link', 'head', 'title', 'template'].includes(tag)) {
            return null;
        }

        // Skip SVG internals (but keep the SVG itself)
        if (['path', 'circle', 'rect', 'line', 'g', 'defs', 'use', 'clippath', 'lineargradient', 'radialgradient', 'stop', 'polygon', 'polyline', 'ellipse'].includes(tag)) {
            return null;
        }

        const styles = window.getComputedStyle(el);

        // Skip hidden elements
        if (styles.display === 'none' || styles.visibility === 'hidden') {
            return null;
        }

        const rect = el.getBoundingClientRect();

        // Skip tiny elements
        if (rect.width < config.minElementSize && rect.height < config.minElementSize) {
            return null;
        }

        // Skip off-screen elements
        if (rect.bottom < 0 || rect.top > viewportHeight * 5) {
            return null;
        }

        // Gather element info
        const id = el.id || undefined;
        const classList = Array.from(el.classList);
        const semanticClasses = extractSemanticClasses(classList);
        const dataSection = el.getAttribute('data-section') || undefined;
        const ariaLabel = el.getAttribute('aria-label') || undefined;

        // Content analysis
        const headingEl = el.querySelector('h1, h2, h3, h4, h5, h6');
        const headingText = headingEl?.textContent?.trim().slice(0, 100) || undefined;

        const buttons = el.querySelectorAll('button, [role="button"], .btn, a.button');
        const buttonTexts = Array.from(buttons)
            .map(b => b.textContent?.trim().slice(0, 50))
            .filter(Boolean) as string[];

        const links = el.querySelectorAll('a[href]');
        const images = el.querySelectorAll('img, picture, [role="img"]');
        const forms = el.querySelectorAll('form, [role="form"]');

        // Layout analysis
        const layout = detectLayout(styles);
        let gridColumns: number | undefined;
        if (layout === 'grid') {
            const cols = styles.gridTemplateColumns;
            if (cols) {
                gridColumns = cols.split(' ').filter(c => c && c !== 'none').length;
            }
        }

        // Detect role
        const role = detectRole(
            tag,
            id || '',
            classList,
            ariaLabel || '',
            headingText || '',
            { y: rect.y, height: rect.height },
            viewportHeight
        );

        // Process children
        const children: StructureNode[] = [];
        for (const child of Array.from(el.children)) {
            const childNode = processElement(child, depth + 1);
            if (childNode) {
                children.push(childNode);
            }
        }

        return {
            tag,
            role,
            id,
            dataSection,
            ariaLabel,
            semanticClasses,
            headingText,
            buttonTexts: buttonTexts.slice(0, 5), // Limit
            linkCount: links.length,
            imageCount: images.length,
            hasForm: forms.length > 0,
            layout,
            gridColumns,
            childCount: el.children.length,
            rect: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            },
            isFullWidth: rect.width >= viewportWidth * 0.9,
            isAboveFold: rect.top < viewportHeight,
            children,
            depth
        };
    };

    // Helper function referenced in processElement
    function extractSemanticClasses(classes: string[]): string[] {
        return classes.filter(c => {
            if (!c || c.length < 3) return false;
            if (/^(bg|text|p|m|w|h|flex|grid|border|rounded|shadow|font|leading|tracking|gap|space|items|justify|self|place|order|col|row|overflow|z|opacity|transition|duration|ease|transform|scale|rotate|translate|skew|origin|cursor|select|resize|list|appearance|outline|ring|fill|stroke)-/.test(c)) {
                return false;
            }
            if (/^(sm|md|lg|xl|2xl):/.test(c)) return false;
            if (/^(hover|focus|active|disabled|visited|first|last|odd|even|group|peer):/.test(c)) return false;
            if (/^[a-z]{1,3}[A-Z0-9]/.test(c)) return false;
            if (/^_/.test(c)) return false;
            if (/^css-/.test(c)) return false;
            if (/[A-Za-z0-9]{6,}$/.test(c) && c.length > 10) return false;
            return true;
        });
    }

    function detectLayout(styles: CSSStyleDeclaration): 'flex-row' | 'flex-col' | 'grid' | 'block' | 'inline' {
        const display = styles.display;
        const flexDirection = styles.flexDirection;
        if (display === 'grid') return 'grid';
        if (display === 'flex') {
            return flexDirection === 'column' ? 'flex-col' : 'flex-row';
        }
        if (display === 'inline' || display === 'inline-block') return 'inline';
        return 'block';
    }

    function detectRole(
        tag: string,
        id: string,
        classes: string[],
        ariaLabel: string,
        headingText: string,
        rect: { y: number; height: number },
        viewportHeight: number
    ): string {
        const classStr = classes.join(' ').toLowerCase();
        const idLower = (id || '').toLowerCase();
        const headingLower = (headingText || '').toLowerCase();

        if (tag === 'header') return 'header';
        if (tag === 'nav') return 'navigation';
        if (tag === 'footer') return 'footer';
        if (tag === 'main') return 'main';
        if (tag === 'aside') return 'sidebar';
        if (tag === 'article') return 'article';
        if (tag === 'form') return 'form';

        if (/hero|banner|jumbotron|splash/i.test(classStr + idLower)) return 'hero';
        if (/nav|menu|navigation/i.test(classStr + idLower)) return 'navigation';
        if (/footer|foot/i.test(classStr + idLower)) return 'footer';
        if (/header|head/i.test(classStr + idLower)) return 'header';
        if (/product|shop|item|card/i.test(classStr + idLower)) return 'products';
        if (/testimonial|review|quote/i.test(classStr + idLower)) return 'testimonials';
        if (/feature|benefit/i.test(classStr + idLower)) return 'features';
        if (/pricing|price|plan/i.test(classStr + idLower)) return 'pricing';
        if (/faq|question|accordion/i.test(classStr + idLower)) return 'faq';
        if (/contact/i.test(classStr + idLower)) return 'contact';
        if (/about|team|story/i.test(classStr + idLower)) return 'about';
        if (/gallery|portfolio|showcase/i.test(classStr + idLower)) return 'gallery';
        if (/cta|call-to-action/i.test(classStr + idLower)) return 'cta';
        if (/newsletter|subscribe/i.test(classStr + idLower)) return 'newsletter';
        if (/comparison|compare/i.test(classStr + idLower)) return 'comparison';

        if (/product|shop/i.test(headingLower)) return 'products';
        if (/testimonial|review|customer/i.test(headingLower)) return 'testimonials';
        if (/feature|benefit|why/i.test(headingLower)) return 'features';
        if (/faq|question/i.test(headingLower)) return 'faq';
        if (/pricing|price|plan/i.test(headingLower)) return 'pricing';

        if (tag === 'section') {
            if (rect.y < viewportHeight * 0.5) return 'hero-section';
            return 'section';
        }

        if (tag === 'div') return 'container';
        return 'element';
    }

    return processElement(document.body, 0);
};

/**
 * Extract structure from a URL
 */
export const extractStructure = async (
    url: string,
    config: Partial<ExtractionConfig> = {}
): Promise<StructureNode | null> => {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: fullConfig.viewport });
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500); // Let animations settle

        const structure = await page.evaluate(extractStructureInBrowser, fullConfig);

        return structure;
    } finally {
        await browser.close();
    }
};

/**
 * Convert structure to a human-readable tree string
 */
export const structureToTree = (node: StructureNode, indent: string = ''): string => {
    const lines: string[] = [];

    // Build node description
    let desc = node.tag;
    if (node.id) desc += `#${node.id}`;
    if (node.role !== 'container' && node.role !== 'element') {
        desc += ` [${node.role}]`;
    }
    if (node.semanticClasses.length > 0) {
        desc += `.${node.semanticClasses.slice(0, 2).join('.')}`;
    }
    if (node.headingText) {
        desc += ` "${node.headingText.slice(0, 30)}..."`;
    }
    if (node.layout !== 'block') {
        desc += ` (${node.layout}${node.gridColumns ? `:${node.gridColumns}cols` : ''})`;
    }
    if (node.imageCount > 0) {
        desc += ` [${node.imageCount} img]`;
    }
    if (node.buttonTexts.length > 0) {
        desc += ` [btn: ${node.buttonTexts.slice(0, 2).join(', ')}]`;
    }

    lines.push(indent + desc);

    // Recurse to children
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const isLast = i === node.children.length - 1;
        const childIndent = indent + (isLast ? '└── ' : '├── ');
        const nextIndent = indent + (isLast ? '    ' : '│   ');

        lines.push(...structureToTree(child, childIndent).split('\n').map((line, idx) =>
            idx === 0 ? line : nextIndent + line.trim()
        ));
    }

    return lines.join('\n');
};

/**
 * Convert structure to a simplified JSON schema for LLM consumption
 */
export const structureToSchema = (node: StructureNode): object => {
    const simplified: any = {
        tag: node.tag,
        role: node.role,
    };

    if (node.id) simplified.id = node.id;
    if (node.dataSection) simplified.dataSection = node.dataSection;
    if (node.headingText) simplified.heading = node.headingText;
    if (node.layout !== 'block') simplified.layout = node.layout;
    if (node.gridColumns) simplified.gridColumns = node.gridColumns;
    if (node.imageCount > 0) simplified.images = node.imageCount;
    if (node.buttonTexts.length > 0) simplified.buttons = node.buttonTexts;
    if (node.linkCount > 0) simplified.links = node.linkCount;
    if (node.hasForm) simplified.hasForm = true;
    if (node.isFullWidth) simplified.fullWidth = true;
    if (node.semanticClasses.length > 0) simplified.classes = node.semanticClasses;

    if (node.children.length > 0) {
        simplified.children = node.children.map(c => structureToSchema(c));
    }

    return simplified;
};

/**
 * Convert structure to an HTML skeleton that the LLM should fill in
 */
export const structureToHtmlSkeleton = (node: StructureNode, indent: string = ''): string => {
    const lines: string[] = [];

    // Build opening tag
    let openTag = `<${node.tag}`;

    // Add data-section for major sections
    if (['header', 'hero', 'products', 'testimonials', 'features', 'pricing',
        'faq', 'footer', 'navigation', 'cta', 'about', 'contact', 'gallery',
        'comparison', 'newsletter', 'stats'].includes(node.role)) {
        openTag += ` data-section="${node.role}"`;
    }

    if (node.id) {
        openTag += ` id="${node.id}"`;
    }

    openTag += ` className="/* TODO: Tailwind classes */"`;
    openTag += '>';

    // Add content hints as comments
    const hints: string[] = [];
    if (node.headingText) {
        hints.push(`Heading: "${node.headingText}"`);
    }
    if (node.imageCount > 0) {
        hints.push(`${node.imageCount} image(s)`);
    }
    if (node.buttonTexts.length > 0) {
        hints.push(`Buttons: ${node.buttonTexts.join(', ')}`);
    }
    if (node.linkCount > 0) {
        hints.push(`${node.linkCount} link(s)`);
    }
    if (node.layout !== 'block') {
        hints.push(`Layout: ${node.layout}${node.gridColumns ? ` (${node.gridColumns} cols)` : ''}`);
    }

    if (hints.length > 0) {
        lines.push(`${indent}${openTag} {/* ${hints.join(' | ')} */}`);
    } else {
        lines.push(`${indent}${openTag}`);
    }

    // Recurse to children
    for (const child of node.children) {
        lines.push(structureToHtmlSkeleton(child, indent + '  '));
    }

    // Closing tag
    lines.push(`${indent}</${node.tag}>`);

    return lines.join('\n');
};

/**
 * Count total nodes in structure
 */
export const countNodes = (node: StructureNode): number => {
    return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
};

/**
 * Get section summary
 */
export const getSectionSummary = (node: StructureNode): Array<{ role: string; heading?: string; depth: number }> => {
    const sections: Array<{ role: string; heading?: string; depth: number }> = [];

    const traverse = (n: StructureNode) => {
        if (['header', 'hero', 'products', 'testimonials', 'features', 'pricing',
            'faq', 'footer', 'navigation', 'cta', 'about', 'contact', 'gallery',
            'comparison', 'newsletter', 'stats', 'hero-section', 'section'].includes(n.role)) {
            sections.push({
                role: n.role,
                heading: n.headingText,
                depth: n.depth
            });
        }
        for (const child of n.children) {
            traverse(child);
        }
    };

    traverse(node);
    return sections;
};