import React from 'https://esm.sh/react@18?dev&target=es2018';
import { createRoot } from 'https://esm.sh/react-dom@18/client?dev&target=es2018';
import App from "./App.js";
const container = document.getElementById("root");
const root = createRoot(container);
root.render(/* @__PURE__ */ React.createElement(App, null));
