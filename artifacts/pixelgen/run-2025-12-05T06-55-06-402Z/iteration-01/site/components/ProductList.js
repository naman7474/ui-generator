import { Flame, UtensilsCrossed } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "./assets/images/91ede9bca7.png",
    thumbnails: [
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "./assets/images/91ede9bca7.png",
    thumbnails: [
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "./assets/images/91ede9bca7.png",
    thumbnails: [
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "./assets/images/91ede9bca7.png",
    thumbnails: [
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "./assets/images/91ede9bca7.png",
    thumbnails: [
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png"
    ]
  },
  {
    id: 6,
    title: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "./assets/images/91ede9bca7.png",
    thumbnails: [
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png",
      "./assets/images/91ede9bca7.png"
    ]
  }
];
function ProductList() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "NEW FLAVOR EVERYDAY", className: "py-16 px-4 md:px-8 max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl text-center mb-8 tracking-wide text-[#1C1C1C]" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-4 mb-16" }, /* @__PURE__ */ React.createElement("button", { className: "flex items-center gap-2 bg-[#D05C35] text-white px-6 py-2 rounded-full text-sm font-bold tracking-wider" }, /* @__PURE__ */ React.createElement(Flame, { size: 16, fill: "currentColor" }), "TIKKAS"), /* @__PURE__ */ React.createElement("button", { className: "flex items-center gap-2 bg-white border border-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm font-bold tracking-wider hover:bg-gray-50" }, /* @__PURE__ */ React.createElement(UtensilsCrossed, { size: 16 }), "GRAVIES")), /* @__PURE__ */ React.createElement("div", { className: "space-y-24" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-[#D05C35] text-white px-8 py-3 rounded text-sm font-bold tracking-widest hover:bg-[#b84a25] transition-colors" }, "SHOW MORE (+5)")));
}
export {
  ProductList as default
};
