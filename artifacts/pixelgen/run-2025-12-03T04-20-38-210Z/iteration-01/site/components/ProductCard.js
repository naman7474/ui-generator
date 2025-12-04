import React from "https://esm.sh/react@18";
import { Plus } from "https://esm.sh/lucide-react";
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-6 md:gap-12 items-center mb-8 md:mb-12" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-3 left-3 bg-white px-2 py-1 text-[10px] font-bold rounded shadow-md md:hidden z-10" }, product.boughtToday, " BOUGHT TODAY"), /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg bg-gray-100" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex gap-3 mt-4 overflow-x-auto" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      alt: "thumbnail",
      className: "w-16 h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-brand-rust"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start md:block mb-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl md:text-3xl font-bold uppercase md:mb-2" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 md:mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice))), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6 leading-relaxed text-sm md:text-base" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-rust text-white px-8 py-3 w-full md:w-fit font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors rounded md:rounded-none" }, /* @__PURE__ */ React.createElement(Plus, { size: 18 }), " Add")));
}
export {
  ProductCard as default
};
