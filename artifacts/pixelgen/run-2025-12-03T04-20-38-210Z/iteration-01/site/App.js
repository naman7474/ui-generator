import React from "https://esm.sh/react@18";
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import MarqueeStrip from "./components/MarqueeStrip.js";
import ProductList from "./components/ProductList.js";
import Testimonials from "./components/Testimonials.js";
import ComparisonSection from "./components/ComparisonSection.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
import FloatingCart from "./components/FloatingCart.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white min-h-screen font-sans text-black" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(MarqueeStrip, null), /* @__PURE__ */ React.createElement(ProductList, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(ComparisonSection, null), /* @__PURE__ */ React.createElement(FAQ, null), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement(FloatingCart, null));
}
export {
  App as default
};
