
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

interface FreezeResult {
    frozenHtml: string;
    baseCss: string;
    overridesPath: string;
    cssPath: string;
}

/**
 * Freeze the HTML structure after initial generation.
 * 
 * 1. Extract all inline styles into a CSS file
 * 2. Add data-section attributes for stable selectors
 * 3. Add overrides.css link
 * 4. Make HTML read-only for subsequent iterations
 */
export const freezeStructure = async (siteDir: string): Promise<FreezeResult> => {
    const htmlPath = path.join(siteDir, 'site', 'index.html');
    const cssPath = path.join(siteDir, 'site', 'base.css');
    const overridesPath = path.join(siteDir, 'site', 'overrides.css');

    const html = await fs.readFile(htmlPath, 'utf-8');
    const $ = cheerio.load(html);

    // 1. Extract inline styles
    const extractedStyles: string[] = [];
    let styleIndex = 0;

    $('[style]').each((_, el) => {
        const $el = $(el);
        const style = $el.attr('style');
        if (style) {
            // Generate a unique class for this element
            const className = `_extracted_${styleIndex++}`;
            $el.addClass(className);
            $el.removeAttr('style');

            extractedStyles.push(`.${className} { ${style} }`);
        }
    });

    // 2. Add data-section attributes to semantic elements
    let sectionIndex = 0;
    $('header, nav, main, section, article, aside, footer').each((_, el) => {
        const $el = $(el);
        if (!$el.attr('data-section')) {
            // Try to infer a name from heading or class
            const heading = $el.find('h1, h2, h3').first().text().trim().slice(0, 30);
            const className = ($el.attr('class') || '').split(' ')[0];
            const tagName = (el as any).tagName.toLowerCase();

            const name = heading || className || `${tagName}-${sectionIndex++}`;
            $el.attr('data-section', name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase());
        }
    });

    // 3. Add CSS links in head
    const hasExtractedLink = $('link[href*="base.css"]').length > 0;
    const hasOverridesLink = $('link[href*="overrides.css"]').length > 0;

    if (!hasExtractedLink && extractedStyles.length > 0) {
        $('head').append('<link rel="stylesheet" href="./base.css">');
    }

    if (!hasOverridesLink) {
        $('head').append('<link rel="stylesheet" href="./overrides.css">');
    }

    // 4. Save files
    const frozenHtml = $.html();
    await fs.writeFile(htmlPath, frozenHtml);

    const baseCss = extractedStyles.join('\n\n');
    if (baseCss) {
        await fs.writeFile(cssPath, baseCss);
    }

    // Create empty overrides file
    await fs.writeFile(overridesPath, '/* CSS Overrides - managed by PixelGen */\n');

    // 5. Create structure lock file
    const structureLock = {
        frozenAt: new Date().toISOString(),
        sections: [] as string[]
    };

    $('[data-section]').each((_, el) => {
        structureLock.sections.push($(el).attr('data-section') || '');
    });

    await fs.writeFile(
        path.join(siteDir, 'structure-lock.json'),
        JSON.stringify(structureLock, null, 2)
    );

    return {
        frozenHtml,
        baseCss,
        overridesPath,
        cssPath
    };
};

/**
 * Verify that HTML structure hasn't changed since freeze.
 */
export const verifyStructure = async (siteDir: string): Promise<boolean> => {
    const lockPath = path.join(siteDir, 'structure-lock.json');
    const htmlPath = path.join(siteDir, 'site', 'index.html');

    try {
        const lock = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
        const html = await fs.readFile(htmlPath, 'utf-8');
        const $ = cheerio.load(html);

        const currentSections: string[] = [];
        $('[data-section]').each((_, el) => {
            currentSections.push($(el).attr('data-section') || '');
        });

        return JSON.stringify(lock.sections) === JSON.stringify(currentSections);
    } catch {
        return false;
    }
};
