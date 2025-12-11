import React from 'https://esm.sh/react@18?dev&target=es2018';
import { createRoot } from 'https://esm.sh/react-dom@18/client?dev&target=es2018';
import App from './App.js';
import Section0 from './components/Section0.js';
import Section1 from './components/Section1.js';
import Section2 from './components/Section2.js';
import Section3 from './components/Section3.js';
import Section4 from './components/Section4.js';
import Section5 from './components/Section5.js';
import Section6 from './components/Section6.js';
import Section7 from './components/Section7.js';
import Section8 from './components/Section8.js';
import Section9 from './components/Section9.js';
import Section10 from './components/Section10.js';
import Section11 from './components/Section11.js';
import Section12 from './components/Section12.js';
import Section13 from './components/Section13.js';

window.__SECTIONS__ = [Section0, Section1, Section2, Section3, Section4, Section5, Section6, Section7, Section8, Section9, Section10, Section11, Section12, Section13];

const mount = () => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  const sections = Array.isArray(window.__SECTIONS__) ? window.__SECTIONS__ : [];
  root.render(React.createElement(App, { sections }));
};

// After mount, hydrate any <i data-icon="IconName"> placeholders using lucide-react
const hydrateIcons = async () => {
  try {
    const Icons = await import('https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018');
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
