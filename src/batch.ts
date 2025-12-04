import path from 'path';
import { compareSites } from './comparator';
import { config as envConfig } from './config';
import { BatchComparisonResult, ComparisonOptions, ComparisonResult } from './types';
import { ensureDir, timestampId } from './utils';
import { crawlPaths } from './crawl';
import { writeBatchReport } from './report';
import { storage } from './storage';

export interface BatchOptions extends ComparisonOptions {
  maxPages?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  devices?: ('desktop' | 'mobile')[];
}

export const compareWholeSite = async (
  baseRoot: string,
  targetRoot: string,
  options?: BatchOptions,
): Promise<BatchComparisonResult> => {
  const maxPages = options?.maxPages ?? 20;
  const batchId = `batch-${timestampId()}`;
  const batchDir = path.join(options?.outputDir ?? envConfig.outputDir, batchId);
  await ensureDir(batchDir);

  const paths = await crawlPaths(baseRoot, {
    maxPages,
    waitUntil: options?.waitUntil,
    navigationTimeoutMs: options?.navigationTimeoutMs,
    headless: options?.headless,
    includePatterns: options?.includePatterns,
    excludePatterns: options?.excludePatterns,
  });

  const devices = options?.devices && options.devices.length > 0 ? options.devices : ['desktop'];

  const pages: ComparisonResult[] = [];
  for (const pathPart of paths) {
    const baseUrl = new URL(pathPart, baseRoot).href;
    const targetUrl = new URL(pathPart, targetRoot).href;

    for (const device of devices) {
      const result = await compareSites(baseUrl, targetUrl, { base: 'base', target: 'target' }, {
        ...options,
        outputDir: batchDir,
      }, device as 'desktop' | 'mobile');
      pages.push(result);
    }
  }

  const summary = (() => {
    if (!pages.length) {
      return { averageSimilarity: 0, averageDiffPixels: 0, averageBaseLoadMs: 0, averageTargetLoadMs: 0 };
    }
    const totals = pages.reduce(
      (acc, page) => {
        acc.similarity += page.diff.similarity;
        acc.diffPixels += page.diff.diffPixels;
        acc.baseLoad += page.base.timing.loadTimeMs;
        acc.targetLoad += page.target.timing.loadTimeMs;
        return acc;
      },
      { similarity: 0, diffPixels: 0, baseLoad: 0, targetLoad: 0 },
    );
    const count = pages.length;
    return {
      averageSimilarity: totals.similarity / count,
      averageDiffPixels: totals.diffPixels / count,
      averageBaseLoadMs: totals.baseLoad / count,
      averageTargetLoadMs: totals.targetLoad / count,
    };
  })();

  const batchResult: BatchComparisonResult = {
    batchId,
    baseRoot,
    targetRoot,
    pages,
    paths,
    summary,
    outputDir: batchDir,
  };

  await writeBatchReport(batchResult);
  await storage.persistDir(batchDir);
  return batchResult;
};
