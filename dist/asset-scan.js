"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectCspForAssets = exports.injectAssetsIntoHtml = exports.scanBaseAssets = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const playwright_1 = require("playwright");
const utils_1 = require("./utils");
const config_1 = require("./config");
const hash = (input) => crypto_1.default.createHash('sha1').update(input).digest('hex').slice(0, 10);
const guessExtFromContentType = (ct) => {
    if (!ct)
        return '';
    if (ct.includes('font/woff2'))
        return '.woff2';
    if (ct.includes('font/woff'))
        return '.woff';
    if (ct.includes('font/ttf'))
        return '.ttf';
    if (ct.includes('font/otf'))
        return '.otf';
    if (ct.includes('image/png'))
        return '.png';
    if (ct.includes('image/jpeg'))
        return '.jpg';
    if (ct.includes('image/jpg'))
        return '.jpg';
    if (ct.includes('image/gif'))
        return '.gif';
    if (ct.includes('image/webp'))
        return '.webp';
    if (ct.includes('image/svg'))
        return '.svg';
    if (ct.includes('image/x-icon') || ct.includes('image/vnd.microsoft.icon'))
        return '.ico';
    if (ct.includes('text/css'))
        return '.css';
    return '';
};
const extFromUrl = (url) => {
    try {
        const u = new URL(url);
        const pathname = u.pathname;
        const m = pathname.match(/\.([a-zA-Z0-9]+)$/);
        return m ? `.${m[1]}` : '';
    }
    catch {
        const m = url.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
        return m ? `.${m[1]}` : '';
    }
};
const safeWrite = async (filePath, data) => {
    await (0, utils_1.ensureDir)(path_1.default.dirname(filePath));
    await promises_1.default.writeFile(filePath, data);
};
const scrollFullPage = async (page, viewportHeight) => {
    const step = Math.max(300, viewportHeight - 200);
    const delayMs = 200;
    const maxSteps = 50;
    await page.evaluate(async ({ step, delayMs, maxSteps }) => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        let steps = 0;
        while (steps < maxSteps) {
            const { scrollY, innerHeight } = window;
            const next = Math.min(scrollY + step, document.body.scrollHeight - innerHeight);
            window.scrollTo(0, next);
            steps += 1;
            await sleep(delayMs);
            const reachedBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight;
            if (reachedBottom)
                break;
        }
    }, { step, delayMs, maxSteps });
    await page.evaluate(() => window.scrollTo(0, 0));
};
const scanBaseAssets = async (baseUrl, outDir, options) => {
    const assetsDir = path_1.default.join(outDir, 'assets');
    const fontsDir = path_1.default.join(assetsDir, 'fonts');
    const imagesDir = path_1.default.join(assetsDir, 'images');
    await (0, utils_1.ensureDir)(fontsDir);
    await (0, utils_1.ensureDir)(imagesDir);
    const fontUrlToLocal = new Map();
    const imageUrlToLocal = new Map();
    const cssTexts = [];
    const capturedFonts = [];
    const capturedImages = [];
    const cssSeen = [];
    const browser = await playwright_1.chromium.launch({ headless: options?.headless ?? config_1.config.headless });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const handleResponse = async (response) => {
        try {
            const url = response.url();
            const status = response.status();
            if (status < 200 || status >= 400)
                return;
            const headers = response.headers();
            const ct = headers['content-type'] || headers['Content-Type'] || '';
            // Capture CSS text for @font-face extraction
            if (ct.includes('text/css')) {
                let text = '';
                try {
                    text = await response.text();
                }
                catch { }
                if (text && /@font-face/i.test(text)) {
                    cssTexts.push({ url, text });
                    cssSeen.push({ url, captured: true });
                }
                else {
                    cssSeen.push({ url, captured: false });
                }
                return;
            }
            // Capture fonts
            if (ct.includes('font') || /\.(woff2?|ttf|otf)(?:[?#].*)?$/i.test(url)) {
                try {
                    const buf = await response.body();
                    const guessedExt = guessExtFromContentType(ct) || extFromUrl(url) || '.woff2';
                    const fileName = `${hash(url)}${guessedExt}`;
                    const localPath = path_1.default.join('assets', 'fonts', fileName);
                    await safeWrite(path_1.default.join(outDir, localPath), buf);
                    fontUrlToLocal.set(url, localPath);
                    capturedFonts.push({ url, localPath, contentType: ct, bytes: buf.length });
                }
                catch { }
                return;
            }
            // Capture images
            if (ct.includes('image') || /\.(png|jpe?g|gif|webp|svg|ico)(?:[?#].*)?$/i.test(url)) {
                try {
                    const buf = await response.body();
                    const guessedExt = guessExtFromContentType(ct) || extFromUrl(url) || '.png';
                    const fileName = `${hash(url)}${guessedExt}`;
                    const localPath = path_1.default.join('assets', 'images', fileName);
                    await safeWrite(path_1.default.join(outDir, localPath), buf);
                    imageUrlToLocal.set(url, localPath);
                    capturedImages.push({ url, localPath, contentType: ct, bytes: buf.length });
                }
                catch { }
                return;
            }
        }
        catch { }
    };
    page.on('response', handleResponse);
    const navTimeout = config_1.config.navigationTimeoutMs > 0 ? config_1.config.navigationTimeoutMs : undefined;
    await page.goto(baseUrl, { waitUntil: config_1.config.waitUntil, timeout: navTimeout });
    if (options?.fullPage ?? config_1.config.fullPage) {
        // Use a default desktop height for scroll trigger; viewport is default
        await scrollFullPage(page, 720);
    }
    if (config_1.config.postLoadWaitMs > 0) {
        await page.waitForTimeout(config_1.config.postLoadWaitMs);
    }
    // Extract typography from DOM
    const typography = await page.evaluate(() => {
        const selectors = ['body', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const result = {};
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                const cs = window.getComputedStyle(el);
                result[sel] = {
                    'font-family': cs.getPropertyValue('font-family'),
                    'font-size': cs.getPropertyValue('font-size'),
                    'font-weight': cs.getPropertyValue('font-weight'),
                    'line-height': cs.getPropertyValue('line-height'),
                    'letter-spacing': cs.getPropertyValue('letter-spacing'),
                    'color': cs.getPropertyValue('color'),
                    'background-color': cs.getPropertyValue('background-color'),
                };
            }
        }
        // Extract likely logo via <img alt*="logo"> or URL contains 'logo'
        const images = Array.from(document.images).map((img) => ({
            src: img.currentSrc || img.src || '',
            alt: img.alt || '',
            width: img.naturalWidth || img.width || 0,
            height: img.naturalHeight || img.height || 0,
            rect: img.getBoundingClientRect(),
        }));
        const logoCandidate = images.find((i) => /logo/i.test(i.alt) || /logo/i.test(i.src));
        // Favicon via link rel
        const iconHref = document.querySelector('link[rel~="icon" i]')?.href || '';
        // Background images (top sections only to limit size)
        const bgNodes = Array.from(document.querySelectorAll('header, nav, main, section, footer, .hero, .banner, .testimonials, .products, .gallery, .features')).slice(0, 40);
        const bgImages = [];
        for (const node of bgNodes) {
            const cs = window.getComputedStyle(node);
            const bg = cs.getPropertyValue('background-image');
            const urls = (bg.match(/url\(([^)]+)\)/g) || []).map((m) => m.replace(/^url\((.*)\)$/, '$1').replace(/^["']|["']$/g, ''));
            for (const u of urls) {
                bgImages.push({ url: u, rect: node.getBoundingClientRect() });
            }
        }
        // Sections extraction with heuristics
        const sectionNodes = Array.from(new Set([
            ...Array.from(document.querySelectorAll('header, nav, main > section, section, footer')),
            ...Array.from(document.querySelectorAll('[data-section], [role=banner], [role=navigation], [role=main], [role=contentinfo], [role=region]')),
            ...Array.from(document.querySelectorAll('.hero, .banner, .testimonials, .products, .gallery, .features'))
        ]));
        const nameFromEl = (el) => {
            const dataName = el.getAttribute('data-section') || el.getAttribute('data-section-name');
            if (dataName)
                return dataName;
            const aria = el.getAttribute('aria-label');
            if (aria)
                return aria;
            const h = el.querySelector('h1, h2, h3');
            if (h && h.textContent)
                return h.textContent.trim().slice(0, 60);
            const cls = (el.className || '').toString();
            if (/hero|banner/i.test(cls))
                return 'Hero';
            if (/testimonials?/i.test(cls))
                return 'Testimonials';
            if (/products?|shop|catalog/i.test(cls))
                return 'Products';
            if (/features?/i.test(cls))
                return 'Features';
            if (/gallery|images?/i.test(cls))
                return 'Gallery';
            const tag = el.tagName.toLowerCase();
            if (tag === 'header')
                return 'Header';
            if (tag === 'nav')
                return 'Navigation';
            if (tag === 'footer')
                return 'Footer';
            return tag;
        };
        const selectorFor = (el) => {
            let s = el.tagName.toLowerCase();
            const cls = (el.className || '').toString().trim();
            if (cls)
                s += '.' + cls.split(/\s+/).slice(0, 2).join('.');
            return s;
        };
        const sections = sectionNodes.map((el) => ({
            name: nameFromEl(el),
            selector: selectorFor(el),
            rect: el.getBoundingClientRect(),
            heading: (el.querySelector('h1, h2, h3')?.textContent || '').trim().slice(0, 60)
        }));
        // Map images to nearest section by containment of center point
        const sectionMappings = sections.map((sec) => ({ name: sec.name, selector: sec.selector, heading: sec.heading, images: [] }));
        const contains = (r, x, y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        for (const img of images) {
            const cx = img.rect.left + img.rect.width / 2;
            const cy = img.rect.top + img.rect.height / 2;
            let idx = sections.findIndex(sec => contains(sec.rect, cx, cy));
            if (idx === -1) {
                // fallback to nearest by vertical distance
                let best = -1;
                let bestDist = Infinity;
                sections.forEach((sec, i) => {
                    const dy = Math.max(0, sec.rect.top - cy, cy - sec.rect.bottom);
                    if (dy < bestDist) {
                        bestDist = dy;
                        best = i;
                    }
                });
                idx = best;
            }
            if (idx >= 0) {
                sectionMappings[idx].images.push({ kind: 'img', url: img.src, alt: img.alt, width: img.width, height: img.height });
            }
        }
        for (const b of bgImages) {
            // Assign background images to the section that owns that rect
            const idx = sections.findIndex(sec => sec.rect.left === b.rect.left && sec.rect.top === b.rect.top && sec.rect.width === b.rect.width && sec.rect.height === b.rect.height);
            if (idx >= 0) {
                sectionMappings[idx].images.push({ kind: 'background', url: b.url });
            }
        }
        // Collect candidate palette from a set of elements
        const colorSelectors = ['body', 'header', 'main', 'footer', 'section', 'h1', 'h2', 'h3', 'p', 'a', 'button'];
        const colors = new Set();
        const backgrounds = new Set();
        for (const sel of colorSelectors) {
            const els = Array.from(document.querySelectorAll(sel));
            for (const el of els.slice(0, 50)) {
                const cs = window.getComputedStyle(el);
                colors.add(cs.getPropertyValue('color'));
                backgrounds.add(cs.getPropertyValue('background-color'));
            }
        }
        return {
            result,
            logoSrc: logoCandidate?.src || '',
            iconHref,
            images: images.map(i => ({ src: i.src, alt: i.alt, width: i.width, height: i.height, rect: { x: i.rect.x, y: i.rect.y, width: i.rect.width, height: i.rect.height } })),
            bgImages: bgImages.map(b => ({ url: b.url, rect: { x: b.rect.x, y: b.rect.y, width: b.rect.width, height: b.rect.height } })),
            palette: { colors: Array.from(colors), backgrounds: Array.from(backgrounds) },
            sections,
            sectionMappings
        };
    });
    await context.close();
    await browser.close();
    // Build fonts.css from captured CSS @font-face rules, rewriting urls()
    const fontFaceBlocks = [];
    for (const { url, text } of cssTexts) {
        const blocks = Array.from(text.matchAll(/@font-face\s*{[^}]*}/gims)).map((m) => m[0]);
        for (const block of blocks) {
            // Replace url(...) to local if captured
            const rewritten = block.replace(/url\(([^)]+)\)/g, (m, g1) => {
                let raw = String(g1).trim();
                if (raw.startsWith('\"') || raw.startsWith("'"))
                    raw = raw.slice(1, -1);
                const local = fontUrlToLocal.get(raw) || fontUrlToLocal.get(tryResolveProtocolRelative(raw, url));
                if (local)
                    return `url('./${local.replace(/\\/g, '/')}')`;
                return m; // keep remote
            });
            fontFaceBlocks.push(rewritten);
        }
    }
    const fontsCss = dedupeCss(fontFaceBlocks).join('\n\n');
    const fontsCssPath = path_1.default.join(outDir, 'fonts.css');
    await safeWrite(fontsCssPath, fontsCss);
    // Build typography.css from computed styles
    const typographyLines = [];
    const typSample = typography.result || {};
    for (const sel of Object.keys(typSample)) {
        const props = typSample[sel];
        const body = Object.entries(props)
            .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
            .map(([k, v]) => `  ${k}: ${v};`)
            .join('\n');
        if (body) {
            typographyLines.push(`${sel} {\n${body}\n}`);
        }
    }
    const typographyCss = typographyLines.join('\n\n');
    const typographyCssPath = path_1.default.join(outDir, 'typography.css');
    await safeWrite(typographyCssPath, typographyCss);
    // Build manifest for images to help consumers pick candidates
    let logoCandidate;
    if (typography.logoSrc) {
        const mapped = imageUrlToLocal.get(typography.logoSrc);
        if (mapped)
            logoCandidate = mapped;
    }
    let faviconCandidate;
    if (typography.iconHref) {
        const mapped = imageUrlToLocal.get(typography.iconHref);
        if (mapped)
            faviconCandidate = mapped;
    }
    if (!faviconCandidate) {
        // Guess common favicons
        for (const it of capturedImages) {
            if (/(favicon\.ico|\/favicon)/i.test(it.url) || it.contentType?.includes('icon')) {
                faviconCandidate = it.localPath;
                break;
            }
        }
    }
    // Determine hero candidate: largest prominent image near top (exclude logo)
    let heroCandidate;
    const imageHints = [];
    if (Array.isArray(typography.images)) {
        const scored = typography.images.map((i) => {
            const score = (i.width * i.height) - (i.y * 10); // favor large and higher on page
            return { ...i, score };
        }).sort((a, b) => b.score - a.score);
        for (const img of scored) {
            const mapped = imageUrlToLocal.get(img.src);
            imageHints.push({ localPath: mapped, url: img.src, alt: img.alt, width: img.width, height: img.height, x: img.rect?.x ?? 0, y: img.rect?.y ?? 0 });
            if (!heroCandidate && mapped && (!logoCandidate || mapped !== logoCandidate)) {
                // Heuristic: first big non-logo image
                heroCandidate = mapped;
            }
        }
    }
    const palette = typography.palette;
    const fontFamiliesSet = new Set();
    const typ = typography.result || {};
    for (const sel of Object.keys(typ)) {
        const ff = typ[sel]['font-family'];
        if (ff) {
            ff.split(',').map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')).forEach(t => { if (t)
                fontFamiliesSet.add(t); });
        }
    }
    const manifest = {
        baseUrl,
        fonts: capturedFonts,
        images: capturedImages,
        logoCandidate,
        faviconCandidate,
        heroCandidate,
        palette,
        fontFamilies: Array.from(fontFamiliesSet),
        imageHints,
        sectionMappings: (typography.sectionMappings || []),
        cssSources: cssSeen,
    };
    const manifestPath = path_1.default.join(outDir, 'assets-manifest.json');
    await safeWrite(manifestPath, JSON.stringify(manifest, null, 2));
    return {
        outDir,
        fontsCssPath,
        typographyCssPath,
        assets: { fonts: capturedFonts, images: capturedImages, css: cssSeen },
        manifestPath,
        logoCandidate,
        faviconCandidate,
        heroCandidate,
        palette,
        fontFamilies: Array.from(fontFamiliesSet),
        imageHints,
        typographySample: typSample,
        sectionHints: (typography.sectionMappings || []).map((s) => ({
            name: s.name,
            selector: s.selector,
            heading: s.heading,
            images: (s.images || []).map((im) => ({
                kind: im.kind,
                url: im.url,
                localPath: imageUrlToLocal.get(im.url),
                alt: im.alt,
                width: im.width,
                height: im.height,
            }))
        })),
    };
};
exports.scanBaseAssets = scanBaseAssets;
const tryResolveProtocolRelative = (url, baseCssUrl) => {
    if (url.startsWith('//')) {
        try {
            const b = new URL(baseCssUrl);
            return `${b.protocol}${url}`;
        }
        catch {
            return `https:${url}`;
        }
    }
    return url;
};
const dedupeCss = (blocks) => {
    const seen = new Set();
    const out = [];
    for (const b of blocks) {
        const key = b.replace(/\s+/g, ' ').trim();
        if (!seen.has(key)) {
            seen.add(key);
            out.push(b);
        }
    }
    return out;
};
const injectAssetsIntoHtml = async (entryHtmlPath, siteDir, scan) => {
    const html = await promises_1.default.readFile(entryHtmlPath, 'utf8');
    const headEndIdx = html.indexOf('</head>');
    const injectionId = 'data-injected-by="checker-asset-scan"';
    const hasInjection = html.includes(injectionId);
    const hasIcon = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i.test(html);
    // Copy CSS files to site root
    const siteFontsCss = path_1.default.join(siteDir, 'fonts.css');
    const siteTypoCss = path_1.default.join(siteDir, 'typography.css');
    await promises_1.default.copyFile(scan.fontsCssPath, siteFontsCss).catch(async () => {
        await (0, utils_1.ensureDir)(path_1.default.dirname(siteFontsCss));
        await promises_1.default.copyFile(scan.fontsCssPath, siteFontsCss);
    });
    await promises_1.default.copyFile(scan.typographyCssPath, siteTypoCss).catch(async () => {
        await (0, utils_1.ensureDir)(path_1.default.dirname(siteTypoCss));
        await promises_1.default.copyFile(scan.typographyCssPath, siteTypoCss);
    });
    // Copy assets directory (fonts/images)
    const copyDir = async (from, to) => {
        await (0, utils_1.ensureDir)(to);
        const entries = await promises_1.default.readdir(from, { withFileTypes: true });
        for (const e of entries) {
            const src = path_1.default.join(from, e.name);
            const dst = path_1.default.join(to, e.name);
            if (e.isDirectory()) {
                await copyDir(src, dst);
            }
            else if (e.isFile()) {
                await promises_1.default.copyFile(src, dst).catch(async () => {
                    await (0, utils_1.ensureDir)(path_1.default.dirname(dst));
                    await promises_1.default.copyFile(src, dst);
                });
            }
        }
    };
    await copyDir(path_1.default.join(scan.outDir, 'assets'), path_1.default.join(siteDir, 'assets'));
    if (hasInjection) {
        // Already injected in a previous iteration; nothing else to do
        return;
    }
    // Preload captured fonts (woff2 preferred)
    const preloadLines = [];
    for (const f of scan.assets.fonts) {
        const ext = path_1.default.extname(f.localPath).toLowerCase();
        const as = 'font';
        let type = '';
        if (ext === '.woff2')
            type = 'font/woff2';
        else if (ext === '.woff')
            type = 'font/woff';
        else if (ext === '.ttf')
            type = 'font/ttf';
        else if (ext === '.otf')
            type = 'font/otf';
        const href = `./${f.localPath.replace(/\\/g, '/')}`;
        preloadLines.push(`<link ${injectionId} rel="preload" href="${href}" as="${as}"${type ? ` type=\"${type}\"` : ''} crossorigin>`);
    }
    const linkLines = [
        `<link ${injectionId} rel=\"stylesheet\" href=\"./fonts.css\">`,
        `<link ${injectionId} rel=\"stylesheet\" href=\"./typography.css\">`,
        ...preloadLines,
    ];
    // Add favicon link if not originally present and we discovered one
    if (!hasIcon && scan.faviconCandidate) {
        const href = `./${scan.faviconCandidate.replace(/\\/g, '/')}`;
        linkLines.push(`<link ${injectionId} rel=\"icon\" href=\"${href}\">`);
    }
    const injection = linkLines.join('\n    ');
    const newHtml = headEndIdx >= 0
        ? `${html.slice(0, headEndIdx)}    ${injection}\n${html.slice(headEndIdx)}`
        : `${injection}\n${html}`;
    await promises_1.default.writeFile(entryHtmlPath, newHtml, 'utf8');
};
exports.injectAssetsIntoHtml = injectAssetsIntoHtml;
const injectCspForAssets = async (entryHtmlPath) => {
    const html = await promises_1.default.readFile(entryHtmlPath, 'utf8');
    const headEndIdx = html.indexOf('</head>');
    const cspId = 'data-injected-by="checker-asset-csp"';
    if (html.includes(cspId))
        return;
    const tag = `<meta ${cspId} http-equiv="Content-Security-Policy" content="img-src 'self' data: blob:; font-src 'self' data:;">`;
    const out = headEndIdx >= 0 ? `${html.slice(0, headEndIdx)}  ${tag}\n${html.slice(headEndIdx)}` : `${tag}\n${html}`;
    await promises_1.default.writeFile(entryHtmlPath, out, 'utf8');
};
exports.injectCspForAssets = injectCspForAssets;
