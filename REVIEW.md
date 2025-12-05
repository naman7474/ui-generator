# PixelGen v2: Deterministic Refinement Architecture

## Executive Summary

This plan transforms the iteration loop from **LLM-regenerates-code** to **LLM-analyzes → Deterministic-patches**. The key insight is that once we have the initial HTML structure, all subsequent iterations should only modify CSS through programmatic manipulation, not LLM code generation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 1: INITIAL GENERATION                        │
│                                                                              │
│   Base URL Screenshot ──► Vision LLM ──► Full React Bundle                  │
│                                      ──► Structure Lock (HTML frozen)        │
│                                      ──► Base CSS extracted                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 2: GROUND TRUTH EXTRACTION                      │
│                                                                              │
│   Base URL ──────────────────► extractGroundTruth() ──► ground-truth.json   │
│   Generated Site ────────────► extractCurrentState() ──► current-state.json │
│                                                                              │
│   Output: Per-element computed styles with stable selectors                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PHASE 3: STRUCTURED DIFF                            │
│                                                                              │
│   ground-truth.json ─┬──► computeStructuredDiff() ──► StyleChange[]         │
│   current-state.json ─┘                                                      │
│                                                                              │
│   Output: Array of { selector, property, expected, actual, priority }        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 4: PRIORITIZATION                            │
│                                                                              │
│   StyleChange[] ──► prioritizeChanges() ──► Top N changes for this iter     │
│                                                                              │
│   Factors: visual impact, element size, above-fold, category                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 5: DETERMINISTIC PATCH                          │
│                                                                              │
│   Option A: CSS AST Manipulation (postcss)                                   │
│   Option B: Append to overrides.css file                                     │
│   Option C: Inject inline styles via Playwright                              │
│                                                                              │
│   NO LLM INVOLVED - Pure programmatic transformation                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PHASE 6: VALIDATION                               │
│                                                                              │
│   Re-render ──► Re-extract styles ──► Verify changes applied                │
│   If regression detected ──► Rollback specific change                        │
│   If improvement ──► Commit change, continue loop                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                              Loop until converged
                         (or max iterations reached)
```

---

## File Structure

```
src/
├── pixelgen-v2.ts              # NEW: Main orchestrator (replaces pixelgen.ts loop)
├── ground-truth/
│   ├── extractor.ts            # NEW: Extract computed styles with stable selectors
│   ├── differ.ts               # NEW: Compute structured diff between states
│   ├── prioritizer.ts          # NEW: Rank changes by visual impact
│   └── types.ts                # NEW: Shared interfaces
├── patcher/
│   ├── css-patcher.ts          # NEW: PostCSS-based CSS manipulation
│   ├── override-generator.ts   # NEW: Generate CSS override rules
│   ├── validator.ts            # NEW: Verify changes applied correctly
│   └── rollback.ts             # NEW: Revert specific changes on regression
├── style-diff.ts               # EXISTING: Keep for visual comparison
├── dom-extractor.ts            # EXISTING: Keep for DOM analysis
├── similarity.ts               # EXISTING: Keep for scoring
└── llm-feedback.ts             # MODIFY: Only used for initial generation
```

---

## Phase 1: Initial Generation (Minimal Changes)

### What Changes
- After initial LLM generation, we **freeze the HTML/JSX structure**
- Extract all CSS into a separate `base.css` file
- Create an empty `overrides.css` that will be modified in iterations

### File: `src/pixelgen-v2.ts` (New Main Orchestrator)

```typescript
// src/pixelgen-v2.ts

import { extractGroundTruth, extractCurrentState } from './ground-truth/extractor';
import { computeStructuredDiff } from './ground-truth/differ';
import { prioritizeChanges } from './ground-truth/prioritizer';
import { applyCSSPatches } from './patcher/css-patcher';
import { validateChanges } from './patcher/validator';
import { rollbackChange } from './patcher/rollback';

export interface PixelGenV2Options {
    baseUrl: string;
    maxIterations?: number;
    targetSimilarity?: number;
    changesPerIteration?: number;
    device?: 'desktop' | 'mobile';
}

export const runPixelGenV2 = async (options: PixelGenV2Options) => {
    const {
        baseUrl,
        maxIterations = 20,
        targetSimilarity = 0.95,
        changesPerIteration = 5,
        device = 'desktop'
    } = options;

    // ========== PHASE 1: Initial Generation ==========
    console.log('[PixelGen v2] Phase 1: Initial generation...');
    const { bundle, siteDir, localUrl } = await generateInitialSite(baseUrl);
    
    // Freeze structure - extract HTML and create CSS architecture
    const { frozenHtml, baseCss, overridesPath } = await freezeStructure(siteDir);
    
    // ========== PHASE 2: Extract Ground Truth ==========
    console.log('[PixelGen v2] Phase 2: Extracting ground truth...');
    const groundTruth = await extractGroundTruth(baseUrl, device);
    await saveJson(path.join(siteDir, 'ground-truth.json'), groundTruth);

    // ========== ITERATION LOOP ==========
    let currentSimilarity = 0;
    let iteration = 0;
    const appliedChanges: AppliedChange[] = [];

    while (iteration < maxIterations && currentSimilarity < targetSimilarity) {
        console.log(`[PixelGen v2] Iteration ${iteration}...`);

        // ========== PHASE 2 (per iteration): Extract Current State ==========
        const currentState = await extractCurrentState(localUrl, device);
        await saveJson(path.join(siteDir, `iteration-${iteration}`, 'current-state.json'), currentState);

        // ========== PHASE 3: Compute Structured Diff ==========
        const diff = computeStructuredDiff(groundTruth, currentState);
        await saveJson(path.join(siteDir, `iteration-${iteration}`, 'diff.json'), diff);

        if (diff.changes.length === 0) {
            console.log('[PixelGen v2] No differences found. Converged!');
            break;
        }

        // ========== PHASE 4: Prioritize Changes ==========
        const prioritized = prioritizeChanges(diff.changes, changesPerIteration);
        console.log(`[PixelGen v2] Applying ${prioritized.length} changes...`);

        // ========== PHASE 5: Apply Deterministic Patches ==========
        for (const change of prioritized) {
            const patchResult = await applyCSSPatches(overridesPath, [change]);
            
            // ========== PHASE 6: Validate Each Change ==========
            const validation = await validateChanges(localUrl, [change], device);
            
            if (validation.regressions.length > 0) {
                console.warn(`[PixelGen v2] Regression detected for ${change.selector}.${change.property}, rolling back...`);
                await rollbackChange(overridesPath, change);
            } else {
                appliedChanges.push({ ...change, iteration });
                console.log(`[PixelGen v2] ✓ Applied: ${change.selector} { ${change.property}: ${change.expected} }`);
            }
        }

        // Compute new similarity
        currentSimilarity = await computeSimilarity(baseUrl, localUrl, device);
        console.log(`[PixelGen v2] Iteration ${iteration} complete. Similarity: ${(currentSimilarity * 100).toFixed(2)}%`);

        iteration++;
    }

    return {
        finalSimilarity: currentSimilarity,
        iterations: iteration,
        appliedChanges,
        localUrl
    };
};
```

---

## Phase 2: Ground Truth Extraction

### File: `src/ground-truth/types.ts`

```typescript
// src/ground-truth/types.ts

export interface ElementStyle {
    // Stable identifier for matching between base and generated
    stableSelector: string;
    
    // Original CSS selector (for applying fixes)
    cssSelector: string;
    
    // Element metadata
    tag: string;
    text?: string;
    section?: string;
    
    // Bounding box (for prioritization)
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    
    // Computed styles (the ground truth)
    styles: Record<string, string>;
}

export interface GroundTruth {
    url: string;
    device: 'desktop' | 'mobile';
    viewport: { width: number; height: number };
    extractedAt: string;
    elements: Map<string, ElementStyle>; // keyed by stableSelector
}

export interface StyleChange {
    stableSelector: string;
    cssSelector: string;
    property: string;
    expected: string;  // from ground truth (base site)
    actual: string;    // from current state (generated site)
    
    // Metadata for prioritization
    section?: string;
    tag: string;
    rect: { x: number; y: number; width: number; height: number };
    
    // Computed priority (higher = more important)
    priority: number;
    category: 'layout' | 'spacing' | 'typography' | 'color' | 'effects';
}

export interface StructuredDiff {
    baseUrl: string;
    targetUrl: string;
    device: 'desktop' | 'mobile';
    timestamp: string;
    changes: StyleChange[];
    summary: {
        totalDifferences: number;
        byCategory: Record<string, number>;
        bySection: Record<string, number>;
    };
}

export interface AppliedChange extends StyleChange {
    iteration: number;
    appliedAt: string;
}
```

### File: `src/ground-truth/extractor.ts`

```typescript
// src/ground-truth/extractor.ts

import { chromium, Page } from 'playwright';
import { ElementStyle, GroundTruth } from './types';

const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 }
};

// CSS properties we care about for visual matching
const STYLE_PROPERTIES = [
    // Layout
    'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap',
    'grid-template-columns', 'grid-template-rows',
    
    // Spacing
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    
    // Typography
    'font-family', 'font-size', 'font-weight', 'line-height',
    'letter-spacing', 'text-align', 'text-transform', 'text-decoration',
    
    // Colors
    'color', 'background-color', 'border-color',
    
    // Borders
    'border-width', 'border-style', 'border-radius',
    
    // Effects
    'opacity', 'box-shadow', 'transform'
];

/**
 * Generate a stable selector that can match elements across base and generated sites.
 * 
 * Strategy:
 * 1. If element has data-section, use it as anchor
 * 2. Use semantic hierarchy: section > heading level > tag + position
 * 3. Include text content hash for disambiguation
 */
const generateStableSelector = (el: Element, ancestors: Element[]): string => {
    const parts: string[] = [];
    
    // Find nearest section anchor
    const sectionAncestor = ancestors.find(a => 
        a.hasAttribute('data-section') || 
        ['HEADER', 'FOOTER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE'].includes(a.tagName)
    );
    
    if (sectionAncestor) {
        const sectionName = sectionAncestor.getAttribute('data-section') || 
                           sectionAncestor.tagName.toLowerCase();
        parts.push(`[section:${sectionName}]`);
    }
    
    // Add semantic tag path
    const semanticPath = ancestors
        .filter(a => ['HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FOOTER'].includes(a.tagName))
        .map(a => a.tagName.toLowerCase())
        .join('/');
    if (semanticPath) {
        parts.push(`[path:${semanticPath}]`);
    }
    
    // Add element info
    parts.push(`[tag:${el.tagName.toLowerCase()}]`);
    
    // Add text content hash (first 50 chars)
    const text = (el.textContent || '').trim().slice(0, 50);
    if (text) {
        const textHash = simpleHash(text);
        parts.push(`[text:${textHash}]`);
    }
    
    // Add position among siblings of same type
    const parent = el.parentElement;
    if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
        if (siblings.length > 1) {
            const index = siblings.indexOf(el);
            parts.push(`[nth:${index}]`);
        }
    }
    
    return parts.join('');
};

const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(0, 8);
};

/**
 * Generate a CSS selector that can be used to apply styles.
 * This should be specific enough to target the element but not brittle.
 */
const generateCSSSelector = (el: Element): string => {
    // Priority 1: ID
    if (el.id) {
        return `#${CSS.escape(el.id)}`;
    }
    
    // Priority 2: data-section + tag + nth-of-type
    const section = el.closest('[data-section]');
    if (section) {
        const sectionName = section.getAttribute('data-section');
        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
            const nth = siblings.indexOf(el) + 1;
            return `[data-section="${sectionName}"] ${el.tagName.toLowerCase()}:nth-of-type(${nth})`;
        }
    }
    
    // Priority 3: Class-based selector
    if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(/\s+/).filter(c => 
            c && !c.startsWith('_') && !c.match(/^[a-z]{6,}$/) // Filter CSS modules hashes
        );
        if (classes.length > 0) {
            return `${el.tagName.toLowerCase()}.${classes.slice(0, 2).join('.')}`;
        }
    }
    
    // Fallback: tag + nth-child path
    const path: string[] = [];
    let current: Element | null = el;
    while (current && current !== document.body) {
        const parent = current.parentElement;
        if (parent) {
            const index = Array.from(parent.children).indexOf(current) + 1;
            path.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
        }
        current = parent;
    }
    return path.slice(-3).join(' > '); // Last 3 levels only
};

export const extractGroundTruth = async (
    url: string, 
    device: 'desktop' | 'mobile' = 'desktop'
): Promise<GroundTruth> => {
    const browser = await chromium.launch({ headless: true });
    const viewport = VIEWPORTS[device];
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Let animations settle
    
    const elements = await page.evaluate((styleProps) => {
        const results: any[] = [];
        
        const processElement = (el: Element, ancestors: Element[] = []) => {
            // Skip invisible elements
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') {
                return;
            }
            
            const rect = el.getBoundingClientRect();
            // Skip elements with no dimensions (unless they're containers)
            if (rect.width === 0 && rect.height === 0 && el.children.length === 0) {
                return;
            }
            
            // Skip script/style/meta elements
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(el.tagName)) {
                return;
            }
            
            // Extract computed styles
            const styles: Record<string, string> = {};
            for (const prop of styleProps) {
                styles[prop] = style.getPropertyValue(prop);
            }
            
            // Get section context
            const sectionEl = el.closest('[data-section]') || 
                             el.closest('header, footer, nav, main, section, article');
            const section = sectionEl?.getAttribute('data-section') || 
                           sectionEl?.tagName.toLowerCase();
            
            // Generate selectors (done in browser context)
            const stableSelector = generateStableSelector(el, ancestors);
            const cssSelector = generateCSSSelector(el);
            
            results.push({
                stableSelector,
                cssSelector,
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || '').trim().slice(0, 100),
                section,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                styles
            });
            
            // Process children
            for (const child of Array.from(el.children)) {
                processElement(child, [...ancestors, el]);
            }
        };
        
        // Helper functions need to be defined inside evaluate
        const generateStableSelector = (el: Element, ancestors: Element[]): string => {
            // ... (same implementation as above, but inline)
            const parts: string[] = [];
            const sectionAncestor = ancestors.find(a => 
                a.hasAttribute('data-section') || 
                ['HEADER', 'FOOTER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE'].includes(a.tagName)
            );
            if (sectionAncestor) {
                const sectionName = sectionAncestor.getAttribute('data-section') || 
                                   sectionAncestor.tagName.toLowerCase();
                parts.push(`[section:${sectionName}]`);
            }
            parts.push(`[tag:${el.tagName.toLowerCase()}]`);
            const text = (el.textContent || '').trim().slice(0, 50);
            if (text) {
                let hash = 0;
                for (let i = 0; i < text.length; i++) {
                    hash = ((hash << 5) - hash) + text.charCodeAt(i);
                    hash = hash & hash;
                }
                parts.push(`[text:${Math.abs(hash).toString(36).slice(0, 8)}]`);
            }
            const parent = el.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
                if (siblings.length > 1) {
                    parts.push(`[nth:${siblings.indexOf(el)}]`);
                }
            }
            return parts.join('');
        };
        
        const generateCSSSelector = (el: Element): string => {
            if (el.id) return `#${el.id}`;
            const section = el.closest('[data-section]');
            if (section) {
                const sectionName = section.getAttribute('data-section');
                const parent = el.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
                    const nth = siblings.indexOf(el) + 1;
                    return `[data-section="${sectionName}"] ${el.tagName.toLowerCase()}:nth-of-type(${nth})`;
                }
            }
            if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(/\s+/).filter(c => c && !c.startsWith('_'));
                if (classes.length > 0) {
                    return `${el.tagName.toLowerCase()}.${classes.slice(0, 2).join('.')}`;
                }
            }
            return el.tagName.toLowerCase();
        };
        
        processElement(document.body);
        return results;
    }, STYLE_PROPERTIES);
    
    await browser.close();
    
    const elementMap = new Map<string, ElementStyle>();
    for (const el of elements) {
        elementMap.set(el.stableSelector, el);
    }
    
    return {
        url,
        device,
        viewport,
        extractedAt: new Date().toISOString(),
        elements: elementMap
    };
};

export const extractCurrentState = extractGroundTruth; // Same function, different URL
```

---

## Phase 3: Structured Diff Computation

### File: `src/ground-truth/differ.ts`

```typescript
// src/ground-truth/differ.ts

import { GroundTruth, StyleChange, StructuredDiff } from './types';

const categorizeProperty = (prop: string): StyleChange['category'] => {
    if (['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 
         'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
         'flex-direction', 'justify-content', 'align-items', 'gap',
         'grid-template-columns', 'grid-template-rows'].includes(prop)) {
        return 'layout';
    }
    if (['margin-top', 'margin-right', 'margin-bottom', 'margin-left',
         'padding-top', 'padding-right', 'padding-bottom', 'padding-left'].includes(prop)) {
        return 'spacing';
    }
    if (['font-family', 'font-size', 'font-weight', 'line-height',
         'letter-spacing', 'text-align', 'text-transform', 'text-decoration'].includes(prop)) {
        return 'typography';
    }
    if (['color', 'background-color', 'border-color'].includes(prop)) {
        return 'color';
    }
    return 'effects';
};

const isSignificantDifference = (prop: string, expected: string, actual: string): boolean => {
    // Skip if identical
    if (expected === actual) return false;
    
    // Normalize and compare
    const normalizeValue = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalizeValue(expected) === normalizeValue(actual)) return false;
    
    // For numeric values, check if difference is significant
    const expectedNum = parseFloat(expected);
    const actualNum = parseFloat(actual);
    
    if (!isNaN(expectedNum) && !isNaN(actualNum)) {
        const diff = Math.abs(expectedNum - actualNum);
        
        // For small values (< 10), allow 1px tolerance
        if (expectedNum < 10 && diff <= 1) return false;
        
        // For larger values, allow 2% tolerance
        if (diff / Math.max(expectedNum, 1) < 0.02) return false;
    }
    
    // For colors, normalize to rgb and compare
    if (prop.includes('color')) {
        const normalizeColor = (c: string) => {
            // Convert hex to rgb, normalize rgb format
            // This is simplified - production would use a color library
            return c.replace(/\s/g, '').toLowerCase();
        };
        if (normalizeColor(expected) === normalizeColor(actual)) return false;
    }
    
    return true;
};

export const computeStructuredDiff = (
    groundTruth: GroundTruth, 
    currentState: GroundTruth
): StructuredDiff => {
    const changes: StyleChange[] = [];
    const byCategory: Record<string, number> = {};
    const bySection: Record<string, number> = {};
    
    // Iterate through ground truth elements
    for (const [stableSelector, baseElement] of groundTruth.elements) {
        const currentElement = currentState.elements.get(stableSelector);
        
        // Skip if element not found in current state (structural difference)
        if (!currentElement) {
            console.warn(`Element not found in current state: ${stableSelector}`);
            continue;
        }
        
        // Compare each style property
        for (const [prop, expectedValue] of Object.entries(baseElement.styles)) {
            const actualValue = currentElement.styles[prop] || '';
            
            if (isSignificantDifference(prop, expectedValue, actualValue)) {
                const category = categorizeProperty(prop);
                const section = baseElement.section || 'global';
                
                changes.push({
                    stableSelector,
                    cssSelector: baseElement.cssSelector,
                    property: prop,
                    expected: expectedValue,
                    actual: actualValue,
                    section,
                    tag: baseElement.tag,
                    rect: baseElement.rect,
                    priority: 0, // Will be computed in prioritization phase
                    category
                });
                
                byCategory[category] = (byCategory[category] || 0) + 1;
                bySection[section] = (bySection[section] || 0) + 1;
            }
        }
    }
    
    return {
        baseUrl: groundTruth.url,
        targetUrl: currentState.url,
        device: groundTruth.device,
        timestamp: new Date().toISOString(),
        changes,
        summary: {
            totalDifferences: changes.length,
            byCategory,
            bySection
        }
    };
};
```

---

## Phase 4: Prioritization

### File: `src/ground-truth/prioritizer.ts`

```typescript
// src/ground-truth/prioritizer.ts

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
```

---

## Phase 5: Deterministic CSS Patching

### File: `src/patcher/css-patcher.ts`

```typescript
// src/patcher/css-patcher.ts

import fs from 'fs/promises';
import postcss, { Root, Rule } from 'postcss';
import { StyleChange } from '../ground-truth/types';
import { groupChangesBySelector } from '../ground-truth/prioritizer';

/**
 * Apply CSS patches using PostCSS AST manipulation.
 * 
 * This is the DETERMINISTIC core - no LLM involved.
 */
export const applyCSSPatches = async (
    overridesPath: string,
    changes: StyleChange[]
): Promise<{ success: boolean; appliedCount: number; errors: string[] }> => {
    const errors: string[] = [];
    let appliedCount = 0;
    
    // Read existing overrides (or start fresh)
    let cssContent = '';
    try {
        cssContent = await fs.readFile(overridesPath, 'utf-8');
    } catch {
        cssContent = '/* Auto-generated CSS overrides */\n';
    }
    
    // Parse with PostCSS
    const root = postcss.parse(cssContent);
    
    // Group changes by selector for efficiency
    const grouped = groupChangesBySelector(changes);
    
    for (const [selector, selectorChanges] of grouped) {
        try {
            // Find existing rule or create new one
            let rule = findRule(root, selector);
            
            if (!rule) {
                rule = postcss.rule({ selector });
                root.append(rule);
            }
            
            // Apply each property change
            for (const change of selectorChanges) {
                applyPropertyChange(rule, change.property, change.expected);
                appliedCount++;
            }
        } catch (e) {
            errors.push(`Failed to apply ${selector}: ${e}`);
        }
    }
    
    // Write back
    const output = root.toString();
    await fs.writeFile(overridesPath, output, 'utf-8');
    
    return { success: errors.length === 0, appliedCount, errors };
};

const findRule = (root: Root, selector: string): Rule | undefined => {
    let found: Rule | undefined;
    
    root.walkRules((rule) => {
        if (rule.selector === selector) {
            found = rule;
        }
    });
    
    return found;
};

const applyPropertyChange = (rule: Rule, property: string, value: string): void => {
    let found = false;
    
    // Check if property already exists
    rule.walkDecls(property, (decl) => {
        decl.value = value;
        found = true;
    });
    
    // If not found, append new declaration
    if (!found) {
        rule.append({ prop: property, value });
    }
};

/**
 * Generate CSS override content without modifying files.
 * Useful for preview/validation before applying.
 */
export const generateCSSOverrides = (changes: StyleChange[]): string => {
    const lines: string[] = ['/* Auto-generated CSS overrides */'];
    
    const grouped = groupChangesBySelector(changes);
    
    for (const [selector, selectorChanges] of grouped) {
        lines.push('');
        lines.push(`${selector} {`);
        
        for (const change of selectorChanges) {
            // Add !important to ensure override takes effect
            lines.push(`  ${change.property}: ${change.expected} !important;`);
        }
        
        lines.push('}');
    }
    
    return lines.join('\n');
};

/**
 * Remove a specific change (for rollback).
 */
export const removeOverride = async (
    overridesPath: string,
    change: StyleChange
): Promise<void> => {
    const cssContent = await fs.readFile(overridesPath, 'utf-8');
    const root = postcss.parse(cssContent);
    
    root.walkRules(change.cssSelector, (rule) => {
        rule.walkDecls(change.property, (decl) => {
            decl.remove();
        });
        
        // Remove empty rules
        if (rule.nodes?.length === 0) {
            rule.remove();
        }
    });
    
    await fs.writeFile(overridesPath, root.toString(), 'utf-8');
};
```

### File: `src/patcher/override-generator.ts`

```typescript
// src/patcher/override-generator.ts

import fs from 'fs/promises';
import path from 'path';
import { StyleChange } from '../ground-truth/types';

/**
 * Alternative approach: Instead of modifying existing CSS,
 * generate a standalone overrides file that's loaded last.
 * 
 * This is simpler and has cleaner rollback semantics.
 */

interface OverrideEntry {
    selector: string;
    property: string;
    value: string;
    addedAt: string;
    iteration: number;
}

export class OverrideManager {
    private entries: OverrideEntry[] = [];
    private filePath: string;
    
    constructor(siteDir: string) {
        this.filePath = path.join(siteDir, 'site', 'overrides.css');
    }
    
    async load(): Promise<void> {
        try {
            const metaPath = this.filePath.replace('.css', '.json');
            const meta = await fs.readFile(metaPath, 'utf-8');
            this.entries = JSON.parse(meta);
        } catch {
            this.entries = [];
        }
    }
    
    async save(): Promise<void> {
        // Save metadata
        const metaPath = this.filePath.replace('.css', '.json');
        await fs.writeFile(metaPath, JSON.stringify(this.entries, null, 2));
        
        // Generate CSS
        const css = this.generateCSS();
        await fs.writeFile(this.filePath, css);
    }
    
    addChange(change: StyleChange, iteration: number): void {
        // Remove existing entry for same selector+property if exists
        this.entries = this.entries.filter(e => 
            !(e.selector === change.cssSelector && e.property === change.property)
        );
        
        this.entries.push({
            selector: change.cssSelector,
            property: change.property,
            value: change.expected,
            addedAt: new Date().toISOString(),
            iteration
        });
    }
    
    removeChange(selector: string, property: string): void {
        this.entries = this.entries.filter(e => 
            !(e.selector === selector && e.property === property)
        );
    }
    
    rollbackIteration(iteration: number): void {
        this.entries = this.entries.filter(e => e.iteration !== iteration);
    }
    
    private generateCSS(): string {
        const lines: string[] = [
            '/**',
            ' * AUTO-GENERATED CSS OVERRIDES',
            ' * Do not edit manually - managed by PixelGen',
            ` * Generated: ${new Date().toISOString()}`,
            ' */',
            ''
        ];
        
        // Group by selector
        const bySelector = new Map<string, OverrideEntry[]>();
        for (const entry of this.entries) {
            if (!bySelector.has(entry.selector)) {
                bySelector.set(entry.selector, []);
            }
            bySelector.get(entry.selector)!.push(entry);
        }
        
        // Generate rules
        for (const [selector, entries] of bySelector) {
            lines.push(`${selector} {`);
            for (const entry of entries) {
                lines.push(`  ${entry.property}: ${entry.value} !important; /* iter ${entry.iteration} */`);
            }
            lines.push('}');
            lines.push('');
        }
        
        return lines.join('\n');
    }
}
```

---

## Phase 6: Validation

### File: `src/patcher/validator.ts`

```typescript
// src/patcher/validator.ts

import { chromium } from 'playwright';
import { StyleChange } from '../ground-truth/types';

interface ValidationResult {
    applied: StyleChange[];
    failed: StyleChange[];
    regressions: Array<{
        change: StyleChange;
        before: string;
        after: string;
        issue: string;
    }>;
}

/**
 * Validate that changes were applied correctly and didn't cause regressions.
 */
export const validateChanges = async (
    url: string,
    appliedChanges: StyleChange[],
    device: 'desktop' | 'mobile' = 'desktop',
    baselineStyles?: Map<string, Record<string, string>>
): Promise<ValidationResult> => {
    const result: ValidationResult = {
        applied: [],
        failed: [],
        regressions: []
    };
    
    const viewport = device === 'mobile' 
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 };
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    
    // Add cache-busting to ensure fresh load
    const cacheBuster = `?cb=${Date.now()}`;
    await page.goto(url + cacheBuster, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    // Check each applied change
    for (const change of appliedChanges) {
        try {
            const actualValue = await page.evaluate(({ selector, property }) => {
                const el = document.querySelector(selector);
                if (!el) return null;
                return window.getComputedStyle(el).getPropertyValue(property);
            }, { selector: change.cssSelector, property: change.property });
            
            if (actualValue === null) {
                result.failed.push(change);
                continue;
            }
            
            // Check if change was applied (allowing some normalization)
            if (valuesMatch(change.expected, actualValue)) {
                result.applied.push(change);
            } else {
                result.failed.push(change);
            }
        } catch (e) {
            result.failed.push(change);
        }
    }
    
    // Check for regressions on other elements (if baseline provided)
    if (baselineStyles) {
        const regressionChecks = await page.evaluate((props) => {
            const results: any[] = [];
            for (const [selector, expectedStyles] of Object.entries(props)) {
                const el = document.querySelector(selector);
                if (!el) continue;
                
                const computed = window.getComputedStyle(el);
                for (const [prop, expected] of Object.entries(expectedStyles as Record<string, string>)) {
                    const actual = computed.getPropertyValue(prop);
                    if (actual !== expected) {
                        results.push({ selector, property: prop, expected, actual });
                    }
                }
            }
            return results;
        }, Object.fromEntries(baselineStyles));
        
        // Filter regressions - only report if not in appliedChanges
        for (const reg of regressionChecks) {
            const wasIntentional = appliedChanges.some(c => 
                c.cssSelector === reg.selector && c.property === reg.property
            );
            if (!wasIntentional) {
                result.regressions.push({
                    change: {
                        stableSelector: '',
                        cssSelector: reg.selector,
                        property: reg.property,
                        expected: reg.expected,
                        actual: reg.actual,
                        tag: '',
                        rect: { x: 0, y: 0, width: 0, height: 0 },
                        priority: 0,
                        category: 'effects'
                    },
                    before: reg.expected,
                    after: reg.actual,
                    issue: `Unintended change: ${reg.property} changed from ${reg.expected} to ${reg.actual}`
                });
            }
        }
    }
    
    await browser.close();
    return result;
};

const valuesMatch = (expected: string, actual: string): boolean => {
    // Normalize values for comparison
    const normalize = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();
    
    if (normalize(expected) === normalize(actual)) return true;
    
    // Try numeric comparison with tolerance
    const expNum = parseFloat(expected);
    const actNum = parseFloat(actual);
    if (!isNaN(expNum) && !isNaN(actNum)) {
        return Math.abs(expNum - actNum) < 1; // 1px tolerance
    }
    
    return false;
};
```

### File: `src/patcher/rollback.ts`

```typescript
// src/patcher/rollback.ts

import { StyleChange } from '../ground-truth/types';
import { removeOverride } from './css-patcher';
import { OverrideManager } from './override-generator';

/**
 * Rollback a specific change.
 */
export const rollbackChange = async (
    overridesPath: string,
    change: StyleChange
): Promise<void> => {
    await removeOverride(overridesPath, change);
};

/**
 * Rollback all changes from a specific iteration.
 */
export const rollbackIteration = async (
    siteDir: string,
    iteration: number
): Promise<void> => {
    const manager = new OverrideManager(siteDir);
    await manager.load();
    manager.rollbackIteration(iteration);
    await manager.save();
};

/**
 * Rollback to a specific iteration state.
 */
export const rollbackToIteration = async (
    siteDir: string,
    targetIteration: number
): Promise<void> => {
    const manager = new OverrideManager(siteDir);
    await manager.load();
    
    // Remove all changes from iterations after target
    for (let i = targetIteration + 1; i < 100; i++) {
        manager.rollbackIteration(i);
    }
    
    await manager.save();
};
```

---

## Integration: HTML Structure Freezing

### File: `src/structure-freeze.ts`

```typescript
// src/structure-freeze.ts

import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

interface FreezeResult {
    frozenHtml: string;
    baseCss: string;
    overridesPath: string;
    cssPath: string;
}

/**
 * Freeze the HTML structure after initial generation.
 * 
 * 1. Extract all inline styles into a CSS file
 * 2. Add data-section attributes for stable selectors
 * 3. Add overrides.css link
 * 4. Make HTML read-only for subsequent iterations
 */
export const freezeStructure = async (siteDir: string): Promise<FreezeResult> => {
    const htmlPath = path.join(siteDir, 'site', 'index.html');
    const cssPath = path.join(siteDir, 'site', 'extracted-styles.css');
    const overridesPath = path.join(siteDir, 'site', 'overrides.css');
    
    const html = await fs.readFile(htmlPath, 'utf-8');
    const $ = cheerio.load(html);
    
    // 1. Extract inline styles
    const extractedStyles: string[] = [];
    let styleIndex = 0;
    
    $('[style]').each((_, el) => {
        const $el = $(el);
        const style = $el.attr('style');
        if (style) {
            // Generate a unique class for this element
            const className = `_extracted_${styleIndex++}`;
            $el.addClass(className);
            $el.removeAttr('style');
            
            extractedStyles.push(`.${className} { ${style} }`);
        }
    });
    
    // 2. Add data-section attributes to semantic elements
    let sectionIndex = 0;
    $('header, nav, main, section, article, aside, footer').each((_, el) => {
        const $el = $(el);
        if (!$el.attr('data-section')) {
            // Try to infer a name from heading or class
            const heading = $el.find('h1, h2, h3').first().text().trim().slice(0, 30);
            const className = ($el.attr('class') || '').split(' ')[0];
            const tagName = el.tagName.toLowerCase();
            
            const name = heading || className || `${tagName}-${sectionIndex++}`;
            $el.attr('data-section', name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase());
        }
    });
    
    // 3. Add CSS links in head
    const hasExtractedLink = $('link[href*="extracted-styles.css"]').length > 0;
    const hasOverridesLink = $('link[href*="overrides.css"]').length > 0;
    
    if (!hasExtractedLink && extractedStyles.length > 0) {
        $('head').append('<link rel="stylesheet" href="./extracted-styles.css">');
    }
    
    if (!hasOverridesLink) {
        $('head').append('<link rel="stylesheet" href="./overrides.css">');
    }
    
    // 4. Save files
    const frozenHtml = $.html();
    await fs.writeFile(htmlPath, frozenHtml);
    
    const baseCss = extractedStyles.join('\n\n');
    if (baseCss) {
        await fs.writeFile(cssPath, baseCss);
    }
    
    // Create empty overrides file
    await fs.writeFile(overridesPath, '/* CSS Overrides - managed by PixelGen */\n');
    
    // 5. Create structure lock file
    const structureLock = {
        frozenAt: new Date().toISOString(),
        sections: [] as string[]
    };
    
    $('[data-section]').each((_, el) => {
        structureLock.sections.push($(el).attr('data-section') || '');
    });
    
    await fs.writeFile(
        path.join(siteDir, 'structure-lock.json'),
        JSON.stringify(structureLock, null, 2)
    );
    
    return {
        frozenHtml,
        baseCss,
        overridesPath,
        cssPath
    };
};

/**
 * Verify that HTML structure hasn't changed since freeze.
 */
export const verifyStructure = async (siteDir: string): Promise<boolean> => {
    const lockPath = path.join(siteDir, 'structure-lock.json');
    const htmlPath = path.join(siteDir, 'site', 'index.html');
    
    try {
        const lock = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
        const html = await fs.readFile(htmlPath, 'utf-8');
        const $ = cheerio.load(html);
        
        const currentSections: string[] = [];
        $('[data-section]').each((_, el) => {
            currentSections.push($(el).attr('data-section') || '');
        });
        
        return JSON.stringify(lock.sections) === JSON.stringify(currentSections);
    } catch {
        return false;
    }
};
```

---

## Migration Guide

### Step 1: Install Dependencies

```bash
npm install postcss cheerio
npm install -D @types/cheerio
```

### Step 2: File Creation Order

1. Create `src/ground-truth/types.ts`
2. Create `src/ground-truth/extractor.ts`
3. Create `src/ground-truth/differ.ts`
4. Create `src/ground-truth/prioritizer.ts`
5. Create `src/patcher/css-patcher.ts`
6. Create `src/patcher/override-generator.ts`
7. Create `src/patcher/validator.ts`
8. Create `src/patcher/rollback.ts`
9. Create `src/structure-freeze.ts`
10. Create `src/pixelgen-v2.ts`

### Step 3: Modify Existing Files

#### `src/pixelgen.ts` → Keep as `pixelgen-legacy.ts`
- Rename the current file for backward compatibility
- Export both v1 and v2 from an index file

#### `src/server.ts` → Add v2 endpoint
```typescript
app.post('/pixelgen/v2/run', async (req, res) => {
    const result = await runPixelGenV2(req.body);
    res.json(result);
});
```

### Step 4: Environment Variables

```bash
# .env additions
PIXELGEN_VERSION=2                    # Use v2 by default
PIXELGEN_CHANGES_PER_ITERATION=5      # Max CSS changes per iteration
PIXELGEN_MAX_ITERATIONS=20            # Max iteration count
PIXELGEN_TARGET_SIMILARITY=0.95       # Target similarity score
PIXELGEN_REGRESSION_THRESHOLD=0.02    # Max allowed regression
```

---

## Testing Plan

### Unit Tests

```typescript
// tests/ground-truth/extractor.test.ts
describe('extractGroundTruth', () => {
    it('should extract computed styles from all visible elements');
    it('should generate stable selectors that match across sites');
    it('should handle dynamic class names (CSS modules, Tailwind)');
    it('should correctly identify section boundaries');
});

// tests/ground-truth/differ.test.ts
describe('computeStructuredDiff', () => {
    it('should detect property differences');
    it('should ignore insignificant differences (< 2px)');
    it('should normalize color values');
    it('should handle missing elements gracefully');
});

// tests/patcher/css-patcher.test.ts
describe('applyCSSPatches', () => {
    it('should add new rules for new selectors');
    it('should update existing rules');
    it('should preserve unrelated rules');
    it('should generate valid CSS');
});
```

### Integration Tests

```typescript
// tests/integration/pixelgen-v2.test.ts
describe('PixelGen v2 Integration', () => {
    it('should improve similarity over iterations');
    it('should not regress on locked structure');
    it('should rollback failed changes');
    it('should converge within max iterations');
});
```

---

## Expected Improvements

| Metric | Current (v1) | Expected (v2) |
|--------|--------------|---------------|
| Iteration success rate | ~20% | >90% |
| Changes applied per iteration | 0-1 | 3-5 |
| Time per iteration | 60-90s | 10-20s |
| Final similarity | 0.3-0.5 | 0.85-0.95 |
| Regressions per run | Many | Near zero |

---

## Rollout Plan

### Phase 1: Parallel Testing (Week 1)
- Deploy v2 alongside v1
- Run both on same inputs
- Compare results

### Phase 2: Gradual Migration (Week 2)
- Route 10% traffic to v2
- Monitor metrics
- Fix issues

### Phase 3: Full Migration (Week 3)
- Route 100% to v2
- Deprecate v1
- Update documentation