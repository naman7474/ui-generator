#!/usr/bin/env node
import { Command } from 'commander';
import { compareSites } from './comparator';
import { compareWholeSite } from './batch';
import { config } from './config';

const parseViewport = (value: string) => {
  const match = value.match(/^(\d+)x(\d+)$/i);
  if (!match) throw new Error('Viewport must be in WIDTHxHEIGHT format, e.g. 1280x720');
  return { width: Number(match[1]), height: Number(match[2]) };
};

const program = new Command();

program
  .name('checker')
  .description('Visual and performance comparison checker for two URLs')
  .requiredOption('-b, --base <url>', 'Base (production) URL')
  .requiredOption('-t, --target <url>', 'Target (candidate) URL')
  .option('--base-label <name>', 'Label for base capture', 'base')
  .option('--target-label <name>', 'Label for target capture', 'target')
  .option('--out <dir>', 'Output directory for artifacts', config.outputDir)
  .option('--threshold <number>', 'Pixelmatch threshold 0-1 (default 0.1)', (v) => Number(v), config.pixelmatchThreshold)
  .option('--viewport <widthxheight>', 'Viewport, e.g. 1280x720', parseViewport)
  .option('--device-scale-factor <number>', 'Device scale factor (default 1)', (v) => Number(v), config.viewport.deviceScaleFactor)
  .option('--wait-until <state>', 'Navigation wait state (load|domcontentloaded|networkidle)', config.waitUntil)
  .option('--timeout <ms>', 'Navigation timeout in ms', (v) => Number(v), config.navigationTimeoutMs)
  .option('--post-wait <ms>', 'Wait after load before screenshot (default 2000)', (v) => Number(v), config.postLoadWaitMs)
  .option('--headless', 'Run browser headless', config.headless)
  .option('--no-headless', 'Run browser with UI')
  .option('--full-page', 'Capture full page', config.fullPage)
  .option('--no-full-page', 'Disable full page screenshot')
  .option('--crawl', 'Crawl the base site and compare matching paths across both sites')
  .option('--max-pages <number>', 'Max pages to crawl/compare (default 20)', (v) => Number(v))
  .option('--devices <list>', 'Comma-separated devices to test (desktop,mobile)', (v) => v.split(',').map((s) => s.trim()).filter(Boolean))
  .option('--include <globs>', 'Comma-separated include patterns for crawl (e.g. /blog/*,/products/**)', (v) => v.split(',').map((s) => s.trim()).filter(Boolean))
  .option('--exclude <globs>', 'Comma-separated exclude patterns for crawl', (v) => v.split(',').map((s) => s.trim()).filter(Boolean));

program.action(async (opts) => {
  try {
    const sharedOptions = {
      outputDir: opts.out,
      threshold: opts.threshold,
      viewport: {
        width: opts.viewport?.width ?? config.viewport.width,
        height: opts.viewport?.height ?? config.viewport.height,
        deviceScaleFactor: opts.deviceScaleFactor ?? config.viewport.deviceScaleFactor,
      },
      waitUntil: opts.waitUntil,
      navigationTimeoutMs: opts.timeout,
      postLoadWaitMs: opts.postWait,
      fullPage: opts.fullPage,
      headless: opts.headless,
    };

    if (opts.crawl) {
      const batch = await compareWholeSite(opts.base, opts.target, {
        ...sharedOptions,
        maxPages: opts.maxPages,
        includePatterns: opts.include,
        excludePatterns: opts.exclude,
        devices: Array.isArray(opts.devices) && opts.devices.length > 0 ? opts.devices : undefined,
      });

      console.log(`Batch: ${batch.batchId}`);
      console.log(`Artifacts: ${batch.outputDir}`);
      console.log(`Pages compared: ${batch.pages.length}`);
      console.log(`Average visual similarity: ${(batch.summary.averageSimilarity * 100).toFixed(2)}%`);
      console.log(`Average load times -> base: ${batch.summary.averageBaseLoadMs.toFixed(0)} ms, target: ${batch.summary.averageTargetLoadMs.toFixed(0)} ms`);
    } else {
      // If multiple devices are provided, run comparisons for each and print summaries
      const devices: ('desktop' | 'mobile')[] = Array.isArray(opts.devices) && opts.devices.length > 0
        ? opts.devices
        : ['desktop'];

      let lastResult: Awaited<ReturnType<typeof compareSites>> | undefined;
      for (const device of devices) {
        const result = await compareSites(
          opts.base,
          opts.target,
          { base: opts.baseLabel, target: opts.targetLabel },
          sharedOptions,
          device as 'desktop' | 'mobile',
        );

        const similarityPct = (result.diff.similarity * 100).toFixed(2);
        console.log(`Run [${device}]: ${result.runId}`);
        console.log(`Artifacts: ${result.outputDir}`);
        console.log(`Visual similarity: ${similarityPct}% (diff pixels: ${result.diff.diffPixels}/${result.diff.totalPixels})`);
        console.log(`Base load time: ${result.base.timing.loadTimeMs.toFixed(0)} ms`);
        console.log(`Target load time: ${result.target.timing.loadTimeMs.toFixed(0)} ms`);
        const delta = result.target.timing.loadTimeMs - result.base.timing.loadTimeMs;
        const faster = delta < 0 ? 'faster' : 'slower';
        console.log(`Target is ${Math.abs(delta).toFixed(0)} ms ${faster} than base.`);
        console.log('');

        lastResult = result;
      }
      // Exit code summary could be added here in future
    }
  } catch (err) {
    console.error('Comparison failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
});

program.parseAsync(process.argv);
