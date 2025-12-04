import React, { useState } from "https://esm.sh/react@18?dev";
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 79,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=100&auto=format&fit=crop"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 79,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=100&auto=format&fit=crop"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 79,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1606659986267-62956a692281?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1606659986267-62956a692281?q=80&w=100&auto=format&fit=crop"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 79,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=100&auto=format&fit=crop"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 79,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=100&auto=format&fit=crop"
    ]
  },
  {
    id: 6,
    title: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 79,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=100&auto=format&fit=crop"
    ]
  }
];
function ProductSection() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 px-4 md:px-8 max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif tracking-wide mb-8" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center justify-center gap-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "TIKKAS" ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-500"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "GRAVIES" ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-500"}`
    },
    "GRAVIES"
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors" }, "Show More (+5)")));
}
export {
  ProductSection as default
};
