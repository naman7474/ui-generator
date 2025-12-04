import React from "https://esm.sh/react@18.2.0?dev";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?deps=react@18.2.0";
import App from "./App.js";
const root = createRoot(document.getElementById("root"));
root.render(
  /* @__PURE__ */ React.createElement(React.StrictMode, null, /* @__PURE__ */ React.createElement(App, null))
);
