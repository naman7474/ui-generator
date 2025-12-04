import { Page } from 'playwright';

export interface DOMNode {
  tag: string;
  attributes: Record<string, string>;
  computedStyles: Record<string, string>;
  boundingBox: { x: number; y: number; width: number; height: number };
  text?: string;
  children: DOMNode[];
  pseudoElements?: {
    before?: Record<string, string>;
    after?: Record<string, string>;
  };
  layoutInfo: {
    display: string;
    flexDirection?: string;
    gridTemplate?: string;
    gap?: string;
    childCount: number;
  };
}

export const extractFullDOM = async (page: Page): Promise<DOMNode> => {
  return page.evaluate(() => {
    const STYLE_PROPERTIES = [
      'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content',
      'grid-template-columns', 'grid-template-rows', 'grid-gap', 'gap',
      'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
      'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
      'color', 'background-color', 'background-image', 'background-size',
      'background-position', 'background-repeat',
      'border', 'border-radius', 'border-width', 'border-style', 'border-color',
      'box-shadow', 'opacity', 'transform', 'transition', 'overflow',
    ];

    const extractNode = (el: Element): any => {
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(el.tagName)) {
        return null;
      }
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return null;
      }
      const rect = el.getBoundingClientRect();
      const computedStyles: Record<string, string> = {};
      for (const prop of STYLE_PROPERTIES) {
        const value = style.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
          computedStyles[prop] = value;
        }
      }
      const beforeStyle = window.getComputedStyle(el, '::before');
      const afterStyle = window.getComputedStyle(el, '::after');
      const pseudoElements: any = {};
      if (beforeStyle.content && beforeStyle.content !== 'none') {
        pseudoElements.before = { content: beforeStyle.content };
      }
      if (afterStyle.content && afterStyle.content !== 'none') {
        pseudoElements.after = { content: afterStyle.content };
      }
      const attributes: Record<string, string> = {};
      const importantAttrs = ['class', 'id', 'href', 'src', 'alt', 'type', 'placeholder', 'data-section'];
      for (const attr of Array.from(el.attributes)) {
        if (importantAttrs.includes(attr.name) || attr.name.startsWith('data-')) {
          attributes[attr.name] = attr.value;
        }
      }
      const children: any[] = [];
      for (const child of Array.from(el.children)) {
        const c = extractNode(child);
        if (c) children.push(c);
      }
      return {
        tag: el.tagName.toLowerCase(),
        attributes,
        computedStyles,
        boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        text: el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE
          ? (el.textContent || '').trim().slice(0, 200)
          : undefined,
        children,
        pseudoElements: Object.keys(pseudoElements).length ? pseudoElements : undefined,
        layoutInfo: {
          display: style.display,
          flexDirection: style.flexDirection !== 'row' ? style.flexDirection : undefined,
          gridTemplate: style.gridTemplateColumns !== 'none' ? style.gridTemplateColumns : undefined,
          gap: style.gap !== 'normal' ? style.gap : undefined,
          childCount: children.length,
        },
      } as DOMNode;
    };
    return extractNode(document.body)!;
  });
};

