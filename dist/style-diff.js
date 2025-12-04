"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFixPrompt = exports.compareStyleData = exports.extractComputedStyles = void 0;
const RELEVANT_STYLES = [
    // Spacing
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'gap',
    // Layout
    'width', 'height',
    'display', 'flex-direction', 'justify-content', 'align-items',
    'position', 'top', 'right', 'bottom', 'left', 'z-index',
    // Typography
    'font-size', 'font-family', 'font-weight', 'line-height',
    'text-align', 'letter-spacing', 'text-decoration-line',
    // Color
    'color', 'background-color', 'border-color',
    // Borders
    'border-width', 'border-style', 'border-radius',
    // Effects
    'opacity', 'box-shadow', 'visibility'
];
const getCategory = (property) => {
    if (property.includes('font') || property.includes('text') || property.includes('line-height'))
        return 'Typography';
    if (property.includes('padding') || property.includes('margin') || property === 'gap')
        return 'Spacing';
    if (property.includes('width') || property.includes('height') || property.includes('display') || property.includes('flex') || property.includes('position') || ['top', 'right', 'bottom', 'left', 'z-index'].includes(property))
        return 'Layout';
    if (property.includes('color') || property.includes('background'))
        return 'Color';
    if (property.includes('shadow') || property.includes('opacity') || property.includes('visibility'))
        return 'Effects';
    return 'Misc';
};
const extractComputedStyles = async (page) => {
    return page.evaluate((relevantStyles) => {
        const SECTION_TAGS = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
        const SECTION_ROLES = ['banner', 'navigation', 'main', 'contentinfo', 'complementary', 'region'];
        const SECTION_DATA_ATTRS = ['data-section', 'data-section-name', 'data-test-section'];
        const SECTION_CLASS_KEYWORDS = ['header', 'hero', 'nav', 'footer', 'sidebar', 'cta', 'section', 'main', 'content'];
        const getSelector = (el) => {
            // Priority 1: data-testid
            const testId = el.getAttribute('data-testid');
            if (testId)
                return `[data-testid="${testId}"]`;
            // Priority 2: ID
            if (el.id)
                return `#${el.id}`;
            // Priority 3: Tag + Classes
            let selector = el.tagName.toLowerCase();
            if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(/\s+/).filter(Boolean).join('.');
                if (classes) {
                    selector += `.${classes}`;
                }
            }
            return selector;
        };
        const getDirectText = (el) => {
            // Get text content of the element itself, excluding children if possible,
            // or just the first few words of innerText
            if (!el.textContent)
                return '';
            // Simple heuristic: take innerText and truncate
            const text = el.innerText || el.textContent || '';
            return text.split('\n')[0].substring(0, 50).trim();
        };
        const inferAriaLabel = (element) => {
            const label = element.getAttribute('aria-label');
            if (label && label.trim())
                return label.trim();
            const labelledBy = element.getAttribute('aria-labelledby');
            if (labelledBy) {
                const ids = labelledBy.split(/\s+/).filter(Boolean);
                for (const id of ids) {
                    const labelEl = document.getElementById(id);
                    if (labelEl?.textContent) {
                        return labelEl.textContent.trim().split('\n')[0].substring(0, 60);
                    }
                }
            }
            return null;
        };
        const qualifiesAsSection = (element) => {
            const tag = element.tagName.toLowerCase();
            if (SECTION_TAGS.includes(tag))
                return true;
            const role = element.getAttribute('role')?.toLowerCase();
            if (role && SECTION_ROLES.includes(role))
                return true;
            if (SECTION_DATA_ATTRS.some(attr => element.hasAttribute(attr)))
                return true;
            if (typeof element.className === 'string' && element.className.length > 0) {
                const lower = element.className.toLowerCase();
                if (SECTION_CLASS_KEYWORDS.some(keyword => lower.includes(keyword))) {
                    return true;
                }
            }
            return false;
        };
        const describeSection = (element) => {
            if (!qualifiesAsSection(element))
                return null;
            if (SECTION_DATA_ATTRS.some(attr => element.getAttribute(attr)?.trim())) {
                for (const attr of SECTION_DATA_ATTRS) {
                    const value = element.getAttribute(attr);
                    if (value && value.trim()) {
                        return value.trim();
                    }
                }
            }
            const ariaLabel = inferAriaLabel(element);
            if (ariaLabel)
                return ariaLabel;
            if (element.id) {
                return `${element.tagName.toLowerCase()}#${element.id}`;
            }
            if (typeof element.className === 'string' && element.className.trim()) {
                const tokens = element.className.split(/\s+/).filter(Boolean);
                const highlighted = tokens.filter(token => SECTION_CLASS_KEYWORDS.some(keyword => token.toLowerCase().includes(keyword))).slice(0, 2);
                const classes = (highlighted.length > 0 ? highlighted : tokens.slice(0, 2))
                    .map(token => `.${token}`)
                    .join('');
                if (classes) {
                    return `${element.tagName.toLowerCase()}${classes}`;
                }
            }
            const directText = getDirectText(element);
            if (directText) {
                return `${element.tagName.toLowerCase()} (${directText})`;
            }
            return element.tagName.toLowerCase();
        };
        const traverse = (element, indexInParent, sectionTrail) => {
            // Skip hidden elements or script/style tags
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META'].includes(element.tagName)) {
                return null;
            }
            const style = window.getComputedStyle(element);
            if (style.display === 'none')
                return null;
            const rect = element.getBoundingClientRect();
            // Filter out elements with 0 dimensions unless they have children (might be wrappers)
            if (rect.width === 0 && rect.height === 0 && element.children.length === 0) {
                return null;
            }
            const styles = {};
            for (const prop of relevantStyles) {
                styles[prop] = style.getPropertyValue(prop);
            }
            const currentSectionTrail = (() => {
                const sectionLabel = describeSection(element);
                if (sectionLabel) {
                    return [...sectionTrail, sectionLabel];
                }
                return sectionTrail;
            })();
            const children = [];
            let childIndex = 0;
            for (const child of Array.from(element.children)) {
                const childData = traverse(child, childIndex, currentSectionTrail);
                if (childData) {
                    children.push(childData);
                    childIndex++;
                }
            }
            // If selector is generic (just tag or tag+class), append nth-child to make it unique relative to parent
            // This helps when we flatten the tree later.
            let selector = getSelector(element);
            if (!selector.startsWith('#') && !selector.startsWith('[data-testid')) {
                selector += `:nth-child(${indexInParent + 1})`;
            }
            return {
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                className: typeof element.className === 'string' ? element.className : '',
                selector,
                text: getDirectText(element),
                rect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                },
                styles,
                sectionTrail: currentSectionTrail,
                children,
            };
        };
        // Start from body
        const bodyData = traverse(document.body, 0, []);
        return bodyData ? [bodyData] : [];
    }, RELEVANT_STYLES);
};
exports.extractComputedStyles = extractComputedStyles;
const flattenStyleData = (data, parentPath = '') => {
    const map = new Map();
    data.forEach((item) => {
        // Construct a full path
        // If the item has an ID or data-testid, we can reset the path or treat it as a root for its children?
        // Actually, CSS selectors can be chained.
        // If we have an ID, we can just use that ID as the key for this element,
        // BUT for its children, we should probably still include the parent context if needed.
        // However, for simplicity and robustness in diffing:
        // If an element has an ID/TestID, use that as the absolute key.
        // If not, append to parent path.
        let uniqueKey = item.selector;
        if (!item.selector.startsWith('#') && !item.selector.startsWith('[data-testid')) {
            uniqueKey = parentPath ? `${parentPath} > ${item.selector}` : item.selector;
        }
        map.set(uniqueKey, item);
        if (item.children.length > 0) {
            const childrenMap = flattenStyleData(item.children, uniqueKey);
            childrenMap.forEach((v, k) => map.set(k, v));
        }
    });
    return map;
};
const compareStyleData = (base, target) => {
    const baseMap = flattenStyleData(base);
    const targetMap = flattenStyleData(target);
    const differences = [];
    // Iterate over base elements and find matches in target
    baseMap.forEach((baseElement, key) => {
        const targetElement = targetMap.get(key);
        if (!targetElement)
            return; // Element removed or moved significantly
        const baseSectionTrail = baseElement.sectionTrail ?? [];
        const targetSectionTrail = targetElement.sectionTrail ?? [];
        const sectionSource = targetSectionTrail.length > 0
            ? 'target'
            : (baseSectionTrail.length > 0 ? 'base' : undefined);
        const sectionBase = baseSectionTrail.length > 0 ? baseSectionTrail[baseSectionTrail.length - 1] : undefined;
        const sectionTarget = targetSectionTrail.length > 0 ? targetSectionTrail[targetSectionTrail.length - 1] : undefined;
        const sectionPathBase = baseSectionTrail.length > 0 ? baseSectionTrail.join(' > ') : undefined;
        const sectionPathTarget = targetSectionTrail.length > 0 ? targetSectionTrail.join(' > ') : undefined;
        const section = sectionSource === 'target' ? sectionTarget : sectionBase;
        const sectionPath = sectionSource === 'target' ? sectionPathTarget : sectionPathBase;
        for (const prop of RELEVANT_STYLES) {
            const baseVal = baseElement.styles[prop];
            const targetVal = targetElement.styles[prop];
            if (baseVal !== targetVal) {
                // Parse numeric values for better diffs (e.g., "16px" vs "20px")
                const baseNum = parseFloat(baseVal);
                const targetNum = parseFloat(targetVal);
                let diff = 'changed';
                if (!isNaN(baseNum) && !isNaN(targetNum)) {
                    const delta = targetNum - baseNum;
                    if (delta === 0)
                        continue; // Might be different units or string representation, but if numbers match...
                    // Check if it's just a float precision issue
                    if (Math.abs(delta) < 0.1)
                        continue;
                    diff = delta > 0 ? `+${delta.toFixed(1)}` : `${delta.toFixed(1)}`;
                    // Append unit if present in targetVal
                    const unit = targetVal.replace(/[0-9.-]/g, '');
                    if (unit)
                        diff += unit;
                }
                differences.push({
                    selector: key,
                    tagName: baseElement.tagName,
                    text: baseElement.text || targetElement.text, // Use text from either
                    property: prop,
                    baseValue: baseVal,
                    targetValue: targetVal,
                    diff,
                    category: getCategory(prop),
                    section,
                    sectionPath,
                    sectionSource,
                    sectionBase,
                    sectionTarget,
                    sectionPathBase,
                    sectionPathTarget,
                });
            }
        }
    });
    return { differences };
};
exports.compareStyleData = compareStyleData;
const generateFixPrompt = (differences) => {
    if (!differences || differences.length === 0) {
        return 'No style differences found. The target site is visually identical to the base site.';
    }
    const groupedBySection = {};
    differences.forEach((diff) => {
        const sectionKey = diff.section || 'Global';
        const catKey = diff.category || 'Misc';
        if (!groupedBySection[sectionKey])
            groupedBySection[sectionKey] = {};
        if (!groupedBySection[sectionKey][catKey])
            groupedBySection[sectionKey][catKey] = [];
        groupedBySection[sectionKey][catKey].push(diff);
    });
    let prompt = `You are an expert frontend developer.
I have compared a base version of a website (the desired state) with a target version (current state) and found the following style differences.
Your task is to generate the necessary CSS/Code changes to make the target version match the base version.

Here are the differences found, grouped by page section and then by category:
`;
    for (const section of Object.keys(groupedBySection).sort()) {
        const sectionLabel = section === 'Global' ? 'Global / Shared Styles' : section;
        prompt += `\n## Section: ${sectionLabel}\n`;
        const categories = groupedBySection[section];
        for (const cat of Object.keys(categories).sort()) {
            prompt += `\n### ${cat}\n`;
            for (const d of categories[cat]) {
                const contextLine = d.text ? `  - **Context**: "${d.text}"\n` : '';
                const sectionPathLines = [];
                if (d.sectionPathTarget) {
                    sectionPathLines.push(`  - **Target Section Path**: ${d.sectionPathTarget}`);
                }
                else if (d.sectionPath) {
                    sectionPathLines.push(`  - **Section Path**: ${d.sectionPath}`);
                }
                if (d.sectionPathBase && d.sectionPathBase !== d.sectionPathTarget) {
                    sectionPathLines.push(`  - **Base Section Path**: ${d.sectionPathBase}`);
                }
                const sectionPathBlock = sectionPathLines.length > 0 ? `${sectionPathLines.join('\n')}\n` : '';
                prompt += `
- **Element**: ${d.tagName} \`${d.selector}\`
${sectionPathBlock}${contextLine}  - **Property**: \`${d.property}\`
  - **Expected (Base)**: \`${d.baseValue}\`
  - **Current (Target)**: \`${d.targetValue}\`
  - **Diff**: ${d.diff}
`;
            }
        }
    }
    prompt += `
Please analyze these differences and provide the specific CSS or code changes required to fix them.
Focus on the "Expected" values as the source of truth.
`;
    return prompt;
};
exports.generateFixPrompt = generateFixPrompt;
