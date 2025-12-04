import { Star } from 'lucide-react';


import React from 'https://esm.sh/react@18?dev';
function ProductCard({ product, isLightning }) {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col min-w-[240px] max-w-[240px]" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, isLightning ? /* @__PURE__ */ React.createElement("div", { className: "absolute top-2 left-2 bg-[rgb(52,64,84)] text-white text-[10px] font-bold px-2 py-1 rounded flex items-center" }, /* @__PURE__ */ React.createElement("span", { className: "mr-1" }, "\u23F1"), " ", product.timer) : /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-0 bg-[rgb(52,64,84)] text-white text-[10px] font-bold px-3 py-1 rounded-br-lg" }, "Best Seller"), /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-48 object-contain bg-gray-50 p-4"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold flex items-center shadow-sm" }, /* @__PURE__ */ React.createElement(Star, { size: 10, className: "text-yellow-500 fill-yellow-500 mr-1" }), product.rating, " | ", product.reviews), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium shadow-sm" }, product.weight)), /* @__PURE__ */ React.createElement("div", { className: "p-3 flex flex-col flex-1" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-gray-800 line-clamp-2 mb-1 h-10" }, product.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 line-clamp-1 mb-3" }, product.subtitle), /* @__PURE__ */ React.createElement("div", { className: "mt-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-bold text-gray-900" }, "\u20B9", product.price), product.originalPrice && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400 line-through mx-2" }, "\u20B9", product.originalPrice), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-red-500 font-bold" }, product.discount, " OFF"))), /* @__PURE__ */ React.createElement("button", { className: "w-full bg-[rgb(0,102,204)] hover:bg-[rgb(0,102,204)] text-white font-semibold py-2 rounded-md text-sm transition-colors" }, "Add to cart"))));
}
export {
  ProductCard as default
};
