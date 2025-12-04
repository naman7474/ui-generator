import React, { useState } from 'https://esm.sh/react@18?dev';
import { Plus } from 'https://esm.sh/react@18?dev';
const products = [
  {
    id: 1,
    name: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "assets/images/b975cbabed.png",
    thumbnails: ["assets/images/b975cbabed.png", "assets/images/b975cbabed.png"]
  },
  {
    id: 2,
    name: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://shop.kilrr.com/_next/image?url=https%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F0833%2F6929%2F6158%2Ffiles%2FWhatsApp_Image_2025-10-13_at_5.22.18_PM_1.jpg%3Fv%3D1760356509&w=1920&q=85",
    thumbnails: ["assets/images/b975cbabed.png"]
  },
  {
    id: 3,
    name: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://shop.kilrr.com/_next/image?url=https%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F0833%2F6929%2F6158%2Ffiles%2F2_gravies.webp%3Fv%3D1764231414&w=1920&q=85",
    thumbnails: ["assets/images/b975cbabed.png"]
  },
  {
    id: 4,
    name: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "assets/images/b975cbabed.png",
    thumbnails: ["assets/images/b975cbabed.png"]
  },
  {
    id: 5,
    name: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://shop.kilrr.com/_next/image?url=https%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F0833%2F6929%2F6158%2Ffiles%2FWhatsApp_Image_2025-10-13_at_5.22.18_PM_1.jpg%3Fv%3D1760356509&w=1920&q=85",
    thumbnails: ["assets/images/b975cbabed.png"]
  },
  {
    id: 6,
    name: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://shop.kilrr.com/_next/image?url=https%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F0833%2F6929%2F6158%2Ffiles%2F2_gravies.webp%3Fv%3D1764231414&w=1920&q=85",
    thumbnails: ["assets/images/b975cbabed.png"]
  }
];
function ProductList({ addToCart }) {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-light tracking-widest uppercase mb-8" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center gap-4" }, /* @__PURE__ */ React.createElement(
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
      className: `px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "GRAVIES" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-600"}`
    },
    "GRAVIES"
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-24" }, products.map((product) => /* @__PURE__ */ React.createElement("div", { key: product.id, className: "flex flex-col md:flex-row gap-8 md:gap-16 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-gray-100" }, /* @__PURE__ */ React.createElement("img", { src: product.image, alt: product.name, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500" })), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 overflow-x-auto pb-2" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement("img", { key: idx, src: thumb, alt: "", className: "w-16 h-16 rounded-md object-cover cursor-pointer border border-gray-200 hover:border-brand-orange" })))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 text-left" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold uppercase mb-2" }, product.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: addToCart,
      className: "bg-brand-orange text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-opacity-90 transition-colors flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 16 }),
    " Add"
  ))))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-12 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-opacity-90 transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
