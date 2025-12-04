import fs from 'fs/promises';
import path from 'path';

import { config } from './config';

export const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const timestampId = (): string => {
  const now = new Date();
  const clean = now.toISOString().replace(/[:.]/g, '-');
  return `run-${clean}`;
};

export const resolveInDir = (dir: string, filename: string): string => path.join(dir, filename);

export const getLocalArtifactUrl = (relativePath: string): string => {
  const cleanPath = relativePath.replace(/^\/+/, '');
  return `http://localhost:${config.port}/artifacts/${cleanPath}`;
};
