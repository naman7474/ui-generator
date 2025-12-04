import React, { useState } from "https://esm.sh/react@18";
import ProductCard from "./ProductCard.js";
const PRODUCTS = [
  {
    id: 1,
    name: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    boughtCount: 213,
    thumbnails: [
      "https://images.unsplash.com/photo-1628294895950-98052523e036?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=100&q=80"
    ]
  },
  {
    id: 2,
    name: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
    boughtCount: 184,
    thumbnails: [
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=100&q=80"
    ]
  },
  {
    id: 3,
    name: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=800&q=80",
    boughtCount: 561,
    thumbnails: []
  },
  {
    id: 4,
    name: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    boughtCount: 196,
    thumbnails: []
  },
  {
    id: 5,
    name: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    boughtCount: 570,
    thumbnails: []
  },
  {
    id: 6,
    name: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
    boughtCount: 142,
    thumbnails: []
  }
];
function ProductList({ addToCart }) {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4 max-w-6xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-light text-center mb-8 tracking-widest uppercase" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-12" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex gap-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${activeTab === "TIKKAS" ? "bg-[#C04B28] text-white border-[#C04B28]" : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-400"}`
    },
    "Tikkas"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${activeTab === "GRAVIES" ? "bg-[#C04B28] text-white border-[#C04B28]" : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-400"}`
    },
    "Gravies",
    /* @__PURE__ */ React.createElement("span", { className: "bg-green-600 text-white text-[9px] px-1 py-0.5 rounded uppercase" }, "New")
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-12 md:gap-24" }, PRODUCTS.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product, onAdd: addToCart }))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-[#C04B28] text-white px-12 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#a64430] transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
