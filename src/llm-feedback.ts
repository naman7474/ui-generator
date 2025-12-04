import { generateMultiDeviceFixPrompt, generateSectionFixPrompt, DeviceArtifacts } from './gemini';
import { DOMNode } from './dom-extractor';

export const buildFeedback = async (artifacts: DeviceArtifacts[], focus?: string, options?: { targetDevice?: 'desktop' | 'mobile'; targetSection?: string; sectionSpecs?: any[]; structureOrder?: string[] }): Promise<string> => {
    return generateMultiDeviceFixPrompt(artifacts, focus, options);
};

export const buildSectionFeedback = async (params: {
    sectionName: string;
    device: 'desktop' | 'mobile';
    basePath: string;
    targetPath: string;
    diffPath?: string;
    sectionSpec?: any;
    structureOrder?: string[];
    issues?: string[];
}): Promise<string> => {
    return generateSectionFixPrompt(params);
};

export const buildDetailedFeedback = async (
  artifacts: DeviceArtifacts[],
  domStructure: DOMNode,
  sectionSpecs: any[],
  options?: { targetDevice?: 'desktop' | 'mobile'; targetSection?: string; structureOrder?: string[]; previousFeedback?: string[] }
): Promise<string> => {
  const lines: string[] = [];
  lines.push('# VISUAL DIFF ANALYSIS AND FIX INSTRUCTIONS');
  lines.push('');
  lines.push('## Current State');
  lines.push(`- Device focus: ${options?.targetDevice || 'all'}`);
  lines.push(`- Section focus: ${options?.targetSection || 'all'}`);
  lines.push('');

  lines.push('## Issues Detected from Visual Comparison');
  for (const art of artifacts) {
    lines.push(`### ${art.device.toUpperCase()} View`);
    if (!art.differences || art.differences.length === 0) {
      lines.push('No significant style differences detected.');
      lines.push('');
      continue;
    }
    const bySection = groupBy(art.differences as any[], (d: any) => d.section || 'Global');
    for (const [section, diffs] of Object.entries(bySection)) {
      lines.push(`#### Section: ${section}`);
      const byCategory = groupBy(diffs, (d: any) => d.category || 'styles');
      for (const [cat, list] of Object.entries(byCategory)) {
        lines.push(`- ${cat}:`);
        for (const d of (list as any[]).slice(0, 5)) {
          lines.push(`  - \`${d.selector}\` → ${d.property}: expected \`${d.baseValue}\`, got \`${d.targetValue}\``);
        }
      }
      lines.push('');
    }
  }

  lines.push('## Expected Structure');
  lines.push('The base site has the following section structure (maintain this order):');
  lines.push('```');
  for (const spec of sectionSpecs) {
    lines.push(`- ${spec.name}: ${spec.layoutHint || 'standard'}, ${spec.childCount ?? 0} children`);
  }
  lines.push('```');
  lines.push('');

  lines.push('## Required Fixes');
  lines.push('1. DO NOT add, remove, or reorder sections');
  lines.push('2. DO NOT change the overall structure');
  lines.push('3. ONLY fix the specific style properties listed above');
  lines.push('4. Ensure all data-section attributes are present');
  lines.push('');

  if (options?.structureOrder?.length) {
    lines.push('## STRUCTURE LOCK');
    lines.push('Maintain EXACTLY this section order:');
    lines.push('```json');
    lines.push(JSON.stringify(options.structureOrder, null, 2));
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
};

const groupBy = <T>(arr: T[], fn: (item: T) => string): Record<string, T[]> => {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};
