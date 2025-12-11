import React from 'https://esm.sh/react@18?dev&target=es2018';
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import Products from "./components/Products.js";
import Reviews from "./components/Reviews.js";
import Comparison from "./components/Comparison.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
function App() {
  return /* @__PURE__ */ React.createElement("main", { className: "w-full bg-white" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(Products, null), /* @__PURE__ */ React.createElement(Reviews, null), /* @__PURE__ */ React.createElement(Comparison, null), /* @__PURE__ */ React.createElement(FAQ, null), /* @__PURE__ */ React.createElement(Footer, null));
}
export {
  App as default
};
