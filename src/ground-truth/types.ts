// src/ground-truth/types.ts
// Type definitions for the ground-truth extraction and diffing system

export interface ElementRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ElementStyle {
    // Selectors
    selector?: string;           // Position-based selector for matching
    stableSelector?: string;     // Same as selector (for compatibility)
    cssSelector: string;         // CSS selector for applying styles

    // Element info
    tag: string;
    section?: string;
    sectionIndex?: number;

    // Position (for matching)
    rect: ElementRect;

    // Computed styles
    styles: Record<string, string>;

    // Priority
    importance?: number;

    // Optional text content (for debugging)
    textContent?: string;
}

export interface GroundTruth {
    url: string;
    device: 'desktop' | 'mobile';
    viewport: { width: number; height: number };
    extractedAt: string;
    elements: Map<string, ElementStyle>;
}

export type StyleCategory = 'color' | 'typography' | 'spacing' | 'border' | 'layout' | 'effects';

export interface StyleChange {
    // Selectors (all should be the same for the generated site)
    selector: string;            // Position-based key
    stableSelector: string;      // For change tracking
    cssSelector: string;         // For CSS rules

    // The change
    property: string;
    expected: string;            // What the base site has (target)
    actual: string;              // What the generated site has (current)

    // Metadata
    category: StyleCategory;
    importance: number;
    priority?: number;           // Computed priority score
    section?: string;
    sectionIndex?: number;

    // Element info (for prioritizer and validator)
    tag?: string;
    rect?: ElementRect;
}

export interface DiffResult {
    changes: StyleChange[];
    matchedCount: number;
    unmatchedCount: number;
    byCategory: Record<string, number>;
}