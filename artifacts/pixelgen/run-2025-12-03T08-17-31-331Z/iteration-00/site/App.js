import React from "https://esm.sh/react@18.2.0?dev";
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import ProductList from "./components/ProductList.js";
import Testimonials from "./components/Testimonials.js";
import ComparisonSlider from "./components/ComparisonSlider.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
import { ShoppingCart } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative min-h-screen" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(ProductList, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(ComparisonSlider, null), /* @__PURE__ */ React.createElement(FAQ, null)), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-8 right-8 z-50" }, /* @__PURE__ */ React.createElement("button", { className: "bg-kilrr-orange text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors relative" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-white text-kilrr-orange text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-kilrr-orange" }, "0"))));
}
export {
  App as default
};
