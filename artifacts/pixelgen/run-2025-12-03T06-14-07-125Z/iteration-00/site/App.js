import React from "https://esm.sh/react@18?dev";
import Header from "./components/Header.js";
import Ticker from "./components/Ticker.js";
import ProductList from "./components/ProductList.js";
import Testimonials from "./components/Testimonials.js";
import ComparisonSection from "./components/ComparisonSection.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "font-sans text-gray-800 bg-white" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement(Ticker, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(ProductList, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(ComparisonSection, null), /* @__PURE__ */ React.createElement(FAQ, null)), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-8 right-8 z-50" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors relative" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" })), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-white text-brand-orange text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-brand-orange" }, "0"))));
}
export {
  App as default
};
