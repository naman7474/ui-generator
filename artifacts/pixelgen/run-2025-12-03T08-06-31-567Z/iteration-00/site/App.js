import React from "https://esm.sh/react@18.2.0?dev";
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import Ticker from "./components/Ticker.js";
import ProductSection from "./components/ProductSection.js";
import Testimonials from "./components/Testimonials.js";
import ComparisonSection from "./components/ComparisonSection.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white min-h-screen font-sans text-gray-800" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(Ticker, null), /* @__PURE__ */ React.createElement(ProductSection, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(ComparisonSection, null), /* @__PURE__ */ React.createElement(FAQ, null), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-8 right-8 z-50" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors relative" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "21", r: "1" }), /* @__PURE__ */ React.createElement("circle", { cx: "20", cy: "21", r: "1" }), /* @__PURE__ */ React.createElement("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-white text-brand-orange text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-brand-orange" }, "0"))));
}
export {
  App as default
};
