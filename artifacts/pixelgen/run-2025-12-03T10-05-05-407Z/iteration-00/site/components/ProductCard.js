import React from 'https://esm.sh/react@18?dev';
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-8 md:gap-12 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-[#FFE9BC]" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 overflow-x-auto pb-2" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      alt: "thumbnail",
      className: "w-16 h-16 md:w-20 md:h-20 object-cover rounded-md cursor-pointer border border-[#7f7f7f] hover:border-brand-orange"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 flex flex-col justify-center pt-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-heading font-bold uppercase mb-2 tracking-wide" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-[#7f7f7f] line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-[#2d3748] mb-8 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 w-fit font-bold uppercase tracking-wider hover:bg-[#d44f22] transition-colors rounded-sm" }, "+ Add")));
}
export {
  ProductCard as default
};
