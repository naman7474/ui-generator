// src/llm-css-refiner.ts
//
// LLM-Guided CSS Refinement
// Uses Gemini to intelligently select safe, effective CSS changes
// v3: Better model selection, error handling, and fallback strategies
//

import { StyleChange } from './ground-truth/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
// Use gemini-2.0-flash by default (more reliable than 2.5-pro for this task)
const GEMINI_MODEL = process.env.GEMINI_REFINER_MODEL || 'gemini-2.5-flash';

// Fallback models if primary fails
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

// Properties that should NEVER be changed via CSS overrides
const DANGEROUS_PROPERTIES = new Set([
    'height', 'min-height', 'max-height',
    'width', 'min-width', 'max-width',
    'position', 'top', 'left', 'right', 'bottom',
    'transform', 'display', 'visibility',
    'overflow', 'overflow-x', 'overflow-y',
    'z-index', 'float', 'clear',
    'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
    'grid-template-columns', 'grid-template-rows'
]);

// Selectors that should NEVER be modified
const DANGEROUS_SELECTORS = [
    /^body$/i, /^html$/i, /^#root$/i, /^#app$/i,
    /^\*$/, /^:root$/i, /^body\s*body/i
];

// Properties that are SAFE and high-impact
const SAFE_PROPERTIES = new Set([
    'color', 'background-color', 'background',
    'font-size', 'font-weight', 'font-family',
    'line-height', 'letter-spacing', 'text-align',
    'border-color', 'border-width', 'border-style', 'border-radius',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'gap', 'box-shadow', 'opacity', 'text-decoration', 'text-transform'
]);

export interface SafeChange extends StyleChange {
    safetyScore: number;
    reason: string;
}

/**
 * Filter out dangerous changes that would break the layout
 */
export const filterDangerousChanges = (changes: StyleChange[]): SafeChange[] => {
    const safeChanges: SafeChange[] = [];

    for (const change of changes) {
        // Check for dangerous selectors
        if (DANGEROUS_SELECTORS.some(pattern => pattern.test(change.cssSelector))) {
            continue;
        }

        // Check for dangerous properties
        if (DANGEROUS_PROPERTIES.has(change.property)) {
            continue;
        }

        // Check for absurd values
        const value = String(change.expected);
        if (/\d{4,}px/.test(value)) continue;  // 1000px+ suspicious
        if (value === 'transparent' || value === 'rgba(0, 0, 0, 0)') continue;

        // Calculate safety score
        let safetyScore = 50;
        let reason = 'Passed basic safety checks';

        if (SAFE_PROPERTIES.has(change.property)) {
            safetyScore += 30;
            reason = `Safe property: ${change.property}`;
        }

        if (change.cssSelector.includes('[data-section=')) {
            safetyScore += 10;
            reason += ', scoped to section';
        }

        if (['color', 'background-color', 'border-color'].includes(change.property)) {
            safetyScore += 10;
        }

        safeChanges.push({ ...change, safetyScore, reason });
    }

    return safeChanges.sort((a, b) => b.safetyScore - a.safetyScore);
};

/**
 * Call Gemini API with proper error handling and fallback
 */
const callGeminiAPI = async (
    model: string,
    parts: any[],
    config: any = {}
): Promise<string | null> => {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        temperature: config.temperature ?? 0.2,
                        maxOutputTokens: config.maxOutputTokens ?? 2048
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`[LLM Refiner] API error ${response.status}: ${errorText.slice(0, 200)}`);
            return null;
        }

        const data = await response.json();

        // Check for safety filters
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
            console.warn(`[LLM Refiner] Response blocked by safety filter`);
            return null;
        }

        // Check for empty/blocked response
        if (!data.candidates || data.candidates.length === 0) {
            console.warn(`[LLM Refiner] No candidates in response`);
            return null;
        }

        const text = data.candidates[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.warn(`[LLM Refiner] Empty text in response`);
            return null;
        }

        return text;
    } catch (e: any) {
        console.error(`[LLM Refiner] API call failed: ${e.message}`);
        return null;
    }
};

/**
 * Generate CSS fixes directly from visual comparison with fallback
 */
export const llmGenerateCSS = async (
    targetScreenshot: string,
    currentScreenshot: string,
    currentHTML: string,
    existingCSS: string
): Promise<string> => {
    if (!GEMINI_API_KEY) {
        console.warn('[LLM Refiner] No Gemini API key for CSS generation');
        return '';
    }

    if (!targetScreenshot || !currentScreenshot) {
        console.warn('[LLM Refiner] Missing screenshots for CSS generation');
        return '';
    }

    // Simplified prompt that's less likely to trigger safety filters
    const prompt = `Compare these website screenshots and generate CSS to make the second look like the first.

First image: TARGET (desired appearance)
Second image: CURRENT (needs fixing)

Generate CSS rules using these selectors:
- [data-section="section-name"] for sections
- Tag names with :nth-of-type() for specific elements
- Class names if visible

Focus on:
- Color differences (text color, backgrounds)
- Font sizes and weights
- Spacing (padding, margin, gap)
- Border styles

Rules:
1. Use !important on all properties
2. Only change visual properties (NO height, width, position, display)
3. Use specific selectors, not body or html
4. Maximum 15 rules

Output ONLY CSS code, nothing else:`;

    const parts = [
        { inline_data: { mime_type: 'image/png', data: targetScreenshot } },
        { inline_data: { mime_type: 'image/png', data: currentScreenshot } },
        { text: prompt }
    ];

    // Try primary model first, then fallbacks
    const modelsToTry = [GEMINI_MODEL, ...FALLBACK_MODELS.filter(m => m !== GEMINI_MODEL)];

    for (const model of modelsToTry) {
        console.log(`[LLM Refiner] Calling ${model} for CSS generation...`);

        const text = await callGeminiAPI(model, parts, { temperature: 0.2, maxOutputTokens: 2048 });

        if (text) {
            // Extract CSS from response
            let css = text;
            const cssMatch = text.match(/```css\n?([\s\S]*?)```/);
            if (cssMatch) css = cssMatch[1];

            // Validate it's actual CSS
            if (css.includes('{') && css.includes('}')) {
                console.log(`[LLM Refiner] Generated ${css.length} chars of CSS using ${model}`);
                return css.trim();
            }
        }

        console.warn(`[LLM Refiner] ${model} failed, trying next...`);
    }

    console.error('[LLM Refiner] All models failed to generate CSS');
    return '';
};

/**
 * Select best changes using LLM
 */
export const llmSelectChanges = async (
    changes: SafeChange[],
    targetScreenshot: string,
    currentScreenshot: string,
    maxChanges: number = 5
): Promise<SafeChange[]> => {
    if (!GEMINI_API_KEY || !targetScreenshot || !currentScreenshot) {
        return changes.slice(0, maxChanges);
    }

    const changesSummary = changes.slice(0, 50).map((c, i) => ({
        id: i,
        selector: c.cssSelector.slice(0, 60),
        property: c.property,
        from: String(c.actual).slice(0, 30),
        to: String(c.expected).slice(0, 30),
        safety: c.safetyScore
    }));

    const prompt = `Select the ${maxChanges} best CSS changes to make CURRENT look like TARGET.

Changes available:
${JSON.stringify(changesSummary, null, 2)}

Return ONLY a JSON array of IDs like: [0, 3, 7, 12, 15]`;

    const parts = [
        { inline_data: { mime_type: 'image/png', data: targetScreenshot } },
        { inline_data: { mime_type: 'image/png', data: currentScreenshot } },
        { text: prompt }
    ];

    const text = await callGeminiAPI(GEMINI_MODEL, parts, { temperature: 0.1, maxOutputTokens: 256 });

    if (text) {
        const match = text.match(/\[[\d,\s]+\]/);
        if (match) {
            const ids: number[] = JSON.parse(match[0]);
            return ids.filter(id => id >= 0 && id < changes.length).slice(0, maxChanges).map(id => changes[id]);
        }
    }

    return changes.slice(0, maxChanges);
};

/**
 * Categorize changes for balanced selection
 */
export const categorizeChanges = (changes: SafeChange[]): {
    colors: SafeChange[];
    typography: SafeChange[];
    spacing: SafeChange[];
    borders: SafeChange[];
    other: SafeChange[];
} => {
    const categories = {
        colors: [] as SafeChange[],
        typography: [] as SafeChange[],
        spacing: [] as SafeChange[],
        borders: [] as SafeChange[],
        other: [] as SafeChange[]
    };

    for (const change of changes) {
        const prop = change.property.toLowerCase();
        if (/color|background/.test(prop)) categories.colors.push(change);
        else if (/font|text|line-height|letter/.test(prop)) categories.typography.push(change);
        else if (/padding|margin|gap/.test(prop)) categories.spacing.push(change);
        else if (/border|radius|shadow/.test(prop)) categories.borders.push(change);
        else categories.other.push(change);
    }

    return categories;
};

/**
 * Select balanced set of changes
 */
export const selectBalancedChanges = (changes: SafeChange[], maxTotal: number = 10): SafeChange[] => {
    const categories = categorizeChanges(changes);
    const selected: SafeChange[] = [];
    const perCategory = Math.max(1, Math.floor(maxTotal / 4));

    selected.push(...categories.colors.slice(0, perCategory + 2));
    selected.push(...categories.typography.slice(0, perCategory));
    selected.push(...categories.spacing.slice(0, perCategory));
    selected.push(...categories.borders.slice(0, perCategory));

    const remaining = maxTotal - selected.length;
    if (remaining > 0) selected.push(...categories.other.slice(0, remaining));

    return selected.slice(0, maxTotal);
};