import React from 'https://esm.sh/react@18?dev&target=es2018';
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import Marquee from "./components/Marquee.js";
import Products from "./components/Products.js";
import Testimonials from "./components/Testimonials.js";
import Comparison from "./components/Comparison.js";
import FAQ from "./components/FAQ.js";
import CallToAction from "./components/CallToAction.js";
import Footer from "./components/Footer.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white text-zinc-800" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(Marquee, null), /* @__PURE__ */ React.createElement(Products, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(Comparison, null), /* @__PURE__ */ React.createElement(FAQ, null), /* @__PURE__ */ React.createElement(CallToAction, null)), /* @__PURE__ */ React.createElement(Footer, null));
}
export {
  App as default
};
