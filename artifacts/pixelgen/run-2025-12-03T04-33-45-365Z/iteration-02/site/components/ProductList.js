import React, { useState } from "https://esm.sh/react@18";
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1628294895950-98052523e036?q=80&w=800&auto=format&fit=crop",
    boughtCount: 213
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop",
    boughtCount: 204
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=800&auto=format&fit=crop",
    boughtCount: 561
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    boughtCount: 196
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop",
    boughtCount: 570
  },
  {
    id: 6,
    title: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://images.unsplash.com/photo-1561651881-d3f007022482?q=80&w=800&auto=format&fit=crop",
    boughtCount: 120
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-12 px-4 md:px-8 max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-4xl font-light text-center mb-8 tracking-[0.2em] uppercase" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-4 mb-12" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-sm font-bold text-sm uppercase tracking-wider transition-all border-2 ${activeTab === "TIKKAS" ? "bg-brand-orange border-brand-orange text-white" : "bg-white border-gray-200 text-gray-400"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-sm font-bold text-sm uppercase tracking-wider transition-all border-2 flex items-center gap-2 ${activeTab === "GRAVIES" ? "bg-brand-orange border-brand-orange text-white" : "bg-white border-gray-200 text-gray-400"}`
    },
    "GRAVIES",
    /* @__PURE__ */ React.createElement("span", { className: "bg-green-600 text-white text-[9px] px-1 py-0.5 rounded-sm" }, "NEW")
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-8 md:space-y-0" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-12 py-4 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-colors shadow-lg" }, "Show More (+5)")));
}
export {
  ProductList as default
};
