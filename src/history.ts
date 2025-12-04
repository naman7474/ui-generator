import fs from 'fs/promises';
import path from 'path';
import { db, isSupabaseConfigured } from './supabase';

export interface HistoryItem {
  runId: string;
  timestamp: number;
  generatedAt?: string;
  type: 'single' | 'batch';
  status: 'success' | 'failure';
  baseUrl?: string;
  targetUrl?: string;
  summary?: any;
  reportUrl?: string;
  reportJsonUrl?: string;
  artifactsUrl?: string;
  device?: string;
  outputDir?: string;
  webPath?: string;
}

import { storage } from './storage';

export const listHistory = async (outputDir: string, limit: number): Promise<HistoryItem[]> => {
  if (isSupabaseConfigured()) {
    const runs = await db.listRuns(limit);
    return Promise.all(runs.map(async (run: any) => {
      let reportUrl: string | undefined;
      let reportJsonUrl: string | undefined;
      let artifactsUrl: string | undefined;
      if (run.artifacts_path) {
        try {
          const reportFile = run.type === 'batch' ? 'batch-report.json' : 'report.json';
          const reportPath = path.join(run.artifacts_path, reportFile);
          reportUrl = await storage.reportUrl(reportPath);
          reportJsonUrl = await storage.reportJsonUrl(reportPath);
          artifactsUrl = await storage.artifactsUrl(run.artifacts_path) || undefined;
        } catch (e) {
          // ignore url gen errors
        }
      }

      return {
        runId: run.id,
        timestamp: new Date(run.created_at).getTime(),
        generatedAt: run.created_at,
        type: run.type,
        status: run.status,
        baseUrl: run.base_url,
        targetUrl: run.target_url,
        summary: run.summary,
        reportUrl,
        reportJsonUrl,
        artifactsUrl,
        device: run.device || 'desktop',
        outputDir: run.artifacts_path,
        webPath: run.artifacts_path ? `/artifacts/${path.relative(outputDir, run.artifacts_path)}` : undefined,
      };
    }));
  }

  // Fallback to local file system
  const entries = await fs.readdir(outputDir, { withFileTypes: true }).catch(() => []);
  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse()
    .slice(0, limit);

  const items: HistoryItem[] = [];
  for (const dirName of dirs) {
    try {
      const reportPath = path.join(outputDir, dirName, 'report.json');
      const batchReportPath = path.join(outputDir, dirName, 'batch-report.json');

      // Try single report first
      const reportContent = await fs.readFile(reportPath, 'utf-8').catch(() => null);
      if (reportContent) {
        const report = JSON.parse(reportContent);
        items.push({
          runId: dirName,
          timestamp: parseTimestamp(dirName),
          type: 'single',
          status: 'success', // inferred
          baseUrl: report.base?.url,
          targetUrl: report.target?.url,
          summary: { similarity: report.diff?.similarity },
          outputDir: path.join(outputDir, dirName),
          reportJsonUrl: `/artifacts/${dirName}/report.json`,
          webPath: `/artifacts/${dirName}`,
        });
        continue;
      }

      // Try batch report
      const batchContent = await fs.readFile(batchReportPath, 'utf-8').catch(() => null);
      if (batchContent) {
        const report = JSON.parse(batchContent);
        items.push({
          runId: dirName,
          timestamp: parseTimestamp(dirName),
          type: 'batch',
          status: 'success',
          baseUrl: report.baseRoot,
          targetUrl: report.targetRoot,
          summary: report.summary,
          outputDir: path.join(outputDir, dirName),
          reportJsonUrl: `/artifacts/${dirName}/batch-report.json`,
          webPath: `/artifacts/${dirName}`,
        });
      }
    } catch {
      // ignore malformed
    }
  }
  return items;
};

const parseTimestamp = (dirName: string): number => {
  // format: YYYY-MM-DDTHH-mm-ss-SSSZ or batch-YYYY...
  // This is a rough approximation if the dirname is ISO-like
  // But our timestampId() uses a specific format. 
  // Let's just return 0 if parse fails or implement a proper parser if needed.
  // For now, sorting by name (reverse) gives correct order.
  return 0;
};
