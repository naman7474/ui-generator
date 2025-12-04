import React from 'https://esm.sh/react@18?dev';
import Header from "./components/Header.js";
import CategoryCircles from "./components/CategoryCircles.js";
import HeroBanner from "./components/HeroBanner.js";
import ProductSection from "./components/ProductSection.js";
import Testimonials from "./components/Testimonials.js";
import ConstantsBanner from "./components/ConstantsBanner.js";
import InfoSection from "./components/InfoSection.js";
import Footer from "./components/Footer.js";
import { bestSellers, lightningSale, trending, moisturizers } from "./data/mockData.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[rgb(255,255,255)] min-h-screen" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(CategoryCircles, null), /* @__PURE__ */ React.createElement(HeroBanner, null), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Best Sellers",
      products: bestSellers,
      hasTabs: true,
      tabs: ["Best Sellers", "Sunscreen", "Fragrance", "Moisturizer", "Cleansers"]
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Lightning Sale",
      products: lightningSale,
      viewAllText: "View all Lightning Sale",
      bgColor: "bg-[rgb(242,242,242)]"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Trending",
      products: trending,
      viewAllText: "View Trending Products"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Moisturizer",
      products: moisturizers,
      viewAllText: "View Moisturizer Products",
      bgColor: "bg-[rgb(242,242,242)]"
    }
  ), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(ConstantsBanner, null), /* @__PURE__ */ React.createElement(InfoSection, null)), /* @__PURE__ */ React.createElement(Footer, null));
}
export {
  App as default
};
