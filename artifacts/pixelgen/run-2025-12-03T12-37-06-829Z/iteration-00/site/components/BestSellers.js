import React, { useState } from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
const tabs = ["Best Sellers", "Sunscreen", "Fragrance", "Moisturizer", "Cleansers", "Serum", "Toner", "Lip Care", "Body", "Dew Drops"];
const products = [
  {
    id: 1,
    title: "Glow+ Dewy Sunscreen Gel In-Vivo Tested",
    subtitle: "Broad Spectrum SPF 50+ PA++++ |...",
    rating: 4.8,
    reviews: 806,
    weight: "80g",
    price: 599,
    image: "assets/images/722835edaa.jpg"
  },
  {
    id: 2,
    title: "Detan+ Dewy Sunscreen In-Vivo Tested",
    subtitle: "Broad Spectrum SPF 50+ PA++++ |...",
    rating: 4.8,
    reviews: 395,
    weight: "80g",
    price: 599,
    image: "assets/images/bd0f2dca23.jpg"
  },
  {
    id: 3,
    title: "Illuminate + Hydra Gel Moisturizer with Wild Berries",
    subtitle: "24 Hour Intense Hydration | Water-Like...",
    rating: 4.8,
    reviews: 362,
    weight: "200g",
    price: 499,
    image: "assets/images/b04e8d74c7.jpg"
  },
  {
    id: 4,
    title: "Glow+ Hydra Gel Moisturizer with Vitamin C",
    subtitle: "24-Hour Intense Hydration | Water-Like...",
    rating: 4.8,
    reviews: 287,
    weight: "200g",
    price: 499,
    image: "assets/images/30ac2fd156.jpg"
  },
  {
    id: 5,
    title: "Refresh+ Sun Kissed Vanilla Perfume Body Mist",
    subtitle: "Warm Vanilla Fragrance | Double Duty...",
    rating: 4.8,
    reviews: 347,
    weight: "150ml",
    price: 499,
    image: "assets/images/f42711648f.jpg"
  }
];
function BestSellers() {
  const [activeTab, setActiveTab] = useState("Best Sellers");
  return /* @__PURE__ */ React.createElement("section", { className: "py-8 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-center mb-6 text-gray-900" }, "Best Sellers"), /* @__PURE__ */ React.createElement("div", { className: "flex overflow-x-auto no-scrollbar space-x-3 mb-8 pb-2 justify-start lg:justify-center" }, tabs.map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab,
      onClick: () => setActiveTab(tab),
      className: `px-4 py-2 rounded-md text-sm whitespace-nowrap border transition-colors ${activeTab === tab ? "border-[rgb(0,102,204)] text-[rgb(0,102,204)] font-semibold bg-[rgb(242,242,242)]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`
    },
    tab
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex overflow-x-auto space-x-4 pb-4 lg:grid lg:grid-cols-5 lg:gap-4 lg:space-x-0" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mt-8" }, /* @__PURE__ */ React.createElement("button", { className: "px-8 py-2 border border-[rgb(0,102,204)] text-[rgb(0,102,204)] font-semibold rounded-md hover:bg-[rgb(242,242,242)] transition-colors" }, "View Best Sellers Products")));
}
export {
  BestSellers as default
};
