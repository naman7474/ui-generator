import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { StyleDifference } from './style-diff';

import { GoogleAIFileManager } from '@google/generative-ai/server';

const genAI = config.googleApiKey ? new GoogleGenerativeAI(config.googleApiKey) : null;
const fileManager = config.googleApiKey ? new GoogleAIFileManager(config.googleApiKey) : null;

const DEFAULT_GEMINI_MODELS = ['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];

const getModelPreferenceList = () => {
    const configured = process.env.GOOGLE_GEMINI_MODEL?.trim();
    const orderedModels = configured && configured.length > 0
        ? [configured, ...DEFAULT_GEMINI_MODELS]
        : [...DEFAULT_GEMINI_MODELS];

    return Array.from(new Set(orderedModels));
};

export const generateAiFixPrompt = async (
    baseImagePath: string,
    targetImagePath: string,
    diffImagePath: string,
    differences: StyleDifference[]
): Promise<string> => {
    if (!genAI || !fileManager) {
        console.warn('GOOGLE_API_KEY not set, skipping AI prompt generation.');
        return 'Google API Key not configured. Please set GOOGLE_API_KEY in .env to generate AI fix prompts.';
    }

    try {
        const modelPreference = getModelPreferenceList();
        const primaryModel = modelPreference[0];

        if (!primaryModel) {
            throw new Error('No Gemini models configured.');
        }

        // Upload images using File API
        const [baseUpload, targetUpload, diffUpload] = await Promise.all([
            fileManager.uploadFile(baseImagePath, { mimeType: 'image/png', displayName: 'Base Screenshot' }),
            fileManager.uploadFile(targetImagePath, { mimeType: 'image/png', displayName: 'Target Screenshot' }),
            fileManager.uploadFile(diffImagePath, { mimeType: 'image/png', displayName: 'Diff Heatmap' }),
        ]);

        const prompt = `
You are an expert frontend developer and UI/UX engineer tasked with producing a clean implementation plan for another coding agent.
I will provide:
1. The "Base" screenshot (desired)
2. The "Target" screenshot (current)
3. The diff heatmap
4. JSON style difference data

Deliver a single Markdown document only. Do not include any explanations before or after the plan, and do not wrap the response in code fences. The Markdown must contain:
- A brief summary of the main issues.
- Detailed steps grouped by page section (Header, Hero, Footer, etc.).
- Within each section list concrete CSS/HTML fixes, referencing selectors or components when possible.
- Call out layout shifts detected from the diff image.

Here is the JSON list of style differences:
${JSON.stringify(differences, null, 2)}

Respond with the Markdown plan only.`;
        const requestParts = [
            prompt,
            {
                fileData: {
                    mimeType: baseUpload.file.mimeType,
                    fileUri: baseUpload.file.uri,
                },
            },
            {
                fileData: {
                    mimeType: targetUpload.file.mimeType,
                    fileUri: targetUpload.file.uri,
                },
            },
            {
                fileData: {
                    mimeType: diffUpload.file.mimeType,
                    fileUri: diffUpload.file.uri,
                },
            },
        ];

        let lastError: unknown;

        for (const modelName of modelPreference) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(requestParts);
                if (modelName !== primaryModel) {
                    console.info(`Gemini model fallback succeeded with ${modelName}.`);
                }
                return result.response.text();
            } catch (modelError) {
                lastError = modelError;
                console.warn(
                    `Gemini model ${modelName} failed: ${modelError instanceof Error ? modelError.message : String(modelError)}.`
                );
            }
        }

        if (lastError) {
            throw lastError;
        }

        throw new Error('Unable to generate response with any Gemini model.');
    } catch (error) {
        console.error('Error generating AI fix prompt:', error);
        return `Failed to generate AI fix prompt. Error: ${error instanceof Error ? error.message : String(error)}`;
    }
};

export type DeviceArtifacts = {
    device: 'desktop' | 'mobile';
    basePath: string;
    targetPath: string;
    diffPath: string;
    differences: StyleDifference[];
};

export const generateMultiDeviceFixPrompt = async (
    artifacts: DeviceArtifacts[],
    focus?: string,
    options?: { targetDevice?: 'desktop' | 'mobile'; targetSection?: string; sectionSpecs?: any[]; structureOrder?: string[] }
): Promise<string> => {
    if (!genAI || !fileManager) {
        console.warn('GOOGLE_API_KEY not set, skipping AI prompt generation.');
        const lines: string[] = [];
        if (focus) lines.push(focus);
        if (options?.targetDevice) lines.push(`Device: ${options.targetDevice}`);
        if (options?.targetSection) lines.push(`Section: ${options.targetSection}`);
        lines.push('Address issues visible in the provided images.');
        if (options?.sectionSpecs?.length) {
            lines.push('Use the provided section_specs to assign images/text and add data-section attributes.');
        }
        return lines.join('\n');
    }

    try {
        const modelPreference = getModelPreferenceList();
        const primaryModel = modelPreference[0];

        if (!primaryModel) {
            throw new Error('No Gemini models configured.');
        }

        const requestParts: any[] = [];
        if (focus || options?.targetDevice || options?.targetSection || (options?.structureOrder && options.structureOrder.length)) {
            const header: string[] = [];
            if (focus) header.push(`CRITICAL FOCUS: ${focus}`);
            if (options?.targetDevice) header.push(`Device: ${options.targetDevice}`);
            if (options?.targetSection) header.push(`Section: ${options.targetSection}`);
            if (options?.structureOrder && options.structureOrder.length) {
                header.push('STRUCTURE LOCK: Do NOT add, remove, or reorder sections. Maintain the same section containers and order as follows:');
                header.push(JSON.stringify(options.structureOrder));
                header.push('Only change styling, spacing, images, and text inside the existing section containers.');
            }
            requestParts.push(header.join('\n'));
        }
        requestParts.push(`You are an expert frontend developer and UI/UX engineer.
I will provide screenshots and diffs for multiple devices (desktop and/or mobile).
For each device, I provide:
1. Base screenshot (desired)
2. Target screenshot (current)
3. Diff heatmap
4. JSON style differences

Your task is to analyze these and produce a single, consolidated set of instructions to fix the code.
Focus on:
- Aligning the Target to the Base pixel-perfectly.
- Fixing layout shifts.
- Correcting styles (colors, spacing, typography) based on the JSON diffs.
- Ensuring responsiveness (desktop vs mobile).

Deliver a single Markdown document. Do not include explanations, just the plan.
Group by section if possible.
List concrete CSS/HTML fixes.
`);

        for (const art of artifacts) {
            const [baseUpload, targetUpload, diffUpload] = await Promise.all([
                fileManager.uploadFile(art.basePath, { mimeType: 'image/png', displayName: `${art.device} Base` }),
                fileManager.uploadFile(art.targetPath, { mimeType: 'image/png', displayName: `${art.device} Target` }),
                fileManager.uploadFile(art.diffPath, { mimeType: 'image/png', displayName: `${art.device} Diff` }),
            ]);

            requestParts.push(`\n## Device: ${art.device}\n`);
            requestParts.push({
                fileData: { mimeType: baseUpload.file.mimeType, fileUri: baseUpload.file.uri },
            });
            requestParts.push({
                fileData: { mimeType: targetUpload.file.mimeType, fileUri: targetUpload.file.uri },
            });
            requestParts.push({
                fileData: { mimeType: diffUpload.file.mimeType, fileUri: diffUpload.file.uri },
            });
            requestParts.push(`\nStyle Differences for ${art.device}:\n${JSON.stringify(art.differences, null, 2)}\n`);
        }

        if (options?.sectionSpecs && options.sectionSpecs.length) {
            requestParts.push('\nUse this section_specs JSON to place images/text and add data-section attributes on each section container:');
            requestParts.push('```json');
            requestParts.push(JSON.stringify(options.sectionSpecs, null, 2));
            requestParts.push('```');
        }
        requestParts.push('\nRespond with the Markdown plan only.');

        let lastError: unknown;

        for (const modelName of modelPreference) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(requestParts);
                if (modelName !== primaryModel) {
                    console.info(`Gemini model fallback succeeded with ${modelName}.`);
                }
                return result.response.text();
            } catch (modelError) {
                lastError = modelError;
                console.warn(
                    `Gemini model ${modelName} failed: ${modelError instanceof Error ? modelError.message : String(modelError)}.`
                );
            }
        }

        if (lastError) {
            throw lastError;
        }

        throw new Error('Unable to generate response with any Gemini model.');

    } catch (error) {
        console.error('Error generating multi-device AI fix prompt:', error);
        return `Failed to generate AI fix prompt. Error: ${error instanceof Error ? error.message : String(error)}`;
    }
};

export const generateSectionFixPrompt = async (params: {
    sectionName: string;
    device: 'desktop' | 'mobile';
    basePath: string;
    targetPath: string;
    diffPath?: string;
    sectionSpec?: any;
    structureOrder?: string[];
}): Promise<string> => {
    const { sectionName, device, sectionSpec } = params;
    const header = [
        `Focus ONLY on the "${sectionName}" section.`,
        `Device: ${device}.`,
        'Do not change other sections.',
        'Use the provided base/target/diff images for this section only.',
        'Ensure the outer element has data-section set to the section name.',
    ];
    if (params.structureOrder && params.structureOrder.length) {
        header.push('STRUCTURE LOCK: Do NOT add, remove, or reorder sections. Maintain this exact order:');
        header.push(JSON.stringify(params.structureOrder));
    }
    if (!genAI || !fileManager) {
        if (sectionSpec) {
            header.push('Use this section spec to map images/text and ensure data-section attribute:');
            header.push('```json');
            header.push(JSON.stringify(sectionSpec, null, 2));
            header.push('```');
        }
        return header.join('\n');
    }

    try {
        const [b, t, d] = await Promise.all([
            fileManager.uploadFile(params.basePath, { mimeType: 'image/png', displayName: `${sectionName} Base` }),
            fileManager.uploadFile(params.targetPath, { mimeType: 'image/png', displayName: `${sectionName} Target` }),
            params.diffPath ? fileManager.uploadFile(params.diffPath, { mimeType: 'image/png', displayName: `${sectionName} Diff` }) : Promise.resolve(null as any),
        ]);

        const parts: any[] = [
            header.join('\n'),
            { fileData: { mimeType: b.file.mimeType, fileUri: b.file.uri } },
            { fileData: { mimeType: t.file.mimeType, fileUri: t.file.uri } },
        ];
        if (d) parts.push({ fileData: { mimeType: d.file.mimeType, fileUri: d.file.uri } });
        if (sectionSpec) {
            parts.push('Section spec JSON:');
            parts.push(JSON.stringify(sectionSpec, null, 2));
        }

        const modelPreference = getModelPreferenceList();
        const primaryModel = modelPreference[0];
        let lastError: unknown;
        for (const modelName of modelPreference) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(parts);
                if (modelName !== primaryModel) {
                    console.info(`Gemini model fallback succeeded with ${modelName}.`);
                }
                return result.response.text();
            } catch (e) {
                lastError = e;
                continue;
            }
        }
        if (lastError) throw lastError;
        throw new Error('No model response');
    } catch (e) {
        return header.join('\n');
    }
};
