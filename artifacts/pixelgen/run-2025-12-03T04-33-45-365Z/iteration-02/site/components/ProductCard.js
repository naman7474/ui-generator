import React from "https://esm.sh/react@18";
import { Flame } from "https://esm.sh/lucide-react";
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-6 md:gap-16 items-center border-b border-gray-100 py-8 md:py-12 last:border-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 relative" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 shadow-md" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-700"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10" }, /* @__PURE__ */ React.createElement(Flame, { size: 14, className: "fill-orange-500 text-orange-500" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wide" }, product.boughtCount, " Bought Today")), /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex justify-center gap-2 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-gray-800" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-gray-300" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-gray-300" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-gray-300" }))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 flex flex-col justify-center" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl md:text-2xl font-bold uppercase mb-3 tracking-wide text-brand-dark" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 mb-6" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-brand-dark" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-lg decoration-1" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 leading-relaxed text-sm md:text-base max-w-md" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-10 py-3 w-full md:w-fit text-sm font-bold uppercase tracking-widest hover:bg-[#b54000] transition-colors rounded-sm shadow-md" }, "+ Add")));
}
export {
  ProductCard as default
};
