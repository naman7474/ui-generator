"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlPaths = void 0;
const playwright_1 = require("playwright");
const minimatch_1 = require("minimatch");
const crawlPaths = async (rootUrl, options) => {
    const browser = await playwright_1.chromium.launch({ headless: options.headless ?? true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const visited = new Set();
    const queue = ['/'];
    const foundPaths = new Set();
    // Helper to check if a path should be included
    const shouldInclude = (pathname) => {
        // If include patterns are provided, path MUST match at least one
        if (options.includePatterns && options.includePatterns.length > 0) {
            const matchedInclude = options.includePatterns.some((pattern) => (0, minimatch_1.minimatch)(pathname, pattern));
            if (!matchedInclude)
                return false;
        }
        // If exclude patterns are provided, path MUST NOT match any
        if (options.excludePatterns && options.excludePatterns.length > 0) {
            const matchedExclude = options.excludePatterns.some((pattern) => (0, minimatch_1.minimatch)(pathname, pattern));
            if (matchedExclude)
                return false;
        }
        return true;
    };
    try {
        while (queue.length > 0 && visited.size < options.maxPages) {
            const currentPath = queue.shift();
            if (visited.has(currentPath))
                continue;
            visited.add(currentPath);
            // Add to results if it matches filters
            if (shouldInclude(currentPath)) {
                foundPaths.add(currentPath);
            }
            const url = new URL(currentPath, rootUrl).href;
            try {
                await page.goto(url, { waitUntil: options.waitUntil ?? 'domcontentloaded', timeout: options.navigationTimeoutMs });
                const hrefs = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('a[href]'))
                        .map((el) => el.getAttribute('href'))
                        .filter((href) => !!href);
                });
                for (const href of hrefs) {
                    try {
                        const resolved = new URL(href, rootUrl);
                        // Only follow internal links
                        if (resolved.origin === new URL(rootUrl).origin) {
                            const newPath = resolved.pathname;
                            if (!visited.has(newPath) && !queue.includes(newPath)) {
                                // We queue it if it matches our filters.
                                // Note: If we only queue matching paths, we might miss children of non-matching paths.
                                // But for "Selective Analysis" of specific sections (e.g. /products/*), 
                                // we usually assume the user wants to scan that section.
                                // However, to find /products/1, we might need to go through /products.
                                // If the user says include '/products/*', and we are at '/', we find '/products'.
                                // '/products' matches '/products/*'? No, usually '/products' matches '/products*'.
                                // If user says '/products/**', then '/products' matches.
                                // Let's assume standard minimatch behavior.
                                // To be safe, we should probably queue everything that *starts with* a prefix of an include pattern?
                                // Or just queue everything and only *record* what matches?
                                // If we queue everything, we might crawl the whole site which is slow.
                                // The user said "So that only relevant pages can be analysed and it is quick."
                                // So we should avoid crawling irrelevant pages.
                                if (shouldInclude(newPath)) {
                                    queue.push(newPath);
                                }
                            }
                        }
                    }
                    catch {
                        // ignore invalid urls
                    }
                }
            }
            catch (err) {
                console.error(`Failed to crawl ${url}`, err);
            }
        }
    }
    finally {
        await browser.close();
    }
    return Array.from(foundPaths);
};
exports.crawlPaths = crawlPaths;
