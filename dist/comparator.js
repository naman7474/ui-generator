"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareSites = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const playwright_1 = require("playwright");
const pixelmatch_1 = __importDefault(require("pixelmatch"));
const pngjs_1 = require("pngjs");
const config_1 = require("./config");
const utils_1 = require("./utils");
const report_1 = require("./report");
const storage_1 = require("./storage");
const style_diff_1 = require("./style-diff");
const mergeOptions = (options) => ({
    outputDir: options?.outputDir ?? config_1.config.outputDir,
    threshold: options?.threshold ?? config_1.config.pixelmatchThreshold,
    viewport: {
        width: options?.viewport?.width ?? config_1.config.viewport.width,
        height: options?.viewport?.height ?? config_1.config.viewport.height,
        deviceScaleFactor: options?.viewport?.deviceScaleFactor ?? config_1.config.viewport.deviceScaleFactor,
    },
    fullPage: options?.fullPage ?? config_1.config.fullPage,
    waitUntil: options?.waitUntil ?? config_1.config.waitUntil,
    navigationTimeoutMs: options?.navigationTimeoutMs ?? config_1.config.navigationTimeoutMs,
    headless: options?.headless ?? config_1.config.headless,
    postLoadWaitMs: options?.postLoadWaitMs ?? config_1.config.postLoadWaitMs,
});
const getViewportForDevice = (device) => {
    if (device === 'mobile') {
        return { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
    }
    return { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false };
};
const sanitizeTiming = (value, fallback) => {
    if (!Number.isFinite(value) || value <= 0)
        return fallback;
    return value;
};
const scrollFullPage = async (page, viewportHeight) => {
    // Scroll through the page to trigger lazy-loaded content before taking a full-page screenshot.
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
const captureSite = async (context, url, label, runDir, options) => {
    const page = await context.newPage();
    const screenshotPath = (0, utils_1.resolveInDir)(runDir, `${label}.png`);
    const start = Date.now();
    const waitStateForLoad = options.waitUntil === 'commit' ? 'load' : options.waitUntil;
    const navTimeout = options.navigationTimeoutMs > 0 ? options.navigationTimeoutMs : undefined;
    await page.goto(url, { waitUntil: options.waitUntil, timeout: navTimeout });
    await page.waitForLoadState(waitStateForLoad, {
        timeout: navTimeout,
    }).catch(() => undefined);
    if (options.postLoadWaitMs > 0) {
        await page.waitForTimeout(options.postLoadWaitMs);
    }
    if (options.fullPage) {
        await scrollFullPage(page, options.viewport.height);
    }
    const timingSummary = await page.evaluate(() => {
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
            const base = navEntry.startTime || 0;
            return {
                loadTimeMs: navEntry.loadEventEnd - base,
                domContentLoadedMs: navEntry.domContentLoadedEventEnd - base,
                responseEndMs: navEntry.responseEnd - base,
                raw: navEntry.toJSON(),
            };
        }
        const t = performance.timing;
        return {
            loadTimeMs: t.loadEventEnd - t.navigationStart,
            domContentLoadedMs: t.domContentLoadedEventEnd - t.navigationStart,
            responseEndMs: t.responseEnd - t.navigationStart,
            raw: { ...t },
        };
    });
    const measuredLoad = Date.now() - start;
    const timing = {
        loadTimeMs: sanitizeTiming(timingSummary.loadTimeMs, measuredLoad),
        domContentLoadedMs: sanitizeTiming(timingSummary.domContentLoadedMs, measuredLoad),
        responseEndMs: sanitizeTiming(timingSummary.responseEndMs, measuredLoad),
        raw: timingSummary.raw,
    };
    const styles = await (0, style_diff_1.extractComputedStyles)(page);
    await page.screenshot({ path: screenshotPath, fullPage: options.fullPage });
    await page.close();
    return { url, label, screenshotPath, timing, styles };
};
const diffScreenshots = async (basePath, targetPath, runDir, threshold) => {
    const [baseBuffer, targetBuffer] = await Promise.all([
        promises_1.default.readFile(basePath),
        promises_1.default.readFile(targetPath),
    ]);
    const basePng = pngjs_1.PNG.sync.read(baseBuffer);
    const targetPng = pngjs_1.PNG.sync.read(targetBuffer);
    // Crop to overlapping area to avoid counting non-overlapping page length as a diff.
    const width = Math.min(basePng.width, targetPng.width);
    const height = Math.min(basePng.height, targetPng.height);
    const crop = (src) => {
        const clipped = new pngjs_1.PNG({ width, height });
        for (let y = 0; y < height; y++) {
            const srcStart = y * src.width * 4;
            const srcSlice = src.data.subarray(srcStart, srcStart + width * 4);
            const destStart = y * width * 4;
            clipped.data.set(srcSlice, destStart);
        }
        return clipped;
    };
    const clippedBase = crop(basePng);
    const clippedTarget = crop(targetPng);
    const diffPng = new pngjs_1.PNG({ width, height });
    const diffPixels = (0, pixelmatch_1.default)(clippedBase.data, clippedTarget.data, diffPng.data, width, height, {
        threshold,
    });
    const diffPath = (0, utils_1.resolveInDir)(runDir, 'diff.png');
    const diffBuffer = pngjs_1.PNG.sync.write(diffPng);
    await promises_1.default.writeFile(diffPath, diffBuffer);
    // Use the overlapping (clipped) region size as the denominator for similarity
    // so we don't penalize differing page lengths outside the compared area.
    const overlappingPixels = width * height;
    const similarity = overlappingPixels === 0 ? 0 : 1 - diffPixels / overlappingPixels;
    return { diffPixels, totalPixels: overlappingPixels, similarity, diffPath };
};
const compareSites = async (baseUrl, targetUrl, labels = {}, options, device = 'desktop') => {
    if (!baseUrl || !targetUrl) {
        throw new Error('Both baseUrl and targetUrl are required.');
    }
    const merged = mergeOptions(options);
    const runId = (0, utils_1.timestampId)();
    const runDir = path_1.default.join(merged.outputDir, runId);
    await (0, utils_1.ensureDir)(runDir);
    const deviceConfig = getViewportForDevice(device);
    // Allow manual override if viewport is explicitly passed in options, otherwise use device default
    const viewport = options?.viewport ? merged.viewport : { width: deviceConfig.width, height: deviceConfig.height };
    const deviceScaleFactor = options?.viewport?.deviceScaleFactor ?? deviceConfig.deviceScaleFactor;
    const browser = await playwright_1.chromium.launch({ headless: merged.headless });
    const context = await browser.newContext({
        viewport,
        deviceScaleFactor,
        isMobile: deviceConfig.isMobile,
        hasTouch: deviceConfig.hasTouch,
        ignoreHTTPSErrors: true,
    });
    context.setDefaultNavigationTimeout(merged.navigationTimeoutMs);
    try {
        const baseLabel = labels.base ?? 'base';
        const targetLabel = labels.target ?? 'target';
        // Capture sequentially to avoid resource contention between the two site loads.
        const baseCapture = await captureSite(context, baseUrl, baseLabel, runDir, merged);
        const targetCapture = await captureSite(context, targetUrl, targetLabel, runDir, merged);
        const diff = await diffScreenshots(baseCapture.screenshotPath, targetCapture.screenshotPath, runDir, merged.threshold);
        let styleDiff;
        if (baseCapture.styles && targetCapture.styles) {
            styleDiff = (0, style_diff_1.compareStyleData)(baseCapture.styles, targetCapture.styles);
        }
        const result = {
            runId,
            base: baseCapture,
            target: targetCapture,
            diff,
            styleDiff,
            outputDir: runDir,
            device,
        };
        await (0, report_1.writeReport)(result);
        try {
            await storage_1.storage.persistDir(runDir);
        }
        catch (err) {
            console.error('Failed to upload to storage:', err);
        }
        return result;
    }
    finally {
        await context.close();
        await browser.close();
    }
};
exports.compareSites = compareSites;
