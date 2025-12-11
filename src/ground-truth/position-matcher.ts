// src/ground-truth/position-matcher.ts
//
// POSITION-BASED ELEMENT MATCHING
//
// This replaces the flawed data-section attribute matching approach.
// Instead of relying on generated HTML attributes, we match elements
// based on their visual coordinates, tag types, and dimensions.
//

import { chromium, Page } from 'playwright';

// ============================================================================
// TYPES
// ============================================================================

export interface VisualElement {
    // Position and size
    rect: { x: number; y: number; width: number; height: number };

    // Element info
    tag: string;
    id?: string;
    classes: string[];

    // Computed styles (key properties only)
    styles: Record<string, string>;

    // Context
    sectionIndex: number;
    sectionRole?: string;
    depth: number;  // Nesting depth

    // Content
    textContent?: string;

    // For matching
    centerX: number;
    centerY: number;
    area: number;

    // Stable identifier for tracking
    stableKey: string;

    // Original CSS selector (for applying fixes)
    cssSelector: string;
}

export interface MatchResult {
    baseElement: VisualElement;
    targetElement: VisualElement;
    confidence: number;
    matchType: 'exact' | 'high' | 'fuzzy' | 'inferred';
    positionDelta: { x: number; y: number };
    sizeDelta: { width: number; height: number };
}

export interface MatchingStats {
    totalBase: number;
    totalTarget: number;
    matched: number;
    unmatched: number;
    matchRate: number;
    byConfidence: {
        exact: number;
        high: number;
        fuzzy: number;
        inferred: number;
    };
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

export const extractVisualElements = async (
    url: string,
    device: 'desktop' | 'mobile' = 'desktop'
): Promise<VisualElement[]> => {
    const viewport = device === 'mobile'
        ? { width: 375, height: 667 }
        : { width: 1280, height: 720 };

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport });

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(1500);

        const elements = await page.evaluate(() => {
            const RELEVANT_STYLES = [
                'display', 'position', 'width', 'height', 'min-width', 'max-width',
                'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                'background-color', 'color', 'font-size', 'font-weight', 'font-family',
                'line-height', 'letter-spacing', 'text-align',
                'border-radius', 'border-width', 'border-color', 'border-style',
                'box-shadow', 'opacity', 'flex-direction', 'justify-content',
                'align-items', 'gap', 'grid-template-columns'
            ];

            const rgbToHex = (rgb: string): string => {
                if (!rgb || rgb === 'transparent') return 'transparent';
                const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (!match) return rgb;
                const r = parseInt(match[1]).toString(16).padStart(2, '0');
                const g = parseInt(match[2]).toString(16).padStart(2, '0');
                const b = parseInt(match[3]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            };

            const isVisible = (el: Element): boolean => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return rect.width > 0 &&
                    rect.height > 0 &&
                    style.visibility !== 'hidden' &&
                    style.display !== 'none' &&
                    parseFloat(style.opacity) > 0.1;
            };

            const getDirectTextContent = (el: Element): string => {
                let text = '';
                for (const node of Array.from(el.childNodes)) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        text += node.textContent?.trim() || '';
                    }
                }
                return text.slice(0, 100);
            };

            // First, identify sections
            const sectionElements = Array.from(document.querySelectorAll(
                'header, footer, main, section, nav, aside, article, ' +
                '[data-section], [role="banner"], [role="main"], [role="contentinfo"]'
            )).filter(el => {
                const rect = el.getBoundingClientRect();
                return isVisible(el) && rect.height > 50;
            }).sort((a, b) =>
                a.getBoundingClientRect().top - b.getBoundingClientRect().top
            );

            const findSectionIndex = (el: Element): number => {
                const rect = el.getBoundingClientRect();
                for (let i = 0; i < sectionElements.length; i++) {
                    if (sectionElements[i].contains(el)) return i;
                }
                // Fallback: find by position
                for (let i = 0; i < sectionElements.length; i++) {
                    const secRect = sectionElements[i].getBoundingClientRect();
                    if (rect.top >= secRect.top && rect.bottom <= secRect.bottom + 10) {
                        return i;
                    }
                }
                return -1;
            };

            const getSectionRole = (el: Element): string | undefined => {
                const section = sectionElements.find(s => s.contains(el));
                if (!section) return undefined;

                const tag = section.tagName.toLowerCase();
                const attr = section.getAttribute('data-section');
                if (attr) return attr;
                if (tag === 'header') return 'header';
                if (tag === 'footer') return 'footer';
                if (tag === 'nav') return 'navigation';

                const classes = section.className?.toLowerCase() || '';
                if (classes.includes('hero')) return 'hero';
                if (classes.includes('feature')) return 'features';

                return undefined;
            };

            const buildCSSSelector = (el: Element, depth: number = 0): string => {
                if (depth > 5) return el.tagName.toLowerCase();

                // Try ID first
                if (el.id) return `#${el.id}`;

                const tag = el.tagName.toLowerCase();
                const classes = Array.from(el.classList)
                    .filter(c => !c.includes(':') && c.length < 30)
                    .slice(0, 2);

                // Try unique class combination
                if (classes.length > 0) {
                    const classSelector = `${tag}.${classes.join('.')}`;
                    if (document.querySelectorAll(classSelector).length === 1) {
                        return classSelector;
                    }
                }

                // Try nth-child within parent
                const parent = el.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
                    if (siblings.length > 1) {
                        const index = siblings.indexOf(el as HTMLElement) + 1;
                        const parentSelector = buildCSSSelector(parent, depth + 1);
                        return `${parentSelector} > ${tag}:nth-of-type(${index})`;
                    } else {
                        const parentSelector = buildCSSSelector(parent, depth + 1);
                        return `${parentSelector} > ${tag}`;
                    }
                }

                return tag;
            };

            const buildStableKey = (el: Element, rect: DOMRect, sectionIndex: number): string => {
                const tag = el.tagName.toLowerCase();
                const roundedX = Math.round(rect.x / 10) * 10;
                const roundedY = Math.round((rect.y + window.scrollY) / 10) * 10;
                const roundedW = Math.round(rect.width / 10) * 10;
                const roundedH = Math.round(rect.height / 10) * 10;
                return `${sectionIndex}:${tag}:${roundedX},${roundedY}:${roundedW}x${roundedH}`;
            };

            // Collect all visual elements
            const visualElements: any[] = [];

            const traverse = (el: Element, depth: number = 0) => {
                if (depth > 20) return;
                if (!isVisible(el)) return;

                const tag = el.tagName.toLowerCase();

                // Skip certain elements
                if (['script', 'style', 'link', 'meta', 'svg', 'path', 'noscript', 'iframe'].includes(tag)) {
                    return;
                }

                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);

                // Only include meaningful elements
                const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
                const isText = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'li', 'label'].includes(tag);
                const isContainer = ['div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside'].includes(tag);
                const isMedia = ['img', 'video', 'picture'].includes(tag);

                // Include if meaningful
                const shouldInclude =
                    isInteractive ||
                    isText ||
                    isMedia ||
                    (isContainer && (
                        rect.height > 30 &&
                        rect.width > 50 &&
                        style.backgroundColor !== 'transparent' && style.backgroundColor !== 'rgba(0, 0, 0, 0)'
                    ));

                const sectionIndex = findSectionIndex(el);
                const sectionRole = getSectionRole(el);

                if (shouldInclude && rect.width > 10 && rect.height > 10) {
                    const styles: Record<string, string> = {};
                    for (const prop of RELEVANT_STYLES) {
                        const val = style.getPropertyValue(prop);
                        if (val) {
                            // Normalize color values
                            if (prop.includes('color')) {
                                styles[prop] = rgbToHex(val);
                            } else {
                                styles[prop] = val;
                            }
                        }
                    }

                    visualElements.push({
                        rect: {
                            x: Math.round(rect.x),
                            y: Math.round(rect.y + window.scrollY),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height)
                        },
                        tag,
                        id: el.id || undefined,
                        classes: Array.from(el.classList).slice(0, 5),
                        styles,
                        sectionIndex,
                        sectionRole,
                        depth,
                        textContent: getDirectTextContent(el),
                        centerX: Math.round(rect.x + rect.width / 2),
                        centerY: Math.round(rect.y + window.scrollY + rect.height / 2),
                        area: Math.round(rect.width * rect.height),
                        stableKey: buildStableKey(el, rect, sectionIndex),
                        cssSelector: buildCSSSelector(el)
                    });
                }

                // Traverse children
                for (const child of Array.from(el.children)) {
                    traverse(child, depth + 1);
                }
            };

            traverse(document.body, 0);

            return visualElements;
        });

        return elements;

    } finally {
        await browser.close();
    }
};

// ============================================================================
// POSITION-BASED MATCHING
// ============================================================================

export const matchElementsByPosition = (
    baseElements: VisualElement[],
    targetElements: VisualElement[],
    options: {
        positionTolerance?: number;  // Max pixel distance for position match
        sizeRatioTolerance?: number; // Min size ratio for size match (0.8 = 80%)
        requireSameSection?: boolean;
        requireSameTag?: boolean;
    } = {}
): { matches: MatchResult[]; stats: MatchingStats } => {
    const {
        positionTolerance = 50,
        sizeRatioTolerance = 0.7,
        requireSameSection = false,
        requireSameTag = false
    } = options;

    const matches: MatchResult[] = [];
    const usedTargets = new Set<number>();

    // Sort base elements by importance (area * depth inverse)
    const sortedBase = [...baseElements].sort((a, b) => {
        const scoreA = a.area * (1 / (a.depth + 1));
        const scoreB = b.area * (1 / (b.depth + 1));
        return scoreB - scoreA;
    });

    for (const base of sortedBase) {
        let bestMatch: {
            target: VisualElement;
            score: number;
            index: number;
            positionDelta: { x: number; y: number };
            sizeDelta: { width: number; height: number };
        } | null = null;

        for (let i = 0; i < targetElements.length; i++) {
            if (usedTargets.has(i)) continue;

            const target = targetElements[i];
            const score = calculateMatchScore(base, target, {
                positionTolerance,
                sizeRatioTolerance,
                requireSameSection,
                requireSameTag
            });

            if (score > 0.5 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = {
                    target,
                    score,
                    index: i,
                    positionDelta: {
                        x: target.centerX - base.centerX,
                        y: target.centerY - base.centerY
                    },
                    sizeDelta: {
                        width: target.rect.width - base.rect.width,
                        height: target.rect.height - base.rect.height
                    }
                };
            }
        }

        if (bestMatch) {
            usedTargets.add(bestMatch.index);

            const matchType: 'exact' | 'high' | 'fuzzy' | 'inferred' =
                bestMatch.score > 0.95 ? 'exact' :
                    bestMatch.score > 0.85 ? 'high' :
                        bestMatch.score > 0.7 ? 'fuzzy' : 'inferred';

            matches.push({
                baseElement: base,
                targetElement: bestMatch.target,
                confidence: bestMatch.score,
                matchType,
                positionDelta: bestMatch.positionDelta,
                sizeDelta: bestMatch.sizeDelta
            });
        }
    }

    // Calculate stats
    const stats: MatchingStats = {
        totalBase: baseElements.length,
        totalTarget: targetElements.length,
        matched: matches.length,
        unmatched: baseElements.length - matches.length,
        matchRate: matches.length / baseElements.length,
        byConfidence: {
            exact: matches.filter(m => m.matchType === 'exact').length,
            high: matches.filter(m => m.matchType === 'high').length,
            fuzzy: matches.filter(m => m.matchType === 'fuzzy').length,
            inferred: matches.filter(m => m.matchType === 'inferred').length
        }
    };

    return { matches, stats };
};

// ============================================================================
// MATCH SCORE CALCULATION
// ============================================================================

const calculateMatchScore = (
    base: VisualElement,
    target: VisualElement,
    options: {
        positionTolerance: number;
        sizeRatioTolerance: number;
        requireSameSection: boolean;
        requireSameTag: boolean;
    }
): number => {
    const { positionTolerance, sizeRatioTolerance, requireSameSection, requireSameTag } = options;

    // Early rejection: section must match if required
    if (requireSameSection && base.sectionIndex !== target.sectionIndex) {
        return 0;
    }

    // Early rejection: tag must match if required
    if (requireSameTag && base.tag !== target.tag) {
        return 0;
    }

    let score = 0;
    let maxScore = 0;

    // 1. Position similarity (35% weight)
    maxScore += 35;
    const centerDistanceX = Math.abs(base.centerX - target.centerX);
    const centerDistanceY = Math.abs(base.centerY - target.centerY);
    const centerDistance = Math.sqrt(centerDistanceX ** 2 + centerDistanceY ** 2);

    if (centerDistance <= positionTolerance) {
        const positionScore = 35 * (1 - centerDistance / positionTolerance);
        score += positionScore;
    }

    // 2. Size similarity (25% weight)
    maxScore += 25;
    const widthRatio = Math.min(base.rect.width, target.rect.width) /
        Math.max(base.rect.width, target.rect.width);
    const heightRatio = Math.min(base.rect.height, target.rect.height) /
        Math.max(base.rect.height, target.rect.height);

    if (widthRatio >= sizeRatioTolerance && heightRatio >= sizeRatioTolerance) {
        const sizeScore = 25 * (widthRatio * heightRatio);
        score += sizeScore;
    }

    // 3. Tag match (15% weight)
    maxScore += 15;
    if (base.tag === target.tag) {
        score += 15;
    } else if (isCompatibleTag(base.tag, target.tag)) {
        score += 10;
    }

    // 4. Section match (10% weight)
    maxScore += 10;
    if (base.sectionIndex === target.sectionIndex) {
        score += 10;
    } else if (base.sectionRole && base.sectionRole === target.sectionRole) {
        score += 7;
    }

    // 5. Text content similarity (10% weight)
    maxScore += 10;
    if (base.textContent && target.textContent) {
        if (base.textContent === target.textContent) {
            score += 10;
        } else if (base.textContent.toLowerCase().includes(target.textContent.toLowerCase()) ||
            target.textContent.toLowerCase().includes(base.textContent.toLowerCase())) {
            score += 5;
        }
    }

    // 6. Depth similarity (5% weight)
    maxScore += 5;
    const depthDiff = Math.abs(base.depth - target.depth);
    if (depthDiff <= 2) {
        score += 5 - depthDiff;
    }

    return score / maxScore;
};

const isCompatibleTag = (tag1: string, tag2: string): boolean => {
    const compatibleGroups = [
        ['div', 'section', 'article', 'main', 'aside'],
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ['p', 'span', 'div'],
        ['button', 'a'],
        ['img', 'picture', 'figure'],
        ['ul', 'ol', 'div'],
        ['li', 'div'],
        ['nav', 'header', 'div'],
        ['footer', 'div', 'section']
    ];

    return compatibleGroups.some(group =>
        group.includes(tag1.toLowerCase()) && group.includes(tag2.toLowerCase())
    );
};

// ============================================================================
// STYLE DIFFERENCE EXTRACTION
// ============================================================================

export interface StyleDifference {
    baseElement: VisualElement;
    targetElement: VisualElement;
    cssSelector: string;
    stableKey: string;
    property: string;
    expected: string;
    actual: string;
    category: 'layout' | 'spacing' | 'typography' | 'color' | 'effects';
    importance: number;  // 0-100, higher = more visual impact
}

export const extractStyleDifferences = (
    matches: MatchResult[]
): StyleDifference[] => {
    const differences: StyleDifference[] = [];

    const categoryMap: Record<string, 'layout' | 'spacing' | 'typography' | 'color' | 'effects'> = {
        'display': 'layout',
        'position': 'layout',
        'flex-direction': 'layout',
        'justify-content': 'layout',
        'align-items': 'layout',
        'grid-template-columns': 'layout',
        'width': 'layout',
        'height': 'layout',
        'min-width': 'layout',
        'max-width': 'layout',

        'margin-top': 'spacing',
        'margin-right': 'spacing',
        'margin-bottom': 'spacing',
        'margin-left': 'spacing',
        'padding-top': 'spacing',
        'padding-right': 'spacing',
        'padding-bottom': 'spacing',
        'padding-left': 'spacing',
        'gap': 'spacing',

        'font-size': 'typography',
        'font-weight': 'typography',
        'font-family': 'typography',
        'line-height': 'typography',
        'letter-spacing': 'typography',
        'text-align': 'typography',

        'background-color': 'color',
        'color': 'color',
        'border-color': 'color',

        'border-radius': 'effects',
        'border-width': 'effects',
        'border-style': 'effects',
        'box-shadow': 'effects',
        'opacity': 'effects'
    };

    const importanceMap: Record<string, number> = {
        'display': 100,
        'position': 95,
        'width': 90,
        'height': 90,
        'flex-direction': 85,
        'grid-template-columns': 85,
        'justify-content': 80,
        'align-items': 80,
        'background-color': 75,
        'color': 70,
        'font-size': 65,
        'padding-top': 60,
        'padding-bottom': 60,
        'margin-top': 55,
        'margin-bottom': 55,
        'gap': 50,
        'font-weight': 45,
        'border-radius': 40,
        'line-height': 35,
        'border-color': 30,
        'box-shadow': 25,
        'letter-spacing': 20,
        'opacity': 15
    };

    for (const match of matches) {
        const { baseElement, targetElement } = match;

        for (const [prop, baseValue] of Object.entries(baseElement.styles)) {
            const targetValue = targetElement.styles[prop];

            // Skip if same
            if (baseValue === targetValue) continue;
            if (!targetValue) continue;

            // Skip insignificant differences
            if (!isSignificantDifference(prop, baseValue, targetValue)) continue;

            differences.push({
                baseElement,
                targetElement,
                cssSelector: targetElement.cssSelector,
                stableKey: targetElement.stableKey,
                property: prop,
                expected: baseValue,
                actual: targetValue,
                category: categoryMap[prop] || 'effects',
                importance: importanceMap[prop] || 25
            });
        }
    }

    // Sort by importance
    differences.sort((a, b) => b.importance - a.importance);

    return differences;
};

const isSignificantDifference = (
    property: string,
    expected: string,
    actual: string
): boolean => {
    if (expected === actual) return false;

    // Numeric comparison with tolerance
    const expectedNum = parseFloat(expected);
    const actualNum = parseFloat(actual);

    if (!isNaN(expectedNum) && !isNaN(actualNum)) {
        // For small values, use absolute tolerance
        if (Math.abs(expectedNum) < 10 && Math.abs(actualNum) < 10) {
            return Math.abs(expectedNum - actualNum) > 1;
        }
        // For larger values, use percentage tolerance
        return Math.abs(expectedNum - actualNum) / Math.max(Math.abs(expectedNum), 1) > 0.1;
    }

    // Color comparison
    if (expected.startsWith('#') && actual.startsWith('#')) {
        // Compare hex colors with tolerance
        const expRgb = hexToRgb(expected);
        const actRgb = hexToRgb(actual);
        if (expRgb && actRgb) {
            const diff = Math.abs(expRgb.r - actRgb.r) +
                Math.abs(expRgb.g - actRgb.g) +
                Math.abs(expRgb.b - actRgb.b);
            return diff > 30; // ~10% difference per channel
        }
    }

    return true;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return null;
    return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16)
    };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    extractVisualElements,
    matchElementsByPosition,
    extractStyleDifferences
};