import React, { useState } from "https://esm.sh/react@18.2.0?dev";
import { Plus } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
const products = [
  {
    id: 1,
    name: "TANDOORI BLAST",
    price: 69,
    originalPrice: 70,
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    thumbnails: ["https://placehold.co/50x50", "https://placehold.co/50x50", "https://placehold.co/50x50"]
  },
  {
    id: 2,
    name: "SAZA-E-KAALIMIRCH",
    price: 69,
    originalPrice: 70,
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    image: "https://images.unsplash.com/photo-1606659898893-624c73302306?auto=format&fit=crop&w=800&q=80",
    thumbnails: ["https://placehold.co/50x50", "https://placehold.co/50x50", "https://placehold.co/50x50"]
  },
  {
    id: 3,
    name: "PAAPI PUDINA",
    price: 69,
    originalPrice: 70,
    description: "The tang hits, world fades & you get caught licking your fingers.",
    image: "https://images.unsplash.com/photo-1626776420079-fa5ad479f466?auto=format&fit=crop&w=800&q=80",
    thumbnails: ["https://placehold.co/50x50", "https://placehold.co/50x50", "https://placehold.co/50x50"]
  },
  {
    id: 4,
    name: "DHANIYA MIRCHI AUR WOH",
    price: 69,
    originalPrice: 70,
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80",
    thumbnails: ["https://placehold.co/50x50", "https://placehold.co/50x50", "https://placehold.co/50x50"]
  },
  {
    id: 5,
    name: "GANGS OF AWADH",
    price: 69,
    originalPrice: 70,
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    thumbnails: ["https://placehold.co/50x50", "https://placehold.co/50x50", "https://placehold.co/50x50"]
  },
  {
    id: 6,
    name: "SHAWARMA JI KA BETA",
    price: 69,
    originalPrice: 70,
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
    thumbnails: ["https://placehold.co/50x50", "https://placehold.co/50x50", "https://placehold.co/50x50"]
  }
];
function ProductList() {
  const [activeTab, setActiveTab] = useState("TIKKAS");
  return /* @__PURE__ */ React.createElement("section", { className: "py-12 container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-10" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif mb-6 tracking-wide" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center space-x-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("TIKKAS"),
      className: `px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === "TIKKAS" ? "bg-kilrr-orange text-white" : "bg-gray-200 text-gray-600"}`
    },
    "TIKKAS"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("GRAVIES"),
      className: `px-6 py-2 rounded-full font-bold text-sm flex items-center transition-colors ${activeTab === "GRAVIES" ? "bg-kilrr-orange text-white" : "bg-gray-200 text-gray-600"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "bg-green-500 text-white text-[10px] px-1 rounded mr-2 uppercase" }, "New Launch"),
    "GRAVIES"
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-16" }, products.map((product) => /* @__PURE__ */ React.createElement("div", { key: product.id, className: "flex flex-col md:flex-row gap-8 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4" }, /* @__PURE__ */ React.createElement("img", { src: product.image, alt: product.name, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500" })), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement("img", { key: idx, src: thumb, alt: "thumbnail", className: "w-16 h-12 object-cover rounded border border-gray-200 cursor-pointer hover:border-kilrr-orange" })))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 text-left" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold mb-2" }, product.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-kilrr-orange text-white px-8 py-3 rounded font-bold hover:bg-orange-700 transition-colors flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Plus, { size: 18 }), " ADD"))))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-16" }, /* @__PURE__ */ React.createElement("button", { className: "bg-kilrr-orange text-white px-10 py-3 rounded font-bold hover:bg-orange-700 transition-colors" }, "SHOW MORE (+5)")));
}
export {
  ProductList as default
};
