import { chromium, Browser, BrowserContext, Page } from 'playwright';
import path from 'path';
import { ensureDir, resolveInDir, timestampId } from './utils';
import { config as envConfig } from './config';

export type ScreenshotOptions = {
    fullPage?: boolean;
    device?: 'desktop' | 'mobile';
    outputDir?: string;
};

export type ScreenshotResult = {
    path: string;
    dataUrl: string;
};

const getViewportForDevice = (device: 'desktop' | 'mobile') => {
    if (device === 'mobile') {
        return { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
    }
    return { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false };
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

export const capture = async (url: string, options: ScreenshotOptions = {}): Promise<ScreenshotResult> => {
    const device = options.device || 'desktop';
    const fullPage = options.fullPage ?? envConfig.fullPage;
    const outputDir = options.outputDir || envConfig.outputDir;

    const runId = timestampId();
    const runDir = path.join(outputDir, 'screenshots', runId);
    await ensureDir(runDir);

    const deviceConfig = getViewportForDevice(device);
    const browser: Browser = await chromium.launch({ headless: envConfig.headless });

    try {
        const context: BrowserContext = await browser.newContext({
            viewport: { width: deviceConfig.width, height: deviceConfig.height },
            deviceScaleFactor: deviceConfig.deviceScaleFactor,
            isMobile: deviceConfig.isMobile,
            hasTouch: deviceConfig.hasTouch,
            ignoreHTTPSErrors: true,
        });

        const page = await context.newPage();
        await page.goto(url, { waitUntil: envConfig.waitUntil, timeout: envConfig.navigationTimeoutMs });

        if (envConfig.postLoadWaitMs > 0) {
            await page.waitForTimeout(envConfig.postLoadWaitMs);
        }

        if (fullPage) {
            await scrollFullPage(page, deviceConfig.height);
        }

        const screenshotPath = resolveInDir(runDir, `${device}.png`);
        const buffer = await page.screenshot({ path: screenshotPath, fullPage });
        const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

        return { path: screenshotPath, dataUrl };
    } finally {
        await browser.close();
    }
};
