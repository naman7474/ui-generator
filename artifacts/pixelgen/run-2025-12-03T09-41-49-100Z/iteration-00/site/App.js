import React from 'https://esm.sh/react@18?dev';
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import Marquee from "./components/Marquee.js";
import ProductSection from "./components/ProductSection.js";
import Testimonials from "./components/Testimonials.js";
import FeatureSection from "./components/FeatureSection.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
import FloatingCart from "./components/FloatingCart.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white text-brand-dark min-h-screen relative" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(Marquee, null), /* @__PURE__ */ React.createElement(ProductSection, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(FeatureSection, null), /* @__PURE__ */ React.createElement(FAQ, null), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement(FloatingCart, null));
}
export {
  App as default
};
