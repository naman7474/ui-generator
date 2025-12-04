import { Page } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs/promises';
import path from 'path';

export interface RegionDiff {
  name: string;
  selector: string;
  rect: { x: number; y: number; width: number; height: number };
  similarity: number;
  diffPixels: number;
  issues: string[];
  basePath?: string;
  targetPath?: string;
  diffPath?: string;
}

export const compareByRegions = async (
  basePage: Page,
  targetPage: Page,
  sections: Array<{ name: string; selector: string }>,
  outputDir: string
): Promise<RegionDiff[]> => {
  const results: RegionDiff[] = [];
  await fs.mkdir(outputDir, { recursive: true }).catch(() => {});

  for (const section of sections) {
    try {
      const baseEl = await basePage.$(section.selector);
      const targetEl = await targetPage.$(section.selector);
      if (!baseEl || !targetEl) {
        results.push({
          name: section.name,
          selector: section.selector,
          rect: { x: 0, y: 0, width: 0, height: 0 },
          similarity: 0,
          diffPixels: -1,
          issues: [!baseEl ? 'Missing in base' : 'Missing in target'],
        });
        continue;
      }

      const baseBuffer = await baseEl.screenshot();
      const targetBuffer = await targetEl.screenshot();
      const basePng = PNG.sync.read(baseBuffer);
      const targetPng = PNG.sync.read(targetBuffer);

      const width = Math.min(basePng.width, targetPng.width);
      const height = Math.min(basePng.height, targetPng.height);
      const issues: string[] = [];
      if (basePng.width !== targetPng.width) issues.push(`Width mismatch: expected ${basePng.width}px, got ${targetPng.width}px`);
      if (basePng.height !== targetPng.height) issues.push(`Height mismatch: expected ${basePng.height}px, got ${targetPng.height}px`);

      const crop = (png: PNG, w: number, h: number): PNG => {
        const out = new PNG({ width: w, height: h });
        for (let y = 0; y < h; y++) {
          const srcStart = y * png.width * 4;
          out.data.set(png.data.subarray(srcStart, srcStart + w * 4), y * w * 4);
        }
        return out;
      };

      const baseClip = crop(basePng, width, height);
      const targetClip = crop(targetPng, width, height);
      const diff = new PNG({ width, height });
      const diffPixels = pixelmatch(baseClip.data, targetClip.data, diff.data, width, height, { threshold: 0.1 });
      const similarity = 1 - diffPixels / (width * height);

      const safe = section.name.replace(/[^a-z0-9]/gi, '_');
      const basePath = path.join(outputDir, `region-${safe}-base.png`);
      const targetPath = path.join(outputDir, `region-${safe}-target.png`);
      const diffPath = path.join(outputDir, `region-${safe}-diff.png`);
      await fs.writeFile(basePath, PNG.sync.write(baseClip));
      await fs.writeFile(targetPath, PNG.sync.write(targetClip));
      await fs.writeFile(diffPath, PNG.sync.write(diff));

      const baseBox = await baseEl.boundingBox();
      results.push({
        name: section.name,
        selector: section.selector,
        rect: baseBox || { x: 0, y: 0, width, height },
        similarity,
        diffPixels,
        issues,
        basePath,
        targetPath,
        diffPath,
      });
    } catch (e: any) {
      results.push({
        name: section.name,
        selector: section.selector,
        rect: { x: 0, y: 0, width: 0, height: 0 },
        similarity: 0,
        diffPixels: -1,
        issues: [`Error: ${e?.message || String(e)}`],
      });
    }
  }

  return results;
};

