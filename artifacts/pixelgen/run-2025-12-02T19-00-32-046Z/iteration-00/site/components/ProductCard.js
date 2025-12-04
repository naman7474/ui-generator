import React from "https://esm.sh/react@18";
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-8 items-center md:items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-4" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "w-16 h-16 border border-gray-200 rounded overflow-hidden cursor-pointer hover:border-brand-orange" }, /* @__PURE__ */ React.createElement("img", { src: thumb, alt: "", className: "w-full h-full object-cover" }))))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 md:pl-8 flex flex-col justify-center h-full py-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold uppercase tracking-wide mb-2" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-2 text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors" }, "+ Add"))));
}
export {
  ProductCard as default
};
