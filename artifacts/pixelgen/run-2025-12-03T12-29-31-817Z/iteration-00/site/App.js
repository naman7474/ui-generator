import React from 'https://esm.sh/react@18?dev';
import TopBar from "./components/TopBar.js";
import Header from "./components/Header.js";
import CategoryRow from "./components/CategoryRow.js";
import HeroBanner from "./components/HeroBanner.js";
import BestSellers from "./components/BestSellers.js";
import LightningSale from "./components/LightningSale.js";
import Footer from "./components/Footer.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-white text-dark-text" }, /* @__PURE__ */ React.createElement(TopBar, null), /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(CategoryRow, null), /* @__PURE__ */ React.createElement(HeroBanner, null), /* @__PURE__ */ React.createElement(BestSellers, null), /* @__PURE__ */ React.createElement(LightningSale, null)), /* @__PURE__ */ React.createElement(Footer, null));
}
export {
  App as default
};
