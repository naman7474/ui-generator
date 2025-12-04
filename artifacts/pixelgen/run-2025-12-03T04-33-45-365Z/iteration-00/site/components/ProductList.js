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
    thumbnails: [
      "https://images.unsplash.com/photo-1628294895950-98052523e036?q=80&w=100&auto=format&fit=crop",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/green/white?text=Cook"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=100&auto=format&fit=crop",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/green/white?text=Cook"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=100&auto=format&fit=crop",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/green/white?text=Cook"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=100&auto=format&fit=crop",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/green/white?text=Cook"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=100&auto=format&fit=crop",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/green/white?text=Cook"
    ]
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 px-4 md:px-8 max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-light text-center mb-8 tracking-widest uppercase" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-4 mb-12" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "TIKKAS" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-600"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "GRAVIES" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-600"}`
    },
    "GRAVIES",
    /* @__PURE__ */ React.createElement("span", { className: "bg-green-500 text-white text-[10px] px-1 rounded" }, "NEW")
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-opacity-90 transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
