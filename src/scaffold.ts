/**
 * scaffold.ts - PATCHED VERSION
 * 
 * Ensures import map URLs match those used in react-host.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from './utils';
import { config } from './config';
import { getLocalArtifactUrl } from './utils';

// ============================================================================
// CONFIGURATION - Must match react-host.ts exactly
// ============================================================================
const getReactCdnConfig = () => {
  const dev = process.env.REACT_DEV === 'true' || process.env.NODE_ENV !== 'production';
  const target = 'es2018';

  return {
    dev,
    target,
    react: dev
      ? `https://esm.sh/react@18?dev&target=${target}`
      : `https://esm.sh/react@18?target=${target}`,
    reactDomClient: dev
      ? `https://esm.sh/react-dom@18/client?dev&target=${target}`
      : `https://esm.sh/react-dom@18/client?target=${target}`,
    lucideReact: dev
      ? `https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=${target}`
      : `https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&target=${target}`,
  };
};

// Generate INDEX_HTML dynamically to ensure CDN URLs match
const getIndexHtml = (): string => {
  const cdn = getReactCdnConfig();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated App</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="./fonts.css">
  <script>window.__ASSETS__ = window.__ASSETS__ || {}; window.__SECTIONS__ = window.__SECTIONS__ || [];<\/script>
  <script type="importmap">
  {
    "imports": {
      "react": "${cdn.react}",
      "react-dom/client": "${cdn.reactDomClient}",
      "lucide-react": "${cdn.lucideReact}"
    }
  }
  <\/script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>`;
};

const getMainJs = (sectionNames: string[] = []): string => {
  const cdn = getReactCdnConfig();
  const imports = sectionNames.map(n => `import ${n} from './components/${n}.js';`).join('\n');
  const register = `window.__SECTIONS__ = [${sectionNames.join(', ')}];`;

  return `import React from '${cdn.react}';
import { createRoot } from '${cdn.reactDomClient}';
import App from './App.js';
${imports}

${register}

const mount = () => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  const sections = Array.isArray(window.__SECTIONS__) ? window.__SECTIONS__ : [];
  root.render(React.createElement(App, { sections }));
};

// After mount, hydrate any <i data-icon="IconName"> placeholders using lucide-react
const hydrateIcons = async () => {
  try {
    const Icons = await import('${cdn.lucideReact}');
    const placeholders = Array.from(document.querySelectorAll('i[data-icon]'));
    for (const el of placeholders) {
      const name = el.getAttribute('data-icon') || 'Circle';
      const Comp = Icons[name] || Icons['Circle'];
      if (!Comp) continue;
      const tmp = document.createElement('span');
      el.replaceWith(tmp);
      const r = createRoot(tmp);
      r.render(React.createElement(Comp, { width: 20, height: 20 }));
    }
  } catch {}
};

// Attach image fallback handler: if any <img> fails to load, swap to first manifest image
const attachImageFallbacks = () => {
  const pickFallback = () => {
    try {
      const mani = (window.__ASSET_MANIFEST__ && window.__ASSET_MANIFEST__.images) || {};
      const vals = Object.values(mani);
      return vals.length ? vals[0] : null;
    } catch { return null; }
  };
  document.querySelectorAll('img').forEach(img => {
    img.onerror = () => {
      const fb = pickFallback();
      if (fb && img.src !== fb) img.src = fb;
    };
  });
};

mount();
hydrateIcons();
attachImageFallbacks();
`;
};

const getAppJs = (): string => {
  const cdn = getReactCdnConfig();
  return `import React from '${cdn.react}';

export default function App({ sections = [] }) {
  if (sections.length === 0) {
    return React.createElement('div', { className: 'p-8 text-center text-gray-500' }, 
      'No sections loaded. Check console for errors.'
    );
  }
  
  return React.createElement('div', { id: 'app-root' },
    sections.map((Section, i) => 
      React.createElement(Section, { key: i })
    )
  );
}
`;
};

const FONTS_CSS = `/* Font definitions - populated by asset scanner */
`;

export const writeBaseReactScaffold = async (
  runDir: string,
  sections: string[] = []
): Promise<{ localUrl: string; entryPath: string; siteDir: string }> => {
  const siteDir = path.join(runDir, 'site');
  await ensureDir(siteDir);

  // Write scaffold files
  const indexPath = path.join(siteDir, 'index.html');
  const mainPath = path.join(siteDir, 'main.js');
  const appPath = path.join(siteDir, 'App.js');
  const fontsPath = path.join(siteDir, 'fonts.css');

  // Create assets directories
  await ensureDir(path.join(siteDir, 'assets', 'images'));
  await ensureDir(path.join(siteDir, 'assets', 'fonts'));
  await ensureDir(path.join(siteDir, 'components'));

  // Generate section components
  const sectionNames: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    const name = `Section${i}`;
    sectionNames.push(name);
    const compContent = `import React from '${getReactCdnConfig().react}';
export default function ${name}() {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: \`${sections[i].replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }
  });
}`;
    await fs.writeFile(path.join(siteDir, 'components', `${name}.js`), compContent);
  }

  await fs.writeFile(indexPath, getIndexHtml());
  await fs.writeFile(mainPath, getMainJs(sectionNames));
  await fs.writeFile(appPath, getAppJs());
  await fs.writeFile(fontsPath, FONTS_CSS);

  const relativeDir = path.relative(config.outputDir, siteDir);
  const localUrl = getLocalArtifactUrl(path.join(relativeDir, 'index.html'));

  return { localUrl, entryPath: indexPath, siteDir };
};

export { getReactCdnConfig };