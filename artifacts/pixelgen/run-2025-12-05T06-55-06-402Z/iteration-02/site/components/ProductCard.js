import { Plus } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-8 md:gap-16 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "relative rounded-2xl overflow-hidden mb-4 bg-gray-50" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 overflow-x-auto hide-scrollbar" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      alt: `${product.title} thumbnail ${idx + 1}`,
      className: "w-16 h-12 object-cover rounded border border-gray-200 cursor-pointer hover:border-[#D05C35]"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 text-left" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold tracking-wide mb-2 text-[#1C1C1C]" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-medium" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-[#D05C35] text-white px-8 py-2.5 rounded text-sm font-bold tracking-widest hover:bg-[#b84a25] transition-colors flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Plus, { size: 16 }), "ADD")));
}
export {
  ProductCard as default
};
