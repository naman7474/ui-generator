function fixReactDomClientImport(code) {
  let out = code;
  const importAnyDefaultClient = /import\s+([A-Za-z_$][\w$]*)\s+from\s+(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\2\s*;?/g;
  out = out.replace(importAnyDefaultClient, (_m, _ident, q, spec) => `import { createRoot } from ${q}${spec}${q};`);
  const importStarClient = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\1\s*;?/g;
  out = out.replace(importStarClient, (_m, q, spec) => `import { createRoot } from ${q}${spec}${q};`);
  const importDomDefault = /import\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom)(?![^"']*\/client)\1\s*;?/g;
  out = out.replace(importDomDefault, (_m, q, _spec) => `import { createRoot } from ${q}react-dom/client${q};`);
  const importDomStar = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s+(["'])([^"']*react-dom)(?![^"']*\/client)\1\s*;?/g;
  out = out.replace(importDomStar, (_m, q, _spec) => `import { createRoot } from ${q}react-dom/client${q};`);
  out = out.replace(/ReactDOM\.createRoot\(/g, 'createRoot(');
  out = out.replace(/ReactDOM\.render\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, 'createRoot($2).render($1)');
  const hasCreateRootCall = /\bcreateRoot\s*\(/.test(out);
  const hasCreateRootImport = (
    /import\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out) ||
    /import\s+[A-Za-z_$][\w$]*\s*,\s*{[^}]*\bcreateRoot\b[^}]*}\s*from\s*["'][^"']*react-dom[^"']*\/client(?:[?#][^"']*)?["']/.test(out)
  );
  if (hasCreateRootCall && !hasCreateRootImport) {
    out = `import { createRoot } from 'react-dom/client';\n` + out;
  }

  let seenCreateRootImport = false;
  const importNamedClient = /(^|\n)\s*import\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\3\s*;?\s*(?=\n|$)/g;
  out = out.replace(importNamedClient, (m, _lb, names, q, spec) => {
    if (!/\bcreateRoot\b/.test(names)) return m;
    if (!seenCreateRootImport) {
      seenCreateRootImport = true;
      const parts = names.split(',').map(s => s.trim()).filter(Boolean);
      const unique = [];
      for (const p of parts) if (!unique.includes(p)) unique.push(p);
      const clean = unique.join(', ');
      return `\nimport { ${clean} } from ${q}${spec}${q};`;
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

  const importDefaultAndNamedClient = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*{\s*([^}]+?)\s*}\s*from\s*(["'])([^"']*react-dom[^"']*\/client(?:[?#][^"']*)?)\4\s*;?\s*(?=\n|$)/g;
  out = out.replace(importDefaultAndNamedClient, (m, _lb, defIdent, names, q, spec) => {
    if (!/\bcreateRoot\b/.test(names)) return m;
    const parts = names.split(',').map(s => s.trim()).filter(Boolean);
    const deduped = [];
    for (const p of parts) if (!deduped.includes(p)) deduped.push(p);
    let filtered = deduped;
    if (!seenCreateRootImport) {
      seenCreateRootImport = true;
    } else {
      filtered = deduped.filter(p => !/^createRoot\b(\s+as\s+[A-Za-z_$][\w$]*)?$/.test(p)).map(p => p.replace(/^,\s*|\s*,\s*$/g, ''));
    }
    const named = filtered.join(', ').replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();
    if (!named) return `\nimport ${defIdent} from ${q}${spec}${q};`;
    return `\nimport ${defIdent}, { ${named} } from ${q}${spec}${q};`;
  });

  let seenBareCreateRoot = false;
  const bareCreateRootNamed = /(^|\n)\s*import\s*{\s*createRoot\s*}\s*from\s*(['\"])([^'\"]*react-dom[^'\"]*\/client(?:[?#][^'\"]*)?)\2\s*;?\s*(?=\n|$)/g;
  out = out.replace(bareCreateRootNamed, (m) => {
    if (seenBareCreateRoot) return '\n';
    seenBareCreateRoot = true;
    return `\n${m.trim()}`;
  });
  return out;
}

module.exports = { fixReactDomClientImport };
