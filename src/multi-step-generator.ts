// src/multi-step-generator.ts
//
// IMPROVED VERSION - Better prompts and image handling for 100% accuracy
// Key improvements:
// 1. More detailed prompts with exact styling requirements
// 2. Better image-to-section mapping
// 3. Fallback to placeholder ONLY when necessary
// 4. Consistent data-section attributes
// 5. Better error handling and retries
//

import path from 'path';
import fs from 'fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { ensureDir, timestampId } from './utils';
import { config } from './config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GENERATOR_CREATE_MODEL || 'gemini-2.5-flash';

// ============================================================================
// TYPES
// ============================================================================

interface Section {
    id: string;
    index: number;
    rect: { x: number; y: number; width: number; height: number };
    tagName: string;
    hasId: boolean;
    idValue?: string;
    headingText?: string;
    elementCount: number;
    imageCount: number;
    backgroundColor?: string;
    textContent: {
        headings: string[];
        paragraphs: string[];
        buttons: string[];
        links: string[];
    };
    layout: 'grid' | 'flex-row' | 'flex-col' | 'stack';
}

interface GeneratedSection {
    id: string;
    index: number;
    code: string;
    success: boolean;
}

interface ExtractedAsset {
    originalUrl: string;
    localPath: string;
    relativePath: string;
    type: 'image' | 'video' | 'font' | 'other';
    rect: { x: number; y: number; width: number; height: number };
    alt: string;
    isBackground: boolean;
    sectionIndex?: number;
    role?: 'logo' | 'hero' | 'product' | 'avatar' | 'icon' | 'background' | 'decoration';
}

// ============================================================================
// ENHANCED ASSET EXTRACTION WITH POSITION TRACKING
// ============================================================================

export const extractAssetsWithPositions = async (
    url: string,
    outputDir: string
): Promise<ExtractedAsset[]> => {
    console.log(`[Assets] Extracting assets from ${url}...`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    const assetsDir = path.join(outputDir, 'assets');
    await ensureDir(assetsDir);

    const extractedAssets: ExtractedAsset[] = [];
    const downloadedUrls = new Set<string>();

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 300000 });

        // Scroll through page to trigger lazy loading
        await page.evaluate(async () => {
            const scrollStep = 500;
            for (let y = 0; y < document.body.scrollHeight; y += scrollStep) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 100));
            }
            window.scrollTo(0, 0);
        });

        await page.waitForTimeout(2000);

        // Extract all images WITH their positions and context
        const imageData = await page.evaluate(() => {
            const images: Array<{
                src: string;
                alt: string;
                width: number;
                height: number;
                rect: { x: number; y: number; width: number; height: number };
                isBackground: boolean;
                parentClasses: string;
                nearbyText: string;
                isLogo: boolean;
                isHero: boolean;
                isProduct: boolean;
            }> = [];

            const getNearbyText = (el: Element): string => {
                const parent = el.closest('section, article, div');
                if (!parent) return '';
                const heading = parent.querySelector('h1, h2, h3');
                return heading?.textContent?.trim().slice(0, 50) || '';
            };

            const isInHeader = (el: Element): boolean => {
                return !!el.closest('header, nav, [data-section="header"], [data-section="navigation"]');
            };

            const isInHeroArea = (el: Element, rect: DOMRect): boolean => {
                return rect.y < window.innerHeight && rect.height > 200;
            };

            const isProductImage = (el: Element): boolean => {
                return !!el.closest('.product, [data-product], .card, .item');
            };

            // Get all <img> elements
            document.querySelectorAll('img').forEach(img => {
                if (!img.src || img.src.startsWith('data:')) return;
                const rect = img.getBoundingClientRect();
                if (rect.width < 10 || rect.height < 10) return;

                // Skip tracking pixels
                if (rect.width === 1 && rect.height === 1) return;

                const classLower = (img.className + ' ' + img.parentElement?.className).toLowerCase();

                images.push({
                    src: img.src,
                    alt: img.alt || '',
                    width: img.naturalWidth || img.width || rect.width,
                    height: img.naturalHeight || img.height || rect.height,
                    rect: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y + window.scrollY),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    },
                    isBackground: false,
                    parentClasses: classLower,
                    nearbyText: getNearbyText(img),
                    isLogo: /logo/i.test(classLower + ' ' + img.alt) || isInHeader(img),
                    isHero: isInHeroArea(img, rect) && rect.width > 400,
                    isProduct: isProductImage(img)
                });
            });

            // Get background images (skip gradients)
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                const bgImage = style.backgroundImage;
                if (!bgImage || bgImage === 'none' || bgImage.includes('gradient')) return;

                const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                if (!match || !match[1] || match[1].startsWith('data:')) return;

                const rect = el.getBoundingClientRect();
                if (rect.width < 50 || rect.height < 50) return;

                const classLower = (el as HTMLElement).className?.toLowerCase() || '';

                images.push({
                    src: match[1],
                    alt: 'background',
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                    rect: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y + window.scrollY),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    },
                    isBackground: true,
                    parentClasses: classLower,
                    nearbyText: getNearbyText(el),
                    isLogo: false,
                    isHero: rect.y < window.innerHeight && rect.width > window.innerWidth * 0.8,
                    isProduct: false
                });
            });

            return images;
        });

        console.log(`[Assets] Found ${imageData.length} images`);

        // Download each image
        for (let i = 0; i < imageData.length; i++) {
            const img = imageData[i];

            if (downloadedUrls.has(img.src)) continue;
            downloadedUrls.add(img.src);

            try {
                // Get extension from URL
                const urlObj = new URL(img.src);
                let ext = path.extname(urlObj.pathname).toLowerCase();
                if (!ext || ext.length > 5) ext = '.png';

                const filename = `img-${i}${ext}`;
                const localPath = path.join(assetsDir, filename);
                const relativePath = `./assets/${filename}`;

                const response = await fetch(img.src, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; PixelGen/1.0)',
                        'Accept': 'image/*'
                    }
                });

                if (response.ok) {
                    const buffer = Buffer.from(await response.arrayBuffer());
                    await fs.writeFile(localPath, buffer);

                    // Determine role
                    let role: ExtractedAsset['role'] = undefined;
                    if (img.isLogo) role = 'logo';
                    else if (img.isHero) role = 'hero';
                    else if (img.isProduct) role = 'product';
                    else if (/avatar|user|profile|testimonial/i.test(img.parentClasses)) role = 'avatar';
                    else if (img.width < 64 && img.height < 64) role = 'icon';
                    else if (img.isBackground) role = 'background';

                    extractedAssets.push({
                        originalUrl: img.src,
                        localPath,
                        relativePath,
                        type: 'image',
                        rect: img.rect,
                        alt: img.alt,
                        isBackground: img.isBackground,
                        role
                    });

                    console.log(`[Assets] ✓ ${filename} (${role || 'general'}) at y=${img.rect.y}`);
                }
            } catch (e: any) {
                // Silent fail for individual images
            }
        }

        await fs.writeFile(
            path.join(outputDir, 'assets-manifest.json'),
            JSON.stringify(extractedAssets, null, 2)
        );

        console.log(`[Assets] Downloaded ${extractedAssets.length}/${imageData.length} assets`);
        return extractedAssets;

    } finally {
        await browser.close();
    }
};

// ============================================================================
// MAP ASSETS TO SECTIONS
// ============================================================================

export const mapAssetsToSections = (
    assets: ExtractedAsset[],
    sections: Section[]
): Map<number, ExtractedAsset[]> => {
    const mapping = new Map<number, ExtractedAsset[]>();

    for (const section of sections) {
        mapping.set(section.index, []);
    }

    for (const asset of assets) {
        let bestSection: Section | null = null;
        let bestOverlap = 0;

        for (const section of sections) {
            const assetTop = asset.rect.y;
            const assetBottom = asset.rect.y + asset.rect.height;
            const sectionTop = section.rect.y;
            const sectionBottom = section.rect.y + section.rect.height;

            const overlapTop = Math.max(assetTop, sectionTop);
            const overlapBottom = Math.min(assetBottom, sectionBottom);
            const overlap = Math.max(0, overlapBottom - overlapTop);

            // Asset belongs to section if significant overlap
            if (overlap > bestOverlap && overlap > asset.rect.height * 0.3) {
                bestOverlap = overlap;
                bestSection = section;
            }
        }

        if (bestSection) {
            asset.sectionIndex = bestSection.index;
            mapping.get(bestSection.index)!.push(asset);
        }
    }

    for (const [idx, sectionAssets] of mapping.entries()) {
        if (sectionAssets.length > 0) {
            console.log(`[Assets] Section ${idx}: ${sectionAssets.length} images`);
        }
    }

    return mapping;
};

// ============================================================================
// STEP 1: IDENTIFY SECTIONS WITH TEXT CONTENT
// ============================================================================

export const identifySections = async (url: string): Promise<Section[]> => {
    console.log(`[MultiStep] Identifying sections...`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 300000 });
        await page.waitForTimeout(2000);

        const sections = await page.evaluate(() => {
            const results: any[] = [];
            const MIN_SECTION_HEIGHT = 40;  // Reduced from 80 to catch slim headers
            const viewportWidth = window.innerWidth;

            // Selectors to find sections
            const semanticSelectors = [
                'body > header', 'body > nav', 'body > main', 'body > section',
                'body > article', 'body > aside', 'body > footer',
                'body > div > header', 'body > div > nav', 'body > div > main',
                'body > div > section', 'body > div > article', 'body > div > footer',
                '#root > header', '#root > section', '#root > footer', '#root > main',
                '#root > div > header', '#root > div > section', '#root > div > footer',
                '#app > header', '#app > section', '#app > footer',
                '#__next > header', '#__next > section', '#__next > footer',
                '#__next > main > section', '#__next > div > section',
                '[data-section]',
                // Additional header patterns
                '[class*="header"]', '[class*="navbar"]', '[class*="nav-bar"]',
                '[class*="top-bar"]', '[class*="announcement"]',
                '[id*="header"]', '[id*="navbar"]'
            ];

            const foundElements = new Set<Element>();

            for (const selector of semanticSelectors) {
                try {
                    document.querySelectorAll(selector).forEach(el => {
                        const rect = el.getBoundingClientRect();
                        if (rect.height >= MIN_SECTION_HEIGHT && rect.width > viewportWidth * 0.5) {
                            foundElements.add(el);
                        }
                    });
                } catch (e) { }
            }

            // CRITICAL: Always try to find header at top of page
            // Check for fixed/sticky elements at top
            const allElements = document.querySelectorAll('header, nav, div, section');
            Array.from(allElements).forEach(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);

                // Skip elements that are too tall (page wrappers, not headers)
                const MAX_HEADER_HEIGHT = 200;

                // Fixed or sticky elements at top are likely headers
                if ((style.position === 'fixed' || style.position === 'sticky') && rect.top <= 10) {
                    if (rect.height >= 30 && rect.height <= MAX_HEADER_HEIGHT && rect.width > viewportWidth * 0.8) {
                        foundElements.add(el);
                    }
                }

                // First element near top of page that looks like a header
                if (rect.top + window.scrollY < 150 && rect.height >= 30 && rect.height <= MAX_HEADER_HEIGHT && rect.width > viewportWidth * 0.8) {
                    // Check if it looks like a header (has logo, nav links, etc.)
                    const hasLogo = el.querySelector('img, svg, [class*="logo"]');
                    const hasNav = el.querySelector('nav, a, button');
                    if (hasLogo || hasNav) {
                        foundElements.add(el);
                    }
                }
            });

            // Fallback: direct children of containers
            if (foundElements.size < 3) {
                const containers = document.querySelectorAll('body > div, #root, #app, #__next, main');
                containers.forEach(container => {
                    Array.from(container.children).forEach(child => {
                        const rect = child.getBoundingClientRect();
                        const tag = child.tagName.toLowerCase();
                        if (['script', 'style', 'link', 'meta', 'noscript'].includes(tag)) return;
                        if (rect.height < MIN_SECTION_HEIGHT || rect.width < viewportWidth * 0.5) return;
                        if (rect.width >= viewportWidth * 0.8) foundElements.add(child);
                    });
                });
            }

            // Sort by Y position
            const sortedElements = Array.from(foundElements).sort((a, b) => {
                return (a.getBoundingClientRect().y + window.scrollY) -
                    (b.getBoundingClientRect().y + window.scrollY);
            });

            // Filter nested elements
            const filteredElements: Element[] = [];
            for (const el of sortedElements) {
                let isContained = false;
                for (const prev of filteredElements) {
                    if (prev.contains(el) && prev !== el) { isContained = true; break; }
                }
                if (!isContained) filteredElements.push(el);
            }

            // Extract detailed info
            filteredElements.forEach((el, index) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);

                // Extract text content
                const headings = Array.from(el.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent?.trim() || '').filter(Boolean);
                const paragraphs = Array.from(el.querySelectorAll('p')).slice(0, 5).map(p => p.textContent?.trim().slice(0, 200) || '').filter(Boolean);
                const buttons = Array.from(el.querySelectorAll('button, .btn, [role="button"], a.button')).map(b => b.textContent?.trim() || '').filter(Boolean);
                const links = Array.from(el.querySelectorAll('a:not(.btn):not(.button)')).slice(0, 10).map(a => a.textContent?.trim() || '').filter(Boolean);

                // Detect layout
                let layout: 'grid' | 'flex-row' | 'flex-col' | 'stack' = 'stack';
                if (style.display === 'grid') layout = 'grid';
                else if (style.display === 'flex') {
                    layout = style.flexDirection === 'row' ? 'flex-row' : 'flex-col';
                }

                results.push({
                    id: `section-${index}`,
                    index,
                    rect: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y + window.scrollY),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    },
                    tagName: el.tagName.toLowerCase(),
                    hasId: !!el.id,
                    idValue: el.id || undefined,
                    headingText: headings[0] || undefined,
                    elementCount: el.querySelectorAll('*').length,
                    imageCount: el.querySelectorAll('img').length,
                    backgroundColor: style.backgroundColor,
                    textContent: { headings, paragraphs, buttons, links },
                    layout
                });
            });

            return results;
        });

        console.log(`[MultiStep] Found ${sections.length} sections:`);
        sections.forEach((s, i) => {
            const name = s.headingText || s.idValue || `Section ${i + 1}`;
            console.log(`  ${i + 1}. ${name} (${s.tagName}): ${s.rect.height}px, ${s.elementCount} elements, ${s.imageCount} images`);
        });

        return sections;
    } finally {
        await browser.close();
    }
};

// ============================================================================
// STEP 2: CAPTURE SCREENSHOTS
// ============================================================================

export const captureSectionScreenshots = async (
    url: string,
    sections: Section[],
    outputDir: string
): Promise<Map<string, string>> => {
    console.log(`[MultiStep] Capturing screenshots...`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await ensureDir(outputDir);
    const screenshotPaths = new Map<string, string>();

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 300000 });
        await page.waitForTimeout(2000);

        const fullPath = path.join(outputDir, 'full-page.png');
        await page.screenshot({ path: fullPath, fullPage: true });

        const metadata = await sharp(fullPath).metadata();
        const pageWidth = metadata.width || 1440;
        const pageHeight = metadata.height || 10000;
        console.log(`[MultiStep] Full page: ${pageWidth}x${pageHeight}`);

        for (const section of sections) {
            const sectionPath = path.join(outputDir, `${section.id}.png`);
            try {
                const x = Math.max(0, Math.min(Math.round(section.rect.x), pageWidth - 1));
                const y = Math.max(0, Math.min(Math.round(section.rect.y), pageHeight - 1));
                const width = Math.min(Math.round(section.rect.width), pageWidth - x);
                const height = Math.min(Math.round(section.rect.height), pageHeight - y);

                if (width > 50 && height > 50) {
                    await sharp(fullPath).extract({ left: x, top: y, width, height }).toFile(sectionPath);
                    screenshotPaths.set(section.id, sectionPath);
                    console.log(`[MultiStep] ✓ ${section.id}: ${width}x${height}`);
                } else {
                    screenshotPaths.set(section.id, fullPath);
                }
            } catch (e: any) {
                console.error(`[MultiStep] ✗ ${section.id}: ${e.message}`);
                screenshotPaths.set(section.id, fullPath);
            }
        }

        return screenshotPaths;
    } finally {
        await browser.close();
    }
};

// ============================================================================
// STEP 3: GENERATE SECTIONS (IMPROVED PROMPTS)
// ============================================================================

const generateSection = async (
    section: Section,
    screenshotPath: string,
    totalSections: number,
    sectionAssets: ExtractedAsset[],
    retryCount: number = 0,
    routeMap?: Record<string, string>  // Original path → generated route
): Promise<string> => {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY required');

    const screenshotBuffer = await fs.readFile(screenshotPath);
    const screenshotBase64 = screenshotBuffer.toString('base64');

    const componentName = `Section${section.index + 1}`;
    const sectionId = section.headingText?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) ||
        `section-${section.index + 1}`;

    // Build detailed image instructions
    let imageInstructions = '';
    if (sectionAssets.length > 0) {
        imageInstructions = `
## IMAGES FOR THIS SECTION
Use these EXACT local paths (they are already downloaded):
${sectionAssets.map((a, i) => {
            const roleDesc = a.role ? ` (${a.role})` : '';
            const altDesc = a.alt && a.alt !== 'background' ? `, alt="${a.alt}"` : '';
            return `  ${i + 1}. src="${a.relativePath}"${roleDesc}${altDesc} - ${a.rect.width}x${a.rect.height}px`;
        }).join('\n')}

CRITICAL: Do NOT use placeholder URLs like placehold.co or via.placeholder.com.
Use ONLY the paths above (./assets/img-X.ext).`;
    }

    // Build text content reference
    let textContentRef = '';
    if (section.textContent.headings.length || section.textContent.paragraphs.length) {
        textContentRef = `
## TEXT CONTENT (Use EXACTLY)
${section.textContent.headings.length > 0 ? `Headings: ${section.textContent.headings.map(h => `"${h}"`).join(', ')}` : ''}
${section.textContent.paragraphs.length > 0 ? `Paragraphs: ${section.textContent.paragraphs.slice(0, 3).map(p => `"${p.slice(0, 100)}..."`).join('\n')}` : ''}
${section.textContent.buttons.length > 0 ? `Buttons: ${section.textContent.buttons.map(b => `"${b}"`).join(', ')}` : ''}`;
    }

    const prompt = `You are an expert React developer creating a PIXEL-PERFECT recreation of a website section.

## COMPONENT INFO
Name: ${componentName}
Section: ${section.index + 1} of ${totalSections}
Tag: <${section.tagName}>
${section.headingText ? `Main heading: "${section.headingText}"` : ''}
Approximate height: ${section.rect.height}px
Layout type: ${section.layout}
Background: ${section.backgroundColor || 'transparent'}
${imageInstructions}
${textContentRef}

## REQUIREMENTS (READ CAREFULLY)

### Structure
- Component must be a const arrow function
- Root element must have data-section="${sectionId}"
- Root element should be <${section.tagName}> with className="w-full"
- NO import statements (React is global)
- NO export statements
- Use React.useState for state, React.useEffect for effects

### Styling (Match Screenshot EXACTLY)
- Use Tailwind CSS classes
- Match colors EXACTLY from screenshot (use specific hex if needed via style prop)
- Match font sizes, weights, and spacing precisely
- Match padding and margins carefully
- Use correct flexbox/grid layout matching the screenshot

### Images
${sectionAssets.length > 0 ?
            '- Use the PROVIDED image paths (./assets/img-X.ext)' :
            '- Use placeholder images from https://placehold.co/WIDTHxHEIGHT only if clearly visible in screenshot'}
- Add descriptive alt text
- Use correct sizing (object-cover, object-contain as appropriate)

### Links
${routeMap && Object.keys(routeMap).length > 0 ? `
- For internal navigation, use these EXACT routes (these are the pages in this site):
${Object.entries(routeMap).map(([origPath, route]) => `  "${origPath}" → href="${route}"`).join('\n')}
- For navigation items that match the paths above, use the corresponding route
- For links to pages NOT in this list, use href="#" with a data-external attribute
` : '- Use href="#" for navigation links (they will be updated later)'}

### Text
- Copy ALL visible text EXACTLY as shown
- Don't abbreviate or summarize
- Include all list items, buttons, links

## OUTPUT FORMAT (EXACTLY)
\`\`\`jsx
const ${componentName} = () => {
  return (
    <${section.tagName} data-section="${sectionId}" className="w-full ...">
      {/* Your JSX here */}
    </${section.tagName}>
  );
};
\`\`\`

Generate the complete component now:`;

    console.log(`[MultiStep] Calling ${GEMINI_MODEL}... (${sectionAssets.length} images, attempt ${retryCount + 1})`);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { inline_data: { mime_type: 'image/png', data: screenshotBase64 } },
                            { text: prompt }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,  // Lower temperature for more consistent output
                        maxOutputTokens: 16384
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[MultiStep] API Error ${response.status}: ${errorText.slice(0, 200)}`);

            // Retry on 5xx errors
            if (response.status >= 500 && retryCount < 2) {
                console.log(`[MultiStep] Retrying after ${(retryCount + 1) * 2}s...`);
                await new Promise(r => setTimeout(r, (retryCount + 1) * 2000));
                return generateSection(section, screenshotPath, totalSections, sectionAssets, retryCount + 1, routeMap);
            }

            return generatePlaceholder(section, componentName, sectionId);
        }

        const data = await response.json();

        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
            console.warn(`[MultiStep] Safety filter triggered`);
            return generatePlaceholder(section, componentName, sectionId);
        }

        let code = '';
        if (data.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.text) code += part.text;
            }
        }

        if (!code || code.length < 50) {
            console.warn(`[MultiStep] Empty response`);
            return generatePlaceholder(section, componentName, sectionId);
        }

        // Clean the code
        code = cleanGeneratedCode(code, componentName);

        // Validate the code has required structure
        if (!code.includes(`const ${componentName}`) || !code.includes('return')) {
            console.warn(`[MultiStep] Invalid code structure, retrying...`);
            if (retryCount < 1) {
                await new Promise(r => setTimeout(r, 1000));
                return generateSection(section, screenshotPath, totalSections, sectionAssets, retryCount + 1, routeMap);
            }
            return generatePlaceholder(section, componentName, sectionId);
        }

        console.log(`[MultiStep] ✓ ${section.id}: ${code.length} chars`);
        return code;

    } catch (e: any) {
        console.error(`[MultiStep] Error: ${e.message}`);
        if (retryCount < 2) {
            await new Promise(r => setTimeout(r, 2000));
            return generateSection(section, screenshotPath, totalSections, sectionAssets, retryCount + 1, routeMap);
        }
        return generatePlaceholder(section, componentName, sectionId);
    }
};

const cleanGeneratedCode = (code: string, componentName: string): string => {
    // Remove markdown wrappers
    code = code
        .replace(/```(?:jsx?|tsx?|javascript|typescript)?\n?/gi, '')
        .replace(/```\s*$/g, '')
        .trim();

    // CRITICAL FIX: Remove LLM preamble text before actual code
    const constIndex = code.search(/const\s+\w+\s*=\s*\(/);
    if (constIndex > 0) {
        console.log(`[MultiStep] Removed ${constIndex} chars of preamble text`);
        code = code.slice(constIndex);
    }

    // Remove import statements
    code = code.replace(/^import\s+.*?['"]\s*;?\s*$/gm, '');

    // Remove export statements
    code = code.replace(/^export\s+(default\s+)?/gm, '');
    code = code.replace(/export\s+default\s+\w+\s*;?\s*$/gm, '');

    // Fix component name if needed
    if (!code.includes(`const ${componentName}`)) {
        const constMatch = code.match(/const\s+(\w+)\s*=\s*\(\)/);
        if (constMatch) {
            code = code.replace(constMatch[0], `const ${componentName} = ()`);
        }
    }

    return code.trim();
};

const generatePlaceholder = (section: Section, componentName: string, sectionId: string): string => {
    const bgColor = section.backgroundColor || 'rgb(249, 250, 251)';
    const height = Math.min(section.rect.height, 600);

    return `const ${componentName} = () => {
  return (
    <${section.tagName} 
      data-section="${sectionId}" 
      className="w-full flex items-center justify-center p-8"
      style={{ minHeight: '${height}px', backgroundColor: '${bgColor}' }}
    >
      <div className="text-center max-w-2xl">
        ${section.headingText ? `<h2 className="text-3xl font-bold text-gray-800 mb-4">${section.headingText}</h2>` : ''}
        <p className="text-gray-600">Section ${section.index + 1} - ${section.elementCount} elements</p>
        ${section.textContent.paragraphs[0] ? `<p className="text-gray-500 mt-4">${section.textContent.paragraphs[0].slice(0, 150)}...</p>` : ''}
      </div>
    </${section.tagName}>
  );
};`;
};

// ============================================================================
// STEP 4: COMBINE SECTIONS
// ============================================================================

const combineIntoApp = (generatedSections: GeneratedSection[]): string => {
    const componentCodes: string[] = [];
    const componentNames: string[] = [];

    for (const section of generatedSections) {
        if (!section.code || section.code.length < 50) continue;

        const expectedName = `Section${section.index + 1}`;
        let code = section.code;

        // Clean up any remaining issues
        code = code.replace(/^import\s+.*$/gm, '');
        code = code.replace(/^export\s+.*$/gm, '');
        code = code.replace(/export\s+default\s+\w+;?\s*$/g, '');

        // Ensure proper naming
        if (!code.includes(`const ${expectedName}`)) {
            code = code.replace(/const\s+\w+\s*=\s*\(\s*\)\s*=>/, `const ${expectedName} = () =>`);
            code = code.replace(/const\s+\w+\s*=\s*\(\s*\)\s*{/, `const ${expectedName} = () => {`);
        }

        componentCodes.push(`// ========== SECTION ${section.index + 1} ==========\n${code.trim()}`);
        componentNames.push(expectedName);
    }

    if (componentCodes.length === 0) {
        return `const App = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500">No sections generated</p>
    </div>
  );
};`;
    }

    return `// Generated by PixelGen v2 - Multi-Step Generator
// For browser use with CDN React + Babel

${componentCodes.join('\n\n')}

// ========== MAIN APP ==========
const App = () => {
  return (
    <div className="min-h-screen">
${componentNames.map(name => `      <${name} />`).join('\n')}
    </div>
  );
};`;
};

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export interface MultiStepGenerationOptions {
    baseUrl: string;
    maxSections?: number;
    delayBetweenSections?: number;
    extractAssets?: boolean;
    routeMap?: Record<string, string>;  // Original path → route for link generation
}

export interface MultiStepGenerationResult {
    success: boolean;
    siteDir: string;
    localUrl: string;
    entryPath: string;
    sectionsGenerated: number;
    totalSections: number;
    assets: ExtractedAsset[];
}

export const generateWithMultiStep = async (
    options: MultiStepGenerationOptions
): Promise<MultiStepGenerationResult> => {
    const {
        baseUrl,
        maxSections = 15,
        delayBetweenSections = 1500,
        extractAssets: shouldExtractAssets = true,
        routeMap
    } = options;

    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is required');
    }

    const jobId = timestampId();
    const runDir = path.join(config.outputDir, 'pixelgen-v2', jobId);
    await ensureDir(runDir);

    console.log(`\n[MultiStep] ════════════════════════════════════════════`);
    console.log(`[MultiStep] Model: ${GEMINI_MODEL}`);
    console.log(`[MultiStep] URL: ${baseUrl}`);
    console.log(`[MultiStep] Output: ${runDir}`);
    console.log(`[MultiStep] ════════════════════════════════════════════\n`);

    // STEP 0: Extract Assets
    let assets: ExtractedAsset[] = [];
    if (shouldExtractAssets) {
        console.log('[MultiStep] STEP 0: Extracting assets...\n');
        try {
            assets = await extractAssetsWithPositions(baseUrl, runDir);
        } catch (e: any) {
            console.warn(`[MultiStep] Asset extraction failed: ${e.message}`);
        }
    }

    // STEP 1: Identify Sections
    console.log('\n[MultiStep] STEP 1: Identifying sections...\n');
    let sections = await identifySections(baseUrl);

    if (sections.length === 0) {
        sections = [{
            id: 'section-0', index: 0,
            rect: { x: 0, y: 0, width: 1440, height: 2000 },
            tagName: 'div', hasId: false, elementCount: 100, imageCount: 10,
            textContent: { headings: [], paragraphs: [], buttons: [], links: [] },
            layout: 'stack'
        }];
    }

    const sectionsToGenerate = sections.slice(0, maxSections);
    console.log(`\n[MultiStep] Will generate ${sectionsToGenerate.length} sections\n`);

    // Map assets to sections
    console.log('[MultiStep] Mapping assets to sections...\n');
    const assetMapping = mapAssetsToSections(assets, sectionsToGenerate);

    // STEP 2: Capture Screenshots
    console.log('\n[MultiStep] STEP 2: Capturing screenshots...\n');
    const screenshotsDir = path.join(runDir, 'screenshots');
    const screenshotPaths = await captureSectionScreenshots(baseUrl, sectionsToGenerate, screenshotsDir);

    // STEP 3: Generate Sections
    console.log('\n[MultiStep] STEP 3: Generating sections...\n');
    const generatedSections: GeneratedSection[] = [];

    for (let i = 0; i < sectionsToGenerate.length; i++) {
        const section = sectionsToGenerate[i];
        const screenshotPath = screenshotPaths.get(section.id);
        const sectionAssets = assetMapping.get(section.index) || [];

        if (!screenshotPath) continue;

        const name = section.headingText || `Section ${i + 1}`;
        console.log(`\n[MultiStep] ─── ${i + 1}/${sectionsToGenerate.length}: ${name} ───`);

        const code = await generateSection(section, screenshotPath, sectionsToGenerate.length, sectionAssets, 0, routeMap);

        generatedSections.push({
            id: section.id,
            index: section.index,
            code,
            success: code.length > 100 && code.includes('return') && code.includes('data-section')
        });

        await fs.writeFile(path.join(runDir, `${section.id}.jsx`), code);

        if (i < sectionsToGenerate.length - 1) {
            console.log(`[MultiStep] Waiting ${delayBetweenSections}ms...`);
            await new Promise(r => setTimeout(r, delayBetweenSections));
        }
    }

    // STEP 4: Combine
    console.log('\n[MultiStep] STEP 4: Combining sections...\n');
    const appCode = combineIntoApp(generatedSections);

    // STEP 5: Create Bundle
    console.log('[MultiStep] STEP 5: Creating site bundle...\n');
    const siteDir = path.join(runDir, 'site');
    await ensureDir(siteDir);

    // Copy assets
    if (assets.length > 0) {
        const siteAssetsDir = path.join(siteDir, 'assets');
        await ensureDir(siteAssetsDir);
        for (const asset of assets) {
            try {
                const destPath = path.join(siteDir, asset.relativePath);
                await fs.copyFile(asset.localPath, destPath);
            } catch (e) { }
        }
    }

    await fs.writeFile(path.join(siteDir, 'App.js'), appCode);

    // Create index.html with inline App.js
    await fs.writeFile(path.join(siteDir, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Site</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="stylesheet" href="overrides.css">
    <style>
        body { margin: 0; padding: 0; }
        #root { min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
${appCode}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
</body>
</html>`);

    await fs.writeFile(path.join(siteDir, 'overrides.css'), '/* CSS Overrides */\n');
    await fs.writeFile(path.join(siteDir, 'bundle.json'), JSON.stringify({
        files: [{ path: 'App.js', content: appCode }],
        entry: 'App.js'
    }, null, 2));

    const successCount = generatedSections.filter(s => s.success).length;
    const localUrl = `http://localhost:${process.env.PORT || 3000}/${siteDir}/index.html`;

    console.log(`[MultiStep] ════════════════════════════════════════════`);
    console.log(`[MultiStep] COMPLETE: ${successCount}/${sectionsToGenerate.length} sections`);
    console.log(`[MultiStep] Assets: ${assets.length}`);
    console.log(`[MultiStep] URL: ${localUrl}`);
    console.log(`[MultiStep] ════════════════════════════════════════════\n`);

    return {
        success: successCount > 0,
        siteDir: runDir,
        localUrl,
        entryPath: path.join(siteDir, 'index.html'),
        sectionsGenerated: successCount,
        totalSections: sectionsToGenerate.length,
        assets
    };
};