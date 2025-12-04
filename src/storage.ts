import fs from 'fs/promises';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { S3Client, PutObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
import { config } from './config';

const toPosix = (value: string) => value.split(path.sep).join('/');

type StorageLinks = {
  reportUrl: string;
  reportJsonUrl: string;
  artifactsUrl: string | null;
};

interface StorageProvider {
  persistDir(localDir: string): Promise<void>;
  reportUrl(localReportPath: string): Promise<string>;
  reportJsonUrl(localReportPath: string): Promise<string>;
  artifactsUrl(localDir: string): Promise<string | null>;
  deleteDir(localDir: string): Promise<void>;
}

const walkFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkFiles(fullPath);
      files.push(...nested);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
};

class LocalStorageProvider implements StorageProvider {
  constructor(private readonly baseDir: string) { }

  async persistDir(_localDir: string): Promise<void> {
    return;
  }

  async reportUrl(localReportPath: string): Promise<string> {
    const htmlPath = localReportPath.replace(/\.json$/, '.html');
    const relative = toPosix(path.relative(this.baseDir, htmlPath));
    return `/artifacts/${relative}`;
  }

  async reportJsonUrl(localReportPath: string): Promise<string> {
    const relative = toPosix(path.relative(this.baseDir, localReportPath));
    return `/artifacts/${relative}`;
  }

  async artifactsUrl(localDir: string): Promise<string | null> {
    const relative = toPosix(path.relative(this.baseDir, localDir));
    return `/artifacts/${relative}`;
  }

  async deleteDir(localDir: string): Promise<void> {
    await fs.rm(localDir, { recursive: true, force: true });
  }
}

class S3StorageProvider implements StorageProvider {
  private client: any;
  private prefix: string;

  constructor(private readonly baseDir: string) {
    this.prefix = config.s3.prefix ? config.s3.prefix.replace(/\/+$/, '') + '/' : '';
    this.client = new S3Client({
      region: config.s3.region,
      endpoint: config.s3.endpoint,
      forcePathStyle: config.s3.forcePathStyle,
      credentials: config.s3.accessKeyId && config.s3.secretAccessKey
        ? {
          accessKeyId: config.s3.accessKeyId,
          secretAccessKey: config.s3.secretAccessKey,
        }
        : undefined,
    });
  }

  private keyFor(localPath: string): string {
    const relative = toPosix(path.relative(this.baseDir, localPath));
    return `${this.prefix}${relative}`;
  }

  private async uploadFile(localPath: string): Promise<void> {
    const key = this.keyFor(localPath);
    const body = await fs.readFile(localPath);
    const contentType = this.guessContentType(localPath);
    await this.client.send(new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));
  }

  private guessContentType(filePath: string): string | undefined {
    if (filePath.endsWith('.html')) return 'text/html';
    if (filePath.endsWith('.json')) return 'application/json';
    if (filePath.endsWith('.png')) return 'image/png';
    return undefined;
  }

  async persistDir(localDir: string): Promise<void> {
    const files = await walkFiles(localDir);
    for (const file of files) {
      await this.uploadFile(file);
    }
  }

  async reportUrl(localReportPath: string): Promise<string> {
    const htmlPath = localReportPath.replace(/\.json$/, '.html');
    const key = this.keyFor(htmlPath);
    const command = new GetObjectCommand({ Bucket: config.s3.bucket, Key: key });
    try {
      return await getSignedUrl(this.client, command, { expiresIn: config.s3.signedUrlTtlSeconds });
    } catch {
      // Fallback to object URL
      return this.objectUrl(key);
    }
  }

  async reportJsonUrl(localReportPath: string): Promise<string> {
    const key = this.keyFor(localReportPath);
    const command = new GetObjectCommand({ Bucket: config.s3.bucket, Key: key });
    try {
      return await getSignedUrl(this.client, command, { expiresIn: config.s3.signedUrlTtlSeconds });
    } catch {
      return this.objectUrl(key);
    }
  }

  async artifactsUrl(localDir: string): Promise<string | null> {
    const key = this.keyFor(localDir).replace(/\/*$/, '/');
    return this.objectUrl(key);
  }

  private objectUrl(key: string): string {
    const endpoint = config.s3.endpoint?.replace(/\/$/, '') || `https://s3.${config.s3.region}.amazonaws.com`;
    if (config.s3.forcePathStyle) {
      return `${endpoint}/${config.s3.bucket}/${key}`;
    }
    return `https://${config.s3.bucket}.${endpoint.replace(/^https?:\/\//, '')}/${key}`;
  }

  async deleteDir(localDir: string): Promise<void> {
    const prefix = this.keyFor(localDir).replace(/\/*$/, '/');
    let ContinuationToken: string | undefined;
    do {
      const list = await this.client.send(
        new ListObjectsV2Command({ Bucket: config.s3.bucket, Prefix: prefix, ContinuationToken }),
      );
      const contents = (list.Contents as any[] | undefined) ?? [];
      ContinuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
      if (!contents.length) continue;
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: config.s3.bucket,
          Delete: {
            Objects: contents.map((c) => ({ Key: c.Key! })),
            Quiet: true,
          },
        }),
      );
    } while (ContinuationToken);
    await fs.rm(localDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

import { supabase, isSupabaseConfigured } from './supabase';

class SupabaseStorageProvider implements StorageProvider {
  private bucket: string;

  constructor(private readonly baseDir: string) {
    this.bucket = config.supabase.bucket;
  }

  private keyFor(localPath: string): string {
    const relative = toPosix(path.relative(this.baseDir, localPath));
    // Supabase storage paths shouldn't start with /
    return relative.replace(/^\/+/, '');
  }

  async persistDir(localDir: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const files = await walkFiles(localDir);
    for (const file of files) {
      const key = this.keyFor(file);
      const body = await fs.readFile(file);
      const contentType = this.guessContentType(file) ?? 'application/octet-stream';

      const { error } = await supabase.storage
        .from(this.bucket)
        .upload(key, body, { contentType, upsert: true });

      if (error) {
        console.error(`Failed to upload ${key} to Supabase`, error);
        if ((error as any).statusCode === '403' || (error as any).message?.includes('row-level security')) {
          console.error('💡 HINT: Ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env file to bypass RLS.');
        }
        // Don't throw immediately to allow partial uploads? Or throw?
        // Throwing is safer to know it failed.
        throw error;
      }
    }
  }

  private guessContentType(filePath: string): string | undefined {
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.html')) return 'text/html';
    if (lower.endsWith('.json')) return 'application/json';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.css')) return 'text/css';
    if (lower.endsWith('.js')) return 'application/javascript';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    return undefined;
  }

  async reportUrl(localReportPath: string): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');
    const htmlPath = localReportPath.replace(/\.json$/, '.html');
    const key = this.keyFor(htmlPath);

    // Use Public URL so that relative links (images) in the HTML report work correctly.
    // NOTE: The 'artifacts' bucket MUST be set to Public in Supabase Dashboard.
    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(key);

    return data.publicUrl;
  }

  async reportJsonUrl(localReportPath: string): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');
    const key = this.keyFor(localReportPath);
    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(key);
    return data.publicUrl;
  }

  async artifactsUrl(localDir: string): Promise<string | null> {
    if (!supabase) return null;
    const key = this.keyFor(localDir);
    // Return the public URL for the folder.
    // Note: Supabase doesn't auto-generate an index page for folders, so this might just show XML or 404
    // unless the user uploads an index.html or configures it differently.
    // But it gives a correct link base.
    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(key);

    return data.publicUrl;
  }

  async deleteDir(localDir: string): Promise<void> {
    if (!supabase) return;
    const prefix = this.keyFor(localDir);
    // List files with prefix
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .list(prefix);

    if (error) {
      console.error('Failed to list files for deletion', error);
      return;
    }

    if (data && data.length > 0) {
      const paths = data.map((f) => `${prefix}/${f.name}`);
      await supabase.storage.from(this.bucket).remove(paths);
    }

    await fs.rm(localDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

// Prefer S3 by default when all required pieces exist; otherwise fall back to local disk.
const useS3 = Boolean(
  config.s3.bucket &&
  config.s3.region &&
  config.s3.accessKeyId &&
  config.s3.secretAccessKey,
);

// Prefer Supabase if configured, then S3, then Local.
const provider: StorageProvider = isSupabaseConfigured()
  ? new SupabaseStorageProvider(config.outputDir)
  : useS3
    ? new S3StorageProvider(config.outputDir)
    : new LocalStorageProvider(config.outputDir);

export const storage = {
  persistDir: (dir: string) => provider.persistDir(dir),
  reportUrl: (reportPath: string) => provider.reportUrl(reportPath),
  reportJsonUrl: (reportPath: string) => provider.reportJsonUrl(reportPath),
  artifactsUrl: (dir: string) => provider.artifactsUrl(dir),
  deleteDir: (dir: string) => provider.deleteDir(dir),
  useS3,
  useSupabase: isSupabaseConfigured(),
};

export const buildLinksForReport = async (reportPath: string): Promise<StorageLinks> => {
  const reportUrl = await provider.reportUrl(reportPath);
  const reportJsonUrl = await provider.reportJsonUrl(reportPath);
  const artifactsUrl = await provider.artifactsUrl(path.dirname(reportPath));
  return { reportUrl, reportJsonUrl, artifactsUrl };
};
