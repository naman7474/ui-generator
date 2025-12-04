"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReactBundle = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const esbuild_1 = require("esbuild");
const config_1 = require("./config");
const utils_1 = require("./utils");
const rewriteQuotedExtensionToJs = (code) => {
    // Replace occurrences of ".jsx" or ".tsx" inside quoted strings with ".js".
    // Covers import/export/dynamic import and basic HTML attribute values.
    return code.replace(/(["'])([^"'\n]+)\.(jsx|tsx)(\1)/g, (_m, q1, p, _ext, q2) => `${q1}${p}.js${q2}`);
};
const ensureRelativeHasJsExtension = (code) => {
    // Append .js for relative specifiers without an explicit extension
    // Matches quoted strings that start with ./ or ../ and don't contain a scheme
    return code.replace(/(["'])(\.\.?[^"'\n]*?)(\1)/g, (m, q1, p, q2) => {
        // Ignore URLs with protocol or query/hash only
        if (/^\.(\.\/|\/)?.*?:\/\//.test(p))
            return m;
        // If ends with slash, assume directory -> add index.js
        if (/\/\s*$/.test(p))
            return `${q1}${p}index.js${q2}`;
        // If already has an extension like .js/.css/.json etc., leave as is
        if (/\.[a-zA-Z0-9]+(\?.*)?$/.test(p))
            return m;
        return `${q1}${p}.js${q2}`;
    });
};
const rewriteRootRelativeToRelative = (code) => {
    // In HTML, convert root-relative paths like "/main.js" or "/assets/app.js"
    // into relative ones "./main.js" so they resolve under the artifact folder
    // rather than the server root. Skip protocol-relative URLs (e.g. "//cdn...").
    return code.replace(/(["'])\/(?!\/)([^"'\n]*?)(\1)/g, (_m, q1, p, q2) => {
        // Do not touch absolute/protocol-like references that accidentally sneak in
        if (/^[a-zA-Z]+:/.test(p))
            return _m;
        return `${q1}./${p}${q2}`;
    });
};
const ensureModuleTypeForLocalScripts = (html) => {
    // Add or normalize type="module" on <script src> tags that point to local/relative JS modules
    // and well-known ESM CDNs like esm.sh. Avoid touching unrelated external scripts.
    return html.replace(/<script\b([^>]*?)\ssrc=(['"])([^'"\s>]+)\2([^>]*)>/gi, (m, pre, q, src, post) => {
        const isExternal = /^(?:https?:)?\/\//i.test(src) || /^data:/i.test(src);
        const isEsmCdn = /(^|\.)esm\.sh\//i.test(src);
        if (isExternal && !isEsmCdn)
            return m; // leave non-ESM external scripts unchanged
        // Only consider likely module files
        const looksLikeJs = /\.js(?:[?#].*)?$/i.test(src) || /\/main(?:[?#].*)?$/i.test(src);
        if (!looksLikeJs && !isEsmCdn)
            return m;
        let tagAttrs = `${pre} src=${q}${src}${q}${post}`;
        // If a type attribute exists and isn't module, rewrite it to module
        if (/\btype\s*=\s*(['"])module\1/i.test(tagAttrs))
            return `<script${tagAttrs}>`;
        if (/\btype\s*=/i.test(tagAttrs)) {
            tagAttrs = tagAttrs.replace(/\btype\s*=\s*(['"])\s*[^'"\s>]+\s*\1/i, 'type="module"');
            return `<script${tagAttrs}>`;
        }
        // Otherwise, inject type="module"
        return `<script type="module"${tagAttrs}>`;
    });
};
const sanitizeSitePath = (siteDir, relativePath) => {
    // Prevent absolute paths and traversal outside siteDir
    const cleanRel = relativePath.replace(/^\/+/, '');
    const resolved = path_1.default.resolve(siteDir, cleanRel);
    if (!resolved.startsWith(path_1.default.resolve(siteDir))) {
        throw new Error(`Unsafe path in bundle: ${relativePath}`);
    }
    return resolved;
};
const fixReactDomClientImport = (code) => {
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
    const hasCreateRootImport = (/import\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out) ||
        /import\s+[A-Za-z_$][\w$]*\s*,\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out));
    if (hasCreateRootCall && !hasCreateRootImport) {
        out = `import { createRoot } from 'react-dom/client';\n` + out;
    }
    // 6) Dedupe multiple createRoot imports to avoid "already been declared" errors
    //    - Keep the first import that includes createRoot
    //    - For subsequent imports from react-dom/client that also include createRoot,
    //      remove just the createRoot specifier; if nothing remains, drop the line
    let seenCreateRootImport = false;
    const importNamedClient = /(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\3\s*;?\s*(?=\n|$)/g;
    out = out.replace(importNamedClient, (m, _lb, names, q, spec) => {
        // Only process lines that actually reference createRoot (possibly with alias)
        if (!/\bcreateRoot\b/.test(names))
            return m;
        if (!seenCreateRootImport) {
            seenCreateRootImport = true;
            // Also quickly dedupe duplicate identifiers within the first import
            const parts = names
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            const unique = [];
            for (const p of parts) {
                if (!unique.includes(p))
                    unique.push(p);
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
    out = out.replace(importDefaultAndNamedClient, (m, _lb, defIdent, names, q, spec) => {
        if (!/\bcreateRoot\b/.test(names))
            return m;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        // Remove duplicate specifiers and handle aliasing cleanup
        const deduped = [];
        for (const p of parts) {
            if (!deduped.includes(p))
                deduped.push(p);
        }
        let filtered = deduped;
        if (!seenCreateRootImport) {
            seenCreateRootImport = true;
        }
        else {
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
    out = out.replace(bareCreateRootNamed, (m) => {
        if (seenBareCreateRoot)
            return '\n';
        seenBareCreateRoot = true;
        return `\n${m.trim()}`;
    });
    return out;
};
const fixBareReactImports = (code) => {
    // Ensure bare imports are resolvable in the browser by pointing to esm.sh
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    const reactUrl = dev ? 'https://esm.sh/react@18?dev' : 'https://esm.sh/react@18';
    const rdomUrl = dev ? 'https://esm.sh/react-dom@18/client?dev' : 'https://esm.sh/react-dom@18/client';
    const lucideUrl = dev ? 'https://esm.sh/lucide-react?dev' : 'https://esm.sh/lucide-react';
    let out = code.replace(/from\s+['\"]react-dom\/client['\"]/g, `from '${rdomUrl}'`);
    out = out.replace(/from\s+['\"]react['\"]/g, `from '${reactUrl}'`);
    out = out.replace(/from\s+['\"]lucide-react['\"]/g, `from '${lucideUrl}'`);
    return out;
};
const fixLucideIconChildren = (code) => {
    let out = code;
    // Collect named lucide imports and their local names (handle aliasing: { A as B })
    const namedImports = [];
    const namedRe = /import\s*{\s*([^}]*)\s*}\s*from\s*["']lucide-react["']/g;
    let m;
    while ((m = namedRe.exec(code)) !== null) {
        const block = m[1];
        const parts = block.split(',').map(s => s.trim()).filter(Boolean);
        for (const p of parts) {
            // Support "Icon" or "Icon as Alias"
            const asMatch = p.match(/^(\w+)(?:\s+as\s+(\w+))?$/i);
            if (asMatch) {
                const local = asMatch[2] || asMatch[1];
                if (/^[A-Z]/.test(local))
                    namedImports.push(local);
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
        out = out.replace(childRe, (_mm, g1, icon, g3) => `${'>'}${g1}<${ns}.${icon} />${g3}<`);
    }
    return out;
};
// Heuristic fix: if icons are mistakenly imported from React, move them to lucide-react
// Example: import { ShoppingCart } from 'react' -> import { ShoppingCart } from 'lucide-react'
// Keeps allowed React uppercase named exports (Fragment, StrictMode, Suspense, Profiler)
const fixIconMisimportsFromReact = (code) => {
    let out = code;
    const allowedReactUpper = new Set(['Fragment', 'StrictMode', 'Suspense', 'Profiler']);
    const matches = [];
    // Pattern for: import React, { X, Y } from 'react' or CDN react
    const reDefaultAndNamed = /import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\3)\s*;?/g;
    // Pattern for: import { X, Y } from 'react' or CDN react
    const reNamedOnly = /import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*\breact@?[^"']*)(?:\2)\s*;?/g;
    const collect = (regex, hasDefault) => {
        let m;
        while ((m = regex.exec(out)) !== null) {
            const names = hasDefault ? m[2] : m[1];
            const q = hasDefault ? m[3] : m[2];
            const spec = hasDefault ? m[4] : m[3];
            // Only target 'react' sources (bare or CDN), not 'react-dom' or others
            const specLc = spec.toLowerCase();
            if (!/\breact(?!-dom)/.test(specLc))
                continue;
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
    if (!matches.length)
        return out;
    // Process from last to first to avoid index shifting
    matches.sort((a, b) => b.start - a.start);
    for (const m of matches) {
        const parts = m.names.split(',').map(s => s.trim()).filter(Boolean);
        const keep = [];
        const toIcons = [];
        for (const p of parts) {
            const name = p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim();
            if (/^[A-Z]/.test(name) && !allowedReactUpper.has(name)) {
                toIcons.push(p);
            }
            else {
                keep.push(p);
            }
        }
        if (!toIcons.length)
            continue;
        // Rewrite the original import without icon names
        let replacement = '';
        if (m.hasDefault && keep.length) {
            replacement = `import ${m.defIdent}, { ${keep.join(', ')} } from ${m.q}${m.spec}${m.q};`;
        }
        else if (m.hasDefault && !keep.length) {
            replacement = `import ${m.defIdent} from ${m.q}${m.spec}${m.q};`;
        }
        else if (!m.hasDefault && keep.length) {
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
        }
        else {
            // Prepend a new import using bare 'lucide-react'; later steps will canonicalize to CDN
            out = `import { ${icons.join(', ')} } from 'lucide-react';\n` + out;
        }
    }
    return out;
};
// Rewrite unknown bare imports (not relative, not react/react-dom/lucide-react) to a local shim module
// and collect required shim exports. This avoids runtime failures for random libraries by stubbing.
const rewriteUnknownImportsToShim = (code) => {
    let out = code;
    const shim = { named: new Set(), needDefault: false, needNS: false, changed: false };
    const isAllowed = (spec) => {
        const s = spec.trim().toLowerCase();
        if (s.startsWith('.') || s.startsWith('/'))
            return true;
        // Allow react-dom client from bare or CDN forms (e.g. react-dom@18/client, https://esm.sh/react-dom@18/client?dev)
        if (/react-dom[^]*\/client/.test(s))
            return true;
        // Allow bare or CDN react but not lucide-react (segment-based)
        if (/(^|\/)react(?!-dom)(?:@[^/]+)?(?:\/|\?|#|$)/.test(s) && !/(^|\/)lucide-react(?:@[^/]+)?(?:\/|\?|#|$)/.test(s))
            return true;
        // Allow lucide-react from bare or CDN forms
        if (/(^|\/)lucide-react(?:@[^/]+)?(?:\/|\?|#|$)/.test(s))
            return true;
        return false;
    };
    // default + named
    out = out.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\4\s*;?/g, (m, lb, defIdent, names, q, spec) => {
        if (isAllowed(spec))
            return m;
        shim.needDefault = true;
        shim.changed = true;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => shim.named.add(p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim()));
        const namedList = parts.join(', ');
        return `\nimport { DefaultShim as ${defIdent}${namedList ? `, ${namedList}` : ''} } from './__shims.js';`;
    });
    // named only
    out = out.replace(/(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']+?)\3\s*;?/g, (m, lb, names, q, spec) => {
        if (isAllowed(spec))
            return m;
        shim.changed = true;
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => shim.named.add(p.replace(/\sas\s+[A-Za-z_$][\w$]*$/, '').trim()));
        const namedList = parts.join(', ');
        return `\nimport { ${namedList} } from './__shims.js';`;
    });
    // default only
    out = out.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s+from\s*(["'])([^"']+?)\3\s*;?/g, (m, lb, ident, q, spec) => {
        if (isAllowed(spec))
            return m;
        shim.needDefault = true;
        shim.changed = true;
        return `\nimport { DefaultShim as ${ident} } from './__shims.js';`;
    });
    // star import -> NS proxy
    out = out.replace(/(^|\n)\s*import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*(["'])([^"']+?)\3\s*;?/g, (m, lb, ns, q, spec) => {
        if (isAllowed(spec))
            return m;
        shim.needNS = true;
        shim.changed = true;
        return `\nimport { NS as ${ns} } from './__shims.js';`;
    });
    return { code: out, shim };
};
const addDevParamToReactCdn = (code) => {
    const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
    if (!dev)
        return code;
    // Add ?dev to existing esm.sh React/ReactDOM CDN imports if not present
    const withReact = code.replace(/(from\s+["']https:\/\/esm\.sh\/react@\d+(?:[^"']*)["'])/g, (m) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1')));
    let out = withReact.replace(/(from\s+["']https:\/\/esm\.sh\/react-dom@\d+\/client(?:[^"']*)["'])/g, (m) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1')));
    // Also add ?dev to lucide-react for consistent dev diagnostics
    out = out.replace(/(from\s+["']https:\/\/esm\.sh\/lucide-react(?:[^"']*)["'])/g, (m) => (m.includes('?dev') ? m : m.replace(/(["'])$/, '?dev$1')));
    return out;
};
const canonicalizeReactCdnImports = (code) => {
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
    out = out.replace(/from\s+['\"]https?:\/\/[^'\"]*\/(?:react)(?!-dom)[^'\"]*['\"]/g, (m) => {
        // If it actually points to lucide-react, skip
        if (/lucide-react/.test(m))
            return m;
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
    <script src="https://cdn.tailwindcss.com"></script>
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
const writeReactBundle = async (runDir, bundle) => {
    const siteDir = path_1.default.join(runDir, 'site');
    await promises_1.default.mkdir(siteDir, { recursive: true });
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
        const ext = path_1.default.extname(originalRelPath);
        // Basic rewrites before transpile
        content = rewriteQuotedExtensionToJs(content);
        content = canonicalizeReactCdnImports(addDevParamToReactCdn(fixBareReactImports(fixIconMisimportsFromReact(fixReactDomClientImport(fixLucideIconChildren(content))))));
        let targetPath = sanitizeSitePath(siteDir, originalRelPath);
        if (ext === '.jsx' || ext === '.tsx') {
            let result;
            try {
                result = await (0, esbuild_1.transform)(content, {
                    loader: ext.slice(1),
                    format: 'esm',
                });
            }
            catch (e) {
                const msg = e && e.message ? e.message : String(e);
                throw new Error(`esbuild transform failed for ${originalRelPath}: ${msg}`);
            }
            content = ensureRelativeHasJsExtension(canonicalizeReactCdnImports(addDevParamToReactCdn(fixBareReactImports(fixIconMisimportsFromReact(fixReactDomClientImport(fixLucideIconChildren(result.code)))))));
            targetPath = targetPath.replace(/\.(jsx|tsx)$/, '.js');
        }
        else if (ext === '.html') {
            // Also rewrite in HTML any references and ensure .js extension on relative paths
            // 1) convert .jsx/.tsx to .js inside quoted strings
            // 2) ensure relative imports have .js
            // 3) convert root-relative paths (e.g. "/main.js") to relative ("./main.js")
            content = ensureModuleTypeForLocalScripts(rewriteRootRelativeToRelative(ensureRelativeHasJsExtension(rewriteQuotedExtensionToJs(content))));
        }
        else if (ext === '.js') {
            // Ensure extensionless relative imports have .js
            content = ensureRelativeHasJsExtension(canonicalizeReactCdnImports(addDevParamToReactCdn(fixBareReactImports(fixIconMisimportsFromReact(fixReactDomClientImport(fixLucideIconChildren(content)))))));
        }
        // After transforming JS/JSX files, rewrite unknown imports to local shims and write the shim if needed
        if (ext === '.jsx' || ext === '.tsx' || ext === '.js') {
            const shimPass = rewriteUnknownImportsToShim(content);
            content = shimPass.code;
            if (shimPass.shim.changed) {
                const shimPath = path_1.default.join(path_1.default.dirname(targetPath), '__shims.js');
                const shimLines = [];
                if (shimPass.shim.needDefault)
                    shimLines.push(`export const DefaultShim = () => null;`);
                if (shimPass.shim.needNS)
                    shimLines.push(`export const NS = new Proxy({}, { get: () => () => null });`);
                for (const name of Array.from(shimPass.shim.named)) {
                    shimLines.push(`export const ${name} = () => null;`);
                }
                await promises_1.default.writeFile(shimPath, shimLines.join('\n'));
            }
        }
        await promises_1.default.mkdir(path_1.default.dirname(targetPath), { recursive: true });
        await promises_1.default.writeFile(targetPath, content);
    }
    // Decide entry HTML to serve
    const entryRel = bundle.entry || 'index.html';
    const entryExt = path_1.default.extname(entryRel);
    let entryHtmlPath;
    if (entryExt === '.html') {
        // Use provided HTML entry
        entryHtmlPath = sanitizeSitePath(siteDir, entryRel);
        try {
            await promises_1.default.access(entryHtmlPath);
        }
        catch {
            // If missing, fall back to scaffold
            entryHtmlPath = path_1.default.join(siteDir, 'index.html');
            await promises_1.default.writeFile(entryHtmlPath, SCAFFOLD_INDEX_HTML);
        }
    }
    else {
        // Entry is a script; ensure an index.html that loads it
        const transpiledEntry = entryRel.replace(/\.(jsx|tsx)$/, '.js');
        const entryScriptRel = transpiledEntry.startsWith('./') ? transpiledEntry : `./${transpiledEntry}`;
        const indexHtml = SCAFFOLD_INDEX_HTML.replace('./main.js', entryScriptRel);
        entryHtmlPath = path_1.default.join(siteDir, 'index.html');
        await promises_1.default.writeFile(entryHtmlPath, indexHtml);
    }
    // Check if the entry script (or App.js if using default scaffold) exists
    // If we are using the default scaffold (entryRel was empty or not provided), it expects ./main.js
    // And main.js (SCAFFOLD_MAIN_JSX) imports ./App.js
    if (!bundle.entry) {
        // We are using the default scaffold which uses main.js -> App.js
        // We need to ensure main.js and App.js exist.
        // 1. Ensure main.js exists (we might need to write the scaffold main.jsx -> main.js)
        const mainJsPath = path_1.default.join(siteDir, 'main.js');
        try {
            await promises_1.default.access(mainJsPath);
        }
        catch {
            // Transpile scaffold main.jsx
            const result = await (0, esbuild_1.transform)(SCAFFOLD_MAIN_JSX, {
                loader: 'jsx',
                format: 'esm',
            });
            const out = ensureRelativeHasJsExtension(canonicalizeReactCdnImports(fixBareReactImports(fixReactDomClientImport(fixLucideIconChildren(result.code)))));
            await promises_1.default.writeFile(mainJsPath, out);
        }
        // 2. Ensure App.js exists
        const appJsPath = path_1.default.join(siteDir, 'App.js');
        try {
            await promises_1.default.access(appJsPath);
        }
        catch {
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
            const result = await (0, esbuild_1.transform)(minimalApp, { loader: 'jsx', format: 'esm' });
            await promises_1.default.writeFile(appJsPath, result.code);
        }
    }
    // Construct local URL for the chosen entry html
    const entryDir = path_1.default.dirname(entryHtmlPath);
    const relativeDir = path_1.default.relative(config_1.config.outputDir, entryDir);
    const fileName = path_1.default.basename(entryHtmlPath);
    const localUrl = (0, utils_1.getLocalArtifactUrl)(path_1.default.join(relativeDir, fileName));
    return { localUrl, entryPath: entryHtmlPath };
};
exports.writeReactBundle = writeReactBundle;
