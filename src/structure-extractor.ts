// src/structure-extractor.ts
//
// FIXED VERSION - Only extracts TOP-LEVEL semantic sections
// Not every nested div with a class name
//

import { chromium } from 'playwright';

export interface StructureNode {
    tag: string;
    role: string;
    id?: string;
    dataSection?: string;
    semanticClasses: string[];
    headingText?: string;
    buttonTexts: string[];
    linkCount: number;
    imageCount: number;
    hasForm: boolean;
    layout: 'flex-row' | 'flex-col' | 'grid' | 'block' | 'inline';
    gridColumns?: number;
    childCount: number;
    rect: { x: number; y: number; width: number; height: number };
    isFullWidth: boolean;
    isAboveFold: boolean;
    children: StructureNode[];
    depth: number;
}

export interface ExtractionConfig {
    maxDepth: number;
    minElementSize: number;
    includeText: boolean;
    viewport: { width: number; height: number };
}

const DEFAULT_CONFIG: ExtractionConfig = {
    maxDepth: 6,
    minElementSize: 20,
    includeText: true,
    viewport: { width: 1440, height: 900 }
};

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
        await page.waitForTimeout(1500);

        const structure = await page.evaluate((cfg) => {
            const viewportHeight = cfg.viewport.height;
            const viewportWidth = cfg.viewport.width;

            // ONLY these tags can be top-level sections
            const SECTION_TAGS = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];

            // Semantic role detection - ONLY for direct children of body or main
            const detectTopLevelRole = (
                el: Element,
                isDirectChildOfBodyOrMain: boolean
            ): string => {
                const tag = el.tagName.toLowerCase();
                const classList = Array.from(el.classList);
                const classStr = classList.join(' ').toLowerCase();
                const id = (el.id || '').toLowerCase();

                // Only assign semantic roles to top-level elements
                if (!isDirectChildOfBodyOrMain && !SECTION_TAGS.includes(tag)) {
                    return 'container';
                }

                // Tag-based roles (highest priority for semantic tags)
                if (tag === 'header') return 'header';
                if (tag === 'nav') return 'navigation';
                if (tag === 'footer') return 'footer';
                if (tag === 'main') return 'main';
                if (tag === 'aside') return 'sidebar';

                // For sections, detect by content/class
                if (tag === 'section' || isDirectChildOfBodyOrMain) {
                    // Get heading for context
                    const heading = el.querySelector('h1, h2, h3');
                    const headingText = (heading?.textContent || '').toLowerCase();

                    // Hero detection (usually first section, has large image/text)
                    const rect = el.getBoundingClientRect();
                    if (rect.top < 200 && rect.height > 400) {
                        if (/hero|banner|splash|jumbotron/i.test(classStr + id)) return 'hero';
                        // If it's the first big section, likely hero
                        const prevSections = el.parentElement?.querySelectorAll('section');
                        if (prevSections && Array.from(prevSections).indexOf(el as HTMLElement) === 0) {
                            return 'hero';
                        }
                    }

                    // Content-based detection
                    if (/product|shop|item|catalog/i.test(classStr + id + headingText)) return 'products';
                    if (/testimonial|review|customer|quote/i.test(classStr + id + headingText)) return 'testimonials';
                    if (/feature|benefit|why/i.test(classStr + id + headingText)) return 'features';
                    if (/pricing|price|plan/i.test(classStr + id + headingText)) return 'pricing';
                    if (/faq|question|accordion/i.test(classStr + id + headingText)) return 'faq';
                    if (/contact/i.test(classStr + id + headingText)) return 'contact';
                    if (/about|team|story/i.test(classStr + id + headingText)) return 'about';
                    if (/gallery|portfolio/i.test(classStr + id + headingText)) return 'gallery';
                    if (/cta|call-to-action/i.test(classStr + id + headingText)) return 'cta';
                    if (/comparison|compare/i.test(classStr + id + headingText)) return 'comparison';
                    if (/newsletter|subscribe/i.test(classStr + id + headingText)) return 'newsletter';

                    return 'section'; // Generic section
                }

                return 'container';
            };

            const extractSemanticClasses = (classes: string[]): string[] => {
                return classes.filter(c => {
                    if (!c || c.length < 3) return false;
                    // Skip Tailwind utilities
                    if (/^(bg|text|p|m|w|h|flex|grid|border|rounded|shadow|font|leading|tracking|gap|space|items|justify|self|place|order|col|row|overflow|z|opacity|transition|duration|ease|transform|scale|rotate|translate|skew|origin|cursor|select|resize|list|appearance|outline|ring|fill|stroke)-/.test(c)) {
                        return false;
                    }
                    if (/^(sm|md|lg|xl|2xl):/.test(c)) return false;
                    if (/^(hover|focus|active|disabled):/.test(c)) return false;
                    if (/^[a-z]{1,3}[A-Z0-9]/.test(c)) return false;
                    if (/^_/.test(c)) return false;
                    return true;
                });
            };

            const detectLayout = (styles: CSSStyleDeclaration): 'flex-row' | 'flex-col' | 'grid' | 'block' | 'inline' => {
                const display = styles.display;
                const flexDirection = styles.flexDirection;
                if (display === 'grid') return 'grid';
                if (display === 'flex') {
                    return flexDirection === 'column' ? 'flex-col' : 'flex-row';
                }
                if (display === 'inline' || display === 'inline-block') return 'inline';
                return 'block';
            };

            const processElement = (el: Element, depth: number, isDirectChildOfBodyOrMain: boolean): StructureNode | null => {
                if (depth > cfg.maxDepth) return null;

                const tag = el.tagName.toLowerCase();

                // Skip non-visual elements
                if (['script', 'style', 'noscript', 'meta', 'link', 'head', 'title', 'template', 'svg', 'path', 'circle', 'rect', 'line', 'g', 'defs'].includes(tag)) {
                    return null;
                }

                const styles = window.getComputedStyle(el);
                if (styles.display === 'none' || styles.visibility === 'hidden') {
                    return null;
                }

                const rect = el.getBoundingClientRect();
                if (rect.width < cfg.minElementSize && rect.height < cfg.minElementSize) {
                    return null;
                }

                const classList = Array.from(el.classList);
                const role = detectTopLevelRole(el, isDirectChildOfBodyOrMain);

                // Content analysis
                const headingEl = el.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > div > h1, :scope > div > h2');
                const headingText = headingEl?.textContent?.trim().slice(0, 100) || undefined;

                const buttons = el.querySelectorAll(':scope > button, :scope > a.btn, :scope > div > button');
                const buttonTexts = Array.from(buttons)
                    .map(b => b.textContent?.trim().slice(0, 50))
                    .filter(Boolean) as string[];

                const links = el.querySelectorAll('a[href]');
                const images = el.querySelectorAll('img');
                const forms = el.querySelectorAll('form');

                const layout = detectLayout(styles);
                let gridColumns: number | undefined;
                if (layout === 'grid') {
                    const cols = styles.gridTemplateColumns;
                    if (cols && cols !== 'none') {
                        gridColumns = cols.split(' ').filter(c => c && c !== 'none').length;
                    }
                }

                // Process children
                const children: StructureNode[] = [];
                const childIsDirectChild = tag === 'body' || tag === 'main';

                for (const child of Array.from(el.children)) {
                    const childNode = processElement(child, depth + 1, childIsDirectChild);
                    if (childNode) {
                        children.push(childNode);
                    }
                }

                return {
                    tag,
                    role,
                    id: el.id || undefined,
                    dataSection: el.getAttribute('data-section') || undefined,
                    semanticClasses: extractSemanticClasses(classList),
                    headingText,
                    buttonTexts: buttonTexts.slice(0, 5),
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

            return processElement(document.body, 0, true);
        }, fullConfig);

        return structure;
    } finally {
        await browser.close();
    }
};

/**
 * Convert structure to a human-readable tree
 */
export const structureToTree = (node: StructureNode, indent: string = ''): string => {
    const lines: string[] = [];

    let desc = node.tag;
    if (node.id) desc += `#${node.id}`;
    if (node.role !== 'container') {
        desc += ` [${node.role}]`;
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

    lines.push(indent + desc);

    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const isLast = i === node.children.length - 1;
        const childIndent = indent + (isLast ? '└── ' : '├── ');
        lines.push(structureToTree(child, childIndent));
    }

    return lines.join('\n');
};

/**
 * Convert structure to JSON schema for LLM
 */
export const structureToSchema = (node: StructureNode): object => {
    const simplified: any = {
        tag: node.tag,
        role: node.role,
    };

    if (node.id) simplified.id = node.id;
    if (node.headingText) simplified.heading = node.headingText;
    if (node.layout !== 'block') simplified.layout = node.layout;
    if (node.gridColumns) simplified.gridColumns = node.gridColumns;
    if (node.imageCount > 0) simplified.images = node.imageCount;
    if (node.buttonTexts.length > 0) simplified.buttons = node.buttonTexts;

    if (node.children.length > 0) {
        simplified.children = node.children.map(c => structureToSchema(c));
    }

    return simplified;
};

/**
 * Get ONLY top-level sections (not nested elements)
 */
export const getSectionSummary = (node: StructureNode): Array<{ role: string; heading?: string; depth: number }> => {
    const sections: Array<{ role: string; heading?: string; depth: number }> = [];

    // Only look at immediate children and their immediate children
    const collectSections = (n: StructureNode, currentDepth: number) => {
        // Only collect sections from top 3 levels
        if (currentDepth > 3) return;

        // Only these roles count as "sections"
        const SECTION_ROLES = ['header', 'navigation', 'hero', 'main', 'products', 'testimonials',
            'features', 'pricing', 'faq', 'footer', 'cta', 'about', 'contact',
            'gallery', 'comparison', 'newsletter', 'section', 'sidebar'];

        if (SECTION_ROLES.includes(n.role) && n.role !== 'container') {
            sections.push({
                role: n.role,
                heading: n.headingText,
                depth: n.depth
            });
        }

        // Only recurse into body, main, or wrapper divs
        if (n.tag === 'body' || n.tag === 'main' || (n.tag === 'div' && n.role === 'container')) {
            for (const child of n.children) {
                collectSections(child, currentDepth + 1);
            }
        }
    };

    collectSections(node, 0);

    // Deduplicate - only keep first occurrence of each role
    const seen = new Set<string>();
    const unique: typeof sections = [];

    for (const section of sections) {
        // Allow multiple 'section' roles but dedupe specific roles
        if (section.role === 'section' || !seen.has(section.role)) {
            seen.add(section.role);
            unique.push(section);
        }
    }

    return unique;
};

/**
 * Count total nodes
 */
export const countNodes = (node: StructureNode): number => {
    return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
};