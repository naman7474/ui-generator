import React from "https://esm.sh/react@18";
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-8 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-gray-100" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 overflow-x-auto no-scrollbar" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      alt: "thumbnail",
      className: "w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:border-brand-orange"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 md:pl-8 flex flex-col justify-center h-full py-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold uppercase mb-2 tracking-wide" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 w-fit text-sm font-bold uppercase tracking-wider hover:bg-opacity-90 transition-colors" }, "+ ADD")));
}
export {
  ProductCard as default
};
