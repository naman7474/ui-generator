import React, { useState } from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    images: [
      "assets/images/8bee64915c.png",
      "assets/images/37401f88bf.png",
      "assets/images/e1f6f7cd45.png"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    images: [
      "assets/images/47553d85b2.png",
      "assets/images/fc841e80a7.png",
      "assets/images/e8663f41c3.png"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    images: [
      "assets/images/e5948e9067.png",
      "assets/images/0b6946f434.png",
      "assets/images/cac0fcf75e.png"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    images: [
      "assets/images/1a7d73102c.png",
      "assets/images/ce17942610.png",
      "assets/images/54cfe34106.png"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    images: [
      "assets/images/a4f1e17947.png",
      "assets/images/156cfc932c.png",
      "assets/images/c610f5f78c.png"
    ]
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-heading text-center mb-8 tracking-wide uppercase" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-12 space-x-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-full font-bold text-sm uppercase transition-all ${activeTab === "TIKKAS" ? "bg-[rgb(212,79,34)] text-white" : "bg-[rgb(255,233,188)] text-[rgb(45,55,72)] hover:bg-[rgb(212,79,34)] hover:text-white"}`
    },
    "Tikkas"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-full font-bold text-sm uppercase transition-all flex items-center ${activeTab === "GRAVIES" ? "bg-[rgb(212,79,34)] text-white" : "bg-[rgb(255,233,188)] text-[rgb(45,55,72)] hover:bg-[rgb(212,79,34)] hover:text-white"}`
    },
    "Gravies",
    /* @__PURE__ */ React.createElement("span", { className: "ml-2 bg-[rgb(30,30,30)] text-white text-[10px] px-1.5 py-0.5 rounded uppercase" }, "New Launch")
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-[rgb(212,79,34)] text-white px-8 py-3 rounded font-bold uppercase text-sm hover:bg-[rgb(196,79,34)] transition-colors" }, "Show More (+5)"))));
}
export {
  ProductList as default
};
