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
    thumbnails: []
  },
  {
    id: 4,
    name: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    thumbnails: []
  },
  {
    id: 5,
    name: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    thumbnails: []
  },
  {
    id: 6,
    name: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
    thumbnails: []
  }
];
function ProductList({ addToCart }) {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-light text-center mb-8 tracking-widest uppercase" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-12" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex bg-gray-100 rounded-full p-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-8 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "TIKKAS" ? "bg-[#C8553D] text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-8 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "GRAVIES" ? "bg-[#C8553D] text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`
    },
    "GRAVIES",
    /* @__PURE__ */ React.createElement("span", { className: "bg-green-500 text-white text-[10px] px-1 rounded uppercase" }, "New Launch")
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, PRODUCTS.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product, onAdd: addToCart }))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-[#C8553D] text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#a64430] transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
