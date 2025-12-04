import React, { useState } from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
const PRODUCTS = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "assets/images/b975cbabed.png",
    thumbnails: [
      "assets/images/b975cbabed.png"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "assets/images/b975cbabed.png",
    thumbnails: [
      "assets/images/b975cbabed.png"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "assets/images/b975cbabed.png",
    thumbnails: []
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "assets/images/b975cbabed.png",
    thumbnails: []
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif mb-8 tracking-wide" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center space-x-4 mb-12" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-8 py-2 rounded-full font-bold text-sm tracking-wider transition-all ${activeTab === "TIKKAS" ? "bg-brand-orange text-white shadow-lg" : "bg-white text-gray-500 border border-gray-300 hover:border-brand-orange"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-8 py-2 rounded-full font-bold text-sm tracking-wider transition-all flex items-center ${activeTab === "GRAVIES" ? "bg-brand-orange text-white shadow-lg" : "bg-white text-gray-500 border border-gray-300 hover:border-brand-orange"}`
    },
    "GRAVIES",
    /* @__PURE__ */ React.createElement("span", { className: "ml-2 text-[10px] bg-green-500 text-white px-1 rounded" }, "NEW")
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, PRODUCTS.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-orange-700 transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
