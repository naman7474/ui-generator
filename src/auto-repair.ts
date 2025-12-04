/**
 * Fixes Tailwind CDN/config ordering and wraps config so it does not throw
 * when tailwind is not yet defined.
 */
export const fixTailwindConfigOrder = (html: string): string => {
  let out = html;
  // Swap order if config appears before CDN script
  const configBeforeCdnPattern = /(<script[^>]*>[\s\S]*?tailwind\.config[\s\S]*?<\/script>)([\s\S]*?)(<script[^>]*src=["'][^"']*tailwindcss[^"']*["'][^>]*><\/script>)/gi;
  if (configBeforeCdnPattern.test(out)) {
    out = out.replace(configBeforeCdnPattern, '$3$2$1');
  }

  // Wrap config assignment with safety checks so it executes only after tailwind exists
  // Safer replacement: wrap the specific assignment in an IIFE that defers until tailwind exists
  const wrapConfigAssignment = (js: string): string => {
    return js.replace(/tailwind\.config\s*=\s*\{[\s\S]*?\}\s*;?/g, (assign) => {
      if (/__applyTailwindConfig/.test(js)) return assign; // already wrapped
      const wrapped = `\n(function(){\n  var __applyTailwindConfig = function(){ ${assign} };\n  if (typeof window !== 'undefined' && (window as any).tailwind) {\n    __applyTailwindConfig();\n  } else {\n    document.addEventListener('DOMContentLoaded', function(){\n      if (typeof window !== 'undefined' && (window as any).tailwind) {\n        __applyTailwindConfig();\n      }\n    });\n  }\n})();\n`;
      return wrapped;
    });
  };

  // Apply wrapper within each <script> block containing tailwind.config assignment
  out = out.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, (scriptTag) => {
    if (!/tailwind\.config\s*=\s*\{/.test(scriptTag)) return scriptTag;
    const bodyMatch = scriptTag.match(/^<script[^>]*>([\s\S]*?)<\/script>$/i);
    if (!bodyMatch) return scriptTag;
    const beforeTag = scriptTag.substring(0, scriptTag.indexOf('>') + 1);
    const body = bodyMatch[1];
    const after = '</script>';
    const replacedBody = wrapConfigAssignment(body);
    return `${beforeTag}${replacedBody}${after}`;
  });
  return out;
};

/**
 * Ensures Tailwind CDN script exists in <head>. If missing, injects it.
 */
export const ensureTailwindCdnLoads = (html: string): string => {
  let out = html;
  const hasTailwindCdn = /cdn\.tailwindcss\.com/i.test(out);
  if (!hasTailwindCdn) {
    out = out.replace(/<\/head>/i, `  <script src="https://cdn.tailwindcss.com"></script>\n</head>`);
  }
  return out;
};

/**
 * Applies Tailwind-specific repairs if errors indicate config is running before the CDN.
 */
export const autoRepairHtml = (html: string, errors: string[]): string => {
  const hasTailwindError = errors.some((err) => {
    const e = err.toLowerCase();
    return e.includes('tailwind is not defined') || e.includes('tailwind.config');
  });
  if (!hasTailwindError) return html;
  let out = html;
  out = ensureTailwindCdnLoads(out);
  out = fixTailwindConfigOrder(out);
  return out;
};
