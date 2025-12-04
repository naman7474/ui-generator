import React, { useState } from "https://esm.sh/react@18?dev";
const products = [
  {
    id: 1,
    title: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1628294895950-98052523e036?auto=format&fit=crop&w=100&q=60",
      "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=100&q=60",
      "https://images.unsplash.com/photo-1514516872020-25ce19f96c2f?auto=format&fit=crop&w=100&q=60"
    ]
  },
  {
    id: 2,
    title: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=100&q=60",
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=100&q=60"
    ]
  },
  {
    id: 3,
    title: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=100&q=60",
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=100&q=60"
    ]
  },
  {
    id: 4,
    title: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=100&q=60",
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=100&q=60"
    ]
  },
  {
    id: 5,
    title: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=100&q=60",
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=100&q=60"
    ]
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif mb-6 tracking-wide" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center bg-gray-100 rounded-full p-1 border border-gray-200" }, /* @__PURE__ */ React.createElement(
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
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-24" }, products.map((product, index) => /* @__PURE__ */ React.createElement("div", { key: product.id, className: `flex flex-col md:flex-row gap-8 md:gap-16 items-center ${index % 2 !== 0 ? "" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg mb-4 shadow-lg" }, /* @__PURE__ */ React.createElement("img", { src: product.image, alt: product.title, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500" })), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 overflow-x-auto pb-2" }, product.thumbnails.map((thumb, i) => /* @__PURE__ */ React.createElement("img", { key: i, src: thumb, alt: "thumbnail", className: "w-20 h-20 object-cover rounded-md cursor-pointer border border-gray-200 hover:border-brand-orange" })))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 text-left" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold font-sans mb-2 uppercase tracking-wide" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 rounded text-sm font-bold tracking-wider hover:bg-[#b04630] transition-colors shadow-md" }, "+ ADD"))))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-10 py-3 rounded text-sm font-bold tracking-wider hover:bg-[#b04630] transition-colors shadow-lg" }, "SHOW MORE (+5)")));
}
export {
  ProductList as default
};
