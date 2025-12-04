import React, { useState } from "https://esm.sh/react@18";
import ProductCard from "./ProductCard.js";
const PRODUCTS = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1628294895950-98052523e036?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1628294895950-98052523e036?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=100&q=80"
    ],
    boughtToday: 213
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1606659893762-6727d6e9203e?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1606659893762-6727d6e9203e?auto=format&fit=crop&w=100&q=80"
    ],
    boughtToday: 156
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=100&q=80"
    ],
    boughtToday: 89
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible?",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=100&q=80"
    ],
    boughtToday: 342
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-12 md:py-16 container mx-auto px-4 max-w-[1200px]" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-display font-medium tracking-wide mb-8 uppercase" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center gap-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "TIKKAS" ? "bg-brand-rust text-white" : "bg-gray-200 text-gray-600"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${activeTab === "GRAVIES" ? "bg-brand-rust text-white" : "bg-gray-200 text-gray-600"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "bg-green-500 text-white text-[10px] px-1 rounded uppercase" }, "New"),
    "GRAVIES"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-8" }, PRODUCTS.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-12 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-rust text-white px-10 py-3 font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
