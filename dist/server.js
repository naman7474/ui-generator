"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const comparator_1 = require("./comparator");
const batch_1 = require("./batch");
const config_1 = require("./config");
const history_1 = require("./history");
const utils_1 = require("./utils");
const storage_1 = require("./storage");
const cleanup_1 = require("./cleanup");
const metrics_1 = require("./metrics");
const supabase_1 = require("./supabase");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '1mb' }));
app.use('/artifacts', express_1.default.static(config_1.config.outputDir));
// Auth middleware removed as per user request for internal tool
// const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => { ... }
// app.use('/compare', authMiddleware); // Disabledotected routes
// app.use('/admin', authMiddleware);
// app.use('/history', authMiddleware);
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});
let inFlightRuns = 0;
const runGate = async (res, handler) => {
    if (inFlightRuns >= config_1.config.maxConcurrentRuns) {
        res.status(429).json({ error: 'Server is busy running other comparisons. Please retry shortly.' });
        return undefined;
    }
    inFlightRuns += 1;
    try {
        return await handler();
    }
    finally {
        inFlightRuns -= 1;
    }
};
const compareSchema = zod_1.z.object({
    baseUrl: zod_1.z.string().url(),
    targetUrl: zod_1.z.string().url(),
    labels: zod_1.z
        .object({
        base: zod_1.z.string().optional(),
        target: zod_1.z.string().optional(),
    })
        .optional(),
    options: zod_1.z
        .object({
        outputDir: zod_1.z.string().optional(),
        threshold: zod_1.z.number().min(0).max(1).optional(),
        viewport: zod_1.z
            .object({
            width: zod_1.z.number().int().positive(),
            height: zod_1.z.number().int().positive(),
            deviceScaleFactor: zod_1.z.number().positive().optional(),
        })
            .optional(),
        fullPage: zod_1.z.boolean().optional(),
        waitUntil: zod_1.z.enum(['load', 'domcontentloaded', 'networkidle', 'commit']).optional(),
        navigationTimeoutMs: zod_1.z.number().int().positive().optional(),
        headless: zod_1.z.boolean().optional(),
        devices: zod_1.z.array(zod_1.z.enum(['desktop', 'mobile'])).optional(),
    })
        .optional(),
});
const batchSchema = zod_1.z.object({
    baseUrl: zod_1.z.string().url(),
    targetUrl: zod_1.z.string().url(),
    maxPages: zod_1.z.number().int().positive().max(200).optional(),
    includePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    excludePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    options: compareSchema.shape.options.optional(),
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.get('/metrics', (_req, res) => {
    res.type('text/plain').send((0, metrics_1.renderMetrics)());
});
app.get('/config', (_req, res) => {
    res.json({
        supabaseUrl: config_1.config.supabase.url,
        supabaseAnonKey: config_1.config.supabase.anonKey,
    });
});
app.get('/ready', async (_req, res) => {
    try {
        await (0, utils_1.ensureDir)(config_1.config.outputDir);
        await promises_1.default.access(config_1.config.outputDir);
        res.json({ status: 'ready' });
    }
    catch (err) {
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
        let status = 'success';
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
                    const result = await (0, comparator_1.compareSites)(baseUrl, targetUrl, labels ?? {}, options, device);
                    const links = await (0, storage_1.buildLinksForReport)(path_1.default.join(result.outputDir, 'report.json'));
                    if ((0, supabase_1.isSupabaseConfigured)()) {
                        await supabase_1.db.createRun({
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
                }
                catch (err) {
                    if ((0, supabase_1.isSupabaseConfigured)()) {
                        await supabase_1.db.createRun({
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
        }
        catch (err) {
            status = 'failure';
            res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
        }
        finally {
            (0, metrics_1.recordRun)('single', status, Date.now() - started);
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
        let status = 'success';
        try {
            const { baseUrl, targetUrl, maxPages, includePatterns, excludePatterns, options } = parsed.data;
            let result;
            try {
                result = await (0, batch_1.compareWholeSite)(baseUrl, targetUrl, { ...options, maxPages, includePatterns, excludePatterns });
            }
            catch (err) {
                if ((0, supabase_1.isSupabaseConfigured)()) {
                    await supabase_1.db.createRun({
                        type: 'batch',
                        status: 'failure',
                        base_url: baseUrl,
                        target_url: targetUrl,
                        summary: { error: err instanceof Error ? err.message : 'Unknown error' },
                    }).catch((e) => console.error('Supabase failure batch insert error:', e));
                }
                throw err;
            }
            const links = await (0, storage_1.buildLinksForReport)(path_1.default.join(result.outputDir, 'batch-report.json'));
            if ((0, supabase_1.isSupabaseConfigured)()) {
                await supabase_1.db.createRun({
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
        }
        catch (err) {
            status = 'failure';
            res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
        }
        finally {
            (0, metrics_1.recordRun)('batch', status, Date.now() - started);
        }
    });
});
app.get('/history', async (req, res) => {
    const limitParam = Number(req.query.limit ?? '50');
    const limit = Number.isFinite(limitParam) ? limitParam : 50;
    try {
        const items = await (0, history_1.listHistory)(config_1.config.outputDir, limit);
        res.json({ items });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
});
app.post('/screenshot', async (req, res) => {
    try {
        const { url, device, fullPage } = req.body;
        if (!url)
            return res.status(400).json({ error: 'url is required' });
        // @ts-ignore
        const result = await Promise.resolve().then(() => __importStar(require('./screenshot'))).then(m => m.capture(url, { device, fullPage }));
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
});
app.post('/pixelgen/run', async (req, res) => {
    const pixelGenSchema = zod_1.z.object({
        baseUrl: zod_1.z.string().url(),
        stack: zod_1.z.string().optional(),
        devices: zod_1.z.array(zod_1.z.enum(['desktop', 'mobile'])).optional(),
        minSimilarity: zod_1.z.number().min(0).max(1).optional(),
        maxIterations: zod_1.z.number().int().positive().max(20).optional(),
        fullPage: zod_1.z.boolean().optional(),
        headless: zod_1.z.boolean().optional(),
        threshold: zod_1.z.number().min(0).max(1).optional(),
    });
    const parsed = pixelGenSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
        // @ts-ignore
        const result = await Promise.resolve().then(() => __importStar(require('./pixelgen'))).then(m => m.runPixelGen(parsed.data));
        // Ensure artifactsUrl is a proper public URL via storage provider when possible
        try {
            const artifactsUrl = await storage_1.storage.artifactsUrl(path_1.default.join(config_1.config.outputDir, 'pixelgen', result.jobId));
            if (artifactsUrl) {
                result.artifactsUrl = artifactsUrl;
            }
        }
        catch { }
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
});
app.post('/admin/cleanup', async (req, res) => {
    const daysParam = Number(req.query.days ?? config_1.config.retentionDays);
    const days = Number.isFinite(daysParam) ? daysParam : config_1.config.retentionDays;
    try {
        const result = await (0, cleanup_1.cleanupArtifacts)(config_1.config.outputDir, days);
        res.json({ pruned: result.removed, kept: result.kept, errors: result.errors, days });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
});
const port = Number(process.env.PORT ?? 3000);
const publicDir = path_1.default.join(process.cwd(), 'public');
app.use(express_1.default.static(publicDir));
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(publicDir, 'index.html'));
});
(0, utils_1.ensureDir)(config_1.config.outputDir)
    .catch((err) => {
    console.error('Failed to ensure output directory', err);
})
    .finally(() => {
    app.listen(port, () => {
        console.log(`Checker API listening on port ${port}`);
    });
});
