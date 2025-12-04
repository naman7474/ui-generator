import React, { useState } from "https://esm.sh/react@18";
import ProductCard from "./ProductCard.js";
import { ShoppingCart } from "https://esm.sh/lucide-react";
const products = [
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
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=100&q=80"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1529312266912-b33cf6227e24?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1529312266912-b33cf6227e24?auto=format&fit=crop&w=100&q=80"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=100&q=80"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=100&q=80"
    ]
  },
  {
    id: 6,
    title: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=100&q=80"
    ]
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-12 relative" }, /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-8 right-8 z-50 md:absolute md:top-0 md:right-12 md:bottom-auto" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white p-4 rounded-full shadow-xl hover:bg-red-700 transition-colors relative" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-white text-brand-orange text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-brand-orange" }, "0"))), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif text-center mb-8 tracking-wide" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-4 mb-12" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-full font-bold text-sm tracking-wider transition-colors ${activeTab === "TIKKAS" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-600"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-full font-bold text-sm tracking-wider flex items-center gap-2 transition-colors ${activeTab === "GRAVIES" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-600"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] bg-green-600 text-white px-1 rounded uppercase" }, "New Launch"),
    "GRAVIES"
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors" }, "Show More (+5)"))));
}
export {
  ProductList as default
};
