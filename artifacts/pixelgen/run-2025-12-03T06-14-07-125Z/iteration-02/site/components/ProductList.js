import React, { useState } from "https://esm.sh/react@18?dev";
const products = [
  {
    id: 1,
    name: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1000&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1628294895950-98052523e036?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 2,
    name: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=1000&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 3,
    name: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1000&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 4,
    name: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505253758473-96b701d2cd3e?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    id: 5,
    name: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop",
    thumbnails: [
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=200&auto=format&fit=crop"
    ]
  }
];
function ProductCard({ product }) {
  const [mainImage, setMainImage] = useState(product.image);
  return /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-16 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] w-full overflow-hidden rounded-lg mb-4 bg-gray-100" }, /* @__PURE__ */ React.createElement("img", { src: mainImage, alt: product.name, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500" })), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 overflow-x-auto pb-2 hide-scrollbar" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      onClick: () => setMainImage(product.image),
      className: `w-16 h-16 md:w-20 md:h-20 object-cover rounded cursor-pointer border-2 ${mainImage === product.image ? "border-brand-orange" : "border-transparent"}`
    }
  ), product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      onClick: () => setMainImage(thumb),
      className: `w-16 h-16 md:w-20 md:h-20 object-cover rounded cursor-pointer border-2 ${mainImage === thumb ? "border-brand-orange" : "border-transparent"}`
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full flex flex-col justify-start pt-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-baseline mb-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg md:text-2xl font-bold uppercase tracking-wide" }, product.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice))), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-4 leading-relaxed text-sm md:text-base" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-6 py-2 md:px-8 md:py-3 rounded font-bold uppercase tracking-wider hover:bg-orange-800 transition-colors self-start" }, "+ Add")));
}
function ProductList() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 px-4 md:px-12 max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif font-black tracking-widest uppercase mb-8" }, "New Flavor Everyday"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-4 mb-12" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-6 py-2 rounded-full font-bold uppercase text-sm flex items-center gap-2" }, "Tikkas ", /* @__PURE__ */ React.createElement("span", { className: "bg-white text-brand-orange rounded-full w-5 h-5 flex items-center justify-center text-xs" }, "\u{1F525}")), /* @__PURE__ */ React.createElement("button", { className: "bg-white border border-gray-300 text-gray-500 px-6 py-2 rounded-full font-bold uppercase text-sm hover:border-brand-orange hover:text-brand-orange transition-colors" }, "Gravies"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-12" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-12 py-3 rounded font-bold uppercase tracking-wider hover:bg-orange-800 transition-colors" }, "Show More (+5)")));
}
export {
  ProductList as default
};
