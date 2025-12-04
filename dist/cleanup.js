"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupArtifacts = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const storage_1 = require("./storage");
const cleanupArtifacts = async (baseDir, olderThanDays) => {
    if (olderThanDays <= 0)
        return { removed: 0, kept: 0, errors: 0 };
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const entries = await promises_1.default.readdir(baseDir, { withFileTypes: true }).catch(() => []);
    const dirs = entries.filter((e) => e.isDirectory());
    let removed = 0;
    let kept = 0;
    let errors = 0;
    for (const dir of dirs) {
        const dirPath = path_1.default.join(baseDir, dir.name);
        try {
            const stats = await promises_1.default.stat(dirPath);
            if (stats.mtimeMs < cutoff) {
                await storage_1.storage.deleteDir(dirPath);
                removed += 1;
            }
            else {
                kept += 1;
            }
        }
        catch (err) {
            console.error('cleanup error', dirPath, err);
            errors += 1;
        }
    }
    return { removed, kept, errors };
};
exports.cleanupArtifacts = cleanupArtifacts;
