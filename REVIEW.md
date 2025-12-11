# PixelGen Improvement Plan: Achieving 90%+ Accuracy

## Executive Summary

After analyzing your codebase, I've identified the key bottlenecks limiting your accuracy:

1. **Initial Generation (60% → 90%)**: The LLM doesn't have enough structured information about the target site before generating code
2. **Iteration Improvement (10% max)**: CSS refinement is too broad, and the element matching system has fundamental flaws
3. **Multi-Page Builder**: Shared component detection is heuristic-based rather than visual-comparison based

---

## GOAL 1: Achieve 90% First Generation Accuracy

### Root Cause Analysis

Your current approach sends a screenshot + generic prompt to the LLM. The LLM must:
- Guess at colors (often gets hex values wrong)
- Estimate spacing (px values are imprecise)
- Infer typography (font families, sizes, weights)
- Deduce layout structure (grid columns, flex arrangements)
- Guess element counts (items in lists/grids)

**Key Insight**: The LLM already "sees" the image well, but it lacks QUANTITATIVE data to match pixel-perfectly.

### Solution: Pre-Generation Extraction Pipeline

Create a **"Site DNA Extraction"** phase that runs BEFORE the LLM generation:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ENHANCED GENERATION PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. CAPTURE          2. EXTRACT DNA        3. GENERATE           4. VALIDATE
│  ┌──────────┐        ┌──────────────┐      ┌──────────────┐      ┌──────────┐
│  │Screenshot│───────▶│ Site DNA     │─────▶│ LLM + DNA    │─────▶│Pixel     │
│  │  + DOM   │        │ Extraction   │      │ Prompt       │      │Compare   │
│  └──────────┘        └──────────────┘      └──────────────┘      └──────────┘
│       │                    │                     │                    │
│       ▼                    ▼                     ▼                    ▼
│  • Full page           • Typography          • Structured          • Quick 
│    screenshot            extracted             code gen              similarity
│  • DOM snapshot        • Colors mapped       • Exact values         check
│  • Computed            • Layout grid           from DNA           • Structure
│    styles              • Element counts      • Section order         validation
│                        • Spacing map           enforced
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation: Site DNA Extractor

```typescript
// src/site-dna-extractor.ts

interface SiteDNA {
  // Typography
  typography: {
    fonts: Array<{
      family: string;
      weights: number[];
      googleFontUrl?: string;
    }>;
    textStyles: Array<{
      selector: string;
      fontSize: string;
      fontWeight: string;
      lineHeight: string;
      letterSpacing: string;
      color: string;
      role: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
    }>;
  };
  
  // Colors
  colors: {
    palette: Array<{
      hex: string;
      rgb: string;
      usage: 'background' | 'text' | 'border' | 'accent';
      frequency: number;  // How often used
    }>;
    dominant: string;
    backgrounds: string[];
    textColors: string[];
  };
  
  // Layout Structure
  layout: {
    sections: Array<{
      index: number;
      tag: string;
      role: string;  // 'header' | 'hero' | 'features' | 'testimonials' | etc.
      rect: { x: number; y: number; width: number; height: number };
      backgroundColor: string;
      padding: { top: number; right: number; bottom: number; left: number };
      layoutType: 'grid' | 'flex-row' | 'flex-col' | 'stack';
      gridInfo?: { columns: number; gap: number; };
      flexInfo?: { direction: string; gap: number; justifyContent: string; alignItems: string; };
      childCount: number;
      headingText?: string;
    }>;
    maxWidth: number;
    containerPadding: number;
  };
  
  // Element Inventory
  elements: {
    images: Array<{
      src: string;
      localPath: string;
      rect: { x: number; y: number; width: number; height: number };
      sectionIndex: number;
      role: 'hero' | 'product' | 'avatar' | 'logo' | 'background' | 'icon';
      aspectRatio: number;
    }>;
    buttons: Array<{
      text: string;
      rect: { x: number; y: number; width: number; height: number };
      style: {
        backgroundColor: string;
        textColor: string;
        borderRadius: string;
        padding: string;
      };
      sectionIndex: number;
    }>;
    links: Array<{
      text: string;
      href: string;
      isNavigation: boolean;
    }>;
    icons: Array<{
      name: string;  // Attempted icon identification
      rect: { x: number; y: number; width: number; height: number };
      sectionIndex: number;
    }>;
  };
  
  // Spacing System
  spacing: {
    baseUnit: number;  // Detected base spacing unit (usually 4 or 8)
    sectionGaps: number[];
    elementGaps: number[];
    containerPadding: number;
  };
}
```

### Implementation: Enhanced Prompt Builder

```typescript
// src/enhanced-prompt-builder.ts

export const buildEnhancedPrompt = (dna: SiteDNA, screenshot: string): string => {
  return `You are a pixel-perfect React/Tailwind developer. You have been given:
1. A screenshot of the target website
2. Extracted DNA data with EXACT values from the site

## CRITICAL: Use the EXACT values from the DNA data below. Do NOT estimate.

## TYPOGRAPHY (Use these exact values)
${dna.typography.fonts.map(f => `- Font: "${f.family}" (weights: ${f.weights.join(', ')})`).join('\n')}

Text Styles:
${dna.typography.textStyles.map(s => `- ${s.role}: ${s.fontSize} ${s.fontWeight} ${s.color}`).join('\n')}

## COLOR PALETTE (Use these exact hex codes)
- Backgrounds: ${dna.colors.backgrounds.join(', ')}
- Text colors: ${dna.colors.textColors.join(', ')}
- Accent/buttons: ${dna.colors.palette.filter(c => c.usage === 'accent').map(c => c.hex).join(', ')}

## SECTION STRUCTURE (Follow this EXACT order and structure)
${dna.layout.sections.map((s, i) => `
### Section ${i + 1}: ${s.role}
- Tag: <${s.tag}>
- data-section="${s.role}"
- Height: ~${s.rect.height}px
- Background: ${s.backgroundColor}
- Padding: ${s.padding.top}px ${s.padding.right}px ${s.padding.bottom}px ${s.padding.left}px
- Layout: ${s.layoutType}${s.gridInfo ? ` (${s.gridInfo.columns} columns, ${s.gridInfo.gap}px gap)` : ''}
- Child elements: ${s.childCount}
${s.headingText ? `- Heading: "${s.headingText}"` : ''}
`).join('\n')}

## IMAGES (Use these exact local paths)
${dna.elements.images.map((img, i) => `
- Image ${i + 1}: src="${img.localPath}"
  - Section: ${img.sectionIndex + 1}
  - Size: ${img.rect.width}x${img.rect.height}
  - Role: ${img.role}
`).join('\n')}

## BUTTONS (Match these exactly)
${dna.elements.buttons.map((btn, i) => `
- Button ${i + 1}: "${btn.text}"
  - Background: ${btn.style.backgroundColor}
  - Text: ${btn.style.textColor}
  - Border radius: ${btn.style.borderRadius}
  - Padding: ${btn.style.padding}
`).join('\n')}

## SPACING SYSTEM
- Base unit: ${dna.spacing.baseUnit}px
- Section gaps: ${[...new Set(dna.spacing.sectionGaps)].join(', ')}px
- Element gaps: ${[...new Set(dna.spacing.elementGaps)].join(', ')}px

## REQUIREMENTS
1. Generate ONE complete React component per section
2. Use EXACT values from DNA data - do NOT estimate
3. Add data-section="<role>" to each section root
4. Use downloaded images from ./assets/ - do NOT use placeholders
5. Match element counts EXACTLY (if DNA shows 6 cards, generate 6)

## OUTPUT FORMAT
Return valid JSX code that can run in browser.
NO import statements (React is global).
NO export statements.
Component name should be "App".`;
};
```

### Implementation: Section-by-Section Generation

Instead of generating the entire page at once, generate section by section:

```typescript
// src/section-generator-v2.ts

interface SectionGenerationResult {
  sectionCode: string;
  componentName: string;
  success: boolean;
  similarity: number;
}

export const generateSectionBySection = async (
  dna: SiteDNA,
  screenshotPath: string,
  outputDir: string
): Promise<string> => {
  const sectionCodes: string[] = [];
  
  for (const section of dna.layout.sections) {
    console.log(`[SectionGen] Generating section ${section.index + 1}: ${section.role}`);
    
    // 1. Crop screenshot to this section
    const sectionScreenshot = await cropScreenshotToSection(
      screenshotPath,
      section.rect
    );
    
    // 2. Get section-specific assets
    const sectionAssets = dna.elements.images.filter(
      img => img.sectionIndex === section.index
    );
    const sectionButtons = dna.elements.buttons.filter(
      btn => btn.sectionIndex === section.index
    );
    
    // 3. Build section-specific prompt
    const sectionPrompt = buildSectionPrompt(
      section,
      sectionAssets,
      sectionButtons,
      dna.typography,
      dna.colors
    );
    
    // 4. Generate section code
    const sectionCode = await llmGenerateSection(
      sectionPrompt,
      sectionScreenshot
    );
    
    // 5. Validate section matches
    const validation = await validateSectionOutput(
      sectionCode,
      section,
      sectionScreenshot
    );
    
    if (validation.similarity < 0.7) {
      // Retry with more specific feedback
      const improvedCode = await retryWithFeedback(
        sectionCode,
        validation.issues,
        sectionScreenshot
      );
      sectionCodes.push(improvedCode);
    } else {
      sectionCodes.push(sectionCode);
    }
  }
  
  // Combine all sections into final App
  return combineSections(sectionCodes, dna);
};
```

### Key Changes to Existing Files

#### 1. Update `src/structure-aware-generator.ts`

Add DNA extraction before generation:

```typescript
export const generateInitialSiteWithStructure = async (
  baseUrl: string,
  extractAssets: boolean = true,
  routeMap?: Record<string, string>
): Promise<GenerationResult> => {
  
  // NEW: Extract site DNA first
  const dna = await extractSiteDNA(baseUrl);
  await saveSiteDNA(dna, outputDir);
  
  // NEW: Download all assets with position info
  const assets = await downloadAssetsWithMetadata(dna.elements.images, outputDir);
  
  // NEW: Build enhanced prompt with DNA
  const prompt = buildEnhancedPrompt(dna, screenshotBase64);
  
  // Generate with enhanced prompt
  const code = await generateWithModel(prompt, screenshotBase64);
  
  // Validate structure matches DNA
  const structureMatch = validateStructureAgainstDNA(code, dna);
  
  return {
    siteDir,
    localUrl,
    entryPath,
    structureMatchRate: structureMatch.rate,
    dna
  };
};
```

#### 2. Create `src/site-dna-extractor.ts`

```typescript
import { chromium, Page } from 'playwright';

export const extractSiteDNA = async (url: string): Promise<SiteDNA> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Extract all DNA in one page.evaluate call for efficiency
  const dna = await page.evaluate(() => {
    // ... comprehensive extraction logic
    // See full implementation below
  });
  
  await browser.close();
  return dna;
};
```

---

## GOAL 2: Improve Iteration Accuracy (10% → 30%+)

### Root Cause Analysis

Your current iteration system has several issues:

1. **Element Matching Flaw**: You identified that `data-section` attributes only exist on generated sites, causing 86% match failure
2. **Too Many Changes**: Trying to fix all differences at once overwhelms the LLM
3. **Lack of Validation**: No per-change validation to prevent regressions
4. **CSS Selector Issues**: Modern frameworks use arbitrary values that break selectors

### Solution: Surgical CSS Patching with Validation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    IMPROVED ITERATION PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. VISUAL DIFF        2. PRIORITIZE        3. PATCH            4. VALIDATE
│  ┌──────────────┐      ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│  │Position-Based│─────▶│ Impact       │───▶│ Single CSS   │───▶│Per-Change│
│  │  Matching    │      │ Scoring      │    │ Change       │    │Similarity│
│  └──────────────┘      └──────────────┘    └──────────────┘    └──────────┘
│       │                      │                    │                  │
│       ▼                      ▼                    ▼                  ▼
│  • Match by visual       • Rank by            • Apply ONE         • Accept if
│    coordinates             pixel impact         change at           improves
│  • Tag type + size       • Group by           • time              • Rollback
│  • Section containment     category           • CSS override        if regress
│  • No reliance on        • Take top 3          file only
│    generated attrs
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation: Position-Based Element Matching

```typescript
// src/ground-truth/position-matcher.ts

interface VisualElement {
  rect: { x: number; y: number; width: number; height: number };
  tag: string;
  styles: Record<string, string>;
  sectionIndex: number;
  textContent?: string;
}

interface MatchResult {
  baseElement: VisualElement;
  targetElement: VisualElement;
  confidence: number;  // 0-1
  matchType: 'exact' | 'fuzzy' | 'inferred';
}

export const matchByPosition = (
  baseElements: VisualElement[],
  targetElements: VisualElement[]
): MatchResult[] => {
  const matches: MatchResult[] = [];
  const usedTargets = new Set<number>();
  
  for (const base of baseElements) {
    let bestMatch: { target: VisualElement; score: number; index: number } | null = null;
    
    for (let i = 0; i < targetElements.length; i++) {
      if (usedTargets.has(i)) continue;
      
      const target = targetElements[i];
      const score = calculateMatchScore(base, target);
      
      if (score > 0.7 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { target, score, index: i };
      }
    }
    
    if (bestMatch) {
      usedTargets.add(bestMatch.index);
      matches.push({
        baseElement: base,
        targetElement: bestMatch.target,
        confidence: bestMatch.score,
        matchType: bestMatch.score > 0.95 ? 'exact' : bestMatch.score > 0.8 ? 'fuzzy' : 'inferred'
      });
    }
  }
  
  return matches;
};

const calculateMatchScore = (base: VisualElement, target: VisualElement): number => {
  let score = 0;
  
  // 1. Position similarity (40% weight)
  const centerDistanceX = Math.abs((base.rect.x + base.rect.width/2) - (target.rect.x + target.rect.width/2));
  const centerDistanceY = Math.abs((base.rect.y + base.rect.height/2) - (target.rect.y + target.rect.height/2));
  const maxDistance = 100; // pixels
  const positionScore = Math.max(0, 1 - (centerDistanceX + centerDistanceY) / (maxDistance * 2));
  score += positionScore * 0.4;
  
  // 2. Size similarity (30% weight)
  const widthRatio = Math.min(base.rect.width, target.rect.width) / Math.max(base.rect.width, target.rect.width);
  const heightRatio = Math.min(base.rect.height, target.rect.height) / Math.max(base.rect.height, target.rect.height);
  score += (widthRatio * heightRatio) * 0.3;
  
  // 3. Tag match (20% weight)
  if (base.tag === target.tag) {
    score += 0.2;
  } else if (isCompatibleTag(base.tag, target.tag)) {
    score += 0.1;
  }
  
  // 4. Section containment (10% weight)
  if (base.sectionIndex === target.sectionIndex) {
    score += 0.1;
  }
  
  return score;
};

const isCompatibleTag = (tag1: string, tag2: string): boolean => {
  const compatibleGroups = [
    ['div', 'section', 'article', 'main'],
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ['p', 'span', 'div'],
    ['button', 'a'],
    ['img', 'picture', 'figure'],
    ['ul', 'ol', 'div'],
    ['li', 'div']
  ];
  
  return compatibleGroups.some(group => 
    group.includes(tag1.toLowerCase()) && group.includes(tag2.toLowerCase())
  );
};
```

### Implementation: Impact-Scored CSS Changes

```typescript
// src/css-impact-scorer.ts

interface ScoredChange {
  change: StyleChange;
  impactScore: number;  // Higher = more visual impact
  pixelImpact: number;  // Estimated pixels affected
  category: 'critical' | 'high' | 'medium' | 'low';
}

export const scoreAndPrioritizeChanges = (
  changes: StyleChange[],
  screenDimensions: { width: number; height: number }
): ScoredChange[] => {
  const scored = changes.map(change => {
    let impactScore = 0;
    
    // 1. Property impact weights
    const propertyWeights: Record<string, number> = {
      // Critical - affects layout
      'display': 100,
      'position': 90,
      'width': 85,
      'height': 85,
      'flex-direction': 80,
      'grid-template-columns': 80,
      
      // High - affects spacing
      'margin': 70,
      'padding': 70,
      'gap': 70,
      'top': 65,
      'left': 65,
      'right': 65,
      'bottom': 65,
      
      // Medium - affects appearance
      'background-color': 50,
      'color': 50,
      'font-size': 45,
      'font-weight': 40,
      'border-radius': 30,
      'box-shadow': 30,
      
      // Low - minor tweaks
      'line-height': 20,
      'letter-spacing': 15,
      'opacity': 15,
      'transform': 10
    };
    
    const propWeight = propertyWeights[change.property] || 25;
    impactScore += propWeight;
    
    // 2. Element size impact
    const elementArea = change.rect.width * change.rect.height;
    const screenArea = screenDimensions.width * screenDimensions.height;
    const sizeMultiplier = 1 + (elementArea / screenArea) * 2;
    impactScore *= sizeMultiplier;
    
    // 3. Value difference magnitude
    const valueDiff = calculateValueDifference(change.expected, change.actual);
    impactScore *= (1 + valueDiff);
    
    // Estimate pixel impact
    const pixelImpact = estimatePixelImpact(change, elementArea);
    
    return {
      change,
      impactScore,
      pixelImpact,
      category: impactScore > 150 ? 'critical' : 
                impactScore > 100 ? 'high' : 
                impactScore > 50 ? 'medium' : 'low'
    };
  });
  
  // Sort by impact score descending
  return scored.sort((a, b) => b.impactScore - a.impactScore);
};

const calculateValueDifference = (expected: string, actual: string): number => {
  const expNum = parseFloat(expected);
  const actNum = parseFloat(actual);
  
  if (!isNaN(expNum) && !isNaN(actNum)) {
    if (expNum === 0) return actNum === 0 ? 0 : 1;
    return Math.min(Math.abs(expNum - actNum) / Math.abs(expNum), 2);
  }
  
  // Color difference
  if (expected.startsWith('#') && actual.startsWith('#')) {
    return colorDifference(expected, actual);
  }
  
  return expected === actual ? 0 : 0.5;
};
```

### Implementation: Single-Change-at-a-Time Patching

```typescript
// src/surgical-patcher.ts

interface PatchResult {
  success: boolean;
  similarityBefore: number;
  similarityAfter: number;
  improvement: number;
  appliedChange: ScoredChange | null;
}

export const applySurgicalPatches = async (
  siteDir: string,
  localUrl: string,
  baseUrl: string,
  scoredChanges: ScoredChange[],
  maxChangesPerIteration: number = 3
): Promise<PatchResult[]> => {
  const results: PatchResult[] = [];
  const overridesPath = path.join(siteDir, 'site', 'overrides.css');
  
  // Start with current state
  let currentOverrides = await fs.readFile(overridesPath, 'utf-8').catch(() => '');
  let currentSimilarity = await measureSimilarity(baseUrl, localUrl);
  
  // Take only top N changes by impact
  const topChanges = scoredChanges.slice(0, maxChangesPerIteration);
  
  for (const scoredChange of topChanges) {
    const { change } = scoredChange;
    
    // 1. Create CSS rule for this single change
    const cssRule = generateCSSRule(change);
    
    // 2. Backup current state
    const backup = currentOverrides;
    
    // 3. Apply change
    currentOverrides = appendCSSRule(currentOverrides, cssRule);
    await fs.writeFile(overridesPath, currentOverrides);
    
    // 4. Wait for render
    await new Promise(r => setTimeout(r, 300));
    
    // 5. Measure new similarity
    const newSimilarity = await measureSimilarity(baseUrl, localUrl);
    const improvement = newSimilarity - currentSimilarity;
    
    console.log(`[SurgicalPatch] ${change.property}: ${currentSimilarity.toFixed(3)} → ${newSimilarity.toFixed(3)} (${improvement >= 0 ? '+' : ''}${(improvement * 100).toFixed(2)}%)`);
    
    if (improvement < -0.002) {
      // REGRESSION: Rollback
      console.log(`[SurgicalPatch] ⚠ Regression! Rolling back...`);
      currentOverrides = backup;
      await fs.writeFile(overridesPath, currentOverrides);
      
      results.push({
        success: false,
        similarityBefore: currentSimilarity,
        similarityAfter: currentSimilarity,
        improvement: 0,
        appliedChange: null
      });
    } else {
      // IMPROVEMENT or neutral: Keep
      results.push({
        success: true,
        similarityBefore: currentSimilarity,
        similarityAfter: newSimilarity,
        improvement,
        appliedChange: scoredChange
      });
      currentSimilarity = newSimilarity;
    }
  }
  
  return results;
};

const generateCSSRule = (change: StyleChange): string => {
  // Use the most specific selector possible
  const selector = change.cssSelector || `[data-section="${change.section}"] ${change.tag}`;
  
  return `
/* Change: ${change.property} from "${change.actual}" to "${change.expected}" */
${selector} {
  ${change.property}: ${change.expected} !important;
}`;
};
```

### Implementation: LLM-Assisted Complex Fixes

For changes that can't be done with simple CSS overrides:

```typescript
// src/llm-css-refiner.ts (enhanced)

export const llmGenerateComplexFix = async (
  currentCode: string,
  issues: ScoredChange[],
  screenshotBase64: string,
  targetScreenshotBase64: string
): Promise<string> => {
  const prompt = `You are fixing specific visual issues in React/Tailwind code.

## CURRENT CODE
\`\`\`jsx
${currentCode}
\`\`\`

## ISSUES TO FIX (In order of priority)
${issues.slice(0, 3).map((issue, i) => `
${i + 1}. Element: ${issue.change.tag} in section "${issue.change.section}"
   Property: ${issue.change.property}
   Current: ${issue.change.actual}
   Expected: ${issue.change.expected}
   Impact: ${issue.category}
`).join('\n')}

## CRITICAL RULES
1. Fix ONLY the listed issues - do NOT change anything else
2. Keep all working code EXACTLY as is
3. Make minimal changes to achieve the fix
4. If unsure, prefer adding/modifying Tailwind classes over restructuring

## OUTPUT
Return ONLY the fixed code. No explanations.`;

  const response = await geminiGenerate(prompt, [
    { type: 'image', data: screenshotBase64, label: 'target' },
    { type: 'image', data: targetScreenshotBase64, label: 'current' }
  ]);
  
  return extractCodeFromResponse(response);
};
```

---

## GOAL 3: Improve Multi-Page Builder Accuracy

### Root Cause Analysis

Current multi-page issues:
1. Shared component detection is based on section names, not visual comparison
2. Link rewriting misses dynamic/JS-based navigation
3. Page consistency varies because each page is generated independently
4. No visual anchor points between pages

### Solution: Visual Consistency System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    IMPROVED MULTI-PAGE PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. DISCOVER         2. ANALYZE           3. GENERATE         4. UNIFY
│  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│  │ Crawl +      │──▶│ Visual       │───▶│ Shared-First │───▶│ Consistent│
│  │ Screenshot   │   │ Clustering   │    │ Generation   │    │ Styling   │
│  └──────────────┘   └──────────────┘    └──────────────┘    └──────────┘
│       │                   │                   │                   │
│       ▼                   ▼                   ▼                   ▼
│  • All pages          • Group visually     • Generate header   • Extract CSS
│    screenshotted        similar sections     /footer ONCE        variables
│  • DOM extracted      • Identify shared    • Inject into all   • Unify font
│  • Links collected      header/footer        pages               imports
│                       • Detect variations  • Generate unique   • Fix link
│                                              content only        targets
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation: Visual Shared Component Detection

```typescript
// src/visual-shared-detector.ts

interface PageScreenshot {
  path: string;
  url: string;
  screenshotPath: string;
  sections: Array<{
    rect: { x: number; y: number; width: number; height: number };
    screenshotCrop: string;  // Base64 of cropped section
    hash: string;  // Perceptual hash for comparison
  }>;
}

interface SharedRegion {
  type: 'header' | 'footer' | 'nav' | 'sidebar';
  rect: { x: number; y: number; width: number; height: number };
  confidence: number;
  pages: string[];  // Which pages have this region
  templatePage: string;  // Best page to use as template
}

export const detectSharedComponents = async (
  pageScreenshots: PageScreenshot[]
): Promise<SharedRegion[]> => {
  const sharedRegions: SharedRegion[] = [];
  
  // 1. Analyze header region (top 200px)
  const headerRegion = await analyzeRegionAcrossPages(
    pageScreenshots,
    { y: 0, height: 200 },
    'header'
  );
  if (headerRegion.confidence > 0.8) {
    sharedRegions.push(headerRegion);
  }
  
  // 2. Analyze footer region (bottom 300px)
  const footerRegion = await analyzeRegionAcrossPages(
    pageScreenshots,
    { y: -300, height: 300 },
    'footer'
  );
  if (footerRegion.confidence > 0.8) {
    sharedRegions.push(footerRegion);
  }
  
  // 3. Analyze sidebar (if any page has consistent left/right region)
  const sidebarRegion = await detectSidebar(pageScreenshots);
  if (sidebarRegion) {
    sharedRegions.push(sidebarRegion);
  }
  
  return sharedRegions;
};

const analyzeRegionAcrossPages = async (
  pages: PageScreenshot[],
  regionSpec: { y: number; height: number },
  type: 'header' | 'footer'
): Promise<SharedRegion> => {
  const regionCrops: Array<{ page: string; crop: Buffer; hash: string }> = [];
  
  for (const page of pages) {
    const crop = await cropRegion(page.screenshotPath, regionSpec);
    const hash = await perceptualHash(crop);
    regionCrops.push({ page: page.path, crop, hash });
  }
  
  // Compare hashes - if most pages have similar hash, it's shared
  const hashGroups = groupByHashSimilarity(regionCrops, 0.9);
  const largestGroup = hashGroups.sort((a, b) => b.length - a.length)[0];
  
  const confidence = largestGroup.length / pages.length;
  
  return {
    type,
    rect: calculateRegionRect(regionSpec, pages[0]),
    confidence,
    pages: largestGroup.map(r => r.page),
    templatePage: largestGroup[0].page  // First in group is template
  };
};
```

### Implementation: Shared-First Generation

```typescript
// src/shared-first-generator.ts

export const generateMultiPageSite = async (
  entryUrl: string,
  options: MultiPageOptions
): Promise<MultiPageResult> => {
  
  // 1. Discover and screenshot all pages
  const pageData = await discoverAndScreenshotPages(entryUrl, options);
  
  // 2. Detect shared components visually
  const sharedRegions = await detectSharedComponents(pageData);
  
  // 3. Generate shared components ONCE from best template
  const sharedComponents: Record<string, string> = {};
  
  for (const region of sharedRegions) {
    console.log(`[MultiPage] Generating ${region.type} from ${region.templatePage}`);
    
    const templatePage = pageData.find(p => p.path === region.templatePage)!;
    const regionScreenshot = await cropRegion(
      templatePage.screenshotPath,
      region.rect
    );
    
    const componentCode = await generateComponent(
      region.type,
      regionScreenshot,
      templatePage.dna
    );
    
    sharedComponents[region.type] = componentCode;
  }
  
  // 4. Generate unique content for each page
  const pageResults: PageGenerationResult[] = [];
  
  for (const page of pageData) {
    console.log(`[MultiPage] Generating unique content for ${page.path}`);
    
    // Mask out shared regions from screenshot
    const uniqueScreenshot = await maskSharedRegions(
      page.screenshotPath,
      sharedRegions
    );
    
    // Generate only unique sections
    const uniqueCode = await generateUniqueContent(
      uniqueScreenshot,
      page.dna,
      sharedRegions
    );
    
    // Compose full page from shared + unique
    const fullPageCode = composePageFromParts(
      sharedComponents,
      uniqueCode,
      page.path
    );
    
    pageResults.push({
      path: page.path,
      code: fullPageCode
    });
  }
  
  // 5. Unify styling across all pages
  const unifiedCSS = extractUnifiedStyles(pageResults);
  
  // 6. Fix all navigation links
  const routeRegistry = buildRouteRegistry(pageData);
  for (const page of pageResults) {
    page.code = rewriteNavigationLinks(page.code, routeRegistry);
  }
  
  return {
    pages: pageResults,
    sharedComponents,
    unifiedCSS,
    routeRegistry
  };
};
```

### Implementation: Link Rewriting Improvements

```typescript
// src/enhanced-link-rewriter.ts

interface LinkRewriteConfig {
  // What to do with external links
  externalBehavior: 'keep' | 'disable' | 'placeholder';
  
  // What to do with unmatched internal links
  unmatchedBehavior: 'best-match' | 'placeholder' | 'disable';
  
  // Navigation patterns to detect
  patterns: {
    mainNav: string[];     // e.g., ['header nav a', '[data-section="header"] a']
    footerNav: string[];   // e.g., ['footer a', '[data-section="footer"] a']
    breadcrumb: string[];  // e.g., ['.breadcrumb a', 'nav[aria-label="breadcrumb"] a']
    ctaButtons: string[];  // e.g., ['a.btn', 'a.button']
  };
}

export const rewriteAllLinks = async (
  code: string,
  routeRegistry: RouteRegistry,
  config: LinkRewriteConfig
): Promise<string> => {
  
  // 1. Parse code to find all link targets
  const linkMatches = findAllLinks(code);
  
  const rewrites: Array<{ original: string; replacement: string }> = [];
  
  for (const link of linkMatches) {
    const { href, context } = link;
    
    // 2. Classify link type
    const isExternal = isExternalUrl(href, routeRegistry.baseOrigin);
    const isAnchor = href.startsWith('#');
    const isInternal = !isExternal && !isAnchor;
    
    if (isExternal) {
      // Handle external links
      switch (config.externalBehavior) {
        case 'keep':
          continue;
        case 'disable':
          rewrites.push({ original: href, replacement: '#' });
          break;
        case 'placeholder':
          rewrites.push({ original: href, replacement: '/external-link-placeholder' });
          break;
      }
    } else if (isInternal) {
      // Try to match to a generated route
      const matchedRoute = routeRegistry.matchUrl(href);
      
      if (matchedRoute) {
        rewrites.push({ original: href, replacement: matchedRoute.route });
      } else {
        // Handle unmatched internal links
        switch (config.unmatchedBehavior) {
          case 'best-match':
            const bestMatch = routeRegistry.findBestMatch(href);
            if (bestMatch) {
              rewrites.push({ original: href, replacement: bestMatch.route });
            }
            break;
          case 'placeholder':
            rewrites.push({ original: href, replacement: '/page-not-generated' });
            break;
          case 'disable':
            rewrites.push({ original: href, replacement: '#' });
            break;
        }
      }
    }
  }
  
  // 3. Apply all rewrites
  let rewrittenCode = code;
  for (const rewrite of rewrites) {
    // Use regex to match href attributes
    const hrefPattern = new RegExp(
      `href=["']${escapeRegex(rewrite.original)}["']`,
      'g'
    );
    rewrittenCode = rewrittenCode.replace(hrefPattern, `href="${rewrite.replacement}"`);
    
    // Also handle to= for React Router
    const toPattern = new RegExp(
      `to=["']${escapeRegex(rewrite.original)}["']`,
      'g'
    );
    rewrittenCode = rewrittenCode.replace(toPattern, `to="${rewrite.replacement}"`);
  }
  
  return rewrittenCode;
};
```

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. ✅ Fix position-based element matching (you're already on this)
2. Implement single-change-at-a-time patching with rollback
3. Add impact scoring to prioritize CSS changes

### Phase 2: DNA Extraction (3-5 days)
4. Build Site DNA Extractor
5. Create Enhanced Prompt Builder with DNA
6. Integrate DNA into generation pipeline

### Phase 3: Section-by-Section Generation (3-5 days)
7. Implement section cropping and individual generation
8. Add section validation after each generation
9. Build section combiner

### Phase 4: Multi-Page Improvements (3-5 days)
10. Visual shared component detection
11. Shared-first generation pipeline
12. Enhanced link rewriting

---

## Expected Results

| Metric | Current | After Phase 1 | After Phase 2 | After Phase 4 |
|--------|---------|---------------|---------------|---------------|
| First Gen Accuracy | 60% | 65% | 85-90% | 85-90% |
| Max Iteration Improvement | 10% | 20% | 25% | 25% |
| Final Achievable | 70% | 85% | 95%+ | 95%+ |
| Multi-Page Consistency | N/A | N/A | N/A | 90%+ |

---

## Key Files to Modify/Create

### New Files
- `src/site-dna-extractor.ts` - Extract site DNA
- `src/enhanced-prompt-builder.ts` - Build prompts with DNA
- `src/position-matcher.ts` - Position-based element matching
- `src/css-impact-scorer.ts` - Score and prioritize CSS changes
- `src/surgical-patcher.ts` - Single-change patching with validation
- `src/visual-shared-detector.ts` - Visual shared component detection
- `src/shared-first-generator.ts` - Multi-page with shared components

### Modified Files
- `src/structure-aware-generator.ts` - Integrate DNA extraction
- `src/pixelgen-v2.ts` - Use new iteration approach
- `src/ground-truth/extractor.ts` - Position-based extraction
- `src/ground-truth/differ.ts` - Impact-scored diffing
- `src/multi-page-orchestrator.ts` - Visual shared detection
- `src/link-rewriter.ts` - Enhanced link rewriting