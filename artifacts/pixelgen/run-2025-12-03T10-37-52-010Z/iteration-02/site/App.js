import React from 'https://esm.sh/react@18?dev';
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import MarqueeStrip from "./components/MarqueeStrip.js";
import MobileDeals from "./components/MobileDeals.js";
import ProductList from "./components/ProductList.js";
import Testimonials from "./components/Testimonials.js";
import FeatureSection from "./components/FeatureSection.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white min-h-screen relative" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(MarqueeStrip, null), /* @__PURE__ */ React.createElement(MobileDeals, null), /* @__PURE__ */ React.createElement(ProductList, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(FeatureSection, null), /* @__PURE__ */ React.createElement(FAQ, null), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-8 right-8 z-50" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform relative" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" })), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-white text-brand-orange text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-brand-orange" }, "0"))));
}
export {
  App as default
};
