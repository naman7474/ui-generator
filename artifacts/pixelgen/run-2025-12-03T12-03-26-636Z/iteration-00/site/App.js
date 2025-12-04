import React from 'https://esm.sh/react@18?dev';
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import CategoryCircles from "./components/CategoryCircles.js";
import ProductSection from "./components/ProductSection.js";
import Testimonials from "./components/Testimonials.js";
import BrandInfo from "./components/BrandInfo.js";
import Footer from "./components/Footer.js";
import { bestSellers, lightningSale, trending, moisturizers, mists, sunscreens, serums, cleansers, bodyCare, newLaunches } from "./data.js";
function App() {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white min-h-screen flex flex-col" }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", { className: "flex-grow" }, /* @__PURE__ */ React.createElement(CategoryCircles, null), /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Best Sellers",
      products: bestSellers,
      viewAllText: "View Best Sellers Products",
      showFilters: true
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Lightning Sale",
      products: lightningSale,
      viewAllText: "View All Lightning Sale",
      bgColor: "bg-bgLight"
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
      bgColor: "bg-bgLight"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Mist",
      products: mists,
      viewAllText: "View Mist Products"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Sunscreen",
      products: sunscreens,
      viewAllText: "View Sunscreen Products",
      bgColor: "bg-bgLight"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Serum",
      products: serums,
      viewAllText: "View Serum Products"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Cleansers",
      products: cleansers,
      viewAllText: "View Cleansers Products",
      bgColor: "bg-bgLight"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "Body Care",
      products: bodyCare,
      viewAllText: "View Body Care Products"
    }
  ), /* @__PURE__ */ React.createElement(
    ProductSection,
    {
      title: "New Launches",
      products: newLaunches,
      viewAllText: "View New Launches",
      bgColor: "bg-bgLight"
    }
  ), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(BrandInfo, null)), /* @__PURE__ */ React.createElement(Footer, null));
}
export {
  App as default
};
