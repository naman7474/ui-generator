"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareWholeSite = void 0;
const path_1 = __importDefault(require("path"));
const comparator_1 = require("./comparator");
const config_1 = require("./config");
const utils_1 = require("./utils");
const crawl_1 = require("./crawl");
const report_1 = require("./report");
const storage_1 = require("./storage");
const compareWholeSite = async (baseRoot, targetRoot, options) => {
    const maxPages = options?.maxPages ?? 20;
    const batchId = `batch-${(0, utils_1.timestampId)()}`;
    const batchDir = path_1.default.join(options?.outputDir ?? config_1.config.outputDir, batchId);
    await (0, utils_1.ensureDir)(batchDir);
    const paths = await (0, crawl_1.crawlPaths)(baseRoot, {
        maxPages,
        waitUntil: options?.waitUntil,
        navigationTimeoutMs: options?.navigationTimeoutMs,
        headless: options?.headless,
        includePatterns: options?.includePatterns,
        excludePatterns: options?.excludePatterns,
    });
    const devices = options?.devices && options.devices.length > 0 ? options.devices : ['desktop'];
    const pages = [];
    for (const pathPart of paths) {
        const baseUrl = new URL(pathPart, baseRoot).href;
        const targetUrl = new URL(pathPart, targetRoot).href;
        for (const device of devices) {
            const result = await (0, comparator_1.compareSites)(baseUrl, targetUrl, { base: 'base', target: 'target' }, {
                ...options,
                outputDir: batchDir,
            }, device);
            pages.push(result);
        }
    }
    const summary = (() => {
        if (!pages.length) {
            return { averageSimilarity: 0, averageDiffPixels: 0, averageBaseLoadMs: 0, averageTargetLoadMs: 0 };
        }
        const totals = pages.reduce((acc, page) => {
            acc.similarity += page.diff.similarity;
            acc.diffPixels += page.diff.diffPixels;
            acc.baseLoad += page.base.timing.loadTimeMs;
            acc.targetLoad += page.target.timing.loadTimeMs;
            return acc;
        }, { similarity: 0, diffPixels: 0, baseLoad: 0, targetLoad: 0 });
        const count = pages.length;
        return {
            averageSimilarity: totals.similarity / count,
            averageDiffPixels: totals.diffPixels / count,
            averageBaseLoadMs: totals.baseLoad / count,
            averageTargetLoadMs: totals.targetLoad / count,
        };
    })();
    const batchResult = {
        batchId,
        baseRoot,
        targetRoot,
        pages,
        paths,
        summary,
        outputDir: batchDir,
    };
    await (0, report_1.writeBatchReport)(batchResult);
    await storage_1.storage.persistDir(batchDir);
    return batchResult;
};
exports.compareWholeSite = compareWholeSite;
