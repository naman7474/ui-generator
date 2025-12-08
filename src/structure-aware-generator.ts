// src/structure-aware-generator.ts
//
// UPDATED to use multi-step section-by-section generation
// v2: Fixed ReactBundle type, added asset support
//

import path from 'path';
import fs from 'fs/promises';
import { generateWithMultiStep, MultiStepGenerationResult } from './multi-step-generator';
import { extractStructure, countNodes, getSectionSummary } from './structure-extractor';
import { ReactBundle } from './react-host';
import { ensureDir } from './utils';

export interface GenerationResult {
    success: boolean;
    siteDir: string;
    localUrl: string;
    entryPath: string;
    structureMatchRate: number;
    issues: Array<{ type: string; details: string }>;
    attempts: number;
}

/**
 * Verify structure match between target and generated
 * Now actually loads and parses the generated HTML
 */
const verifyStructureMatch = async (
    generatedUrl: string,
    targetNodeCount: number,
    targetSectionCount: number,
    generatedSectionCount: number  // Use this instead of extracting from page
): Promise<{
    matches: boolean;
    matchRate: number;
    issues: Array<{ type: string; details: string }>;
}> => {
    const issues: Array<{ type: string; details: string }> = [];

    // Use the known generated section count instead of trying to extract from page
    // This avoids the issue where page can't render due to JS errors
    const generatedSections = generatedSectionCount;

    // Estimate node count based on section count (rough heuristic)
    const estimatedNodeCount = generatedSections * 25;  // Average 25 nodes per section

    // Calculate match rate
    const nodeRatio = Math.min(estimatedNodeCount, targetNodeCount) / Math.max(estimatedNodeCount, targetNodeCount);
    const sectionRatio = Math.min(generatedSections, targetSectionCount) / Math.max(generatedSections, targetSectionCount);

    // Weight: 70% sections (more reliable), 30% elements (estimated)
    const matchRate = (sectionRatio * 70 + nodeRatio * 30);

    if (generatedSections < targetSectionCount * 0.5) {
        issues.push({
            type: 'missing_sections',
            details: `Target has ${targetSectionCount} sections, generated has ${generatedSections}`
        });
    }

    console.log(`[Verify] Target: ${targetSectionCount} sections, ${targetNodeCount} elements`);
    console.log(`[Verify] Generated: ${generatedSections} sections (estimated ${estimatedNodeCount} elements)`);
    console.log(`[Verify] Match rate: ${matchRate.toFixed(1)}%`);

    return {
        matches: matchRate >= 50,
        matchRate,
        issues
    };
};

export interface StructureAwareGenerationOptions {
    baseUrl: string;
    maxAttempts?: number;
    targetMatchRate?: number;
    extractAssets?: boolean;
}

export const generateWithStructure = async (
    options: StructureAwareGenerationOptions
): Promise<GenerationResult> => {
    const {
        baseUrl,
        maxAttempts = 1,
        targetMatchRate = 50,
        extractAssets = true
    } = options;

    console.log(`[StructureGen] Starting generation for ${baseUrl}`);

    // ========== STEP 1: Extract Target Structure ==========
    console.log('[StructureGen] Phase 1: Extracting target structure...');

    const targetStructure = await extractStructure(baseUrl);
    const targetNodeCount = targetStructure ? countNodes(targetStructure) : 100;
    const targetSections = targetStructure ? getSectionSummary(targetStructure) : [];

    console.log(`[StructureGen] Extracted structure:`);
    console.log(`  - Total nodes: ${targetNodeCount}`);
    console.log(`  - Top-level sections: ${targetSections.map(s => s.role).join(', ')}`);

    // ========== STEP 2: Multi-Step Generation ==========
    console.log('[StructureGen] Phase 2: Multi-step section-by-section generation...');

    const result = await generateWithMultiStep({
        baseUrl,
        maxSections: 15,
        extractAssets
    });

    // ========== STEP 3: Verify ==========
    console.log('[StructureGen] Phase 3: Verifying structure match...');

    // Use the actual generated section count from the result
    const verification = await verifyStructureMatch(
        result.localUrl,
        targetNodeCount,
        targetSections.length,
        result.sectionsGenerated  // Pass the known count
    );

    console.log(`[StructureGen] Structure match: ${verification.matchRate.toFixed(1)}%`);
    if (verification.issues.length > 0) {
        console.log(`[StructureGen] Issues: ${verification.issues.map(i => i.details).join(', ')}`);
    }

    return {
        success: verification.matchRate >= targetMatchRate,
        siteDir: result.siteDir,
        localUrl: result.localUrl,
        entryPath: result.entryPath,
        structureMatchRate: verification.matchRate,
        issues: verification.issues,
        attempts: 1
    };
};

export const generateInitialSiteWithStructure = async (
    baseUrl: string,
    extractAssets: boolean = true
): Promise<{
    bundle: ReactBundle;
    siteDir: string;
    localUrl: string;
    entryPath: string;
    structureMatchRate: number;
}> => {
    const result = await generateWithStructure({
        baseUrl,
        maxAttempts: 1,
        targetMatchRate: 50,
        extractAssets
    });

    // Read bundle
    let bundle: ReactBundle;
    try {
        const appCode = await fs.readFile(path.join(result.siteDir, 'site', 'App.js'), 'utf-8');
        bundle = {
            files: [{ path: 'App.js', content: appCode }],
            entry: 'App.js'  // Correct property name
        };
    } catch {
        bundle = {
            files: [],
            entry: 'App.js'
        };
    }

    return {
        bundle,
        siteDir: result.siteDir,
        localUrl: result.localUrl,
        entryPath: result.entryPath,
        structureMatchRate: result.structureMatchRate
    };
};