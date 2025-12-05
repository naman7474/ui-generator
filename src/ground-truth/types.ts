
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
