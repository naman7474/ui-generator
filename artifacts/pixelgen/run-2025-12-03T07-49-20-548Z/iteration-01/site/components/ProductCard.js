import React from "https://esm.sh/react@18?dev";
import { Plus, Flame } from "https://esm.sh/lucide-react?dev";
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-6 md:gap-12 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 relative" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 mb-4 relative" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Flame, { size: 14, className: "text-brand-orange fill-brand-orange" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wide text-brand-dark" }, product.boughtCount, " Bought Today"))), /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex gap-3 overflow-x-auto pb-2" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      alt: "thumbnail",
      className: "w-20 h-20 object-cover rounded border border-gray-200 cursor-pointer hover:border-brand-orange"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "md:hidden flex justify-center gap-2 mt-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-brand-orange" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-gray-300" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-gray-300" }))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 flex flex-col justify-center md:pt-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-black" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-lg" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 leading-relaxed text-sm md:text-base max-w-md" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 rounded w-fit flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200" }, /* @__PURE__ */ React.createElement(Plus, { size: 18 }), " Add")));
}
export {
  ProductCard as default
};
