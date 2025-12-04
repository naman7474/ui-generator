import fs from 'fs/promises';
import path from 'path';
import { storage } from './storage';

export interface CleanupResult {
  removed: number;
  kept: number;
  errors: number;
}

export const cleanupArtifacts = async (baseDir: string, olderThanDays: number): Promise<CleanupResult> => {
  if (olderThanDays <= 0) return { removed: 0, kept: 0, errors: 0 };
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const entries = await fs.readdir(baseDir, { withFileTypes: true }).catch(() => []);
  const dirs = entries.filter((e) => e.isDirectory());

  let removed = 0;
  let kept = 0;
  let errors = 0;

  for (const dir of dirs) {
    const dirPath = path.join(baseDir, dir.name);
    try {
      const stats = await fs.stat(dirPath);
      if (stats.mtimeMs < cutoff) {
        await storage.deleteDir(dirPath);
        removed += 1;
      } else {
        kept += 1;
      }
    } catch (err) {
      console.error('cleanup error', dirPath, err);
      errors += 1;
    }
  }

  return { removed, kept, errors };
};
