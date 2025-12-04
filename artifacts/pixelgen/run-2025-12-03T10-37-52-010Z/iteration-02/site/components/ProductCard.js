import React from 'https://esm.sh/react@18?dev';
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-8 md:mb-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 relative" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-brand-peach relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-3 left-3 bg-white px-2 py-1 rounded text-[10px] font-bold z-10 shadow-sm md:hidden" }, /* @__PURE__ */ React.createElement("span", { className: "text-brand-orange" }, "\u{1F525}"), " ", product.boughtToday, " BOUGHT TODAY"), /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 md:hidden" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-white" }), /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-white/50" }), /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-white/50" }))), /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex gap-3 overflow-x-auto pb-2" }, product.thumbnails.map((thumb, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: thumb,
      alt: "thumbnail",
      className: "w-16 h-16 md:w-20 md:h-20 object-cover rounded-md cursor-pointer border border-brand-peach hover:border-brand-orange"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mt-2 justify-center md:justify-start" }, [1, 2, 3, 4].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "w-8 h-8 rounded-full bg-white border border-gray-200 p-1 flex items-center justify-center" }, /* @__PURE__ */ React.createElement("svg", { className: "w-4 h-4 text-brand-orange", fill: "currentColor", viewBox: "0 0 20 20" }, /* @__PURE__ */ React.createElement("path", { d: "M10 2a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 2zM10 18a.75.75 0 01.75-.75v-3.5a.75.75 0 01-1.5 0v3.5A.75.75 0 0110 18zM18 10a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5h3.5A.75.75 0 0118 10zM2 10a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5A.75.75 0 012 10z" })))))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 flex flex-col justify-center pt-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-heading font-bold uppercase mb-2 tracking-[0.5px]" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-bold font-heading" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-allowed-grayMid line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-allowed-grayDark mb-8 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-2.5 w-full md:w-fit font-bold uppercase tracking-wider hover:opacity-90 transition-opacity rounded-[2px]" }, "+ Add")));
}
export {
  ProductCard as default
};
