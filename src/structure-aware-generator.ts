// src/structure-aware-generator.ts
//
// Two-phase generation:
// 1. Extract structure from target site
// 2. Generate code that matches structure
// 3. Verify structure matches
// 4. Fix any mismatches
//

import path from 'path';
import fs from 'fs/promises';
import { extractStructure, StructureNode, structureToTree, structureToSchema, countNodes, getSectionSummary } from './structure-extractor';
import { buildStructureAwarePrompt, extractStructuralConstraints } from './structure-aware-prompt';
import { scanBaseAssets, AssetScanResult } from './asset-scan';
import { writeReactBundle, ReactBundle } from './react-host';
import { capture } from './screenshot';
import { timestampId, ensureDir } from './utils';
import { config } from './config';

const GENERATOR_API_URL = process.env.GENERATOR_API_URL || 'http://localhost:8000';

const withRetry = async <T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 500): Promise<T> => {
    let lastErr: any;
    for (let i = 0; i <= retries; i++) {
        try { return await fn(); } catch (e) {
            lastErr = e;
            if (i === retries) break;
            const delay = baseDelayMs * Math.pow(2, i);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw lastErr;
};

/**
 * Verify generated code matches target structure
 */
const verifyStructureMatch = async (
    generatedUrl: string,
    targetStructure: StructureNode
): Promise<{
    matches: boolean;
    matchRate: number;
    issues: Array<{ type: string; details: string }>;
}> => {
    // Extract structure from generated site
    const generatedStructure = await extractStructure(generatedUrl);

    if (!generatedStructure) {
        return {
            matches: false,
            matchRate: 0,
            issues: [{ type: 'extraction_failed', details: 'Could not extract structure from generated site' }]
        };
    }

    const issues: Array<{ type: string; details: string }> = [];

    // Get section summaries
    const targetSections = getSectionSummary(targetStructure);
    const generatedSections = getSectionSummary(generatedStructure);

    // Check section count
    if (targetSections.length !== generatedSections.length) {
        issues.push({
            type: 'section_count_mismatch',
            details: `Target has ${targetSections.length} sections, generated has ${generatedSections.length}`
        });
    }

    // Check section order
    const targetRoles = targetSections.map(s => s.role);
    const generatedRoles = generatedSections.map(s => s.role);

    for (let i = 0; i < Math.min(targetRoles.length, generatedRoles.length); i++) {
        if (targetRoles[i] !== generatedRoles[i]) {
            issues.push({
                type: 'section_order_mismatch',
                details: `Position ${i}: expected "${targetRoles[i]}", got "${generatedRoles[i]}"`
            });
        }
    }

    // Check for missing sections
    for (const role of targetRoles) {
        if (!generatedRoles.includes(role)) {
            issues.push({
                type: 'missing_section',
                details: `Missing section: ${role}`
            });
        }
    }

    // Check for extra sections
    for (const role of generatedRoles) {
        if (!targetRoles.includes(role)) {
            issues.push({
                type: 'extra_section',
                details: `Extra section: ${role}`
            });
        }
    }

    // Check element counts
    const targetCount = countNodes(targetStructure);
    const generatedCount = countNodes(generatedStructure);
    const countDiff = Math.abs(targetCount - generatedCount) / targetCount;

    if (countDiff > 0.3) { // More than 30% difference
        issues.push({
            type: 'element_count_mismatch',
            details: `Target has ${targetCount} elements, generated has ${generatedCount} (${(countDiff * 100).toFixed(0)}% diff)`
        });
    }

    // Check wrapper structure
    const targetConstraints = extractStructuralConstraints(targetStructure);
    const generatedConstraints = extractStructuralConstraints(generatedStructure);

    // Check wrapper tags
    if (targetConstraints.wrapperTags.slice(0, 3).join('>') !==
        generatedConstraints.wrapperTags.slice(0, 3).join('>')) {
        issues.push({
            type: 'wrapper_mismatch',
            details: `Wrapper structure differs: target [${targetConstraints.wrapperTags.slice(0, 3).join('>')}] vs generated [${generatedConstraints.wrapperTags.slice(0, 3).join('>')}]`
        });
    }

    // Calculate match rate
    let matchScore = 100;
    matchScore -= issues.filter(i => i.type === 'section_count_mismatch').length * 15;
    matchScore -= issues.filter(i => i.type === 'section_order_mismatch').length * 10;
    matchScore -= issues.filter(i => i.type === 'missing_section').length * 10;
    matchScore -= issues.filter(i => i.type === 'extra_section').length * 5;
    matchScore -= issues.filter(i => i.type === 'wrapper_mismatch').length * 10;
    matchScore -= Math.min(20, countDiff * 50);

    matchScore = Math.max(0, matchScore);

    return {
        matches: matchScore >= 80,
        matchRate: matchScore,
        issues
    };
};

export interface StructureAwareGenerationOptions {
    baseUrl: string;
    maxAttempts?: number;  // How many times to try generation
    targetMatchRate?: number;  // Minimum acceptable structure match
}

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
 * Structure-aware generation with verification and retry
 */
export const generateWithStructure = async (
    options: StructureAwareGenerationOptions
): Promise<GenerationResult> => {
    const {
        baseUrl,
        maxAttempts = 3,
        targetMatchRate = 80
    } = options;

    const jobId = timestampId();
    const runDir = path.join(config.outputDir, 'pixelgen-v2', jobId);
    await ensureDir(runDir);

    console.log(`[StructureGen] Starting generation for ${baseUrl}`);
    console.log(`[StructureGen] Run directory: ${runDir}`);

    // ========== PHASE 1: Extract Structure ==========
    console.log('[StructureGen] Phase 1: Extracting target structure...');

    const structure = await extractStructure(baseUrl);
    if (!structure) {
        throw new Error('Failed to extract structure from target site');
    }

    const tree = structureToTree(structure);
    const sections = getSectionSummary(structure);
    const nodeCount = countNodes(structure);
    const constraints = extractStructuralConstraints(structure);

    console.log(`[StructureGen] Extracted structure:`);
    console.log(`  - Total nodes: ${nodeCount}`);
    console.log(`  - Sections: ${sections.map(s => s.role).join(', ')}`);
    console.log(`  - Required data-sections: ${constraints.requiredDataSections.join(', ')}`);

    // Save structure for debugging
    await fs.writeFile(
        path.join(runDir, 'target-structure.txt'),
        tree
    );
    await fs.writeFile(
        path.join(runDir, 'target-structure.json'),
        JSON.stringify(structureToSchema(structure), null, 2)
    );
    await fs.writeFile(
        path.join(runDir, 'constraints.json'),
        JSON.stringify(constraints, null, 2)
    );

    // ========== PHASE 2: Capture Screenshot & Assets ==========
    console.log('[StructureGen] Phase 2: Capturing screenshot and assets...');

    const captureResult = await capture(baseUrl, {
        device: 'desktop',
        outputDir: path.join(runDir, 'base'),
    });
    const screenshotBuffer = await fs.readFile(captureResult.path);
    const screenshotDataUrl = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

    // Scan assets
    const assetsScanDir = path.join(runDir, 'base-assets');
    await ensureDir(assetsScanDir);
    let baseAssets: AssetScanResult | undefined;
    try {
        baseAssets = await scanBaseAssets(baseUrl, assetsScanDir, { headless: true });
    } catch (e) {
        console.warn('[StructureGen] Asset scan failed:', e);
    }

    // Extract colors and fonts for prompt
    const colors = baseAssets?.palette ? {
        primary: baseAssets.palette.colors[0] || '#000000',
        secondary: baseAssets.palette.colors[1] || '#666666',
        background: baseAssets.palette.backgrounds[0] || '#ffffff',
        text: baseAssets.palette.colors[0] || '#333333'
    } : undefined;

    const fonts = baseAssets?.fontFamilies;
    const imageUrls = baseAssets?.imageHints?.map(img => ({
        url: img.localPath || img.url,
        alt: img.alt || '',
        section: undefined // Could map based on position
    }));

    // ========== PHASE 3: Generate with Structure Constraint ==========
    console.log('[StructureGen] Phase 3: Generating code with structure constraint...');

    // Build the structure-aware prompt
    const structurePrompt = buildStructureAwarePrompt(structure, {
        colors,
        fonts,
        imageUrls
    });

    // Save prompt for debugging
    await fs.writeFile(path.join(runDir, 'generation-prompt.txt'), structurePrompt);

    let bestResult: GenerationResult | null = null;
    let attempt = 0;

    while (attempt < maxAttempts) {
        attempt++;
        console.log(`[StructureGen] Generation attempt ${attempt}/${maxAttempts}...`);

        try {
            // Call generator with structure constraint
            const createModel = process.env.GENERATOR_CREATE_MODEL || 'gemini-2.5-pro';

            const createRes = await withRetry(() => fetch(`${GENERATOR_API_URL}/api/generate-from-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stack: 'react_tailwind',
                    image: screenshotDataUrl,
                    model: createModel,
                    sectionSpecs: baseAssets?.sectionSpecs,
                    // NEW: Pass structure constraint
                    structureConstraint: {
                        tree: tree,
                        schema: structureToSchema(structure),
                        sections: sections.map(s => ({ role: s.role, heading: s.heading })),
                        constraints: constraints
                    },
                    // Add structure prompt to system message
                    structurePrompt: structurePrompt
                })
            }));

            if (!createRes.ok) {
                throw new Error(`Generator failed: ${createRes.statusText}`);
            }

            const createData = await createRes.json();
            const bundle: ReactBundle = createData.bundle;

            // Write bundle
            const attemptDir = attempt === 1 ? runDir : path.join(runDir, `attempt-${attempt}`);
            const { localUrl, entryPath } = await writeReactBundle(attemptDir, bundle);

            // Inject assets
            if (baseAssets) {
                try {
                    const { injectAssetsIntoHtml } = await import('./asset-scan');
                    const sitePath = path.dirname(entryPath);
                    await injectAssetsIntoHtml(entryPath, sitePath, baseAssets);
                } catch (e: any) {
                    console.warn('[StructureGen] Asset injection failed:', e?.message);
                }
            }

            // ========== PHASE 4: Verify Structure Match ==========
            console.log('[StructureGen] Phase 4: Verifying structure match...');

            const verification = await verifyStructureMatch(localUrl, structure);

            console.log(`[StructureGen] Structure match: ${verification.matchRate.toFixed(1)}%`);
            if (verification.issues.length > 0) {
                console.log(`[StructureGen] Issues found:`);
                for (const issue of verification.issues) {
                    console.log(`  - [${issue.type}] ${issue.details}`);
                }
            }

            const result: GenerationResult = {
                success: verification.matchRate >= targetMatchRate,
                siteDir: attemptDir,
                localUrl,
                entryPath,
                structureMatchRate: verification.matchRate,
                issues: verification.issues,
                attempts: attempt
            };

            // Track best result
            if (!bestResult || result.structureMatchRate > bestResult.structureMatchRate) {
                bestResult = result;
            }

            // If good enough, return
            if (result.success) {
                console.log(`[StructureGen] ✓ Generation successful with ${verification.matchRate.toFixed(1)}% match`);
                return result;
            }

            // If not last attempt, log and retry
            if (attempt < maxAttempts) {
                console.log(`[StructureGen] Match rate ${verification.matchRate.toFixed(1)}% below target ${targetMatchRate}%, retrying...`);
            }

        } catch (e) {
            console.error(`[StructureGen] Attempt ${attempt} failed:`, e);
            if (attempt >= maxAttempts) {
                throw e;
            }
        }
    }

    // Return best result even if below target
    if (bestResult) {
        console.log(`[StructureGen] ⚠ Best result: ${bestResult.structureMatchRate.toFixed(1)}% (below target ${targetMatchRate}%)`);
        return bestResult;
    }

    throw new Error('All generation attempts failed');
};

/**
 * Integration with existing pixelgen-v2 flow
 */
export const generateInitialSiteWithStructure = async (
    baseUrl: string
): Promise<{
    bundle: ReactBundle;
    siteDir: string;
    localUrl: string;
    entryPath: string;
    structureMatchRate: number;
}> => {
    const result = await generateWithStructure({
        baseUrl,
        maxAttempts: 3,
        targetMatchRate: 80
    });

    // Read the bundle back for compatibility
    const bundlePath = path.join(result.siteDir, 'site', 'bundle.json');
    let bundle: ReactBundle;
    try {
        bundle = JSON.parse(await fs.readFile(bundlePath, 'utf-8'));
    } catch {
        // Bundle might not be saved, create a minimal one
        bundle = {
            files: [],
            entry: 'App.js'
        } as ReactBundle;
    }

    return {
        bundle,
        siteDir: result.siteDir,
        localUrl: result.localUrl,
        entryPath: result.entryPath,
        structureMatchRate: result.structureMatchRate
    };
};
