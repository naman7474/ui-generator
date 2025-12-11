// src/site-dna-extractor.ts
//
// SITE DNA EXTRACTION - The key to 90%+ first generation accuracy
//
// This module extracts precise, quantitative data from the target website
// BEFORE sending to the LLM, giving it exact values instead of guessing.
//

import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { ensureDir } from './utils';

// ============================================================================
// TYPES
// ============================================================================

export interface FontInfo {
    family: string;
    weights: number[];
    googleFontUrl?: string;
    source: 'google' | 'system' | 'custom';
}

export interface TextStyle {
    selector: string;
    fontSize: string;
    fontWeight: string;
    fontFamily: string;
    lineHeight: string;
    letterSpacing: string;
    color: string;
    role: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button' | 'link' | 'nav';
}

export interface ColorInfo {
    hex: string;
    rgb: string;
    usage: 'background' | 'text' | 'border' | 'accent' | 'gradient';
    frequency: number;
    sampleSelector?: string;
}

export interface SectionInfo {
    index: number;
    tag: string;
    role: string;
    rect: { x: number; y: number; width: number; height: number };
    backgroundColor: string;
    backgroundImage?: string;
    padding: { top: number; right: number; bottom: number; left: number };
    margin: { top: number; right: number; bottom: number; left: number };
    layoutType: 'grid' | 'flex-row' | 'flex-col' | 'stack' | 'absolute';
    gridInfo?: {
        columns: number;
        rows: number;
        columnGap: number;
        rowGap: number;
        templateColumns: string;
        templateRows: string;
    };
    flexInfo?: {
        direction: string;
        wrap: string;
        justifyContent: string;
        alignItems: string;
        gap: number;
    };
    childCount: number;
    headingText?: string;
    headingLevel?: number;
    selector: string;
}

export interface ImageInfo {
    src: string;
    localPath: string;
    rect: { x: number; y: number; width: number; height: number };
    sectionIndex: number;
    role: 'hero' | 'product' | 'avatar' | 'logo' | 'background' | 'icon' | 'decoration' | 'content';
    aspectRatio: number;
    alt: string;
    naturalSize: { width: number; height: number };
    objectFit: string;
    borderRadius: string;
}

export interface ButtonInfo {
    text: string;
    rect: { x: number; y: number; width: number; height: number };
    style: {
        backgroundColor: string;
        textColor: string;
        borderRadius: string;
        border: string;
        padding: string;
        fontSize: string;
        fontWeight: string;
    };
    sectionIndex: number;
    href?: string;
    selector: string;
}

export interface IconInfo {
    name: string;
    rect: { x: number; y: number; width: number; height: number };
    sectionIndex: number;
    color: string;
    size: number;
    source: 'font-awesome' | 'lucide' | 'heroicons' | 'svg' | 'unknown';
}

export interface LinkInfo {
    text: string;
    href: string;
    isNavigation: boolean;
    sectionIndex: number;
    rect: { x: number; y: number; width: number; height: number };
    style: {
        color: string;
        textDecoration: string;
        fontWeight: string;
    };
}

export interface SpacingInfo {
    baseUnit: number;
    sectionGaps: number[];
    elementGaps: number[];
    containerPadding: { x: number; y: number };
    commonPaddings: number[];
    commonMargins: number[];
}

export interface LayoutInfo {
    sections: SectionInfo[];
    maxWidth: number;
    containerPadding: number;
    hasFixedHeader: boolean;
    hasFixedFooter: boolean;
    pageHeight: number;
}

export interface SiteDNA {
    url: string;
    timestamp: string;
    viewport: { width: number; height: number };

    typography: {
        fonts: FontInfo[];
        textStyles: TextStyle[];
    };

    colors: {
        palette: ColorInfo[];
        dominant: string;
        backgrounds: string[];
        textColors: string[];
        accents: string[];
    };

    layout: LayoutInfo;

    elements: {
        images: ImageInfo[];
        buttons: ButtonInfo[];
        links: LinkInfo[];
        icons: IconInfo[];
    };

    spacing: SpacingInfo;

    metadata: {
        title: string;
        description?: string;
        favicon?: string;
    };
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

export const extractSiteDNA = async (
    url: string,
    outputDir: string,
    options: {
        viewport?: { width: number; height: number };
        downloadAssets?: boolean;
        fullPage?: boolean;
    } = {}
): Promise<SiteDNA> => {
    const {
        viewport = { width: 1280, height: 720 },
        downloadAssets = true,
        fullPage = true
    } = options;

    console.log(`[SiteDNA] Extracting DNA from ${url}`);
    console.log(`[SiteDNA] Viewport: ${viewport.width}x${viewport.height}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        // Navigate and wait for full load
        await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 60000
        });

        // Wait a bit more for lazy-loaded content
        await page.waitForTimeout(2000);

        // Scroll to trigger lazy loading
        if (fullPage) {
            await autoScroll(page);
        }

        // Extract all DNA data in a single page.evaluate call
        const extractedData = await page.evaluate((viewportData) => {
            // ==================== HELPER FUNCTIONS ====================

            const rgbToHex = (rgb: string): string => {
                const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (!match) return rgb;
                const r = parseInt(match[1]).toString(16).padStart(2, '0');
                const g = parseInt(match[2]).toString(16).padStart(2, '0');
                const b = parseInt(match[3]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            };

            const isVisible = (el: Element): boolean => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return rect.width > 0 &&
                    rect.height > 0 &&
                    style.visibility !== 'hidden' &&
                    style.display !== 'none' &&
                    parseFloat(style.opacity) > 0;
            };

            const getPadding = (style: CSSStyleDeclaration) => ({
                top: parseFloat(style.paddingTop) || 0,
                right: parseFloat(style.paddingRight) || 0,
                bottom: parseFloat(style.paddingBottom) || 0,
                left: parseFloat(style.paddingLeft) || 0
            });

            const getMargin = (style: CSSStyleDeclaration) => ({
                top: parseFloat(style.marginTop) || 0,
                right: parseFloat(style.marginRight) || 0,
                bottom: parseFloat(style.marginBottom) || 0,
                left: parseFloat(style.marginLeft) || 0
            });

            const detectLayoutType = (el: Element, style: CSSStyleDeclaration): string => {
                if (style.display.includes('grid')) return 'grid';
                if (style.display.includes('flex')) {
                    return style.flexDirection === 'column' ? 'flex-col' : 'flex-row';
                }
                if (style.position === 'absolute' || style.position === 'fixed') return 'absolute';
                return 'stack';
            };

            const getGridInfo = (style: CSSStyleDeclaration) => {
                if (!style.display.includes('grid')) return undefined;

                const templateCols = style.gridTemplateColumns || '';
                const columnCount = templateCols.split(/\s+/).filter(v => v && v !== 'none').length ||
                    parseInt(style.getPropertyValue('grid-template-columns').match(/repeat\((\d+)/)?.[1] || '0');

                return {
                    columns: columnCount,
                    rows: 0,
                    columnGap: parseFloat(style.columnGap) || parseFloat(style.gap) || 0,
                    rowGap: parseFloat(style.rowGap) || parseFloat(style.gap) || 0,
                    templateColumns: templateCols,
                    templateRows: style.gridTemplateRows || ''
                };
            };

            const getFlexInfo = (style: CSSStyleDeclaration) => {
                if (!style.display.includes('flex')) return undefined;
                return {
                    direction: style.flexDirection || 'row',
                    wrap: style.flexWrap || 'nowrap',
                    justifyContent: style.justifyContent || 'flex-start',
                    alignItems: style.alignItems || 'stretch',
                    gap: parseFloat(style.gap) || 0
                };
            };

            const getSectionRole = (el: Element, index: number, totalSections: number): string => {
                const tag = el.tagName.toLowerCase();
                const text = el.textContent?.toLowerCase() || '';
                const classes = el.className?.toLowerCase() || '';
                const id = el.id?.toLowerCase() || '';
                const rect = el.getBoundingClientRect();

                // By tag
                if (tag === 'header' || tag === 'nav') return 'header';
                if (tag === 'footer') return 'footer';

                // By position
                if (index === 0 && rect.y < 200) return 'header';
                if (index === totalSections - 1 && rect.y > document.body.scrollHeight - 500) return 'footer';

                // By class/id
                if (classes.includes('hero') || id.includes('hero')) return 'hero';
                if (classes.includes('feature') || id.includes('feature')) return 'features';
                if (classes.includes('testimonial') || id.includes('testimonial')) return 'testimonials';
                if (classes.includes('pricing') || id.includes('pricing')) return 'pricing';
                if (classes.includes('faq') || id.includes('faq')) return 'faq';
                if (classes.includes('cta') || id.includes('cta')) return 'cta';
                if (classes.includes('contact') || id.includes('contact')) return 'contact';
                if (classes.includes('about') || id.includes('about')) return 'about';
                if (classes.includes('team') || id.includes('team')) return 'team';
                if (classes.includes('gallery') || id.includes('gallery')) return 'gallery';
                if (classes.includes('blog') || id.includes('blog')) return 'blog';
                if (classes.includes('product') || id.includes('product')) return 'products';

                // By content
                if (index === 1 && (text.includes('welcome') || text.includes('get started'))) return 'hero';

                return `section-${index}`;
            };

            type ImageRole = 'hero' | 'product' | 'avatar' | 'logo' | 'background' | 'icon' | 'decoration' | 'content';
            const detectImageRole = (img: HTMLImageElement, sectionRole: string): ImageRole => {
                const src = img.src.toLowerCase();
                const alt = img.alt?.toLowerCase() || '';
                const classes = img.className?.toLowerCase() || '';
                const rect = img.getBoundingClientRect();
                const parent = img.parentElement;

                // Logo detection
                if (src.includes('logo') || alt.includes('logo') || classes.includes('logo')) return 'logo';
                if (rect.y < 100 && rect.width < 200 && rect.height < 100) return 'logo';

                // Avatar detection
                if (src.includes('avatar') || alt.includes('avatar') || classes.includes('avatar')) return 'avatar';
                if (rect.width < 80 && rect.height < 80 && classes.includes('rounded')) return 'avatar';

                // Hero image detection
                if (sectionRole === 'hero' && rect.width > 400) return 'hero';

                // Product image detection
                if (parent?.closest('[class*="product"]') || parent?.closest('[class*="card"]')) return 'product';

                // Background image
                if (classes.includes('bg') || classes.includes('background')) return 'background';

                // Icon
                if (rect.width <= 32 && rect.height <= 32) return 'icon';

                return 'content';
            };

            const buildSelector = (el: Element): string => {
                if (el.id) return `#${el.id}`;

                const tag = el.tagName.toLowerCase();
                const classes = Array.from(el.classList).slice(0, 3).join('.');

                if (classes) return `${tag}.${classes}`;

                // Build path from section
                const section = el.closest('[data-section]') || el.closest('section') || el.closest('header') || el.closest('footer');
                if (section) {
                    const sectionId = section.getAttribute('data-section') || section.tagName.toLowerCase();
                    const index = Array.from(section.querySelectorAll(tag)).indexOf(el as HTMLElement);
                    return `[data-section="${sectionId}"] ${tag}:nth-of-type(${index + 1})`;
                }

                return tag;
            };

            // ==================== EXTRACTION ====================

            // 1. EXTRACT SECTIONS
            const sectionElements = Array.from(document.querySelectorAll(
                'header, footer, main, section, [role="banner"], [role="main"], [role="contentinfo"], ' +
                'div[class*="section"], div[class*="hero"], div[class*="container"] > div:not([class*="nav"])'
            )).filter(el => {
                const rect = el.getBoundingClientRect();
                return isVisible(el) && rect.height > 100 && rect.width > viewportData.width * 0.5;
            });

            // Deduplicate nested sections
            const sections: Element[] = [];
            for (const el of sectionElements) {
                const isNested = sections.some(s => s.contains(el) || el.contains(s));
                if (!isNested) {
                    sections.push(el);
                } else if (el.contains(sections[sections.length - 1])) {
                    // Replace parent with child if child is more specific
                    sections[sections.length - 1] = el;
                }
            }

            // Sort by Y position
            sections.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

            const sectionsData: any[] = sections.map((el, index) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                const heading = el.querySelector('h1, h2, h3');

                return {
                    index,
                    tag: el.tagName.toLowerCase(),
                    role: getSectionRole(el, index, sections.length),
                    rect: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y + window.scrollY),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    },
                    backgroundColor: rgbToHex(style.backgroundColor),
                    backgroundImage: style.backgroundImage !== 'none' ? style.backgroundImage : undefined,
                    padding: getPadding(style),
                    margin: getMargin(style),
                    layoutType: detectLayoutType(el, style),
                    gridInfo: getGridInfo(style),
                    flexInfo: getFlexInfo(style),
                    childCount: el.children.length,
                    headingText: heading?.textContent?.trim().slice(0, 100),
                    headingLevel: heading ? parseInt(heading.tagName[1]) : undefined,
                    selector: buildSelector(el)
                };
            });

            // 2. EXTRACT TYPOGRAPHY
            const textElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li'));
            const textStylesMap = new Map<string, any>();
            const fontFamilies = new Set<string>();

            for (const el of textElements) {
                if (!isVisible(el)) continue;

                const style = window.getComputedStyle(el);
                const family = style.fontFamily.split(',')[0].trim().replace(/["']/g, '');
                fontFamilies.add(family);

                const role = el.tagName.toLowerCase().startsWith('h')
                    ? el.tagName.toLowerCase() as 'h1' | 'h2' | 'h3' | 'h4'
                    : el.tagName.toLowerCase() === 'button' ? 'button'
                        : el.tagName.toLowerCase() === 'a' ? 'link'
                            : 'body';

                const key = `${role}-${style.fontSize}-${style.fontWeight}`;

                if (!textStylesMap.has(key)) {
                    textStylesMap.set(key, {
                        selector: buildSelector(el),
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        fontFamily: family,
                        lineHeight: style.lineHeight,
                        letterSpacing: style.letterSpacing,
                        color: rgbToHex(style.color),
                        role
                    });
                }
            }

            // 3. EXTRACT COLORS
            const colorUsage = new Map<string, { count: number; usage: string; selector: string }>();

            const processColor = (color: string, usage: string, selector: string) => {
                const hex = rgbToHex(color);
                if (hex === 'transparent' || hex === 'rgba(0, 0, 0, 0)' || hex.includes('rgba')) return;

                const existing = colorUsage.get(hex);
                if (existing) {
                    existing.count++;
                } else {
                    colorUsage.set(hex, { count: 1, usage, selector });
                }
            };

            for (const el of Array.from(document.querySelectorAll('*'))) {
                if (!isVisible(el)) continue;
                const style = window.getComputedStyle(el);

                processColor(style.backgroundColor, 'background', buildSelector(el));
                processColor(style.color, 'text', buildSelector(el));
                processColor(style.borderColor, 'border', buildSelector(el));
            }

            // 4. EXTRACT IMAGES
            const images = Array.from(document.querySelectorAll('img, picture img, [style*="background-image"]'))
                .filter(el => isVisible(el))
                .map(el => {
                    const img = el as HTMLImageElement;
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);

                    // Find which section this image belongs to
                    let sectionIndex = -1;
                    for (let i = 0; i < sectionsData.length; i++) {
                        const sec = sectionsData[i];
                        if (rect.y >= sec.rect.y && rect.y < sec.rect.y + sec.rect.height) {
                            sectionIndex = i;
                            break;
                        }
                    }

                    const sectionRole = sectionIndex >= 0 ? sectionsData[sectionIndex].role : 'unknown';

                    return {
                        src: img.src || style.backgroundImage?.match(/url\(["']?(.+?)["']?\)/)?.[1] || '',
                        localPath: '', // Will be set during asset download
                        rect: {
                            x: Math.round(rect.x),
                            y: Math.round(rect.y + window.scrollY),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height)
                        },
                        sectionIndex,
                        role: detectImageRole(img, sectionRole),
                        aspectRatio: rect.width / rect.height,
                        alt: img.alt || '',
                        naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
                        objectFit: style.objectFit,
                        borderRadius: style.borderRadius
                    };
                });

            // 5. EXTRACT BUTTONS
            const buttons = Array.from(document.querySelectorAll('button, a.btn, a.button, [role="button"], input[type="submit"]'))
                .filter(el => isVisible(el))
                .map(el => {
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);

                    let sectionIndex = -1;
                    for (let i = 0; i < sectionsData.length; i++) {
                        const sec = sectionsData[i];
                        if (rect.y >= sec.rect.y && rect.y < sec.rect.y + sec.rect.height) {
                            sectionIndex = i;
                            break;
                        }
                    }

                    return {
                        text: el.textContent?.trim().slice(0, 50) || '',
                        rect: {
                            x: Math.round(rect.x),
                            y: Math.round(rect.y + window.scrollY),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height)
                        },
                        style: {
                            backgroundColor: rgbToHex(style.backgroundColor),
                            textColor: rgbToHex(style.color),
                            borderRadius: style.borderRadius,
                            border: style.border,
                            padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
                            fontSize: style.fontSize,
                            fontWeight: style.fontWeight
                        },
                        sectionIndex,
                        href: (el as HTMLAnchorElement).href || undefined,
                        selector: buildSelector(el)
                    };
                });

            // 6. EXTRACT LINKS
            const links = Array.from(document.querySelectorAll('a[href]'))
                .filter(el => isVisible(el))
                .map(el => {
                    const a = el as HTMLAnchorElement;
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);

                    const isNav = !!el.closest('nav, header, [role="navigation"]');

                    let sectionIndex = -1;
                    for (let i = 0; i < sectionsData.length; i++) {
                        const sec = sectionsData[i];
                        if (rect.y >= sec.rect.y && rect.y < sec.rect.y + sec.rect.height) {
                            sectionIndex = i;
                            break;
                        }
                    }

                    return {
                        text: el.textContent?.trim().slice(0, 50) || '',
                        href: a.href,
                        isNavigation: isNav,
                        sectionIndex,
                        rect: {
                            x: Math.round(rect.x),
                            y: Math.round(rect.y + window.scrollY),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height)
                        },
                        style: {
                            color: rgbToHex(style.color),
                            textDecoration: style.textDecoration,
                            fontWeight: style.fontWeight
                        }
                    };
                });

            // 7. CALCULATE SPACING
            const gaps: number[] = [];
            for (let i = 1; i < sectionsData.length; i++) {
                const gap = sectionsData[i].rect.y - (sectionsData[i - 1].rect.y + sectionsData[i - 1].rect.height);
                if (gap > 0 && gap < 500) gaps.push(Math.round(gap));
            }

            // Detect base unit (most common divisor)
            const allSpacings = [
                ...sectionsData.flatMap(s => [s.padding.top, s.padding.right, s.padding.bottom, s.padding.left]),
                ...gaps
            ].filter(v => v > 0);

            const gcdAll = (arr: number[]): number => {
                if (arr.length === 0) return 4;
                return arr.reduce((a, b) => {
                    while (b) { [a, b] = [b, a % b]; }
                    return a;
                });
            };

            const baseUnit = gcdAll(allSpacings.map(v => Math.round(v))) || 4;

            // 8. METADATA
            const metadata = {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
                favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href')
            };

            // Return all extracted data
            return {
                sections: sectionsData,
                textStyles: Array.from(textStylesMap.values()),
                fonts: Array.from(fontFamilies),
                colors: Array.from(colorUsage.entries()).map(([hex, data]) => ({
                    hex,
                    ...data
                })),
                images,
                buttons,
                links,
                spacing: {
                    baseUnit,
                    sectionGaps: gaps,
                    elementGaps: [], // Would need more analysis
                    containerPadding: { x: 0, y: 0 },
                    commonPaddings: [...new Set(allSpacings.filter(v => v <= 100))].sort((a, b) => a - b),
                    commonMargins: []
                },
                metadata,
                pageHeight: document.body.scrollHeight,
                maxWidth: Math.max(...sectionsData.map(s => s.rect.width))
            };
        }, viewport);

        // Process and structure the DNA
        const dna: SiteDNA = {
            url,
            timestamp: new Date().toISOString(),
            viewport,

            typography: {
                fonts: extractedData.fonts.map((family: string) => ({
                    family,
                    weights: [400, 500, 600, 700], // Default weights
                    source: family.includes('Arial') || family.includes('Helvetica') || family.includes('system')
                        ? 'system'
                        : 'google'
                })),
                textStyles: extractedData.textStyles
            },

            colors: {
                palette: extractedData.colors.sort((a: any, b: any) => b.count - a.count).map((c: any) => ({
                    hex: c.hex,
                    rgb: c.hex, // Using hex as fallback for rgb
                    usage: c.usage as 'background' | 'text' | 'border' | 'accent' | 'gradient',
                    frequency: c.count,
                    sampleSelector: c.selector
                })),
                dominant: extractedData.colors[0]?.hex || '#000000',
                backgrounds: extractedData.colors
                    .filter((c: any) => c.usage === 'background')
                    .map((c: any) => c.hex),
                textColors: extractedData.colors
                    .filter((c: any) => c.usage === 'text')
                    .map((c: any) => c.hex),
                accents: extractedData.colors
                    .filter((c: any) => c.usage === 'border' || c.count < 5)
                    .map((c: any) => c.hex)
            },

            layout: {
                sections: extractedData.sections,
                maxWidth: extractedData.maxWidth,
                containerPadding: extractedData.spacing.containerPadding?.x || 0,
                hasFixedHeader: extractedData.sections[0]?.role === 'header',
                hasFixedFooter: extractedData.sections[extractedData.sections.length - 1]?.role === 'footer',
                pageHeight: extractedData.pageHeight
            },

            elements: {
                images: extractedData.images,
                buttons: extractedData.buttons,
                links: extractedData.links,
                icons: [] // Would need icon detection
            },

            spacing: extractedData.spacing,

            metadata: {
                title: extractedData.metadata.title,
                description: extractedData.metadata.description ?? undefined,
                favicon: extractedData.metadata.favicon ?? undefined
            }
        };

        // Download assets if requested
        if (downloadAssets && outputDir) {
            const assetsDir = path.join(outputDir, 'assets', 'images');
            await ensureDir(assetsDir);

            for (let i = 0; i < dna.elements.images.length; i++) {
                const img = dna.elements.images[i];
                if (!img.src || img.src.startsWith('data:')) continue;

                try {
                    const response = await page.goto(img.src, { waitUntil: 'load' });
                    if (response) {
                        const buffer = await response.body();
                        const ext = img.src.split('.').pop()?.split('?')[0] || 'png';
                        const filename = `img-${i}.${ext}`;
                        const localPath = path.join(assetsDir, filename);
                        await fs.writeFile(localPath, buffer);
                        img.localPath = `./assets/images/${filename}`;
                    }
                } catch (e) {
                    console.warn(`[SiteDNA] Failed to download image: ${img.src}`);
                    img.localPath = img.src; // Keep original URL as fallback
                }
            }
        }

        // Save DNA to file
        if (outputDir) {
            await ensureDir(outputDir);
            await fs.writeFile(
                path.join(outputDir, 'site-dna.json'),
                JSON.stringify(dna, null, 2)
            );
            console.log(`[SiteDNA] Saved DNA to ${path.join(outputDir, 'site-dna.json')}`);
        }

        console.log(`[SiteDNA] Extracted:`);
        console.log(`  - ${dna.layout.sections.length} sections`);
        console.log(`  - ${dna.typography.fonts.length} fonts`);
        console.log(`  - ${dna.colors.palette.length} colors`);
        console.log(`  - ${dna.elements.images.length} images`);
        console.log(`  - ${dna.elements.buttons.length} buttons`);
        console.log(`  - ${dna.elements.links.length} links`);

        return dna;

    } finally {
        await browser.close();
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function autoScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 300;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    window.scrollTo(0, 0);
                    resolve();
                }
            }, 100);
        });
    });
}

// ============================================================================
// PROMPT BUILDER FROM DNA
// ============================================================================

export const buildPromptFromDNA = (dna: SiteDNA): string => {
    const { typography, colors, layout, elements, spacing } = dna;

    return `You are a pixel-perfect React/Tailwind developer. Generate an EXACT replica using the DNA data below.

## CRITICAL: Use EXACT values from DNA - do NOT estimate or guess.

## FONTS
${typography.fonts.map(f => `- ${f.family} (${f.source})`).join('\n')}

## TEXT STYLES (Use these exact values)
${typography.textStyles.slice(0, 10).map(s =>
        `- ${s.role}: ${s.fontSize} ${s.fontWeight} color:${s.color}`
    ).join('\n')}

## COLOR PALETTE (Use exact hex codes)
- Primary backgrounds: ${colors.backgrounds.slice(0, 5).join(', ')}
- Text colors: ${colors.textColors.slice(0, 5).join(', ')}
- Accents: ${colors.accents.slice(0, 5).join(', ')}

## SECTION STRUCTURE (Follow this EXACT order)
${layout.sections.map((s, i) => `
### ${i + 1}. ${s.role.toUpperCase()}
- Tag: <${s.tag}>
- data-section="${s.role}"
- Size: ${s.rect.width}x${s.rect.height}px
- Background: ${s.backgroundColor}
- Padding: ${s.padding.top}px ${s.padding.right}px ${s.padding.bottom}px ${s.padding.left}px
- Layout: ${s.layoutType}${s.gridInfo ? ` (${s.gridInfo.columns} cols, ${s.gridInfo.columnGap}px gap)` : ''}${s.flexInfo ? ` (${s.flexInfo.direction}, gap: ${s.flexInfo.gap}px)` : ''}
- Children: ${s.childCount}
${s.headingText ? `- Heading: "${s.headingText}"` : ''}
`).join('\n')}

## IMAGES (Use these EXACT paths)
${elements.images.slice(0, 20).map((img, i) =>
        `${i + 1}. src="${img.localPath}" - ${img.rect.width}x${img.rect.height}px - ${img.role} in section ${img.sectionIndex + 1}`
    ).join('\n')}

## BUTTONS (Match these exactly)
${elements.buttons.slice(0, 10).map((btn, i) =>
        `${i + 1}. "${btn.text}" - bg:${btn.style.backgroundColor} text:${btn.style.textColor} radius:${btn.style.borderRadius}`
    ).join('\n')}

## SPACING
- Base unit: ${spacing.baseUnit}px
- Section gaps: ${[...new Set(spacing.sectionGaps)].slice(0, 5).join(', ')}px
- Common paddings: ${spacing.commonPaddings.slice(0, 8).join(', ')}px

## REQUIREMENTS
1. Use EXACT DNA values - no estimation
2. Add data-section="<role>" to each section
3. Use downloaded images from ./assets/images/
4. Match element counts exactly
5. Preserve section order

## OUTPUT
Return complete JSX code. NO imports (React is global). Component name: App.`;
};

export default {
    extractSiteDNA,
    buildPromptFromDNA
};