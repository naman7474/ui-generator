import fs from 'fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { DOMNode } from './dom-extractor';

export interface WeightedSimilarityConfig {
  pixelmatch: number;
  ssim: number;
  layout: number;
  text: number;
}

export const computeWeightedSimilarity = async (
  basePath: string,
  targetPath: string,
  baseDOM: DOMNode,
  targetDOM: DOMNode,
  config: WeightedSimilarityConfig = { pixelmatch: 0.4, ssim: 0.3, layout: 0.2, text: 0.1 }
): Promise<{ total: number; breakdown: Record<string, number> }> => {
  const pixelScore = await computePixelmatchScore(basePath, targetPath);
  const ssimScore = await computeSSIM(basePath, targetPath);
  const layoutScore = computeLayoutScore(baseDOM, targetDOM);
  const textScore = computeTextScore(baseDOM, targetDOM);
  const total = pixelScore * config.pixelmatch + ssimScore * config.ssim + layoutScore * config.layout + textScore * config.text;
  return { total, breakdown: { pixelmatch: pixelScore, ssim: ssimScore, layout: layoutScore, text: textScore } };
};

const computeLayoutScore = (base: DOMNode, target: DOMNode): number => {
  const baseBoxes = flattenBoundingBoxes(base);
  const targetBoxes = flattenBoundingBoxes(target);
  let matches = 0;
  let total = 0;
  for (const [selector, baseBox] of baseBoxes.entries()) {
    const tgt = targetBoxes.get(selector);
    if (tgt) {
      total++;
      const posMatch = Math.abs(baseBox.x - tgt.x) < (baseBox.width || 1) * 0.05 && Math.abs(baseBox.y - tgt.y) < (baseBox.height || 1) * 0.05;
      const sizeMatch = Math.abs(baseBox.width - tgt.width) < (baseBox.width || 1) * 0.05 && Math.abs(baseBox.height - tgt.height) < (baseBox.height || 1) * 0.05;
      if (posMatch && sizeMatch) matches++;
    }
  }
  return total > 0 ? matches / total : 0;
};

const computeTextScore = (base: DOMNode, target: DOMNode): number => {
  const baseTexts = extractAllText(base).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const targetTexts = extractAllText(target).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const baseSet = new Set(baseTexts);
  const targetSet = new Set(targetTexts);
  const intersection = new Set([...baseSet].filter((x) => targetSet.has(x)));
  const union = new Set([...baseSet, ...targetSet]);
  return union.size > 0 ? intersection.size / union.size : 1;
};

export const computePixelmatchScore = async (aPath: string, bPath: string): Promise<number> => {
  const [aBuf, bBuf] = await Promise.all([fs.readFile(aPath), fs.readFile(bPath)]);
  const aPng = PNG.sync.read(aBuf);
  const bPng = PNG.sync.read(bBuf);
  const width = Math.min(aPng.width, bPng.width);
  const height = Math.min(aPng.height, bPng.height);
  const clip = (img: PNG) => {
    const out = new PNG({ width, height });
    for (let y = 0; y < height; y++) {
      const src = y * img.width * 4;
      out.data.set(img.data.subarray(src, src + width * 4), y * width * 4);
    }
    return out;
  };
  const aClip = clip(aPng);
  const bClip = clip(bPng);
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(aClip.data, bClip.data, diff.data, width, height, { threshold: 0.1 });
  return width * height === 0 ? 0 : 1 - diffPixels / (width * height);
};

export const computeSSIM = async (aPath: string, bPath: string): Promise<number> => {
  const [aBuf, bBuf] = await Promise.all([fs.readFile(aPath), fs.readFile(bPath)]);
  const aPng = PNG.sync.read(aBuf);
  const bPng = PNG.sync.read(bBuf);
  return ssimFromPNGs(aPng, bPng);
};

const ssimFromPNGs = (a: PNG, b: PNG): number => {
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;
  const N = width * height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const ax = a.data[idx], ay = a.data[idx + 1], az = a.data[idx + 2];
      const bx = b.data[idx], by = b.data[idx + 1], bz = b.data[idx + 2];
      const gA = 0.299 * ax + 0.587 * ay + 0.114 * az;
      const gB = 0.299 * bx + 0.587 * by + 0.114 * bz;
      sumX += gA; sumY += gB; sumX2 += gA * gA; sumY2 += gB * gB; sumXY += gA * gB;
    }
  }
  if (N === 0) return 0;
  const muX = sumX / N, muY = sumY / N;
  const varX = sumX2 / N - muX * muX, varY = sumY2 / N - muY * muY;
  const covXY = sumXY / N - muX * muY;
  const L = 255, K1 = 0.01, K2 = 0.03; const C1 = (K1 * L) ** 2; const C2 = (K2 * L) ** 2;
  const numerator = (2 * muX * muY + C1) * (2 * covXY + C2);
  const denominator = (muX * muX + muY * muY + C1) * (varX + varY + C2);
  const ssim = denominator === 0 ? 0 : numerator / denominator;
  return Math.max(0, Math.min(1, ssim));
};

const flattenBoundingBoxes = (node: DOMNode, prefix: string = ''): Map<string, { x: number; y: number; width: number; height: number }> => {
  const map = new Map<string, { x: number; y: number; width: number; height: number }>();
  const key = `${prefix}/${node.tag}${node.attributes.id ? `#${node.attributes.id}` : ''}${node.attributes.class ? `.${node.attributes.class.split(' ').join('.')}` : ''}`;
  map.set(key, node.boundingBox);
  for (let i = 0; i < (node.children || []).length; i++) {
    const child = node.children[i];
    const childKey = `${key}[${i}]`;
    for (const [k, v] of flattenBoundingBoxes(child, childKey).entries()) map.set(k, v);
  }
  return map;
};

const extractAllText = (node: DOMNode): string[] => {
  const out: string[] = [];
  if (node.text) out.push(node.text);
  for (const c of node.children || []) out.push(...extractAllText(c));
  return out;
};
