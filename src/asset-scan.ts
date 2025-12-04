import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { chromium, Browser, BrowserContext, Page, Response } from 'playwright';
import { ensureDir } from './utils';
import { config as envConfig } from './config';

export type AssetScanResult = {
  outDir: string;
  fontsCssPath: string;
  typographyCssPath: string;
  assets: {
    fonts: Array<{ url: string; localPath: string; contentType?: string; bytes: number }>;
    images: Array<{ url: string; localPath: string; contentType?: string; bytes: number }>;
    css: Array<{ url: string; captured: boolean }>;
  };
  manifestPath: string;
  logoCandidate?: string;
  faviconCandidate?: string;
  heroCandidate?: string;
  palette?: {
    colors: string[];
    backgrounds: string[];
  };
  fontFamilies?: string[];
  imageHints?: Array<{ localPath?: string; url: string; alt: string; width: number; height: number; x: number; y: number }>;
  typographySample?: Record<string, Record<string, string>>;
  sectionHints?: Array<{
    name: string;
    selector?: string;
    heading?: string;
    images: Array<{ kind: 'img' | 'background'; url: string; localPath?: string; alt?: string; width?: number; height?: number }>
  }>;
  sectionSpecs?: Array<{
    name: string;
    selector: string;
    heading?: string;
    layoutHint?: string;
    rect?: { x: number; y: number; width: number; height: number };
    backgroundColor?: string;
    backgroundImage?: string;
    padding?: string;
    gridColumns?: number;
    flexGap?: string;
    childCount?: number;
    images: Array<{ kind: 'img' | 'background'; url: string; localPath?: string; alt?: string; width?: number; height?: number; position?: { x: number; y: number } }>;
    textContent?: { headings: string[]; paragraphs: string[]; buttons: string[] };
  }>;
};

const hash = (input: string | Buffer) => crypto.createHash('sha1').update(input).digest('hex').slice(0, 10);

const guessExtFromContentType = (ct?: string): string => {
  if (!ct) return '';
  if (ct.includes('font/woff2')) return '.woff2';
  if (ct.includes('font/woff')) return '.woff';
  if (ct.includes('font/ttf')) return '.ttf';
  if (ct.includes('font/otf')) return '.otf';
  if (ct.includes('image/png')) return '.png';
  if (ct.includes('image/jpeg')) return '.jpg';
  if (ct.includes('image/jpg')) return '.jpg';
  if (ct.includes('image/gif')) return '.gif';
  if (ct.includes('image/webp')) return '.webp';
  if (ct.includes('image/svg')) return '.svg';
  if (ct.includes('image/x-icon') || ct.includes('image/vnd.microsoft.icon')) return '.ico';
  if (ct.includes('text/css')) return '.css';
  return '';
};

const extFromUrl = (url: string) => {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const m = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return m ? `.${m[1]}` : '';
  } catch {
    const m = url.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
    return m ? `.${m[1]}` : '';
  }
};

const safeWrite = async (filePath: string, data: Buffer | string) => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, data);
};

const scrollFullPage = async (page: Page, viewportHeight: number) => {
  const step = Math.max(300, viewportHeight - 200);
  const delayMs = 200;
  const maxSteps = 50;
  await page.evaluate(
    async ({ step, delayMs, maxSteps }) => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      let steps = 0;
      while (steps < maxSteps) {
        const { scrollY, innerHeight } = window;
        const next = Math.min(scrollY + step, document.body.scrollHeight - innerHeight);
        window.scrollTo(0, next);
        steps += 1;
        await sleep(delayMs);
        const reachedBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight;
        if (reachedBottom) break;
      }
    },
    { step, delayMs, maxSteps },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
};

export const scanBaseAssets = async (
  baseUrl: string,
  outDir: string,
  options?: { headless?: boolean; fullPage?: boolean }
): Promise<AssetScanResult> => {
  const assetsDir = path.join(outDir, 'assets');
  const fontsDir = path.join(assetsDir, 'fonts');
  const imagesDir = path.join(assetsDir, 'images');
  await ensureDir(fontsDir);
  await ensureDir(imagesDir);

  const fontUrlToLocal: Map<string, string> = new Map();
  const imageUrlToLocal: Map<string, string> = new Map();
  const cssTexts: Array<{ url: string; text: string }> = [];
  const capturedFonts: Array<{ url: string; localPath: string; contentType?: string; bytes: number }> = [];
  const capturedImages: Array<{ url: string; localPath: string; contentType?: string; bytes: number }> = [];
  const cssSeen: Array<{ url: string; captured: boolean }> = [];

  const browser: Browser = await chromium.launch({ headless: options?.headless ?? envConfig.headless });
  const context: BrowserContext = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const handleResponse = async (response: Response) => {
    try {
      const url = response.url();
      const status = response.status();
      if (status < 200 || status >= 400) return;
      const headers = response.headers();
      const ct = headers['content-type'] || headers['Content-Type'] || '';

      // Capture CSS text for @font-face extraction
      if (ct.includes('text/css')) {
        let text = '';
        try { text = await response.text(); } catch { }
        if (text && /@font-face/i.test(text)) {
          cssTexts.push({ url, text });
          cssSeen.push({ url, captured: true });
        } else {
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
          const localPath = path.join('assets', 'fonts', fileName);
          await safeWrite(path.join(outDir, localPath), buf);
          fontUrlToLocal.set(url, localPath);
          capturedFonts.push({ url, localPath, contentType: ct, bytes: buf.length });
        } catch { }
        return;
      }

      // Capture images
      if (ct.includes('image') || /\.(png|jpe?g|gif|webp|svg|ico)(?:[?#].*)?$/i.test(url)) {
        try {
          const buf = await response.body();
          const guessedExt = guessExtFromContentType(ct) || extFromUrl(url) || '.png';
          const fileName = `${hash(url)}${guessedExt}`;
          const localPath = path.join('assets', 'images', fileName);
          await safeWrite(path.join(outDir, localPath), buf);
          imageUrlToLocal.set(url, localPath);
          capturedImages.push({ url, localPath, contentType: ct, bytes: buf.length });
        } catch { }
        return;
      }
    } catch { }
  };

  page.on('response', handleResponse);

  const navTimeout = envConfig.navigationTimeoutMs > 0 ? envConfig.navigationTimeoutMs : undefined;
  await page.goto(baseUrl, { waitUntil: envConfig.waitUntil, timeout: navTimeout });
  if (options?.fullPage ?? envConfig.fullPage) {
    // Use a default desktop height for scroll trigger; viewport is default
    await scrollFullPage(page, 720);
  }
  if (envConfig.postLoadWaitMs > 0) {
    await page.waitForTimeout(envConfig.postLoadWaitMs);
  }

  // Extract typography from DOM
  const typography = await page.evaluate(() => {
    const selectors = ['body', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const result: Record<string, Record<string, string>> = {};
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
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
    const iconHref = (
      document.querySelector('link[rel~="icon" i]') as HTMLLinkElement | null
    )?.href || '';

    // Background images (top sections only to limit size)
    const bgNodes = Array.from(document.querySelectorAll('header, nav, main, section, footer, .hero, .banner, .testimonials, .products, .gallery, .features')).slice(0, 40) as HTMLElement[];
    const bgImages: Array<{ url: string; rect: DOMRect }> = [];
    for (const node of bgNodes) {
      const cs = window.getComputedStyle(node);
      const bg = cs.getPropertyValue('background-image');
      const urls = (bg.match(/url\(([^)]+)\)/g) || []).map((m) => m.replace(/^url\((.*)\)$/, '$1').replace(/^["']|["']$/g, ''));
      for (const u of urls) {
        bgImages.push({ url: u, rect: node.getBoundingClientRect() });
      }
    }

    // Sections extraction with heuristics
    const sectionNodes: HTMLElement[] = Array.from(new Set([
      ...Array.from(document.querySelectorAll('header, nav, main > section, section, footer')) as HTMLElement[],
      ...Array.from(document.querySelectorAll('[data-section], [role=banner], [role=navigation], [role=main], [role=contentinfo], [role=region]')) as HTMLElement[],
      ...Array.from(document.querySelectorAll('.hero, .banner, .testimonials, .products, .gallery, .features')) as HTMLElement[]
    ]));

    const nameFromEl = (el: HTMLElement): string => {
      const dataName = el.getAttribute('data-section') || el.getAttribute('data-section-name');
      if (dataName) return dataName;
      const aria = el.getAttribute('aria-label');
      if (aria) return aria;
      const h = el.querySelector('h1, h2, h3');
      if (h && h.textContent) return h.textContent.trim().slice(0, 60);
      const cls = (el.className || '').toString();
      if (/hero|banner/i.test(cls)) return 'Hero';
      if (/testimonials?/i.test(cls)) return 'Testimonials';
      if (/products?|shop|catalog/i.test(cls)) return 'Products';
      if (/features?/i.test(cls)) return 'Features';
      if (/gallery|images?/i.test(cls)) return 'Gallery';
      const tag = el.tagName.toLowerCase();
      if (tag === 'header') return 'Header';
      if (tag === 'nav') return 'Navigation';
      if (tag === 'footer') return 'Footer';
      return tag;
    };

    const selectorFor = (el: HTMLElement): string => {
      let s = el.tagName.toLowerCase();
      const cls = (el.className || '').toString().trim();
      if (cls) s += '.' + cls.split(/\s+/).slice(0, 2).join('.');
      return s;
    };

    const getLayoutHint = (el: HTMLElement): string => {
      const rect = el.getBoundingClientRect();
      const winW = window.innerWidth;
      if (rect.width >= winW * 0.95) return 'full-width';

      // Check for grid/columns by looking at children
      const children = Array.from(el.children).filter(c => {
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });

      if (children.length > 1) {
        const top0 = children[0].getBoundingClientRect().top;
        const sameRow = children.filter(c => Math.abs(c.getBoundingClientRect().top - top0) < 10);
        if (sameRow.length > 1 && sameRow.length < children.length) return 'grid'; // multiple rows
        if (sameRow.length === children.length && children.length > 1) return 'columns'; // single row multiple cols
      }

      const style = window.getComputedStyle(el);
      if (style.display === 'grid') return 'grid';
      if (style.display === 'flex' && style.flexDirection === 'row') return 'columns';

      return 'standard';
    };

    const sections = sectionNodes.map((el) => ({
      name: nameFromEl(el),
      selector: selectorFor(el),
      rect: el.getBoundingClientRect(),
      heading: (el.querySelector('h1, h2, h3')?.textContent || '').trim().slice(0, 60),
      layoutHint: getLayoutHint(el)
    }));

    // Map images to nearest section by containment of center point
    const sectionMappings = sections.map((sec) => ({
      name: sec.name,
      selector: sec.selector,
      heading: sec.heading,
      layoutHint: sec.layoutHint,
      rect: { x: sec.rect.x, y: sec.rect.y, width: sec.rect.width, height: sec.rect.height },
      images: [] as Array<any>,
      backgroundColor: (document.elementFromPoint(Math.max(0, sec.rect.left + 1), Math.max(0, sec.rect.top + 1)) as HTMLElement | null)?.style?.backgroundColor,
      backgroundImage: (() => {
        const el = document.querySelector(sec.selector) as HTMLElement | null;
        if (!el) return undefined;
        const cs = window.getComputedStyle(el);
        const bg = cs.getPropertyValue('background-image');
        return /url\(/.test(bg) ? bg : undefined;
      })(),
      padding: (() => {
        const el = document.querySelector(sec.selector) as HTMLElement | null; if (!el) return undefined; const cs = window.getComputedStyle(el);
        const p = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' ');
        return p;
      })(),
      childCount: (() => { const el = document.querySelector(sec.selector) as HTMLElement | null; return el ? el.children.length : undefined; })(),
      gridColumns: (() => { const el = document.querySelector(sec.selector) as HTMLElement | null; if (!el) return undefined; const cs = window.getComputedStyle(el); const g = cs.gridTemplateColumns; if (!g || g === 'none') return undefined; return g.split(' ').length; })(),
      flexGap: (() => { const el = document.querySelector(sec.selector) as HTMLElement | null; if (!el) return undefined; const cs = window.getComputedStyle(el); const gap = cs.gap; return gap && gap !== 'normal' ? gap : undefined; })(),
      textContent: (() => {
        const el = document.querySelector(sec.selector) as HTMLElement | null; if (!el) return undefined;
        const headings = Array.from(el.querySelectorAll('h1,h2,h3')).map(h => (h.textContent || '').trim()).filter(Boolean);
        const paragraphs = Array.from(el.querySelectorAll('p')).map(p => (p.textContent || '').trim()).filter(Boolean).slice(0, 20);
        const buttons = Array.from(el.querySelectorAll('a,button')).map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 20);
        return { headings, paragraphs, buttons };
      })()
    }));

    const contains = (r: DOMRect, x: number, y: number) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    for (const img of images) {
      const cx = img.rect.left + img.rect.width / 2;
      const cy = img.rect.top + img.rect.height / 2;
      let idx = sections.findIndex(sec => contains(sec.rect, cx, cy));
      if (idx === -1) {
        // fallback to nearest by vertical distance
        let best = -1; let bestDist = Infinity;
        sections.forEach((sec, i) => {
          const dy = Math.max(0, sec.rect.top - cy, cy - sec.rect.bottom);
          if (dy < bestDist) { bestDist = dy; best = i; }
        });
        idx = best;
      }
      if (idx >= 0) {
        const sec = sections[idx];
        const relX = img.rect.left - sec.rect.left;
        const relY = img.rect.top - sec.rect.top;
        (sectionMappings[idx].images as any[]).push({ kind: 'img', url: img.src, alt: img.alt, width: img.width, height: img.height, position: { x: relX, y: relY } });
      }
    }
    for (const b of bgImages) {
      // Assign background images to the section that owns that rect
      const idx = sections.findIndex(sec => sec.rect.left === b.rect.left && sec.rect.top === b.rect.top && sec.rect.width === b.rect.width && sec.rect.height === b.rect.height);
      if (idx >= 0) {
        (sectionMappings[idx].images as any[]).push({ kind: 'background', url: b.url, position: { x: 0, y: 0 } });
      }
    }

    // Collect candidate palette from a set of elements
    const colorSelectors = ['body', 'header', 'main', 'footer', 'section', 'h1', 'h2', 'h3', 'p', 'a', 'button'];
    const colors = new Set<string>();
    const backgrounds = new Set<string>();
    for (const sel of colorSelectors) {
      const els = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
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
  const fontFaceBlocks: string[] = [];
  for (const { url, text } of cssTexts) {
    const blocks = Array.from(text.matchAll(/@font-face\s*{[^}]*}/gims)).map((m) => m[0]);
    for (const block of blocks) {
      // Replace url(...) to local if captured
      const rewritten = block.replace(/url\(([^)]+)\)/g, (m, g1) => {
        let raw = String(g1).trim();
        if (raw.startsWith('\"') || raw.startsWith("'")) raw = raw.slice(1, -1);
        const local = fontUrlToLocal.get(raw) || fontUrlToLocal.get(tryResolveProtocolRelative(raw, url));
        if (local) return `url('./${local.replace(/\\/g, '/')}')`;
        return m; // keep remote
      });
      fontFaceBlocks.push(rewritten);
    }
  }

  const fontsCss = dedupeCss(fontFaceBlocks).join('\n\n');
  const fontsCssPath = path.join(outDir, 'fonts.css');
  await safeWrite(fontsCssPath, fontsCss);

  // Build typography.css from computed styles
  const typographyLines: string[] = [];
  const typSample = typography.result || {};
  for (const sel of Object.keys(typSample)) {
    const props = (typSample as any)[sel];
    const body = (Object.entries(props) as Array<[string, string]>)
      .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');
    if (body) {
      typographyLines.push(`${sel} {\n${body}\n}`);
    }
  }
  const typographyCss = typographyLines.join('\n\n');
  const typographyCssPath = path.join(outDir, 'typography.css');
  await safeWrite(typographyCssPath, typographyCss);

  // Build manifest for images to help consumers pick candidates
  let logoCandidate: string | undefined;
  if (typography.logoSrc) {
    const mapped = imageUrlToLocal.get(typography.logoSrc);
    if (mapped) logoCandidate = mapped;
  }
  let faviconCandidate: string | undefined;
  if (typography.iconHref) {
    const mapped = imageUrlToLocal.get(typography.iconHref);
    if (mapped) faviconCandidate = mapped;
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
  let heroCandidate: string | undefined;
  const imageHints: Array<{ localPath?: string; url: string; alt: string; width: number; height: number; x: number; y: number }> = [];
  if (Array.isArray(typography.images)) {
    const scored = typography.images.map((i: any) => {
      const score = (i.width * i.height) - (i.y * 10); // favor large and higher on page
      return { ...i, score };
    }).sort((a: any, b: any) => b.score - a.score);
    for (const img of scored) {
      const mapped = imageUrlToLocal.get(img.src);
      imageHints.push({ localPath: mapped, url: img.src, alt: img.alt, width: img.width, height: img.height, x: img.rect?.x ?? 0, y: img.rect?.y ?? 0 });
      if (!heroCandidate && mapped && (!logoCandidate || mapped !== logoCandidate)) {
        // Heuristic: first big non-logo image
        heroCandidate = mapped;
      }
    }
  }

  const palette = typography.palette as { colors: string[]; backgrounds: string[] } | undefined;
  const fontFamiliesSet = new Set<string>();
  const typ = typography.result || {};
  for (const sel of Object.keys(typ)) {
    const ff = typ[sel]['font-family'];
    if (ff) {
      ff.split(',').map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')).forEach(t => { if (t) fontFamiliesSet.add(t); });
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
  const manifestPath = path.join(outDir, 'assets-manifest.json');
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
    sectionHints: (typography.sectionMappings || []).map((s: any) => ({
      name: s.name,
      selector: s.selector,
      heading: s.heading,
      images: (s.images || []).map((im: any) => ({
        kind: im.kind,
        url: im.url,
        localPath: imageUrlToLocal.get(im.url),
        alt: im.alt,
        width: im.width,
        height: im.height,
      }))
    })),
    sectionSpecs: (typography.sectionMappings || []).map((s: any) => ({
      name: s.name,
      selector: s.selector,
      heading: s.heading,
      layoutHint: s.layoutHint,
      rect: s.rect,
      backgroundColor: s.backgroundColor,
      backgroundImage: s.backgroundImage,
      padding: s.padding,
      gridColumns: s.gridColumns,
      flexGap: s.flexGap,
      childCount: s.childCount,
      images: (s.images || []).map((im: any) => ({
        kind: im.kind,
        url: im.url,
        localPath: imageUrlToLocal.get(im.url),
        alt: im.alt,
        width: im.width,
        height: im.height,
        position: im.position,
      }))
    })).map((s: any) => ({
      ...s,
      textContent: ((): any => {
        try {
          const secEl = s.selector ? document.querySelector(s.selector) as HTMLElement | null : null;
          if (!secEl) return undefined;
          const headings = Array.from(secEl.querySelectorAll('h1,h2,h3')).map((h: any) => (h.textContent || '').trim()).filter(Boolean);
          const paragraphs = Array.from(secEl.querySelectorAll('p')).map((p: any) => (p.textContent || '').trim()).filter(Boolean).slice(0, 20);
          const buttons = Array.from(secEl.querySelectorAll('a,button')).map((b: any) => (b.textContent || '').trim()).filter(Boolean).slice(0, 20);
          return { headings, paragraphs, buttons };
        } catch { return undefined; }
      })()
    })),
  };
};

const tryResolveProtocolRelative = (url: string, baseCssUrl: string): string => {
  if (url.startsWith('//')) {
    try { const b = new URL(baseCssUrl); return `${b.protocol}${url}`; } catch { return `https:${url}`; }
  }
  return url;
};

const dedupeCss = (blocks: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of blocks) {
    const key = b.replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) { seen.add(key); out.push(b); }
  }
  return out;
};

export const injectAssetsIntoHtml = async (
  entryHtmlPath: string,
  siteDir: string,
  scan: AssetScanResult
): Promise<void> => {
  const html = await fs.readFile(entryHtmlPath, 'utf8');
  const headEndIdx = html.indexOf('</head>');
  const injectionId = 'data-injected-by="checker-asset-scan"';
  const hasInjection = html.includes(injectionId);
  const hasIcon = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i.test(html);

  // Copy CSS files to site root
  const siteFontsCss = path.join(siteDir, 'fonts.css');
  const siteTypoCss = path.join(siteDir, 'typography.css');
  await fs.copyFile(scan.fontsCssPath, siteFontsCss).catch(async () => {
    await ensureDir(path.dirname(siteFontsCss));
    await fs.copyFile(scan.fontsCssPath, siteFontsCss);
  });
  await fs.copyFile(scan.typographyCssPath, siteTypoCss).catch(async () => {
    await ensureDir(path.dirname(siteTypoCss));
    await fs.copyFile(scan.typographyCssPath, siteTypoCss);
  });

  // Copy assets directory (fonts/images)
  const copyDir = async (from: string, to: string) => {
    await ensureDir(to);
    const entries = await fs.readdir(from, { withFileTypes: true });
    for (const e of entries) {
      const src = path.join(from, e.name);
      const dst = path.join(to, e.name);
      if (e.isDirectory()) {
        await copyDir(src, dst);
      } else if (e.isFile()) {
        await fs.copyFile(src, dst).catch(async () => {
          await ensureDir(path.dirname(dst));
          await fs.copyFile(src, dst);
        });
      }
    }
  };
  await copyDir(path.join(scan.outDir, 'assets'), path.join(siteDir, 'assets'));

  if (hasInjection) {
    // Already injected in a previous iteration; nothing else to do
    return;
  }

  // Preload captured fonts (woff2 preferred)
  const preloadLines: string[] = [];
  for (const f of scan.assets.fonts) {
    const ext = path.extname(f.localPath).toLowerCase();
    const as = 'font';
    let type = '';
    if (ext === '.woff2') type = 'font/woff2';
    else if (ext === '.woff') type = 'font/woff';
    else if (ext === '.ttf') type = 'font/ttf';
    else if (ext === '.otf') type = 'font/otf';
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
  await fs.writeFile(entryHtmlPath, newHtml, 'utf8');
};

export const injectCspForAssets = async (entryHtmlPath: string): Promise<void> => {
  const html = await fs.readFile(entryHtmlPath, 'utf8');
  const headEndIdx = html.indexOf('</head>');
  const cspId = 'data-injected-by="checker-asset-csp"';
  if (html.includes(cspId)) return;
  const tag = `<meta ${cspId} http-equiv="Content-Security-Policy" content="img-src 'self' data: blob:; font-src 'self' data:;">`;
  const out = headEndIdx >= 0 ? `${html.slice(0, headEndIdx)}  ${tag}\n${html.slice(headEndIdx)}` : `${tag}\n${html}`;
  await fs.writeFile(entryHtmlPath, out, 'utf8');
};
