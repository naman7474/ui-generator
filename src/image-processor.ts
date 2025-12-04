import fs from 'fs/promises';
import path from 'path';
import { AssetScanResult } from './asset-scan';

export interface ImageProcessingResult {
  localPath: string;
  originalUrl: string;
  width?: number;
  height?: number;
  format?: string;
  optimizedPath?: string;
}

export const processAndOptimizeImages = async (
  scan: AssetScanResult,
  outputDir: string
): Promise<Map<string, ImageProcessingResult>> => {
  const results = new Map<string, ImageProcessingResult>();

  for (const img of scan.assets.images) {
    const abs = path.join(outputDir, img.localPath);
    let exists = false;
    try { await fs.access(abs); exists = true; } catch { exists = false; }

    if (!exists) {
      // Best-effort re-download when possible
      try {
        const res = await fetch(img.url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          await fs.mkdir(path.dirname(abs), { recursive: true });
          await fs.writeFile(abs, buf);
          exists = true;
        }
      } catch {}
    }

    // TODO: Add WebP optimization and size variants (requires an image lib like sharp)
    results.set(img.url, {
      localPath: img.localPath,
      originalUrl: img.url,
      // width/height/format could be extracted via an image library
    });
  }

  return results;
};

