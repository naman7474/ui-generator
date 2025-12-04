import { ComputedStyleData, StyleComparisonResult } from './style-diff';

export interface ComparisonOptions {
  outputDir?: string;
  threshold?: number;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
  };
  fullPage?: boolean;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  navigationTimeoutMs?: number;
  headless?: boolean;
  postLoadWaitMs?: number;
}

export interface NavigationTimingSummary {
  loadTimeMs: number;
  domContentLoadedMs: number;
  responseEndMs: number;
  raw: Record<string, unknown>;
}

export interface SiteCaptureResult {
  url: string;
  label: string;
  screenshotPath: string;
  timing: NavigationTimingSummary;
  styles?: ComputedStyleData[];
}

export interface DiffResult {
  diffPixels: number;
  totalPixels: number;
  similarity: number;
  diffPath: string;
}

export interface ComparisonResult {
  runId: string;
  base: SiteCaptureResult;
  target: SiteCaptureResult;
  diff: DiffResult;
  styleDiff?: StyleComparisonResult;
  outputDir: string;
  device: 'desktop' | 'mobile';
}

export interface BatchComparisonResult {
  batchId: string;
  baseRoot: string;
  targetRoot: string;
  paths: string[];
  summary: {
    averageSimilarity: number;
    averageDiffPixels: number;
    averageBaseLoadMs: number;
    averageTargetLoadMs: number;
  };
  pages: ComparisonResult[];
  outputDir: string;
}

export * from './style-diff';
