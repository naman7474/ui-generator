import fs from 'fs/promises';
import path from 'path';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { config as envConfig } from './config';
import { ComparisonOptions, ComparisonResult, DiffResult, SiteCaptureResult } from './types';
import { ensureDir, resolveInDir, timestampId } from './utils';
import { writeReport } from './report';
import { storage } from './storage';
import { extractComputedStyles, compareStyleData } from './style-diff';

type MergedOptions = Required<Omit<ComparisonOptions, 'viewport'>> & {
  viewport: { width: number; height: number; deviceScaleFactor: number };
};

const mergeOptions = (options?: ComparisonOptions): MergedOptions => ({
  outputDir: options?.outputDir ?? envConfig.outputDir,
  threshold: options?.threshold ?? envConfig.pixelmatchThreshold,
  viewport: {
    width: options?.viewport?.width ?? envConfig.viewport.width,
    height: options?.viewport?.height ?? envConfig.viewport.height,
    deviceScaleFactor: options?.viewport?.deviceScaleFactor ?? envConfig.viewport.deviceScaleFactor,
  },
  fullPage: options?.fullPage ?? envConfig.fullPage,
  waitUntil: options?.waitUntil ?? envConfig.waitUntil,
  navigationTimeoutMs: options?.navigationTimeoutMs ?? envConfig.navigationTimeoutMs,
  headless: options?.headless ?? envConfig.headless,
  postLoadWaitMs: options?.postLoadWaitMs ?? envConfig.postLoadWaitMs,
});

const getViewportForDevice = (device: 'desktop' | 'mobile') => {
  if (device === 'mobile') {
    return { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  }
  return { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false };
};

const sanitizeTiming = (value: number, fallback: number): number => {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
};

const scrollFullPage = async (page: Page, viewportHeight: number) => {
  // Scroll through the page to trigger lazy-loaded content before taking a full-page screenshot.
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

const captureSite = async (
  context: BrowserContext,
  url: string,
  label: string,
  runDir: string,
  options: MergedOptions,
): Promise<SiteCaptureResult> => {
  const page: Page = await context.newPage();
  const screenshotPath = resolveInDir(runDir, `${label}.png`);
  const start = Date.now();

  const waitStateForLoad = options.waitUntil === 'commit' ? 'load' : options.waitUntil;

  const navTimeout = options.navigationTimeoutMs > 0 ? options.navigationTimeoutMs : undefined;
  await page.goto(url, { waitUntil: options.waitUntil, timeout: navTimeout });
  await page.waitForLoadState(waitStateForLoad as 'load' | 'domcontentloaded' | 'networkidle', {
    timeout: navTimeout,
  }).catch(() => undefined);

  if (options.postLoadWaitMs > 0) {
    await page.waitForTimeout(options.postLoadWaitMs);
  }

  if (options.fullPage) {
    await scrollFullPage(page, options.viewport.height);
  }

  const timingSummary = await page.evaluate(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

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
      raw: { ...t } as unknown as Record<string, unknown>,
    };
  });

  const measuredLoad = Date.now() - start;
  const timing = {
    loadTimeMs: sanitizeTiming(timingSummary.loadTimeMs, measuredLoad),
    domContentLoadedMs: sanitizeTiming(timingSummary.domContentLoadedMs, measuredLoad),
    responseEndMs: sanitizeTiming(timingSummary.responseEndMs, measuredLoad),
    raw: timingSummary.raw,
  };

  const styles = await extractComputedStyles(page);

  await page.screenshot({ path: screenshotPath, fullPage: options.fullPage });
  await page.close();

  return { url, label, screenshotPath, timing, styles };
};

const diffScreenshots = async (
  basePath: string,
  targetPath: string,
  runDir: string,
  threshold: number,
): Promise<DiffResult> => {
  const [baseBuffer, targetBuffer] = await Promise.all([
    fs.readFile(basePath),
    fs.readFile(targetPath),
  ]);

  const basePng = PNG.sync.read(baseBuffer);
  const targetPng = PNG.sync.read(targetBuffer);

  // Crop to overlapping area to avoid counting non-overlapping page length as a diff.
  const width = Math.min(basePng.width, targetPng.width);
  const height = Math.min(basePng.height, targetPng.height);

  const crop = (src: PNG) => {
    const clipped = new PNG({ width, height });
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

  const diffPng = new PNG({ width, height });
  const diffPixels = pixelmatch(clippedBase.data, clippedTarget.data, diffPng.data, width, height, {
    threshold,
  });

  const diffPath = resolveInDir(runDir, 'diff.png');
  const diffBuffer = PNG.sync.write(diffPng);
  await fs.writeFile(diffPath, diffBuffer);

  // Use the overlapping (clipped) region size as the denominator for similarity
  // so we don't penalize differing page lengths outside the compared area.
  const overlappingPixels = width * height;
  const similarity = overlappingPixels === 0 ? 0 : 1 - diffPixels / overlappingPixels;

  return { diffPixels, totalPixels: overlappingPixels, similarity, diffPath };
};

export const compareSites = async (
  baseUrl: string,
  targetUrl: string,
  labels: { base?: string; target?: string } = {},
  options?: ComparisonOptions,
  device: 'desktop' | 'mobile' = 'desktop',
): Promise<ComparisonResult> => {
  if (!baseUrl || !targetUrl) {
    throw new Error('Both baseUrl and targetUrl are required.');
  }

  const merged = mergeOptions(options);
  const runId = timestampId();
  const runDir = path.join(merged.outputDir, runId);
  await ensureDir(runDir);

  const deviceConfig = getViewportForDevice(device);
  // Allow manual override if viewport is explicitly passed in options, otherwise use device default
  const viewport = options?.viewport ? merged.viewport : { width: deviceConfig.width, height: deviceConfig.height };
  const deviceScaleFactor = options?.viewport?.deviceScaleFactor ?? deviceConfig.deviceScaleFactor;

  const browser: Browser = await chromium.launch({ headless: merged.headless });
  const context: BrowserContext = await browser.newContext({
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
      styleDiff = compareStyleData(baseCapture.styles, targetCapture.styles);
    }

    const result: ComparisonResult = {
      runId,
      base: baseCapture,
      target: targetCapture,
      diff,
      styleDiff,
      outputDir: runDir,
      device,
    };

    await writeReport(result);
    try {
      await storage.persistDir(runDir);
    } catch (err) {
      console.error('Failed to upload to storage:', err);
    }
    return result;
  } finally {
    await context.close();
    await browser.close();
  }
};
