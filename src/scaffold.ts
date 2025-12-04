import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from './utils';
import { config } from './config';
import { getLocalArtifactUrl } from './utils';

const INDEX_HTML = `<!DOCTYPE html>
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
      "react": "https://esm.sh/react@18?dev&target=es2018",
      "react-dom/client": "https://esm.sh/react-dom@18/client?dev&target=es2018",
      "lucide-react": "https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018"
    }
  }
  <\/script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>`;

const MAIN_JS = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

const mount = () => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  const sections = Array.isArray(window.__SECTIONS__) ? window.__SECTIONS__ : [];
  root.render(React.createElement(App, { sections }));
};

// After mount, hydrate any <i data-icon="IconName"> placeholders using lucide-react
const hydrateIcons = async () => {
  try {
    const Icons = await import('lucide-react');
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
      return vals.length ? String(vals[0]) : undefined;
    } catch { return undefined; }
  };
  const onerr = (e) => {
    const fb = pickFallback();
    if (fb && e && e.target && !e.target.__fb) {
      e.target.__fb = true;
      e.target.src = fb;
    }
  };
  const wire = (img) => { try { img.addEventListener('error', onerr, { once: false }); } catch {} };
  Array.from(document.querySelectorAll('img')).forEach(wire);
  const mo = new MutationObserver((muts) => {
    muts.forEach((m) => {
      m.addedNodes && m.addedNodes.forEach((n) => {
        if (n && n.tagName === 'IMG') wire(n);
        if (n && n.querySelectorAll) Array.from(n.querySelectorAll('img')).forEach(wire);
      });
    });
  });
  try { mo.observe(document.documentElement, { childList: true, subtree: true }); } catch {}
};

mount();
hydrateIcons();
attachImageFallbacks();
`;

const APP_JS = `import React from 'react';
import Section from './components/Section.js';

export default function App({ sections = [] }) {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-white text-gray-900' },
    ...sections.map((html, i) => React.createElement(Section, { key: i, html }))
  );
}
`;

const SECTION_JS = `import React from 'react';

export default function Section({ html }) {
  return React.createElement('section', {
    dangerouslySetInnerHTML: { __html: html }
  });
}
`;

const IMAGE_WITH_FALLBACK_JS = `import React from 'react';
import { resolveAsset } from '../utils/assets.js';

export default function ImageWithFallback({ src, alt = '', ...rest }) {
  const resolved = resolveAsset(src) || src;
  const onError = (e) => {
    try {
      const manifest = (window.__ASSET_MANIFEST__ && window.__ASSET_MANIFEST__.images) || {};
      const any = Object.values(manifest)[0];
      if (any) e.currentTarget.src = any;
    } catch {}
  };
  return React.createElement('img', { src: resolved, alt, onError, ...rest });
}
`;

const ICON_JS = `import React from 'react';
import * as Icons from 'lucide-react';

export default function Icon({ name = 'Circle', ...props }) {
  const Comp = Icons[name] || Icons['Circle'];
  return React.createElement(Comp, props);
}
`;

const ASSETS_UTIL_JS = `export const resolveAsset = (keyOrUrl) => {
  try {
    const m = (window.__ASSET_MANIFEST__ && window.__ASSET_MANIFEST__.images) || {};
    if (keyOrUrl && m[keyOrUrl]) return m[keyOrUrl];
    return keyOrUrl;
  } catch { return keyOrUrl; }
};
`;

export const writeBaseReactScaffold = async (
  siteDir: string,
  sectionsHtml: string[]
): Promise<{ entryPath: string; localUrl: string }> => {
  await ensureDir(siteDir);
  const indexPath = path.join(siteDir, 'index.html');
  const mainPath = path.join(siteDir, 'main.js');
  const appPath = path.join(siteDir, 'App.js');
  const componentsDir = path.join(siteDir, 'components');
  const utilsDir = path.join(siteDir, 'utils');

  await ensureDir(componentsDir);
  await ensureDir(utilsDir);

  // Write base files
  await fs.writeFile(indexPath, INDEX_HTML, 'utf8');
  await fs.writeFile(mainPath, MAIN_JS, 'utf8');
  await fs.writeFile(appPath, APP_JS, 'utf8');
  await fs.writeFile(path.join(componentsDir, 'Section.js'), SECTION_JS, 'utf8');
  await fs.writeFile(path.join(componentsDir, 'ImageWithFallback.js'), IMAGE_WITH_FALLBACK_JS, 'utf8');
  await fs.writeFile(path.join(componentsDir, 'Icon.js'), ICON_JS, 'utf8');
  await fs.writeFile(path.join(utilsDir, 'assets.js'), ASSETS_UTIL_JS, 'utf8');

  // Inject sections into index.html via window.__SECTIONS__
  const html = await fs.readFile(indexPath, 'utf8');
  const headEndIdx = html.indexOf('</head>');
  const sectionsScript = `<script>window.__SECTIONS__ = ${JSON.stringify(sectionsHtml)};<\/script>`;
  const newHtml = headEndIdx >= 0
    ? `${html.slice(0, headEndIdx)}  ${sectionsScript}\n${html.slice(headEndIdx)}`
    : `${sectionsScript}\n${html}`;
  await fs.writeFile(indexPath, newHtml, 'utf8');

  const entryDir = path.dirname(indexPath);
  const relativeDir = path.relative(config.outputDir, entryDir);
  const localUrl = getLocalArtifactUrl(path.join(relativeDir, 'index.html'));
  return { entryPath: indexPath, localUrl };
};
