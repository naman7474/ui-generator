/**
 * react-host.ts - PATCHED VERSION
 * 
 * Fixes applied:
 * 1. Unified CDN URLs with consistent `target=es2018` parameter
 * 2. Expanded allowedReactUpper set to include all legitimate React exports
 * 3. Consistent lucide-react version pinning with deps parameter
 * 4. Improved regex patterns for edge cases
 * 5. Added normalization for lucide-react CDN URLs
 */

import fs from 'fs/promises';
import path from 'path';
import { transform } from 'esbuild';
import { config } from './config';
import { getLocalArtifactUrl } from './utils';

export type ReactBundle = {
    entry: string;
    files: Array<{ path: string; content: string }>;
};

// ============================================================================
// CONFIGURATION - Centralized CDN URLs (FIX #1: Unified URLs)
// ============================================================================
const getReactCdnConfig = () => {
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    const target = 'es2018';

    return {
        dev,
        target,
        // All URLs now consistently include target=es2018
        react: dev
            ? `https://esm.sh/react@18?dev&target=${target}`
            : `https://esm.sh/react@18?target=${target}`,
        reactDomClient: dev
            ? `https://esm.sh/react-dom@18/client?dev&target=${target}`
            : `https://esm.sh/react-dom@18/client?target=${target}`,
        // Pin lucide-react with deps to prevent duplicate React instances
        lucideReact: dev
            ? `https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=${target}`
            : `https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&target=${target}`,
    };
};

// ============================================================================
// FIX #2: Expanded allowed React uppercase exports
// ============================================================================
const ALLOWED_REACT_UPPER = new Set([
    // Core React exports that ARE legitimate uppercase names
    'Fragment',
    'StrictMode',
    'Suspense',
    'Profiler',
    'Component',
    'PureComponent',
    'Children',
    // These are typically used as React.createElement, etc., but could be destructured
    'createElement',
    'cloneElement',
    'isValidElement',
    'createContext',
    'forwardRef',
    'lazy',
    'memo',
    'createRef',
    // React 18+ additions
    'startTransition',
    'useTransition',
    'useDeferredValue',
    'useId',
    'useSyncExternalStore',
    'useInsertionEffect',
    // Common hooks (lowercase, but listed for completeness in case of aliasing)
]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Strip common non-code artifacts sometimes leaked by LLMs into JS/JSX files
const sanitizeGeneratedJs = (code: string): string => {
    let out = code;
    // Remove triple backtick fences and language identifiers
    out = out.replace(/```[a-zA-Z]*\n?/g, '');
    // Remove JSON sentinels
    out = out.replace(/###_JSON_START_###|###_JSON_END_###/g, '');
    // Remove "[Pasted Content ...]" marker lines
    out = out.replace(/^\s*\[Pasted Content[^\n]*\]\s*$/gmi, '');
    return out;
};

const rewriteQuotedExtensionToJs = (code: string): string => {
    // Replace occurrences of ".jsx" or ".tsx" inside quoted strings with ".js".
    return code.replace(/(["'])([^"'\n]+)\.(jsx|tsx)(\1)/g, (_m, q1: string, p: string, _ext: string, q2: string) => `${q1}${p}.js${q2}`);
};

const ensureRelativeHasJsExtension = (code: string): string => {
    // Append .js for relative specifiers without an explicit extension
    return code.replace(/(["'])(\.\.?[^"'\n]*?)(\1)/g, (m: string, q1: string, p: string, q2: string) => {
        if (/^\.(\.\/|\/)?.*?:\/\//.test(p)) return m;
        if (/\/\s*$/.test(p)) return `${q1}${p}index.js${q2}`;
        if (/\.[a-zA-Z0-9]+(\?.*)?$/.test(p)) return m;
        return `${q1}${p}.js${q2}`;
    });
};

const rewriteRootRelativeToRelative = (code: string): string => {
    // Convert root-relative paths like "/main.js" to "./main.js"
    return code.replace(/(["'])\/(?!\/)([^"'\n]*?)(\1)/g, (_m, q1: string, p: string, q2: string) => {
        if (/^[a-zA-Z]+:/.test(p)) return _m;
        return `${q1}./${p}${q2}`;
    });
};

const ensureModuleTypeForLocalScripts = (html: string): string => {
    return html.replace(/<script\b([^>]*?)\ssrc=(['"])([^'"\s>]+)\2([^>]*)>/gi, (m, pre: string, q: string, src: string, post: string) => {
        const isExternal = /^(?:https?:)?\/\//i.test(src) || /^data:/i.test(src);
        const isEsmCdn = /(^|\.)esm\.sh\//i.test(src);
        if (isExternal && !isEsmCdn) return m;
        const looksLikeJs = /\.js(?:[?#].*)?$/i.test(src) || /\/main(?:[?#].*)?$/i.test(src);
        if (!looksLikeJs && !isEsmCdn) return m;
        let tagAttrs = `${pre} src=${q}${src}${q}${post}`;
        if (/\btype\s*=\s*(['"])module\1/i.test(tagAttrs)) return `<script${tagAttrs}>`;
        if (/\btype\s*=/i.test(tagAttrs)) {
            tagAttrs = tagAttrs.replace(/\btype\s*=\s*(['"])\s*[^'"\s>]+\s*\1/i, 'type="module"');
            return `<script${tagAttrs}>`;
        }
        return `<script type="module"${tagAttrs}>`;
    });
};

const replaceTailwindCdnScriptWithCss = (html: string): string => {
    const re = /<script\s+[^>]*src=["']https?:\/\/cdn\.tailwindcss\.com["'][^>]*><\/script>/gi;
    if (!re.test(html)) return html;
    const cssHref = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    const link = `<link rel="stylesheet" href="${cssHref}">`;
    return html.replace(re, link);
};

const stripExternalGoogleFonts = (html: string): string => {
    let out = html;
    out = out.replace(/<link[^>]*href=["']https?:\/\/fonts\.googleapis\.com[^>]*>/gi, '');
    out = out.replace(/<link[^>]*href=["']https?:\/\/fonts\.gstatic\.com[^>]*>/gi, '');
    out = out.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (m) => m.replace(/@import[^;]*fonts\.googleapis\.com[^;]*;/gi, ''));
    return out;
};

const sanitizeSitePath = (siteDir: string, relativePath: string): string => {
    const cleanRel = relativePath.replace(/^\/+/, '');
    const resolved = path.resolve(siteDir, cleanRel);
    if (!resolved.startsWith(path.resolve(siteDir))) {
        throw new Error(`Unsafe path in bundle: ${relativePath}`);
    }
    return resolved;
};

// ============================================================================
// REACT IMPORT FIXING FUNCTIONS
// ============================================================================

/**
 * Fix lucide icon components rendered as children instead of JSX elements
 * Example: > {Icon} < -> > <Icon /> <
 */
const fixLucideIconChildren = (code: string): string => {
    let out = code;
    const namedImports: string[] = [];
    const namedRe = /import\s*{\s*([^}]*)\s*}\s*from\s*["'](?:lucide-react|https:\/\/esm\.sh\/lucide-react[^"']*)["']/g;
    let m: RegExpExecArray | null;

    while ((m = namedRe.exec(code)) !== null) {
        const block = m[1];
        const parts = block.split(',').map(s => s.trim()).filter(Boolean);
        for (const p of parts) {
            const asMatch = p.match(/^(\w+)(?:\s+as\s+(\w+))?$/i);
            if (asMatch) {
                const local = asMatch[2] || asMatch[1];
                if (/^[A-Z]/.test(local)) namedImports.push(local);
            }
        }
    }

    for (const local of namedImports) {
        const re = new RegExp(`>(\\s*){\\s*${local}\\s*}(\\s*)<`, 'g');
        out = out.replace(re, `>$1<${local} />$2<`);
    }

    // Handle star import: import * as Icons from 'lucide-react'
    const starRe = /import\s*\*\s*as\s*(\w+)\s*from\s*["'](?:lucide-react|https:\/\/esm\.sh\/lucide-react[^"']*)["']/g;
    while ((m = starRe.exec(code)) !== null) {
        const ns = m[1];
        const childRe = new RegExp(`>(\\s*){\\s*${ns}\\.([A-Z][A-Za-z0-9_]*)\\s*}(\\s*)<`, 'g');
        out = out.replace(childRe, (_mm, g1: string, icon: string, g3: string) => `>${g1}<${ns}.${icon} />${g3}<`);
    }

    return out;
};

/**
 * Fix double-curly object literals rendered as children
 * Example: > {{value}} < -> > {value} <
 */
const fixInvalidJsxChildren = (code: string): string => {
    let out = code;
    out = out.replace(/>(\s*)\{\s*\{([\s\S]*?)\}\s*\}(\s*)</g, '>$1{$2}$3<');
    return out;
};

/**
 * Normalize React 18 root API imports
 */
const fixReactDomClientImport = (code: string): string => {
    let out = code;

    // Convert default import from 'react-dom/client' to named { createRoot }
    const importAnyDefaultClient = /import\s+([A-Za-z_$][\w$]*)\s+from\s+(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\2\s*;?/g;
    out = out.replace(importAnyDefaultClient, (_m, _ident, q, spec) => `import { createRoot } from ${q}${spec}${q};`);

    // Convert star import from 'react-dom/client' to named { createRoot }
    const importStarClient = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\1\s*;?/g;
    out = out.replace(importStarClient, (_m, q, spec) => `import { createRoot } from ${q}${spec}${q};`);

    // Convert default import from 'react-dom' (no /client) to named { createRoot } from 'react-dom/client'
    const importDomDefault = /import\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom)(?![^"']*\/client)\1\s*;?/g;
    out = out.replace(importDomDefault, (_m, q, _spec) => `import { createRoot } from ${q}react-dom/client${q};`);

    // Convert star import from 'react-dom' to named createRoot from 'react-dom/client'
    const importDomStar = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom)(?![^"']*\/client)\1\s*;?/g;
    out = out.replace(importDomStar, (_m, q, _spec) => `import { createRoot } from ${q}react-dom/client${q};`);

    // Update usages
    out = out.replace(/ReactDOM\.createRoot\(/g, 'createRoot(');
    out = out.replace(/ReactDOM\.render\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, 'createRoot($2).render($1)');

    // Inject createRoot import if missing
    const hasCreateRootCall = /\bcreateRoot\s*\(/.test(out);
    const hasCreateRootImport = (
        /import\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out) ||
        /import\s+[A-Za-z_$][\w$]*\s*,\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out)
    );
    if (hasCreateRootCall && !hasCreateRootImport) {
        out = `import { createRoot } from 'react-dom/client';\n` + out;
    }

    // Deduplicate createRoot imports
    let seenCreateRootImport = false;
    const importNamedClient = /(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\3\s*;?\s*(?=\n|$)/g;
    out = out.replace(importNamedClient, (m: string, _lb: string, names: string, q: string, spec: string) => {
        if (!/\bcreateRoot\b/.test(names)) return m;
        if (!seenCreateRootImport) {
            seenCreateRootImport = true;
            const parts = names.split(',').map(s => s.trim()).filter(Boolean);
            const unique: string[] = [];
            for (const p of parts) {
                if (!unique.includes(p)) unique.push(p);
            }
            return `\nimport { ${unique.join(', ')} } from ${q}${spec}${q};`;
        }
        let pruned = names
            .replace(/\bcreateRoot\b\s+as\s+[A-Za-z_$][\w$]*\s*,?\s*/g, '')
            .replace(/\bcreateRoot\b\s*,?\s*/g, '')
            .replace(/,\s*,/g, ',')
            .replace(/^\s*,\s*|\s*,\s*$/g, '')
            .trim();
        if (!pruned) return '\n';
        return `\nimport { ${pruned} } from ${q}${spec}${q};`;
    });

    // Handle default + named imports
    const importDefaultAndNamedClient = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\4\s*;?\s*(?=\n|$)/g;
    out = out.replace(importDefaultAndNamedClient, (m: string, _lb: string, defIdent: string, names: string, q: string, spec: string) => {
        if (!/\bcreateRoot\b/.test(names)) return m;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        const deduped: string[] = [];
        for (const p of parts) { if (!deduped.includes(p)) deduped.push(p); }
        let filtered = deduped;
        if (!seenCreateRootImport) {
            seenCreateRootImport = true;
        } else {
            filtered = deduped
                .filter(p => !/^createRoot\b(\s+as\s+[A-Za-z_$][\w$]*)?$/.test(p))
                .map(p => p.replace(/^,\s*|\s*,\s*$/g, ''));
        }
        const named = filtered.join(', ').replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();
        if (!named) {
            return `\nimport ${defIdent} from ${q}${spec}${q};`;
        }
        return `\nimport ${defIdent}, { ${named} } from ${q}${spec}${q};`;
    });

    // Final safety: keep only first bare createRoot import
    let seenBareCreateRoot = false;
    const bareCreateRootNamed = /(^|\n)\s*import\s*{\s*createRoot\s*}\s*from\s*(['"])([^'\"]*react-dom[^'\"]*\/client(?:[?#][^'\"]*)?)\2\s*;?\s*(?=\n|$)/g;
    out = out.replace(bareCreateRootNamed, (m: string) => {
        if (seenBareCreateRoot) return '\n';
        seenBareCreateRoot = true;
        return `\n${m.trim()}`;
    });

    return out;
};

/**
 * FIX #3: Move icons mistakenly imported from react-dom to lucide-react
 */
const fixIconMisimportsFromReactDom = (code: string): string => {
    let out = code;
    const cdnConfig = getReactCdnConfig();

    type Match = { full: string; hasDefault: boolean; defIdent?: string; names: string; q: string; spec: string; start: number; end: number };
    const matches: Match[] = [];
    const isReactDomSpec = (s: string) => /react-dom(\b|\/)/i.test(s);

    const reDefaultAndNamed = /import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\3\s*;?/g;
    const reNamedOnly = /import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\2\s*;?/g;

    const collect = (regex: RegExp, hasDefault: boolean) => {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(out)) !== null) {
            const def = hasDefault ? m[1] : undefined;
            const names = hasDefault ? m[2] : m[1];
            const q = hasDefault ? m[3] : m[2];
            const spec = hasDefault ? m[4] : m[3];
            if (!isReactDomSpec(spec)) continue;
            matches.push({ full: m[0], hasDefault, defIdent: def, names, q, spec, start: m.index, end: m.index + m[0].length });
        }
    };

    collect(reDefaultAndNamed, true);
    collect(reNamedOnly, false);

    if (!matches.length) return out;
    matches.sort((a, b) => b.start - a.start);

    for (const m of matches) {
        const parts = m.names.split(',').map(s => s.trim()).filter(Boolean);
        const keep: string[] = [];
        const toIcons: string[] = [];
        for (const p of parts) {
            const name = p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim();
            // Any PascalCase name is likely an icon (react-dom exports are camelCase)
            if (/^[A-Z]/.test(name)) toIcons.push(p);
            else keep.push(p);
        }
        if (!toIcons.length) continue;

        let replacement = '';
        if (m.hasDefault && keep.length) {
            replacement = `import ${m.defIdent}, { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
        } else if (m.hasDefault && !keep.length) {
            replacement = `import ${m.defIdent} from ${m.q}${m.spec}${m.q};`;
        } else if (!m.hasDefault && keep.length) {
            replacement = `import { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
        }
        out = out.slice(0, m.start) + (replacement ? replacement + '\n' : '') + out.slice(m.end);

        // Merge into existing lucide-react import or create new one
        const lucideRe = /(^|\n)\s*import\s*{\s*([^}]*?)\s*}\s*from\s*(["'])([^"']*lucide-react[^"']*)\3\s*;?/;
        const m2 = out.match(lucideRe);
        const icons = toIcons.map(s => s.trim());
        if (m2) {
            const before = m2[0];
            const currentNames = m2[2].split(',').map(s => s.trim()).filter(Boolean);
            const merged = Array.from(new Set([...currentNames, ...icons]));
            const after = `${m2[1]}import { ${merged.join(', ')} } from '${cdnConfig.lucideReact}';`;
            out = out.replace(before, after);
        } else {
            out = `import { ${icons.join(', ')} } from '${cdnConfig.lucideReact}';\n` + out;
        }
    }

    return out;
};

/**
 * FIX #4: Move icons mistakenly imported from react to lucide-react
 * Uses expanded ALLOWED_REACT_UPPER set
 */
const fixIconMisimportsFromReact = (code: string): string => {
    let out = code;
    const cdnConfig = getReactCdnConfig();

    type Match = { full: string; hasDefault: boolean; defIdent?: string; names: string; q: string; spec: string; start: number; end: number };
    const matches: Match[] = [];

    // Match both bare 'react' and CDN react URLs (but not react-dom or lucide-react)
    const reDefaultAndNamed = /import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\3)\s*;?/g;
    const reNamedOnly = /import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\2)\s*;?/g;

    const collect = (regex: RegExp, hasDefault: boolean) => {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(out)) !== null) {
            const names = hasDefault ? m[2] : m[1];
            const q = hasDefault ? m[3] : m[2];
            const spec = hasDefault ? m[4] : m[3];
            const specLc = spec.toLowerCase();
            // Only target 'react' sources, not 'react-dom' or 'lucide-react'
            if (!/\breact(?!-dom)/.test(specLc)) continue;
            if (/lucide-react/.test(specLc)) continue;
            matches.push({
                full: m[0],
                hasDefault,
                defIdent: hasDefault ? m[1] : undefined,
                names,
                q,
                spec,
                start: m.index,
                end: m.index + m[0].length,
            });
        }
    };

    collect(reDefaultAndNamed, true);
    collect(reNamedOnly, false);

    if (!matches.length) return out;
    matches.sort((a, b) => b.start - a.start);

    for (const m of matches) {
        const parts = m.names.split(',').map(s => s.trim()).filter(Boolean);
        const keep: string[] = [];
        const toIcons: string[] = [];
        for (const p of parts) {
            const name = p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim();
            // If it's PascalCase and NOT in our allowed React exports, it's probably an icon
            if (/^[A-Z]/.test(name) && !ALLOWED_REACT_UPPER.has(name)) {
                toIcons.push(p);
            } else {
                keep.push(p);
            }
        }
        if (!toIcons.length) continue;

        let replacement = '';
        if (m.hasDefault && keep.length) {
            replacement = `import ${m.defIdent}, { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
        } else if (m.hasDefault && !keep.length) {
            replacement = `import ${m.defIdent} from ${m.q}${m.spec}${m.q};`;
        } else if (!m.hasDefault && keep.length) {
            replacement = `import { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
        }
        out = out.slice(0, m.start) + (replacement ? replacement + '\n' : '') + out.slice(m.end);

        // Merge into existing lucide-react import or create new one
        const lucideRe = /(^|\n)\s*import\s*{\s*([^}]*?)\s*}\s*from\s*(["'])([^"']*lucide-react[^"']*)\3\s*;?/;
        const m2 = out.match(lucideRe);
        const icons = toIcons.map(s => s.trim());
        if (m2) {
            const before = m2[0];
            const currentNames = m2[2].split(',').map(s => s.trim()).filter(Boolean);
            const merged = Array.from(new Set([...currentNames, ...icons]));
            // Use consistent CDN URL
            const after = `${m2[1]}import { ${merged.join(', ')} } from '${cdnConfig.lucideReact}';`;
            out = out.replace(before, after);
        } else {
            out = `import { ${icons.join(', ')} } from '${cdnConfig.lucideReact}';\n` + out;
        }
    }

    return out;
};

/**
 * FIX #5: Convert bare imports to CDN URLs with consistent parameters
 */
const fixBareReactImports = (code: string): string => {
    const cdnConfig = getReactCdnConfig();

    let out = code;

    // Replace bare imports with CDN URLs
    out = out.replace(/from\s+['\"]react-dom\/client['\"]/g, `from '${cdnConfig.reactDomClient}'`);
    out = out.replace(/from\s+['\"]react['\"]/g, `from '${cdnConfig.react}'`);
    out = out.replace(/from\s+['\"]lucide-react['\"]/g, `from '${cdnConfig.lucideReact}'`);

    // Normalize existing esm.sh URLs to canonical form
    out = out.replace(/from\s+['\"]https:\/\/esm\.sh\/react(@[^'"\s]*)?(\?[^'"\s]*)?['\"]/g, () => `from '${cdnConfig.react}'`);
    out = out.replace(/from\s+['\"]https:\/\/esm\.sh\/react-dom[^'"\s]*['\"]/g, () => `from '${cdnConfig.reactDomClient}'`);
    out = out.replace(/from\s+['\"]https:\/\/esm\.sh\/lucide-react(@[^'"\s]*)?(\?[^'"\s]*)?['\"]/g, () => `from '${cdnConfig.lucideReact}'`);

    return out;
};

/**
 * Add ?dev parameter to CDN imports in development mode
 */
const addDevParamToReactCdn = (code: string): string => {
    const cdnConfig = getReactCdnConfig();
    if (!cdnConfig.dev) return code;

    let out = code;

    // Add ?dev to React imports if not present
    out = out.replace(
        /(from\s+["']https:\/\/esm\.sh\/react@\d+(?:[^"']*)["'])/g,
        (m: string) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1'))
    );

    // Add ?dev to ReactDOM imports if not present
    out = out.replace(
        /(from\s+["']https:\/\/esm\.sh\/react-dom@\d+\/client(?:[^"']*)["'])/g,
        (m: string) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1'))
    );

    // Add ?dev to lucide-react imports if not present
    out = out.replace(
        /(from\s+["']https:\/\/esm\.sh\/lucide-react(?:[^"']*)["'])/g,
        (m: string) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1'))
    );

    return out;
};

/**
 * FIX #1 MAIN: Canonicalize all React CDN imports to use consistent URLs
 * This is the key fix - ensures all imports use the SAME URL to prevent duplicate React instances
 */
const canonicalizeReactCdnImports = (code: string): string => {
    const cdnConfig = getReactCdnConfig();

    let out = code;

    // Canonicalize react-dom/client URLs (must come before react-dom without /client)
    out = out.replace(
        /from\s+['\"]https?:\/\/[^'\"]*react-dom[^'\"]*\/client[^'\"]*['\"]/g,
        `from '${cdnConfig.reactDomClient}'`
    );

    // Canonicalize react-dom (without /client) to react-dom/client
    out = out.replace(
        /from\s+['\"]https?:\/\/[^'\"]*react-dom(?![^'\"]*\/client)[^'\"]*['\"]/g,
        `from '${cdnConfig.reactDomClient}'`
    );

    // Canonicalize lucide-react URLs (must come before react to avoid partial matches)
    out = out.replace(
        /from\s+['\"]https?:\/\/[^'\"]*lucide-react[^'\"]*['\"]/g,
        `from '${cdnConfig.lucideReact}'`
    );

    // Canonicalize react URLs (not react-dom or lucide-react)
    out = out.replace(
        /from\s+['\"]https?:\/\/esm\.sh\/react(?!-dom)(?:@[^'\"]*)?['\"]/g,
        (m: string) => {
            // Skip if it's lucide-react
            if (/lucide-react/.test(m)) return m;
            return `from '${cdnConfig.react}'`;
        }
    );

    return out;
};

/**
 * FIX: Aggressively remove PascalCase names from react-dom CDN imports
 * This runs AFTER all other canonicalization to catch any remaining icon imports
 * from react-dom/client that slipped through
 */
const fixIconsFromReactDomCdnFinal = (code: string): string => {
    const cdnConfig = getReactCdnConfig();
    let out = code;

    // Match imports from any react-dom CDN URL (including /client)
    const reactDomCdnPattern = /import\s*\{\s*([^}]+)\s*\}\s*from\s*(['"])([^'"]*react-dom[^'"]*)\2\s*;?/g;

    const replacements: Array<{ start: number; end: number; newText: string; icons: string[] }> = [];
    let match: RegExpExecArray | null;

    while ((match = reactDomCdnPattern.exec(out)) !== null) {
        const fullMatch = match[0];
        const names = match[1];
        const quote = match[2];
        const specifier = match[3];

        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        const keep: string[] = [];
        const toIcons: string[] = [];

        for (const part of parts) {
            // Extract the actual name (handle "Name as Alias" syntax)
            const nameMatch = part.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
            if (!nameMatch) {
                keep.push(part);
                continue;
            }
            const originalName = nameMatch[1];

            // Known react-dom/client exports (all camelCase or lowercase)
            const knownReactDomExports = new Set([
                'createRoot', 'hydrateRoot', 'createPortal',
                'flushSync', 'unstable_batchedUpdates',
                'render', 'hydrate', 'unmountComponentAtNode', 'findDOMNode'
            ]);

            if (knownReactDomExports.has(originalName)) {
                keep.push(part);
            } else if (/^[A-Z]/.test(originalName)) {
                // PascalCase name NOT in known exports = likely an icon
                toIcons.push(part);
            } else {
                keep.push(part);
            }
        }

        if (toIcons.length > 0) {
            let newImport = '';
            if (keep.length > 0) {
                newImport = `import { ${keep.join(', ')} } from ${quote}${specifier}${quote};`;
            }
            replacements.push({
                start: match.index,
                end: match.index + fullMatch.length,
                newText: newImport,
                icons: toIcons
            });
        }
    }

    // Apply replacements in reverse order to preserve indices
    replacements.sort((a, b) => b.start - a.start);

    const allIcons: string[] = [];
    for (const rep of replacements) {
        out = out.slice(0, rep.start) + rep.newText + out.slice(rep.end);
        allIcons.push(...rep.icons);
    }

    // Add icons to existing lucide-react import or create new one
    if (allIcons.length > 0) {
        const lucidePattern = /import\s*\{\s*([^}]*)\s*\}\s*from\s*(['"])([^'"]*lucide-react[^'"]*)\2\s*;?/;
        const lucideMatch = out.match(lucidePattern);

        if (lucideMatch) {
            const existingNames = lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            const mergedNames = Array.from(new Set([...existingNames, ...allIcons]));
            const newLucideImport = `import { ${mergedNames.join(', ')} } from '${cdnConfig.lucideReact}';`;
            out = out.replace(lucideMatch[0], newLucideImport);
        } else {
            // Add new lucide-react import at the top
            out = `import { ${allIcons.join(', ')} } from '${cdnConfig.lucideReact}';\n` + out;
        }
    }

    return out;
};

// ============================================================================
// SHIM HANDLING FOR UNKNOWN IMPORTS
// ============================================================================

type ShimState = { named: Set<string>; needDefault: boolean; needNS: boolean; changed: boolean };

const rewriteUnknownImportsToShim = (code: string): { code: string; shim: ShimState } => {
    let out = code;
    const shim: ShimState = { named: new Set<string>(), needDefault: false, needNS: false, changed: false };
    const cdnConfig = getReactCdnConfig();

    const isAllowed = (spec: string): boolean => {
        const s = spec.trim().toLowerCase();
        if (s.startsWith('.') || s.startsWith('/')) return true;
        if (/react-dom[^]*\/client/.test(s)) return true;
        if (/(^|\/)react(?!-dom)(?:@[^/]+)?(?:\/|\?|#|$)/.test(s) && !/(^|\/)lucide-react(?:@[^/]+)?(?:\/|\?|#|$)/.test(s)) return true;
        if (/(^|\/)lucide-react(?:@[^/]+)?(?:\/|\?|#|$)/.test(s)) return true;
        return false;
    };

    // default + named
    out = out.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\4\s*;?/g, (m, lb: string, defIdent: string, names: string, q: string, spec: string) => {
        if (isAllowed(spec)) return m;
        shim.needDefault = true; shim.changed = true;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => shim.named.add(p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim()));
        const namedList = parts.join(', ');
        return `\nimport { DefaultShim as ${defIdent}${namedList ? `, ${namedList}` : ''} } from './__shims.js';`;
    });

    // named only
    out = out.replace(/(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\3\s*;?/g, (m, lb: string, names: string, q: string, spec: string) => {
        if (isAllowed(spec)) return m;
        shim.changed = true;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => shim.named.add(p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim()));
        const namedList = parts.join(', ');
        return `\nimport { ${namedList} } from './__shims.js';`;
    });

    // default only
    out = out.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s+from\s*(["'])([^"']+?)\3\s*;?/g, (m, lb: string, ident: string, q: string, spec: string) => {
        if (isAllowed(spec)) return m;
        shim.needDefault = true; shim.changed = true;
        return `\nimport { DefaultShim as ${ident} } from './__shims.js';`;
    });

    // star import -> NS proxy
    out = out.replace(/(^|\n)\s*import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*(["'])([^"']+?)\3\s*;?/g, (m, lb: string, ns: string, q: string, spec: string) => {
        if (isAllowed(spec)) return m;
        shim.needNS = true; shim.changed = true;
        return `\nimport { NS as ${ns} } from './__shims.js';`;
    });

    return { code: out, shim };
};

// ============================================================================
// SCAFFOLD TEMPLATES
// ============================================================================

const getScaffoldIndexHtml = (): string => {
    const cdnConfig = getReactCdnConfig();
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
    <script type="importmap">
    {
      "imports": {
        "react": "${cdnConfig.react}",
        "react-dom/client": "${cdnConfig.reactDomClient}",
        "lucide-react": "${cdnConfig.lucideReact}"
      }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>`;
};

const getScaffoldMainJsx = (): string => {
    const cdnConfig = getReactCdnConfig();
    return `import React from '${cdnConfig.react}';
import { createRoot } from '${cdnConfig.reactDomClient}';
import App from './App.js';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
};

// ============================================================================
// MAIN EXPORT: writeReactBundle
// ============================================================================

export const writeReactBundle = async (
    runDir: string,
    bundle: ReactBundle
): Promise<{ localUrl: string; entryPath: string }> => {
    const cdnConfig = getReactCdnConfig();
    const siteDir = path.join(runDir, 'site');
    await fs.mkdir(siteDir, { recursive: true });

    // Basic guardrails
    const MAX_FILES = 200;
    const MAX_TOTAL_BYTES = 3 * 1024 * 1024;
    if (!Array.isArray(bundle.files)) {
        throw new Error('Invalid bundle: files must be an array');
    }
    if (bundle.files.length > MAX_FILES) {
        throw new Error(`Bundle too large: ${bundle.files.length} files (max ${MAX_FILES})`);
    }
    const totalBytes = bundle.files.reduce((acc, f) => acc + (f.content?.length || 0), 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
        throw new Error(`Bundle too large: ~${totalBytes} bytes (max ${MAX_TOTAL_BYTES})`);
    }

    // Process all files
    for (const file of bundle.files) {
        let content = file.content;
        const originalRelPath = file.path.replace(/\\/g, '/');
        const ext = path.extname(originalRelPath);

        // Basic rewrites before transpile
        content = rewriteQuotedExtensionToJs(content);
        if (ext === '.js' || ext === '.jsx' || ext === '.tsx') {
            content = sanitizeGeneratedJs(content);
        }

        // Apply all import fixes in correct order
        content = fixIconsFromReactDomCdnFinal(
            canonicalizeReactCdnImports(
                addDevParamToReactCdn(
                    fixBareReactImports(
                        fixIconMisimportsFromReact(
                            fixIconMisimportsFromReactDom(
                                fixReactDomClientImport(
                                    fixInvalidJsxChildren(
                                        fixLucideIconChildren(content)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );

        let targetPath = sanitizeSitePath(siteDir, originalRelPath);

        if (ext === '.jsx' || ext === '.tsx') {
            let result;
            try {
                result = await transform(content, {
                    loader: ext.slice(1) as 'jsx' | 'tsx',
                    format: 'esm',
                    target: 'es2018',
                    sourcemap: false,
                });
            } catch (e: any) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`esbuild transform failed for ${originalRelPath}: ${msg}`);
            }
            content = ensureRelativeHasJsExtension(
                fixIconsFromReactDomCdnFinal(
                    canonicalizeReactCdnImports(
                        addDevParamToReactCdn(
                            fixBareReactImports(
                                fixIconMisimportsFromReact(
                                    fixIconMisimportsFromReactDom(
                                        fixReactDomClientImport(
                                            fixInvalidJsxChildren(
                                                rewriteRootRelativeToRelative(
                                                    fixLucideIconChildren(result.code)
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
            targetPath = targetPath.replace(/\.(jsx|tsx)$/, '.js');
        } else if (ext === '.html') {
            content = stripExternalGoogleFonts(
                replaceTailwindCdnScriptWithCss(
                    ensureModuleTypeForLocalScripts(
                        rewriteRootRelativeToRelative(
                            ensureRelativeHasJsExtension(
                                rewriteQuotedExtensionToJs(content)
                            )
                        )
                    )
                )
            );
        } else if (ext === '.js') {
            let result;
            try {
                result = await transform(content, { loader: 'js', format: 'esm', target: 'es2018', sourcemap: false });
            } catch (e: any) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`esbuild transform failed for ${originalRelPath}: ${msg}`);
            }
            content = ensureRelativeHasJsExtension(
                fixIconsFromReactDomCdnFinal(
                    canonicalizeReactCdnImports(
                        addDevParamToReactCdn(
                            fixBareReactImports(
                                fixIconMisimportsFromReact(
                                    fixIconMisimportsFromReactDom(
                                        fixReactDomClientImport(
                                            fixInvalidJsxChildren(
                                                rewriteRootRelativeToRelative(
                                                    fixLucideIconChildren(result.code)
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }

        // Handle unknown imports with shims
        if (ext === '.jsx' || ext === '.tsx' || ext === '.js') {
            const shimPass = rewriteUnknownImportsToShim(content);
            content = shimPass.code;
            if (shimPass.shim.changed) {
                const shimPath = path.join(path.dirname(targetPath), '__shims.js');
                const shimLines: string[] = [];
                if (shimPass.shim.needDefault) shimLines.push(`export const DefaultShim = () => null;`);
                if (shimPass.shim.needNS) shimLines.push(`export const NS = new Proxy({}, { get: () => () => null });`);
                for (const name of Array.from(shimPass.shim.named)) {
                    shimLines.push(`export const ${name} = () => null;`);
                }
                await fs.writeFile(shimPath, shimLines.join('\n'));
            }
        }

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content);
    }

    // Setup entry HTML
    const entryRel = bundle.entry || 'index.html';
    const entryExt = path.extname(entryRel);
    let entryHtmlPath: string;

    if (entryExt === '.html') {
        entryHtmlPath = sanitizeSitePath(siteDir, entryRel);
        try {
            await fs.access(entryHtmlPath);
        } catch {
            entryHtmlPath = path.join(siteDir, 'index.html');
            await fs.writeFile(entryHtmlPath, getScaffoldIndexHtml());
        }

        // Ensure App.js exists
        const appJsPath = path.join(siteDir, 'App.js');
        try {
            await fs.access(appJsPath);
        } catch {
            const minimalApp = `import React from '${cdnConfig.react}';
export default function App() { return React.createElement('div', { className: 'p-4 text-red-500' }, 'No App.tsx found'); }`;
            const result = await transform(minimalApp, { loader: 'jsx', format: 'esm', target: 'es2018', sourcemap: false });
            const out = canonicalizeReactCdnImports(fixBareReactImports(fixReactDomClientImport(fixLucideIconChildren(result.code))));
            await fs.writeFile(appJsPath, out);
        }
    } else {
        // Entry is a JSX/TSX file, create scaffold HTML
        entryHtmlPath = path.join(siteDir, 'index.html');
        await fs.writeFile(entryHtmlPath, getScaffoldIndexHtml());

        // Create main.js from scaffold
        const mainJsPath = path.join(siteDir, 'main.js');
        const mainContent = getScaffoldMainJsx();
        const result = await transform(mainContent, { loader: 'jsx', format: 'esm', target: 'es2018', sourcemap: false });
        await fs.writeFile(mainJsPath, canonicalizeReactCdnImports(result.code));
    }

    // Construct local URL
    const entryDir = path.dirname(entryHtmlPath);
    const relativeDir = path.relative(config.outputDir, entryDir);
    const fileName = path.basename(entryHtmlPath);
    const localUrl = getLocalArtifactUrl(path.join(relativeDir, fileName));

    return { localUrl, entryPath: entryHtmlPath };
};