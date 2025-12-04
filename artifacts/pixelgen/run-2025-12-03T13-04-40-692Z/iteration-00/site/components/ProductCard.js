import { Star } from 'https://esm.sh/lucide-react?dev';


import React from 'https://esm.sh/react@18?dev';
function ProductCard({ product }) {
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[rgb(255,255,255)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[rgb(204,204,204)] flex flex-col h-full" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, product.badge && /* @__PURE__ */ React.createElement("div", { className: `absolute top-2 left-2 bg-[rgb(0,102,204)] text-[rgb(255,255,255)] text-[10px] font-bold px-2 py-1 rounded-sm z-10 uppercase tracking-wider` }, product.badge), /* @__PURE__ */ React.createElement("div", { className: "aspect-square overflow-hidden bg-[rgb(242,242,242)]" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.image,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 left-2 right-2 bg-[rgba(255,255,255,0.9)] backdrop-blur-sm rounded-md px-2 py-1 flex items-center justify-between text-xs font-medium shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold" }, product.rating), /* @__PURE__ */ React.createElement(Star, { className: "w-3 h-3 fill-[rgb(0,102,204)] text-[rgb(0,102,204)]" }), /* @__PURE__ */ React.createElement("span", { className: "text-[rgb(80,80,80)]" }, "| ", product.reviews)), /* @__PURE__ */ React.createElement("span", { className: "text-[rgb(80,80,80)]" }, product.weight))), /* @__PURE__ */ React.createElement("div", { className: "p-4 flex flex-col flex-grow" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-[rgb(29,29,29)] text-sm mb-1 line-clamp-1" }, product.title), /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(80,80,80)] text-xs mb-3 line-clamp-1" }, product.desc), /* @__PURE__ */ React.createElement("div", { className: "mt-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-lg" }, "\u20B9", product.price), product.originalPrice && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "text-[rgb(204,204,204)] text-sm line-through" }, "\u20B9", product.originalPrice), /* @__PURE__ */ React.createElement("span", { className: "text-[rgb(0,102,204)] text-xs font-bold" }, product.discount))), /* @__PURE__ */ React.createElement("button", { className: "w-full bg-[rgb(0,102,204)] text-[rgb(255,255,255)] py-2 rounded-md font-bold text-sm hover:bg-[rgb(0,102,204)] transition-colors" }, "Add to cart"))));
}
export {
  ProductCard as default
};
