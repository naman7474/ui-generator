"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHistory = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const supabase_1 = require("./supabase");
const storage_1 = require("./storage");
const listHistory = async (outputDir, limit) => {
    if ((0, supabase_1.isSupabaseConfigured)()) {
        const runs = await supabase_1.db.listRuns(limit);
        return Promise.all(runs.map(async (run) => {
            let reportUrl;
            let reportJsonUrl;
            let artifactsUrl;
            if (run.artifacts_path) {
                try {
                    const reportFile = run.type === 'batch' ? 'batch-report.json' : 'report.json';
                    const reportPath = path_1.default.join(run.artifacts_path, reportFile);
                    reportUrl = await storage_1.storage.reportUrl(reportPath);
                    reportJsonUrl = await storage_1.storage.reportJsonUrl(reportPath);
                    artifactsUrl = await storage_1.storage.artifactsUrl(run.artifacts_path) || undefined;
                }
                catch (e) {
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
                webPath: run.artifacts_path ? `/artifacts/${path_1.default.relative(outputDir, run.artifacts_path)}` : undefined,
            };
        }));
    }
    // Fallback to local file system
    const entries = await promises_1.default.readdir(outputDir, { withFileTypes: true }).catch(() => []);
    const dirs = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort()
        .reverse()
        .slice(0, limit);
    const items = [];
    for (const dirName of dirs) {
        try {
            const reportPath = path_1.default.join(outputDir, dirName, 'report.json');
            const batchReportPath = path_1.default.join(outputDir, dirName, 'batch-report.json');
            // Try single report first
            const reportContent = await promises_1.default.readFile(reportPath, 'utf-8').catch(() => null);
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
                    outputDir: path_1.default.join(outputDir, dirName),
                    reportJsonUrl: `/artifacts/${dirName}/report.json`,
                    webPath: `/artifacts/${dirName}`,
                });
                continue;
            }
            // Try batch report
            const batchContent = await promises_1.default.readFile(batchReportPath, 'utf-8').catch(() => null);
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
                    outputDir: path_1.default.join(outputDir, dirName),
                    reportJsonUrl: `/artifacts/${dirName}/batch-report.json`,
                    webPath: `/artifacts/${dirName}`,
                });
            }
        }
        catch {
            // ignore malformed
        }
    }
    return items;
};
exports.listHistory = listHistory;
const parseTimestamp = (dirName) => {
    // format: YYYY-MM-DDTHH-mm-ss-SSSZ or batch-YYYY...
    // This is a rough approximation if the dirname is ISO-like
    // But our timestampId() uses a specific format. 
    // Let's just return 0 if parse fails or implement a proper parser if needed.
    // For now, sorting by name (reverse) gives correct order.
    return 0;
};
