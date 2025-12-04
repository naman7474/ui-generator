import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { compareSites } from './comparator';
import { compareWholeSite } from './batch';
import { config } from './config';
import { listHistory } from './history';
import { ensureDir } from './utils';
import { buildLinksForReport, storage } from './storage';
import { cleanupArtifacts } from './cleanup';
import { recordRun, renderMetrics } from './metrics';
import { supabase, db, isSupabaseConfigured } from './supabase';
import { Agent, setGlobalDispatcher } from 'undici';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/artifacts', express.static(config.outputDir));

// Auth middleware removed as per user request for internal tool
// const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => { ... }

// app.use('/compare', authMiddleware); // Disabledotected routes
// app.use('/admin', authMiddleware);
// app.use('/history', authMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const urlPath = (req.path || req.originalUrl || '').toString();
  const isNoisyStatic =
    /^\/artifacts\//.test(urlPath) ||
    /^\/.well-known\//.test(urlPath) ||
    /\.(png|jpe?g|gif|webp|svg|ico|css|js|map|woff2?|ttf|otf)$/i.test(urlPath);
  res.on('finish', () => {
    if (isNoisyStatic) return; // suppress static noise
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Configure global HTTP timeouts for long-running generator requests
try {
  const headersTimeout = Number(process.env.FETCH_HEADERS_TIMEOUT_MS || 600000); // 10 minutes
  const bodyTimeout = Number(process.env.FETCH_BODY_TIMEOUT_MS || 0); // 0 = disable body timeout
  setGlobalDispatcher(new Agent({ headersTimeout, bodyTimeout }));
  console.log(`[HTTP] Undici timeouts set: headers=${headersTimeout}ms body=${bodyTimeout}ms`);
} catch (e) {
  console.warn('[HTTP] Failed to set Undici global dispatcher:', e instanceof Error ? e.message : String(e));
}

let inFlightRuns = 0;
const runGate = async <T>(res: express.Response, handler: () => Promise<T>): Promise<T | undefined> => {
  if (inFlightRuns >= config.maxConcurrentRuns) {
    res.status(429).json({ error: 'Server is busy running other comparisons. Please retry shortly.' });
    return undefined;
  }
  inFlightRuns += 1;
  try {
    return await handler();
  } finally {
    inFlightRuns -= 1;
  }
};

const compareSchema = z.object({
  baseUrl: z.string().url(),
  targetUrl: z.string().url(),
  labels: z
    .object({
      base: z.string().optional(),
      target: z.string().optional(),
    })
    .optional(),
  options: z
    .object({
      outputDir: z.string().optional(),
      threshold: z.number().min(0).max(1).optional(),
      viewport: z
        .object({
          width: z.number().int().positive(),
          height: z.number().int().positive(),
          deviceScaleFactor: z.number().positive().optional(),
        })
        .optional(),
      fullPage: z.boolean().optional(),
      waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle', 'commit']).optional(),
      navigationTimeoutMs: z.number().int().positive().optional(),
      headless: z.boolean().optional(),
      devices: z.array(z.enum(['desktop', 'mobile'])).optional(),
    })
    .optional(),
});

const batchSchema = z.object({
  baseUrl: z.string().url(),
  targetUrl: z.string().url(),
  maxPages: z.number().int().positive().max(200).optional(),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  options: compareSchema.shape.options.optional(),
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/metrics', (_req, res) => {
  res.type('text/plain').send(renderMetrics());
});

app.get('/config', (_req, res) => {
  res.json({
    supabaseUrl: config.supabase.url,
    supabaseAnonKey: config.supabase.anonKey,
  });
});

app.get('/ready', async (_req, res) => {
  try {
    await ensureDir(config.outputDir);
    await fs.access(config.outputDir);
    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', error: err instanceof Error ? err.message : 'unknown' });
  }
});

app.post('/compare', async (req, res) => {
  const parsed = compareSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  await runGate(res, async () => {
    const started = Date.now();
    let status: 'success' | 'failure' = 'success';
    try {
      const { baseUrl, targetUrl, labels, options } = parsed.data;
      const devices = options?.devices && options.devices.length > 0 ? options.devices : ['desktop'];

      const results = [];
      for (const device of devices) {
        // We need unique labels or dirs if running multiple?
        // Actually compareSites creates a unique timestamped dir.
        // But if we want them grouped or just returned as a list?
        // The current API returns a single result object.
        // We should probably change the response to return an array of results or a "multi-result".
        // BUT to keep it simple for now, let's just run them sequentially and return the LAST one?
        // No, that's bad.
        // Let's return a list of results if multiple devices are requested?
        // Or better: The UI expects a single result.
        // If we want to support multiple devices, we should probably change the UI to handle a list.
        // OR we can just return the first one and let the others be in history?
        // The user wants "Multi Device Support".
        // Let's return an array of results.
        // But we need to update the frontend to handle it.
        // Wait, the frontend `renderResult` takes a single result.
        // I should update the frontend to handle an array.

        try {
          const result = await compareSites(baseUrl, targetUrl, labels ?? {}, options, device as 'desktop' | 'mobile');

          const links = await buildLinksForReport(path.join(result.outputDir, 'report.json'));

          if (isSupabaseConfigured()) {
            await db.createRun({
              type: 'single',
              status: 'success',
              base_url: baseUrl,
              target_url: targetUrl,
              summary: {
                similarity: result.diff.similarity,
                baseLoadMs: result.base.timing.loadTimeMs,
                targetLoadMs: result.target.timing.loadTimeMs,
              },
              artifacts_path: result.outputDir,
              device: device,
            });
          }

          results.push({
            ...result,
            reportUrl: links.reportUrl,
            reportJsonUrl: links.reportJsonUrl,
            artifactsUrl: links.artifactsUrl,
          });
        } catch (err) {
          if (isSupabaseConfigured()) {
            await db.createRun({
              type: 'single',
              status: 'failure',
              base_url: baseUrl,
              target_url: targetUrl,
              summary: { error: err instanceof Error ? err.message : 'Unknown error' },
              device: device,
            }).catch((e) => console.error('Supabase failure run insert error:', e));
          }
          throw err;
        }
      }

      // If only one result, return it as object (backward compatibility)
      // If multiple, return array?
      // Let's return { result: results[0], results: results }
      res.json({ result: results[0], results });
    } catch (err) {
      status = 'failure';
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      recordRun('single', status, Date.now() - started);
    }
  });
});

app.post('/compare/batch', async (req, res) => {
  const parsed = batchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  await runGate(res, async () => {
    const started = Date.now();
    let status: 'success' | 'failure' = 'success';
    try {
      const { baseUrl, targetUrl, maxPages, includePatterns, excludePatterns, options } = parsed.data;
      let result: Awaited<ReturnType<typeof compareWholeSite>>;
      try {
        result = await compareWholeSite(baseUrl, targetUrl, { ...options, maxPages, includePatterns, excludePatterns });
      } catch (err) {
        if (isSupabaseConfigured()) {
          await db.createRun({
            type: 'batch',
            status: 'failure',
            base_url: baseUrl,
            target_url: targetUrl,
            summary: { error: err instanceof Error ? err.message : 'Unknown error' },
          }).catch((e) => console.error('Supabase failure batch insert error:', e));
        }
        throw err;
      }
      const links = await buildLinksForReport(path.join(result.outputDir, 'batch-report.json'));

      if (isSupabaseConfigured()) {
        await db.createRun({
          type: 'batch',
          status: 'success',
          base_url: baseUrl,
          target_url: targetUrl,
          summary: result.summary,
          artifacts_path: result.outputDir,
        });
      }

      res.json({
        result: {
          ...result,
          reportUrl: links.reportUrl,
          reportJsonUrl: links.reportJsonUrl,
          artifactsUrl: links.artifactsUrl,
        },
      });
    } catch (err) {
      status = 'failure';
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      recordRun('batch', status, Date.now() - started);
    }
  });
});

app.get('/history', async (req, res) => {
  const limitParam = Number(req.query.limit ?? '50');
  const limit = Number.isFinite(limitParam) ? limitParam : 50;
  try {
    const items = await listHistory(config.outputDir, limit);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});



app.post('/screenshot', async (req, res) => {
  try {
    const { url, device, fullPage } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    // @ts-ignore
    const result = await import('./screenshot').then(m => m.capture(url, { device, fullPage }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/pixelgen/run', async (req, res) => {
  const pixelGenSchema = z.object({
    baseUrl: z.string().url(),
    stack: z.string().optional(),
    devices: z.array(z.enum(['desktop','mobile'])).optional(),
    minSimilarity: z.number().min(0).max(1).optional(),
    maxIterations: z.number().int().positive().max(20).optional(),
    fullPage: z.boolean().optional(),
    headless: z.boolean().optional(),
    threshold: z.number().min(0).max(1).optional(),
  });

  const parsed = pixelGenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    // @ts-ignore
    const result = await import('./pixelgen').then(m => m.runPixelGen(parsed.data));
    // Ensure artifactsUrl is a proper public URL via storage provider when possible
    try {
      const artifactsUrl = await storage.artifactsUrl(path.join(config.outputDir, 'pixelgen', result.jobId));
      if (artifactsUrl) {
        result.artifactsUrl = artifactsUrl;
      }
    } catch {}
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/admin/cleanup', async (req, res) => {
  const daysParam = Number(req.query.days ?? config.retentionDays);
  const days = Number.isFinite(daysParam) ? daysParam : config.retentionDays;
  try {
    const result = await cleanupArtifacts(config.outputDir, days);
    res.json({ pruned: result.removed, kept: result.kept, errors: result.errors, days });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

const port = Number(process.env.PORT ?? 3000);
const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

ensureDir(config.outputDir)
  .catch((err) => {
    console.error('Failed to ensure output directory', err);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`Checker API listening on port ${port}`);
    });
  });
