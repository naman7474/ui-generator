import React from 'https://esm.sh/react@18?dev';
import { createRoot } from './__shims.js';
import App from "./App.js";
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ React.createElement(React.StrictMode, null, /* @__PURE__ */ React.createElement(App, null))
);
