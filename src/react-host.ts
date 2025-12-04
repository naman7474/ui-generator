import fs from 'fs/promises';
import path from 'path';
import { transform } from 'esbuild';
import { config } from './config';
import { getLocalArtifactUrl } from './utils';

export type ReactBundle = {
    entry: string;
    files: Array<{ path: string; content: string }>;
};

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
    // Covers import/export/dynamic import and basic HTML attribute values.
    return code.replace(/(["'])([^"'\n]+)\.(jsx|tsx)(\1)/g, (_m, q1: string, p: string, _ext: string, q2: string) => `${q1}${p}.js${q2}`);
};

const ensureRelativeHasJsExtension = (code: string): string => {
    // Append .js for relative specifiers without an explicit extension
    // Matches quoted strings that start with ./ or ../ and don't contain a scheme
    return code.replace(/(["'])(\.\.?[^"'\n]*?)(\1)/g, (m: string, q1: string, p: string, q2: string) => {
        // Ignore URLs with protocol or query/hash only
        if (/^\.(\.\/|\/)?.*?:\/\//.test(p)) return m;
        // If ends with slash, assume directory -> add index.js
        if (/\/\s*$/.test(p)) return `${q1}${p}index.js${q2}`;
        // If already has an extension like .js/.css/.json etc., leave as is
        if (/\.[a-zA-Z0-9]+(\?.*)?$/.test(p)) return m;
        return `${q1}${p}.js${q2}`;
    });
};

const rewriteRootRelativeToRelative = (code: string): string => {
    // In HTML, convert root-relative paths like "/main.js" or "/assets/app.js"
    // into relative ones "./main.js" so they resolve under the artifact folder
    // rather than the server root. Skip protocol-relative URLs (e.g. "//cdn...").
    return code.replace(/(["'])\/(?!\/)([^"'\n]*?)(\1)/g, (_m, q1: string, p: string, q2: string) => {
        // Do not touch absolute/protocol-like references that accidentally sneak in
        if (/^[a-zA-Z]+:/.test(p)) return _m;
        return `${q1}./${p}${q2}`;
    });
};

const ensureModuleTypeForLocalScripts = (html: string): string => {
    // Add or normalize type="module" on <script src> tags that point to local/relative JS modules
    // and well-known ESM CDNs like esm.sh. Avoid touching unrelated external scripts.
    return html.replace(/<script\b([^>]*?)\ssrc=(['"])([^'"\s>]+)\2([^>]*)>/gi, (m, pre: string, q: string, src: string, post: string) => {
        const isExternal = /^(?:https?:)?\/\//i.test(src) || /^data:/i.test(src);
        const isEsmCdn = /(^|\.)esm\.sh\//i.test(src);
        if (isExternal && !isEsmCdn) return m; // leave non-ESM external scripts unchanged
        // Only consider likely module files
        const looksLikeJs = /\.js(?:[?#].*)?$/i.test(src) || /\/main(?:[?#].*)?$/i.test(src);
        if (!looksLikeJs && !isEsmCdn) return m;
        let tagAttrs = `${pre} src=${q}${src}${q}${post}`;
        // If a type attribute exists and isn't module, rewrite it to module
        if (/\btype\s*=\s*(['"])module\1/i.test(tagAttrs)) return `<script${tagAttrs}>`;
        if (/\btype\s*=/i.test(tagAttrs)) {
            tagAttrs = tagAttrs.replace(/\btype\s*=\s*(['"])\s*[^'"\s>]+\s*\1/i, 'type="module"');
            return `<script${tagAttrs}>`;
        }
        // Otherwise, inject type="module"
        return `<script type="module"${tagAttrs}>`;
    });
};

// Replace Tailwind CDN runtime script with a static CSS fallback to avoid executing modern JS in headless contexts
const replaceTailwindCdnScriptWithCss = (html: string): string => {
    const re = /<script\s+[^>]*src=["']https?:\/\/cdn\.tailwindcss\.com["'][^>]*><\/script>/gi;
    if (!re.test(html)) return html;
    // Note: v3+ does not ship an official precompiled CSS. We use v2.2.19 as a broadly compatible fallback
    const cssHref = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    const link = `<link rel="stylesheet" href="${cssHref}">`;
    return html.replace(re, link);
};

// Remove external Google Fonts links and @import blocks to avoid CSP/font loading errors
const stripExternalGoogleFonts = (html: string): string => {
    let out = html;
    // Remove <link ... href="https://fonts.googleapis.com/...">
    out = out.replace(/<link[^>]*href=["']https?:\/\/fonts\.googleapis\.com[^>]*>/gi, '');
    // Remove <link ... href="https://fonts.gstatic.com/...">
    out = out.replace(/<link[^>]*href=["']https?:\/\/fonts\.gstatic\.com[^>]*>/gi, '');
    // Remove @import lines to Google Fonts inside style blocks (keep the rest of the style content)
    out = out.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (m) => m.replace(/@import[^;]*fonts\.googleapis\.com[^;]*;/gi, ''));
    return out;
};

const sanitizeSitePath = (siteDir: string, relativePath: string): string => {
    // Prevent absolute paths and traversal outside siteDir
    const cleanRel = relativePath.replace(/^\/+/, '');
    const resolved = path.resolve(siteDir, cleanRel);
    if (!resolved.startsWith(path.resolve(siteDir))) {
        throw new Error(`Unsafe path in bundle: ${relativePath}`);
    }
    return resolved;
};

const fixReactDomClientImport = (code: string): string => {
    // Normalize React 18 root API
    let out = code;
    // 1) Convert ANY default import from 'react-dom/client' to named { createRoot }
    const importAnyDefaultClient = /import\s+([A-Za-z_$][\w$]*)\s+from\s+(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\2\s*;?/g;
    out = out.replace(importAnyDefaultClient, (_m, _ident, q, spec) => `import { createRoot } from ${q}${spec}${q};`);
    // 2) Convert star import from 'react-dom/client' to named { createRoot }
    const importStarClient = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\1\s*;?/g;
    out = out.replace(importStarClient, (_m, q, spec) => `import { createRoot } from ${q}${spec}${q};`);
    // 3) Convert default import from 'react-dom' (no /client) to named { createRoot } from 'react-dom/client'
    const importDomDefault = /import\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom)(?![^"']*\/client)\1\s*;?/g;
    out = out.replace(importDomDefault, (_m, q, _spec) => `import { createRoot } from ${q}react-dom/client${q};`);
    // 4) Convert star import from 'react-dom' to named createRoot from 'react-dom/client'
    const importDomStar = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom)(?![^"']*\/client)\1\s*;?/g;
    out = out.replace(importDomStar, (_m, q, _spec) => `import { createRoot } from ${q}react-dom/client${q};`);
    // 3) Update usages
    out = out.replace(/ReactDOM\.createRoot\(/g, 'createRoot(');
    // 4) Transform legacy ReactDOM.render(element, container) -> createRoot(container).render(element)
    out = out.replace(/ReactDOM\.render\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, 'createRoot($2).render($1)');
    // 5) If createRoot is referenced but no import present, inject import at top
    const hasCreateRootCall = /\bcreateRoot\s*\(/.test(out);
    // Match both named-only and default+named imports that include createRoot
    const hasCreateRootImport = (
        /import\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out) ||
        /import\s+[A-Za-z_$][\w$]*\s*,\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out)
    );
    if (hasCreateRootCall && !hasCreateRootImport) {
        out = `import { createRoot } from 'react-dom/client';\n` + out;
    }

    // 6) Dedupe multiple createRoot imports to avoid "already been declared" errors
    //    - Keep the first import that includes createRoot
    //    - For subsequent imports from react-dom/client that also include createRoot,
    //      remove just the createRoot specifier; if nothing remains, drop the line
    let seenCreateRootImport = false;
    const importNamedClient = /(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\3\s*;?\s*(?=\n|$)/g;
    out = out.replace(importNamedClient, (m: string, _lb: string, names: string, q: string, spec: string) => {
        // Only process lines that actually reference createRoot (possibly with alias)
        if (!/\bcreateRoot\b/.test(names)) return m;
        if (!seenCreateRootImport) {
            seenCreateRootImport = true;
            // Also quickly dedupe duplicate identifiers within the first import
            const parts = names
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            const unique: string[] = [];
            for (const p of parts) {
                if (!unique.includes(p)) unique.push(p);
            }
            const clean = unique.join(', ');
            return `\nimport { ${clean} } from ${q}${spec}${q};`;
        }
        // Remove createRoot (with or without alias) from subsequent imports
        let pruned = names
            .replace(/\bcreateRoot\b\s+as\s+[A-Za-z_$][\w$]*\s*,?\s*/g, '')
            .replace(/\bcreateRoot\b\s*,?\s*/g, '')
            .replace(/,\s*,/g, ',')
            .replace(/^\s*,\s*|\s*,\s*$/g, '')
            .trim();
        if (!pruned) {
            // Drop the whole import if nothing remains
            return '\n';
        }
        return `\nimport { ${pruned} } from ${q}${spec}${q};`;
    });

    // Also handle default + named imports: import ReactDOM, { createRoot, ... } from 'react-dom/client'
    const importDefaultAndNamedClient = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\4\s*;?\s*(?=\n|$)/g;
    out = out.replace(importDefaultAndNamedClient, (m: string, _lb: string, defIdent: string, names: string, q: string, spec: string) => {
        if (!/\bcreateRoot\b/.test(names)) return m;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        // Remove duplicate specifiers and handle aliasing cleanup
        const deduped: string[] = [];
        for (const p of parts) { if (!deduped.includes(p)) deduped.push(p); }
        let filtered = deduped;
        if (!seenCreateRootImport) {
            seenCreateRootImport = true;
        } else {
            // Remove createRoot if we've already kept one elsewhere
            filtered = deduped
                .filter(p => !/^createRoot\b(\s+as\s+[A-Za-z_$][\w$]*)?$/.test(p))
                .map(p => p.replace(/^,\s*|\s*,\s*$/g, ''));
        }
        // Clean stray commas/spaces
        const named = filtered.join(', ').replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();
        if (!named) {
            // Nothing left in named, reduce to default-only import
            return `\nimport ${defIdent} from ${q}${spec}${q};`;
        }
        return `\nimport ${defIdent}, { ${named} } from ${q}${spec}${q};`;
    });

    // Final safety: if multiple bare createRoot-only named imports remain, keep the first and drop the rest
    let seenBareCreateRoot = false;
    const bareCreateRootNamed = /(^|\n)\s*import\s*{\s*createRoot\s*}\s*from\s*(['"])([^'\"]*react-dom[^'\"]*\/client(?:[?#][^'\"]*)?)\2\s*;?\s*(?=\n|$)/g;
    out = out.replace(bareCreateRootNamed, (m: string) => {
        if (seenBareCreateRoot) return '\n';
        seenBareCreateRoot = true;
        return `\n${m.trim()}`;
    });
    return out;
};

const fixBareReactImports = (code: string): string => {
    // Ensure bare imports are resolvable in the browser by pointing to esm.sh
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    const target = 'es2018';
    const reactUrl = dev ? `https://esm.sh/react@18?dev&target=${target}` : `https://esm.sh/react@18?target=${target}`;
    const rdomUrl = dev ? `https://esm.sh/react-dom@18/client?dev&target=${target}` : `https://esm.sh/react-dom@18/client?target=${target}`;
    const lucideUrl = dev ? `https://esm.sh/lucide-react?dev&target=${target}` : `https://esm.sh/lucide-react?target=${target}`;
    let out = code.replace(/from\s+['\"]react-dom\/client['\"]/g, `from '${rdomUrl}'`);
    out = out.replace(/from\s+['\"]react['\"]/g, `from '${reactUrl}'`);
    out = out.replace(/from\s+['\"]lucide-react['\"]/g, `from '${lucideUrl}'`);
    // Normalize any esm.sh CDN entries to include target as well
    out = out.replace(/from\s+['\"]https:\/\/esm\.sh\/react(@[^'"\s]*)?(\?[^'"\s]*)?['\"]/g, (_m) => `from '${reactUrl}'`);
    out = out.replace(/from\s+['\"]https:\/\/esm\.sh\/react-dom(@[^'"\s]*)?\/client(\?[^'"\s]*)?['\"]/g, (_m) => `from '${rdomUrl}'`);
    out = out.replace(/from\s+['\"]https:\/\/esm\.sh\/lucide-react(@[^'"\s]*)?(\?[^'"\s]*)?['\"]/g, (_m) => `from '${lucideUrl}'`);
    return out;
};

const fixLucideIconChildren = (code: string): string => {
    let out = code;
    // Collect named lucide imports and their local names (handle aliasing: { A as B })
    const namedImports: string[] = [];
    const namedRe = /import\s*{\s*([^}]*)\s*}\s*from\s*["']lucide-react["']/g;
    let m: RegExpExecArray | null;
    while ((m = namedRe.exec(code)) !== null) {
        const block = m[1];
        const parts = block.split(',').map(s => s.trim()).filter(Boolean);
        for (const p of parts) {
            // Support "Icon" or "Icon as Alias"
            const asMatch = p.match(/^(\w+)(?:\s+as\s+(\w+))?$/i);
            if (asMatch) {
                const local = asMatch[2] || asMatch[1];
                if (/^[A-Z]/.test(local)) namedImports.push(local);
            }
        }
    }

    // Replace occurrences like "> {Icon} <" with "> <Icon /> <"
    for (const local of namedImports) {
        const re = new RegExp(`>(\\s*){\\s*${local}\\s*}(\\s*)<`, 'g');
        out = out.replace(re, `>$1<${local} />$2<`);
    }

    // Handle star import: import * as Icons from 'lucide-react'
    const starRe = /import\s*\*\s*as\s*(\w+)\s*from\s*["']lucide-react["']/g;
    while ((m = starRe.exec(code)) !== null) {
        const ns = m[1];
        const childRe = new RegExp(`>(\\s*){\\s*${ns}\\.([A-Z][A-Za-z0-9_]*)\\s*}(\\s*)<`, 'g');
        out = out.replace(childRe, (_mm, g1: string, icon: string, g3: string) => `${'>'}${g1}<${ns}.${icon} />${g3}<`);
    }

    return out;
};

// Heuristic: unwrap double-curly object literals rendered as children (e.g., > {{value}} < -> > {value} <)
const fixInvalidJsxChildren = (code: string): string => {
    let out = code;
    // Replace child object literal patterns with inner expression
    out = out.replace(/>(\s*)\{\s*\{([\s\S]*?)\}\s*\}(\s*)</g, '>$1{$2}$3<');
    return out;
};

// Replace lucide-react imports with local lightweight SVG stubs to avoid runtime incompatibilities
const rewriteLucideImportsToLocal = async (code: string, outDir: string): Promise<string> => {
    let out = code;
    const re = /(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*lucide-react[^"']*)\3\s*;?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
        const full = m[0];
        const names = m[2].split(',').map(s => s.trim()).filter(Boolean);
        const locals = names.map(n => {
            const mm = n.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
            return mm ? (mm[2] || mm[1]) : n.replace(/\sas\s+.*$/,'').trim();
        });
        // Build a local __icons.js file in the same directory with named exports
        const lines: string[] = [];
        const localPath = path.join(outDir, '__icons.js');
        await fs.mkdir(outDir, { recursive: true });
        // Read existing icons to preserve previously exported names
        const existing: Set<string> = new Set();
        try {
            const cur = await fs.readFile(localPath, 'utf8');
            const reExport = /export\s+const\s+(\w+)\s*=\s*/g;
            let mm: RegExpExecArray | null;
            while ((mm = reExport.exec(cur)) !== null) existing.add(mm[1]);
            if (cur.trim().length > 0) lines.push(cur.trim());
        } catch {}
        // Merge new icons
        const needed = locals.filter(n => !existing.has(n));
        if (needed.length) {
            if (!lines.length) lines.push(`import React from 'https://esm.sh/react@18?dev&target=es2018';`);
            for (const nm of needed) {
                lines.push(
                    `export const ${nm} = (props) => React.createElement('svg', Object.assign({ width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, props), React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2, opacity: 0.1 }));`
                );
            }
        }
        if (lines.length) await fs.writeFile(localPath, lines.join('\n') + '\n');
        const rel = './__icons.js';
        out = out.replace(full, `\nimport { ${locals.join(', ')} } from '${rel}';`);
    }
    return out;
};

// Heuristic fix: if icons are mistakenly imported from React, move them to lucide-react
// Example: import { ShoppingCart } from 'react' -> import { ShoppingCart } from 'lucide-react'
// Keeps allowed React uppercase named exports (Fragment, StrictMode, Suspense, Profiler)
const fixIconMisimportsFromReact = (code: string): string => {
    let out = code;
    const allowedReactUpper = new Set(['Fragment', 'StrictMode', 'Suspense', 'Profiler']);
    type Match = { full: string; hasDefault: boolean; defIdent?: string; names: string; q: string; spec: string; start: number; end: number };

    const matches: Match[] = [];
    // Pattern for: import React, { X, Y } from 'react' or CDN react
    const reDefaultAndNamed = /import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\3)\s*;?/g;
    // Pattern for: import { X, Y } from 'react' or CDN react
    const reNamedOnly = /import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\2)\s*;?/g;

    const collect = (regex: RegExp, hasDefault: boolean) => {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(out)) !== null) {
            const names = hasDefault ? m[2] : m[1];
            const q = hasDefault ? m[3] : m[2];
            const spec = hasDefault ? m[4] : m[3];
            // Only target 'react' sources (bare or CDN), not 'react-dom' or others
            const specLc = spec.toLowerCase();
            if (!/\breact(?!-dom)/.test(specLc)) continue;
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

    // Process from last to first to avoid index shifting
    matches.sort((a,b) => b.start - a.start);

    for (const m of matches) {
        const parts = m.names.split(',').map(s => s.trim()).filter(Boolean);
        const keep: string[] = [];
        const toIcons: string[] = [];
        for (const p of parts) {
            const name = p.replace(/\sas\s+[A-Za-z_$][\w$]*$/,'').trim();
            if (/^[A-Z]/.test(name) && !allowedReactUpper.has(name)) {
                toIcons.push(p);
            } else {
                keep.push(p);
            }
        }
        if (!toIcons.length) continue;

        // Rewrite the original import without icon names
        let replacement = '';
        if (m.hasDefault && keep.length) {
            replacement = `import ${m.defIdent}, { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
        } else if (m.hasDefault && !keep.length) {
            replacement = `import ${m.defIdent} from ${m.q}${m.spec}${m.q};`;
        } else if (!m.hasDefault && keep.length) {
            replacement = `import { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
        } // else: no default and nothing to keep -> drop import entirely

        out = out.slice(0, m.start) + (replacement ? replacement + '\n' : '') + out.slice(m.end);

        // Inject or merge lucide-react import for toIcons list
        const icons = toIcons.map(s => s.trim());
        // Try to find existing lucide-react import
        const lucideRe = /(^|\n)\s*import\s*{\s*([^}]*?)\s*}\s*from\s*(["'])([^"']*lucide-react[^"']*)\3\s*;?/;
        const m2 = out.match(lucideRe);
        if (m2) {
            // Merge names, avoiding duplicates
            const before = m2[0];
            const currentNames = m2[2]
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            const merged = Array.from(new Set([...currentNames, ...icons]));
            const after = `${m2[1]}import { ${merged.join(', ')} } from ${m2[3]}${m2[4]}${m2[3]};`;
            out = out.replace(before, after);
        } else {
            // Prepend a new import using bare 'lucide-react'; later steps will canonicalize to CDN
            out = `import { ${icons.join(', ')} } from 'lucide-react';\n` + out;
        }
    }

    return out;
};

type ShimState = { named: Set<string>; needDefault: boolean; needNS: boolean; changed: boolean };

// Rewrite unknown bare imports (not relative, not react/react-dom/lucide-react) to a local shim module
// and collect required shim exports. This avoids runtime failures for random libraries by stubbing.
const rewriteUnknownImportsToShim = (code: string): { code: string; shim: ShimState } => {
    let out = code;
    const shim: ShimState = { named: new Set<string>(), needDefault: false, needNS: false, changed: false };
    const isAllowed = (spec: string): boolean => {
        const s = spec.trim().toLowerCase();
        if (s.startsWith('.') || s.startsWith('/')) return true;
        // Allow react-dom client from bare or CDN forms (e.g. react-dom@18/client, https://esm.sh/react-dom@18/client?dev)
        if (/react-dom[^]*\/client/.test(s)) return true;
        // Allow bare or CDN react but not lucide-react (segment-based)
        if (/(^|\/)react(?!-dom)(?:@[^/]+)?(?:\/|\?|#|$)/.test(s) && !/(^|\/)lucide-react(?:@[^/]+)?(?:\/|\?|#|$)/.test(s)) return true;
        // Allow lucide-react from bare or CDN forms
        if (/(^|\/)lucide-react(?:@[^/]+)?(?:\/|\?|#|$)/.test(s)) return true;
        return false;
    };

    // default + named
    out = out.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\4\s*;?/g, (m, lb: string, defIdent: string, names: string, q: string, spec: string) => {
        if (isAllowed(spec)) return m;
        shim.needDefault = true; shim.changed = true;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => shim.named.add(p.replace(/\sas\s+[A-Za-z_$][\w$]*$/,'').trim()));
        const namedList = parts.join(', ');
        return `\nimport { DefaultShim as ${defIdent}${namedList ? `, ${namedList}` : ''} } from './__shims.js';`;
    });

    // named only
    out = out.replace(/(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\3\s*;?/g, (m, lb: string, names: string, q: string, spec: string) => {
        if (isAllowed(spec)) return m;
        shim.changed = true;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => shim.named.add(p.replace(/\sas\s+[A-Za-z_$][\w$]*$/,'').trim()));
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

const addDevParamToReactCdn = (code: string): string => {
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    if (!dev) return code;
    // Add ?dev to existing esm.sh React/ReactDOM CDN imports if not present
    const withReact = code.replace(
        /(from\s+["']https:\/\/esm\.sh\/react@\d+(?:[^"']*)["'])/g,
        (m: string) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1'))
    );
    let out = withReact.replace(
        /(from\s+["']https:\/\/esm\.sh\/react-dom@\d+\/client(?:[^"']*)["'])/g,
        (m: string) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1'))
    );
    // Also add ?dev to lucide-react for consistent dev diagnostics
    out = out.replace(
        /(from\s+["']https:\/\/esm\.sh\/lucide-react(?:[^"']*)["'])/g,
        (m: string) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1'))
    );
    return out;
};

const canonicalizeReactCdnImports = (code: string): string => {
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    const reactCdn = dev ? 'https://esm.sh/react@18?dev' : 'https://esm.sh/react@18';
    const rdomClientCdn = dev ? 'https://esm.sh/react-dom@18/client?dev' : 'https://esm.sh/react-dom@18/client';
    let out = code;
    // Any CDN react-dom/client -> canonical
    out = out.replace(/from\s+['\"]https?:\/\/[^'\"]*react-dom[^'\"]*\/client[^'\"]*['\"]/g, `from '${rdomClientCdn}'`);
    // Any CDN react-dom (without /client) -> canonical client
    out = out.replace(/from\s+['\"]https?:\/\/[^'\"]*react-dom(?![^'\"]*\/client)[^'\"]*['\"]/g, `from '${rdomClientCdn}'`);
    // Any CDN react root (not react-dom and not lucide-react) -> canonical react
    // Ensure we match a path segment '/react' to avoid hitting 'lucide-react'
    out = out.replace(/from\s+['\"]https?:\/\/[^'\"]*\/(?:react)(?!-dom)[^'\"]*['\"]/g, (m: string) => {
        // If it actually points to lucide-react, skip
        if (/lucide-react/.test(m)) return m;
        return `from '${reactCdn}'`;
    });
    return out;
};

const SCAFFOLD_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>`;

const SCAFFOLD_MAIN_JSX = `import React from 'https://esm.sh/react@18';
import ReactDOM from 'https://esm.sh/react-dom@18/client';
import App from './App.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

export const writeReactBundle = async (
    runDir: string,
    bundle: ReactBundle
): Promise<{ localUrl: string; entryPath: string }> => {
    const siteDir = path.join(runDir, 'site');
    await fs.mkdir(siteDir, { recursive: true });

    // Basic guardrails on bundle size/shape
    const MAX_FILES = 200;
    const MAX_TOTAL_BYTES = 3 * 1024 * 1024; // 3 MB
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

    // Write all files from the bundle
    for (const file of bundle.files) {
        let content = file.content;
        const originalRelPath = file.path.replace(/\\/g, '/');
        const ext = path.extname(originalRelPath);

        // Basic rewrites before transpile
        content = rewriteQuotedExtensionToJs(content);
        if (ext === '.js' || ext === '.jsx' || ext === '.tsx') {
            content = sanitizeGeneratedJs(content);
        }
        content = canonicalizeReactCdnImports(
            addDevParamToReactCdn(
                fixBareReactImports(
                    fixIconMisimportsFromReact(
                        fixReactDomClientImport(
                            fixInvalidJsxChildren(
                                fixLucideIconChildren(content)
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
                canonicalizeReactCdnImports(
                    addDevParamToReactCdn(
                        fixBareReactImports(
                            fixIconMisimportsFromReact(
                                fixReactDomClientImport(
                                    fixInvalidJsxChildren(
                                        fixLucideIconChildren(result.code)
                                    )
                                )
                            )
                        )
                    )
                )
            );
            targetPath = targetPath.replace(/\.(jsx|tsx)$/, '.js');
        } else if (ext === '.html') {
            // Also rewrite in HTML any references and ensure .js extension on relative paths
            // 1) convert .jsx/.tsx to .js inside quoted strings
            // 2) ensure relative imports have .js
            // 3) convert root-relative paths (e.g. "/main.js") to relative ("./main.js")
            content = stripExternalGoogleFonts(
                replaceTailwindCdnScriptWithCss(
                ensureModuleTypeForLocalScripts(
                    rewriteRootRelativeToRelative(
                        ensureRelativeHasJsExtension(
                            rewriteQuotedExtensionToJs(content)
                        )
                    )
                )
            ));
        } else if (ext === '.js') {
            // Downlevel and normalize
            let result;
            try {
                result = await transform(content, { loader: 'js', format: 'esm', target: 'es2018', sourcemap: false });
            } catch (e: any) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`esbuild transform failed for ${originalRelPath}: ${msg}`);
            }
            content = ensureRelativeHasJsExtension(
                canonicalizeReactCdnImports(
                    addDevParamToReactCdn(
                        fixBareReactImports(
                            fixIconMisimportsFromReact(
                                fixReactDomClientImport(
                                    fixInvalidJsxChildren(
                                        fixLucideIconChildren(result.code)
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }

        // After transforming JS/JSX files, rewrite unknown imports to local shims and write the shim if needed
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
            // Replace lucide-react with local stubs to eliminate React child/runtime compatibility issues
            content = await rewriteLucideImportsToLocal(content, path.dirname(targetPath));
        }

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content);
    }

    // Decide entry HTML to serve
    const entryRel = bundle.entry || 'index.html';
    const entryExt = path.extname(entryRel);
    let entryHtmlPath: string;

    if (entryExt === '.html') {
        // Use provided HTML entry
        entryHtmlPath = sanitizeSitePath(siteDir, entryRel);
        try {
            await fs.access(entryHtmlPath);
        } catch {
            // If missing, fall back to scaffold
            entryHtmlPath = path.join(siteDir, 'index.html');
            await fs.writeFile(entryHtmlPath, SCAFFOLD_INDEX_HTML);
        }
        // Ensure default main.js exists to satisfy typical index.html expectations
        const mainJsPath = path.join(siteDir, 'main.js');
        try {
            await fs.access(mainJsPath);
        } catch {
            const result = await transform(SCAFFOLD_MAIN_JSX, { loader: 'jsx', format: 'esm', target: 'es2018', sourcemap: false });
            const out = ensureRelativeHasJsExtension(
                canonicalizeReactCdnImports(fixBareReactImports(fixReactDomClientImport(fixLucideIconChildren(result.code))))
            );
            await fs.writeFile(mainJsPath, out);
        }
        // Ensure App.js exists if referenced by scaffold or generated main.js
        const appJsPath = path.join(siteDir, 'App.js');
        try {
            await fs.access(appJsPath);
        } catch {
            const minimalApp = `import React from 'https://esm.sh/react@18?dev&target=es2018';\nexport default function App() { return React.createElement('div', { className: 'p-4 text-gray-700' }, 'App placeholder'); }`;
            const result = await transform(minimalApp, { loader: 'jsx', format: 'esm', target: 'es2018', sourcemap: false });
            const out = canonicalizeReactCdnImports(fixBareReactImports(fixReactDomClientImport(fixLucideIconChildren(result.code))));
            await fs.writeFile(appJsPath, out);
        }
    } else {
        // Entry is a script; ensure an index.html that loads it
        const transpiledEntry = entryRel.replace(/\.(jsx|tsx)$/, '.js');
        const entryScriptRel = transpiledEntry.startsWith('./') ? transpiledEntry : `./${transpiledEntry}`;
        const indexHtml = SCAFFOLD_INDEX_HTML.replace('./main.js', entryScriptRel);
        entryHtmlPath = path.join(siteDir, 'index.html');
        await fs.writeFile(entryHtmlPath, indexHtml);
    }

    // Check if the entry script (or App.js if using default scaffold) exists
    // If we are using the default scaffold (entryRel was empty or not provided), it expects ./main.js
    // And main.js (SCAFFOLD_MAIN_JSX) imports ./App.js

    if (!bundle.entry) {
        // We are using the default scaffold which uses main.js -> App.js
        // We need to ensure main.js and App.js exist.

        // 1. Ensure main.js exists (we might need to write the scaffold main.jsx -> main.js)
        const mainJsPath = path.join(siteDir, 'main.js');
        try {
            await fs.access(mainJsPath);
        } catch {
            // Transpile scaffold main.jsx
            const result = await transform(SCAFFOLD_MAIN_JSX, {
                loader: 'jsx',
                format: 'esm',
                target: 'es2018',
                sourcemap: false,
            });
            const out = ensureRelativeHasJsExtension(
                canonicalizeReactCdnImports(fixBareReactImports(fixReactDomClientImport(fixLucideIconChildren(result.code))))
            );
            await fs.writeFile(mainJsPath, out);
        }

        // 2. Ensure App.js exists
        const appJsPath = path.join(siteDir, 'App.js');
        try {
            await fs.access(appJsPath);
        } catch {
            // Check if App.jsx or App.tsx exists (it would have been transpiled to App.js already if it was in bundle.files)
            // If we are here, it means App.js does not exist on disk.

            // Try to find a likely candidate in the bundle to be the App component
            // But for now, just fallback to minimal
            const minimal = 'export default function App(){ return React.createElement("div", null, "App component missing"); }';
            // We need React for this fallback if we use createElement, or just return null
            // The scaffold main.jsx imports React, so App.js just needs to export default.
            // Let's use a simple text
            const minimalApp = `import React from 'https://esm.sh/react@18';
export default function App() { return React.createElement('div', { className: 'p-4 text-red-500' }, 'No App.tsx found'); }`;

            // Transpile it just in case, though it's simple JS
            const result = await transform(minimalApp, { loader: 'jsx', format: 'esm', target: 'es2018', sourcemap: false });
            const out = canonicalizeReactCdnImports(fixBareReactImports(fixReactDomClientImport(fixLucideIconChildren(result.code))));
            await fs.writeFile(appJsPath, out);
        }
    }

    // Construct local URL for the chosen entry html
    const entryDir = path.dirname(entryHtmlPath);
    const relativeDir = path.relative(config.outputDir, entryDir);
    const fileName = path.basename(entryHtmlPath);
    const localUrl = getLocalArtifactUrl(path.join(relativeDir, fileName));

    return { localUrl, entryPath: entryHtmlPath };
};
