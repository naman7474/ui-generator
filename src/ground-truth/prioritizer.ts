
import { StyleChange } from './types';

interface PriorityFactors {
    visualImpact: number;      // How much does this property affect appearance
    elementSize: number;       // Larger elements = higher priority
    aboveFold: number;         // Above-the-fold elements are more important
    categoryWeight: number;    // Layout > Colors > Typography > Effects
}

const CATEGORY_WEIGHTS: Record<string, number> = {
    layout: 10,
    color: 8,
    typography: 6,
    spacing: 5,
    effects: 3
};

const PROPERTY_IMPACT: Record<string, number> = {
    // High impact (10)
    'display': 10,
    'background-color': 10,
    'color': 10,
    'width': 9,
    'height': 9,

    // Medium impact (5-8)
    'font-size': 8,
    'padding-top': 7,
    'padding-bottom': 7,
    'margin-top': 7,
    'margin-bottom': 7,
    'flex-direction': 7,
    'justify-content': 6,
    'align-items': 6,
    'gap': 6,

    // Lower impact (1-4)
    'padding-left': 5,
    'padding-right': 5,
    'margin-left': 5,
    'margin-right': 5,
    'font-weight': 4,
    'line-height': 4,
    'border-radius': 3,
    'letter-spacing': 2,
    'opacity': 2
};

const computePriority = (change: StyleChange, viewportHeight: number = 900): number => {
    let score = 0;

    // 1. Property impact (0-10)
    score += PROPERTY_IMPACT[change.property] || 5;

    // 2. Category weight (0-10)
    score += CATEGORY_WEIGHTS[change.category] || 5;

    // 3. Element size (0-10)
    const area = change.rect.width * change.rect.height;
    const sizeScore = Math.min(10, area / 10000); // Normalize: 100k px² = max score
    score += sizeScore;

    // 4. Above-the-fold bonus (0-10)
    if (change.rect.y < viewportHeight) {
        const foldScore = 10 * (1 - change.rect.y / viewportHeight);
        score += foldScore;
    }

    // 5. Section importance (bonus for header/hero)
    if (change.section) {
        const lowerSection = change.section.toLowerCase();
        if (lowerSection.includes('header') || lowerSection.includes('hero')) {
            score += 5;
        } else if (lowerSection.includes('nav')) {
            score += 4;
        } else if (lowerSection.includes('footer')) {
            score += 2;
        }
    }

    return score;
};

export const prioritizeChanges = (
    changes: StyleChange[],
    limit: number = 10,
    viewportHeight: number = 900
): StyleChange[] => {
    // Compute priority for each change
    const withPriority = changes.map(change => ({
        ...change,
        priority: computePriority(change, viewportHeight)
    }));

    // Sort by priority (descending)
    withPriority.sort((a, b) => b.priority - a.priority);

    // Deduplicate: if same selector+property appears multiple times, keep highest priority
    const seen = new Set<string>();
    const deduplicated: StyleChange[] = [];

    for (const change of withPriority) {
        const key = `${change.cssSelector}|${change.property}`;
        if (!seen.has(key)) {
            seen.add(key);
            deduplicated.push(change);
        }
    }

    // Return top N
    return deduplicated.slice(0, limit);
};

/**
 * Group changes by section for batch processing
 */
export const groupChangesBySection = (changes: StyleChange[]): Map<string, StyleChange[]> => {
    const groups = new Map<string, StyleChange[]>();

    for (const change of changes) {
        const section = change.section || 'global';
        if (!groups.has(section)) {
            groups.set(section, []);
        }
        groups.get(section)!.push(change);
    }

    return groups;
};

/**
 * Group changes by selector for efficient CSS generation
 */
export const groupChangesBySelector = (changes: StyleChange[]): Map<string, StyleChange[]> => {
    const groups = new Map<string, StyleChange[]>();

    for (const change of changes) {
        if (!groups.has(change.cssSelector)) {
            groups.set(change.cssSelector, []);
        }
        groups.get(change.cssSelector)!.push(change);
    }

    return groups;
};
