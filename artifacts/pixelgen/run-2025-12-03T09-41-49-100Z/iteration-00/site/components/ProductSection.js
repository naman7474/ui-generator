import React, { useState } from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1628294895950-98052523e036?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?q=80&w=800&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=200&auto=format&fit=crop"
    ]
  }
];
function ProductSection() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-12 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl text-center font-light tracking-widest mb-8 uppercase" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-12" }, /* @__PURE__ */ React.createElement("div", { className: "flex bg-gray-100 rounded-full p-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "TIKKAS" ? "bg-brand-orange text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "GRAVIES" ? "bg-brand-orange text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`
    },
    "GRAVIES"
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 text-center" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors" }, "Show More (+5)")));
}
export {
  ProductSection as default
};
