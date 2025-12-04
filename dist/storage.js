"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLinksForReport = exports.storage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { S3Client, PutObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config_1 = require("./config");
const toPosix = (value) => value.split(path_1.default.sep).join('/');
const walkFiles = async (dir) => {
    const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = path_1.default.join(dir, entry.name);
        if (entry.isDirectory()) {
            const nested = await walkFiles(fullPath);
            files.push(...nested);
        }
        else if (entry.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
};
class LocalStorageProvider {
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    async persistDir(_localDir) {
        return;
    }
    async reportUrl(localReportPath) {
        const htmlPath = localReportPath.replace(/\.json$/, '.html');
        const relative = toPosix(path_1.default.relative(this.baseDir, htmlPath));
        return `/artifacts/${relative}`;
    }
    async reportJsonUrl(localReportPath) {
        const relative = toPosix(path_1.default.relative(this.baseDir, localReportPath));
        return `/artifacts/${relative}`;
    }
    async artifactsUrl(localDir) {
        const relative = toPosix(path_1.default.relative(this.baseDir, localDir));
        return `/artifacts/${relative}`;
    }
    async deleteDir(localDir) {
        await promises_1.default.rm(localDir, { recursive: true, force: true });
    }
}
class S3StorageProvider {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.prefix = config_1.config.s3.prefix ? config_1.config.s3.prefix.replace(/\/+$/, '') + '/' : '';
        this.client = new S3Client({
            region: config_1.config.s3.region,
            endpoint: config_1.config.s3.endpoint,
            forcePathStyle: config_1.config.s3.forcePathStyle,
            credentials: config_1.config.s3.accessKeyId && config_1.config.s3.secretAccessKey
                ? {
                    accessKeyId: config_1.config.s3.accessKeyId,
                    secretAccessKey: config_1.config.s3.secretAccessKey,
                }
                : undefined,
        });
    }
    keyFor(localPath) {
        const relative = toPosix(path_1.default.relative(this.baseDir, localPath));
        return `${this.prefix}${relative}`;
    }
    async uploadFile(localPath) {
        const key = this.keyFor(localPath);
        const body = await promises_1.default.readFile(localPath);
        const contentType = this.guessContentType(localPath);
        await this.client.send(new PutObjectCommand({
            Bucket: config_1.config.s3.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        }));
    }
    guessContentType(filePath) {
        if (filePath.endsWith('.html'))
            return 'text/html';
        if (filePath.endsWith('.json'))
            return 'application/json';
        if (filePath.endsWith('.png'))
            return 'image/png';
        return undefined;
    }
    async persistDir(localDir) {
        const files = await walkFiles(localDir);
        for (const file of files) {
            await this.uploadFile(file);
        }
    }
    async reportUrl(localReportPath) {
        const htmlPath = localReportPath.replace(/\.json$/, '.html');
        const key = this.keyFor(htmlPath);
        const command = new GetObjectCommand({ Bucket: config_1.config.s3.bucket, Key: key });
        try {
            return await getSignedUrl(this.client, command, { expiresIn: config_1.config.s3.signedUrlTtlSeconds });
        }
        catch {
            // Fallback to object URL
            return this.objectUrl(key);
        }
    }
    async reportJsonUrl(localReportPath) {
        const key = this.keyFor(localReportPath);
        const command = new GetObjectCommand({ Bucket: config_1.config.s3.bucket, Key: key });
        try {
            return await getSignedUrl(this.client, command, { expiresIn: config_1.config.s3.signedUrlTtlSeconds });
        }
        catch {
            return this.objectUrl(key);
        }
    }
    async artifactsUrl(localDir) {
        const key = this.keyFor(localDir).replace(/\/*$/, '/');
        return this.objectUrl(key);
    }
    objectUrl(key) {
        const endpoint = config_1.config.s3.endpoint?.replace(/\/$/, '') || `https://s3.${config_1.config.s3.region}.amazonaws.com`;
        if (config_1.config.s3.forcePathStyle) {
            return `${endpoint}/${config_1.config.s3.bucket}/${key}`;
        }
        return `https://${config_1.config.s3.bucket}.${endpoint.replace(/^https?:\/\//, '')}/${key}`;
    }
    async deleteDir(localDir) {
        const prefix = this.keyFor(localDir).replace(/\/*$/, '/');
        let ContinuationToken;
        do {
            const list = await this.client.send(new ListObjectsV2Command({ Bucket: config_1.config.s3.bucket, Prefix: prefix, ContinuationToken }));
            const contents = list.Contents ?? [];
            ContinuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
            if (!contents.length)
                continue;
            await this.client.send(new DeleteObjectsCommand({
                Bucket: config_1.config.s3.bucket,
                Delete: {
                    Objects: contents.map((c) => ({ Key: c.Key })),
                    Quiet: true,
                },
            }));
        } while (ContinuationToken);
        await promises_1.default.rm(localDir, { recursive: true, force: true }).catch(() => undefined);
    }
}
const supabase_1 = require("./supabase");
class SupabaseStorageProvider {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.bucket = config_1.config.supabase.bucket;
    }
    keyFor(localPath) {
        const relative = toPosix(path_1.default.relative(this.baseDir, localPath));
        // Supabase storage paths shouldn't start with /
        return relative.replace(/^\/+/, '');
    }
    async persistDir(localDir) {
        if (!supabase_1.supabase)
            throw new Error('Supabase not configured');
        const files = await walkFiles(localDir);
        for (const file of files) {
            const key = this.keyFor(file);
            const body = await promises_1.default.readFile(file);
            const contentType = this.guessContentType(file) ?? 'application/octet-stream';
            const { error } = await supabase_1.supabase.storage
                .from(this.bucket)
                .upload(key, body, { contentType, upsert: true });
            if (error) {
                console.error(`Failed to upload ${key} to Supabase`, error);
                if (error.statusCode === '403' || error.message?.includes('row-level security')) {
                    console.error('💡 HINT: Ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env file to bypass RLS.');
                }
                // Don't throw immediately to allow partial uploads? Or throw?
                // Throwing is safer to know it failed.
                throw error;
            }
        }
    }
    guessContentType(filePath) {
        const lower = filePath.toLowerCase();
        if (lower.endsWith('.html'))
            return 'text/html';
        if (lower.endsWith('.json'))
            return 'application/json';
        if (lower.endsWith('.png'))
            return 'image/png';
        if (lower.endsWith('.css'))
            return 'text/css';
        if (lower.endsWith('.js'))
            return 'application/javascript';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg'))
            return 'image/jpeg';
        return undefined;
    }
    async reportUrl(localReportPath) {
        if (!supabase_1.supabase)
            throw new Error('Supabase not configured');
        const htmlPath = localReportPath.replace(/\.json$/, '.html');
        const key = this.keyFor(htmlPath);
        // Use Public URL so that relative links (images) in the HTML report work correctly.
        // NOTE: The 'artifacts' bucket MUST be set to Public in Supabase Dashboard.
        const { data } = supabase_1.supabase.storage
            .from(this.bucket)
            .getPublicUrl(key);
        return data.publicUrl;
    }
    async reportJsonUrl(localReportPath) {
        if (!supabase_1.supabase)
            throw new Error('Supabase not configured');
        const key = this.keyFor(localReportPath);
        const { data } = supabase_1.supabase.storage
            .from(this.bucket)
            .getPublicUrl(key);
        return data.publicUrl;
    }
    async artifactsUrl(localDir) {
        if (!supabase_1.supabase)
            return null;
        const key = this.keyFor(localDir);
        // Return the public URL for the folder.
        // Note: Supabase doesn't auto-generate an index page for folders, so this might just show XML or 404
        // unless the user uploads an index.html or configures it differently.
        // But it gives a correct link base.
        const { data } = supabase_1.supabase.storage
            .from(this.bucket)
            .getPublicUrl(key);
        return data.publicUrl;
    }
    async deleteDir(localDir) {
        if (!supabase_1.supabase)
            return;
        const prefix = this.keyFor(localDir);
        // List files with prefix
        const { data, error } = await supabase_1.supabase.storage
            .from(this.bucket)
            .list(prefix);
        if (error) {
            console.error('Failed to list files for deletion', error);
            return;
        }
        if (data && data.length > 0) {
            const paths = data.map((f) => `${prefix}/${f.name}`);
            await supabase_1.supabase.storage.from(this.bucket).remove(paths);
        }
        await promises_1.default.rm(localDir, { recursive: true, force: true }).catch(() => undefined);
    }
}
// Prefer S3 by default when all required pieces exist; otherwise fall back to local disk.
const useS3 = Boolean(config_1.config.s3.bucket &&
    config_1.config.s3.region &&
    config_1.config.s3.accessKeyId &&
    config_1.config.s3.secretAccessKey);
// Prefer Supabase if configured, then S3, then Local.
const provider = (0, supabase_1.isSupabaseConfigured)()
    ? new SupabaseStorageProvider(config_1.config.outputDir)
    : useS3
        ? new S3StorageProvider(config_1.config.outputDir)
        : new LocalStorageProvider(config_1.config.outputDir);
exports.storage = {
    persistDir: (dir) => provider.persistDir(dir),
    reportUrl: (reportPath) => provider.reportUrl(reportPath),
    reportJsonUrl: (reportPath) => provider.reportJsonUrl(reportPath),
    artifactsUrl: (dir) => provider.artifactsUrl(dir),
    deleteDir: (dir) => provider.deleteDir(dir),
    useS3,
    useSupabase: (0, supabase_1.isSupabaseConfigured)(),
};
const buildLinksForReport = async (reportPath) => {
    const reportUrl = await provider.reportUrl(reportPath);
    const reportJsonUrl = await provider.reportJsonUrl(reportPath);
    const artifactsUrl = await provider.artifactsUrl(path_1.default.dirname(reportPath));
    return { reportUrl, reportJsonUrl, artifactsUrl };
};
exports.buildLinksForReport = buildLinksForReport;
