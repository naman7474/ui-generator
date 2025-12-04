import React, { useState } from "https://esm.sh/react@18";
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import Marquee from "./components/Marquee.js";
import ProductList from "./components/ProductList.js";
import Testimonials from "./components/Testimonials.js";
import ComparisonSection from "./components/ComparisonSection.js";
import FAQ from "./components/FAQ.js";
import Footer from "./components/Footer.js";
import FloatingCart from "./components/FloatingCart.js";
function App() {
  const [cartCount, setCartCount] = useState(0);
  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "relative min-h-screen flex flex-col" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", { className: "flex-grow" }, /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(Marquee, null), /* @__PURE__ */ React.createElement(ProductList, { addToCart }), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(ComparisonSection, null), /* @__PURE__ */ React.createElement(FAQ, null)), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement(FloatingCart, { count: cartCount }));
}
export {
  App as default
};
