"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.capture = void 0;
const playwright_1 = require("playwright");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const config_1 = require("./config");
const getViewportForDevice = (device) => {
    if (device === 'mobile') {
        return { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
    }
    return { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false };
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
const capture = async (url, options = {}) => {
    const device = options.device || 'desktop';
    const fullPage = options.fullPage ?? config_1.config.fullPage;
    const outputDir = options.outputDir || config_1.config.outputDir;
    const runId = (0, utils_1.timestampId)();
    const runDir = path_1.default.join(outputDir, 'screenshots', runId);
    await (0, utils_1.ensureDir)(runDir);
    const deviceConfig = getViewportForDevice(device);
    const browser = await playwright_1.chromium.launch({ headless: config_1.config.headless });
    try {
        const context = await browser.newContext({
            viewport: { width: deviceConfig.width, height: deviceConfig.height },
            deviceScaleFactor: deviceConfig.deviceScaleFactor,
            isMobile: deviceConfig.isMobile,
            hasTouch: deviceConfig.hasTouch,
            ignoreHTTPSErrors: true,
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: config_1.config.waitUntil, timeout: config_1.config.navigationTimeoutMs });
        if (config_1.config.postLoadWaitMs > 0) {
            await page.waitForTimeout(config_1.config.postLoadWaitMs);
        }
        if (fullPage) {
            await scrollFullPage(page, deviceConfig.height);
        }
        const screenshotPath = (0, utils_1.resolveInDir)(runDir, `${device}.png`);
        const buffer = await page.screenshot({ path: screenshotPath, fullPage });
        const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
        return { path: screenshotPath, dataUrl };
    }
    finally {
        await browser.close();
    }
};
exports.capture = capture;
