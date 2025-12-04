import React, { useState } from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "assets/images/8bee64915c.png",
    thumbnails: [
      "assets/images/8bee64915c.png",
      "assets/images/37401f88bf.png",
      "assets/images/e1f6f7cd45.png"
    ],
    boughtToday: 213
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "assets/images/47553d85b2.png",
    thumbnails: [
      "assets/images/47553d85b2.png",
      "assets/images/fc841e80a7.png",
      "assets/images/e8663f41c3.png"
    ],
    boughtToday: 156
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "assets/images/e5948e9067.png",
    thumbnails: [
      "assets/images/e5948e9067.png",
      "assets/images/0b6946f434.png",
      "assets/images/cac0fcf75e.png"
    ],
    boughtToday: 89
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "assets/images/1a7d73102c.png",
    thumbnails: [
      "assets/images/1a7d73102c.png",
      "assets/images/ce17942610.png",
      "assets/images/54cfe34106.png"
    ],
    boughtToday: 102
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "assets/images/a4f1e17947.png",
    thumbnails: [
      "assets/images/a4f1e17947.png",
      "assets/images/156cfc932c.png",
      "assets/images/c610f5f78c.png"
    ],
    boughtToday: 75
  },
  {
    id: 6,
    title: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "assets/images/efbabe3856.png",
    thumbnails: [
      "assets/images/efbabe3856.png",
      "assets/images/51acae48b0.png",
      "assets/images/30dac6869c.png"
    ],
    boughtToday: 134
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-10 md:py-16 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-10" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-heading font-medium tracking-wide py-10" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center gap-4 mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "relative inline-flex bg-brand-peach rounded-full p-1 cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "TIKKAS" ? "bg-brand-orange text-white shadow-md" : "text-brand-salmon"}`,
      onClick: () => setActiveTab("TIKKAS")
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "GRAVIES" ? "bg-brand-orange text-white shadow-md" : "text-brand-salmon"}`,
      onClick: () => setActiveTab("GRAVIES")
    },
    "GRAVIES"
  )))), /* @__PURE__ */ React.createElement("div", { className: "space-y-12 md:space-y-20" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors rounded-sm" }, "Show More (+5)")));
}
export {
  ProductList as default
};
