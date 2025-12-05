// src/structure-aware-prompt.ts
//
// Builds prompts for LLM that enforce structural matching
//

import { StructureNode, structureToTree, structureToSchema, getSectionSummary } from './structure-extractor';

/**
 * Build a comprehensive prompt that enforces structure matching
 */
export const buildStructureAwarePrompt = (
    structure: StructureNode,
    additionalContext: {
        colors?: { primary: string; secondary: string; background: string; text: string };
        fonts?: string[];
        imageUrls?: Array<{ url: string; alt: string; section?: string }>;
        sectionSpecs?: Array<{ name: string; heading?: string; description?: string }>;
    } = {}
): string => {
    const sections = getSectionSummary(structure);
    const schema = structureToSchema(structure);
    const tree = structureToTree(structure);

    // Count elements for context
    const countElements = (node: StructureNode): { total: number; byTag: Record<string, number> } => {
        const byTag: Record<string, number> = {};
        const count = (n: StructureNode) => {
            byTag[n.tag] = (byTag[n.tag] || 0) + 1;
            n.children.forEach(count);
        };
        count(node);
        const total = Object.values(byTag).reduce((a, b) => a + b, 0);
        return { total, byTag };
    };
    const elementCount = countElements(structure);

    const prompt = `
You are generating React code with Tailwind CSS that EXACTLY matches a target website's structure.

## CRITICAL STRUCTURE REQUIREMENTS

The target website has this EXACT structure that you MUST follow:

\`\`\`
${tree}
\`\`\`

### Section Order (MUST match exactly):
${sections.map((s, i) => `${i + 1}. ${s.role}${s.heading ? ` - "${s.heading}"` : ''}`).join('\n')}

### Element Counts:
- Total elements: ${elementCount.total}
${Object.entries(elementCount.byTag).map(([tag, count]) => `- <${tag}>: ${count}`).join('\n')}

## STRUCTURE RULES (MANDATORY)

1. **EXACT TAG MATCHING**: Use the same HTML tags as shown above. If the target has <section>, use <section>. If it has <div>, use <div>. Do NOT substitute tags.

2. **SAME NESTING DEPTH**: If the target has a wrapper div, you MUST have a wrapper div. Match the nesting exactly.

3. **SAME SECTION ORDER**: Sections must appear in the exact order shown above. Do NOT reorder, add, or remove sections.

4. **DATA-SECTION ATTRIBUTES**: Add data-section="[role]" to all major sections:
   ${sections.filter(s => s.role !== 'container' && s.role !== 'element').map(s => `- data-section="${s.role}"`).join('\n   ')}

5. **PRESERVE ELEMENT COUNTS**: 
   - If the target has 6 product cards, generate exactly 6.
   - If the target has 4 testimonials, generate exactly 4.
   - If the target has 5 FAQ items, generate exactly 5.

## DETAILED STRUCTURE SCHEMA

\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

## STYLING GUIDELINES

${additionalContext.colors ? `
### Colors (from target site)
- Primary: ${additionalContext.colors.primary}
- Secondary: ${additionalContext.colors.secondary}
- Background: ${additionalContext.colors.background}
- Text: ${additionalContext.colors.text}
` : ''}

${additionalContext.fonts ? `
### Fonts
${additionalContext.fonts.map(f => `- ${f}`).join('\n')}
` : ''}

### Tailwind Usage
- Use Tailwind utility classes for all styling
- Match the visual appearance of the screenshot
- Ensure responsive design (mobile-first)

## IMAGE HANDLING

${additionalContext.imageUrls && additionalContext.imageUrls.length > 0 ? `
Use these local image paths (they have been downloaded):
${additionalContext.imageUrls.map(img => `- ${img.url}${img.alt ? ` (alt: "${img.alt}")` : ''}${img.section ? ` [${img.section}]` : ''}`).join('\n')}
` : `
- Use placeholder images from https://via.placeholder.com/[width]x[height]
- Match dimensions to the original layout
`}

## OUTPUT FORMAT

Generate a complete React component file with:
1. All necessary imports at the top
2. Sub-components for each major section
3. A default export of the main App component
4. Proper TypeScript types (if applicable)

## VERIFICATION CHECKLIST

Before outputting, verify:
- [ ] Same number of sections as target
- [ ] Same section order as target
- [ ] Same nesting depth as target
- [ ] data-section attributes on all major sections
- [ ] Same number of cards/items in grids
- [ ] No extra wrapper divs that aren't in target
- [ ] No missing elements from target

Now generate the React code that EXACTLY matches this structure:
`;

    return prompt.trim();
};

/**
 * Build a simpler structure-only prompt (for regenerating specific sections)
 */
export const buildSectionPrompt = (
    sectionNode: StructureNode,
    context: {
        parentRole?: string;
        previousSibling?: string;
        nextSibling?: string;
    } = {}
): string => {
    const schema = structureToSchema(sectionNode);

    return `
Generate a React component for a ${sectionNode.role} section.

## STRUCTURE REQUIREMENTS

\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

Key details:
- Tag: <${sectionNode.tag}>
- Role: ${sectionNode.role}
${sectionNode.headingText ? `- Heading: "${sectionNode.headingText}"` : ''}
- Layout: ${sectionNode.layout}${sectionNode.gridColumns ? ` (${sectionNode.gridColumns} columns)` : ''}
- Images: ${sectionNode.imageCount}
${sectionNode.buttonTexts.length > 0 ? `- Buttons: ${sectionNode.buttonTexts.join(', ')}` : ''}
- Child elements: ${sectionNode.childCount}

${context.parentRole ? `This section is inside: ${context.parentRole}` : ''}
${context.previousSibling ? `Previous section: ${context.previousSibling}` : ''}
${context.nextSibling ? `Next section: ${context.nextSibling}` : ''}

## REQUIREMENTS

1. Use data-section="${sectionNode.role}" attribute
2. Match the layout type: ${sectionNode.layout}
3. Include exactly ${sectionNode.childCount} direct children
4. Match the heading if provided
5. Use Tailwind CSS for styling

Generate the component:
`;
};

/**
 * Build a structure verification prompt (to check if generated code matches)
 */
export const buildVerificationPrompt = (
    targetStructure: StructureNode,
    generatedCode: string
): string => {
    const sections = getSectionSummary(targetStructure);

    return `
Analyze the following React code and verify it matches the target structure.

## TARGET STRUCTURE

Expected sections in order:
${sections.map((s, i) => `${i + 1}. ${s.role}${s.heading ? ` ("${s.heading}")` : ''}`).join('\n')}

## GENERATED CODE

\`\`\`jsx
${generatedCode}
\`\`\`

## VERIFICATION TASKS

Check each of the following and respond with JSON:

{
  "sectionsMatch": boolean,        // Are all sections present in correct order?
  "nestingMatch": boolean,         // Does nesting depth match?
  "dataSectionsPresent": boolean,  // Are data-section attributes present?
  "issues": [                      // List any structural issues
    { "type": "missing_section" | "extra_section" | "wrong_order" | "wrong_nesting", "details": string }
  ],
  "overallMatch": number           // 0-100 percentage match
}

Respond ONLY with the JSON, no other text.
`;
};

/**
 * Build a structure fix prompt (to fix specific structural issues)
 */
export const buildStructureFixPrompt = (
    currentCode: string,
    issues: Array<{ type: string; details: string }>,
    targetStructure: StructureNode
): string => {
    const schema = structureToSchema(targetStructure);

    return `
Fix the following structural issues in the React code.

## CURRENT CODE

\`\`\`jsx
${currentCode}
\`\`\`

## ISSUES TO FIX

${issues.map((issue, i) => `${i + 1}. [${issue.type}] ${issue.details}`).join('\n')}

## TARGET STRUCTURE

\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

## REQUIREMENTS

1. Fix ONLY the structural issues listed above
2. Do NOT change styling or visual appearance
3. Preserve all existing functionality
4. Ensure data-section attributes are present on all major sections

Output the corrected code:
`;
};

/**
 * Extract key structural constraints for quick validation
 */
export const extractStructuralConstraints = (structure: StructureNode): {
    sectionOrder: string[];
    wrapperTags: string[];
    requiredIds: string[];
    requiredDataSections: string[];
    gridCounts: Record<string, number>;
    totalDepth: number;
} => {
    const sectionOrder: string[] = [];
    const wrapperTags: string[] = [];
    const requiredIds: string[] = [];
    const requiredDataSections: string[] = [];
    const gridCounts: Record<string, number> = {};
    let maxDepth = 0;

    const traverse = (node: StructureNode, path: string[] = []) => {
        maxDepth = Math.max(maxDepth, node.depth);

        // Track wrapper structure
        if (node.depth <= 2) {
            wrapperTags.push(node.tag);
        }

        // Track IDs
        if (node.id) {
            requiredIds.push(node.id);
        }

        // Track sections
        if (['header', 'hero', 'products', 'testimonials', 'features', 'pricing',
            'faq', 'footer', 'navigation', 'cta', 'about', 'contact', 'gallery',
            'comparison', 'newsletter', 'stats'].includes(node.role)) {
            sectionOrder.push(node.role);
            requiredDataSections.push(node.role);

            // Track grid counts
            if (node.layout === 'grid' && node.gridColumns) {
                gridCounts[node.role] = node.children.length;
            }
        }

        for (const child of node.children) {
            traverse(child, [...path, node.tag]);
        }
    };

    traverse(structure);

    return {
        sectionOrder,
        wrapperTags,
        requiredIds,
        requiredDataSections,
        gridCounts,
        totalDepth: maxDepth
    };
};