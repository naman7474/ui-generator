import React from "https://esm.sh/react@18";
function ProductCard({ product, onAdd }) {
  return /* @__PURE__ */ React.createElement("div", { className: "group" }, /* @__PURE__ */ React.createElement("div", { className: "md:hidden flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "relative aspect-[4/3]" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.name,
      className: "w-full h-full object-cover"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 left-4 bg-white text-black text-[10px] px-3 py-1 rounded-full font-bold uppercase shadow-md" }, product.boughtCount, " Bought Today")), /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold uppercase leading-tight w-2/3" }, product.name), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-end" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-red-500 line-through text-xs font-bold" }, "\u20B9", product.originalPrice))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 mb-4 line-clamp-2" }, product.description), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onAdd,
      className: "w-full bg-[#C04B28] text-white py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#a64430] transition-colors rounded-sm"
    },
    "+ Add"
  ))), /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex flex-row items-center gap-12" }, /* @__PURE__ */ React.createElement("div", { className: "w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 relative" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.name,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-700"
    }
  )), product.thumbnails.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 mt-4" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      alt: "Thumbnail",
      className: "w-20 h-20 object-cover rounded border border-gray-200 cursor-pointer hover:border-[#C04B28]"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-1/2 flex flex-col items-start text-left" }, /* @__PURE__ */ React.createElement("h3", { className: "text-3xl font-bold uppercase mb-4 tracking-wide" }, product.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 mb-6" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-[#e74c3c] line-through text-lg font-bold" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 text-lg leading-relaxed max-w-md" }, product.description), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onAdd,
      className: "bg-[#C04B28] text-white px-10 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#a64430] transition-colors rounded-sm"
    },
    "+ Add"
  ))));
}
export {
  ProductCard as default
};
