import React, { useState } from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=100&q=80",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/black/white?text=Cook"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=100&q=80",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/black/white?text=Cook"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=100&q=80",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/black/white?text=Cook"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=100&q=80",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/black/white?text=Cook"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=100&q=80",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/black/white?text=Cook"
    ]
  },
  {
    id: 6,
    title: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://images.unsplash.com/photo-1561651823-34febf5a90aa?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1561651823-34febf5a90aa?auto=format&fit=crop&w=100&q=80",
      "https://placehold.co/100x100/orange/white?text=Pack",
      "https://placehold.co/100x100/black/white?text=Cook"
    ]
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-heading font-medium tracking-wide mb-6" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative inline-flex bg-gray-200 rounded-full p-1 cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "TIKKAS" ? "bg-brand-orange text-white shadow-md" : "text-gray-500"}`,
      onClick: () => setActiveTab("TIKKAS")
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "GRAVIES" ? "bg-brand-orange text-white shadow-md" : "text-gray-500"}`,
      onClick: () => setActiveTab("GRAVIES")
    },
    "GRAVIES"
  )))), /* @__PURE__ */ React.createElement("div", { className: "space-y-20" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
