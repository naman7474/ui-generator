import { Star } from 'https://esm.sh/react@18?dev';

import React from 'https://esm.sh/react@18?dev';
function ProductCard({ product }) {
  const {
    title,
    subtitle,
    price,
    originalPrice,
    rating,
    reviews,
    weight,
    tag,
    tagColor,
    image,
    timer
  } = product;
  const discount = originalPrice ? Math.round((originalPrice - price) / originalPrice * 100) : 0;
  const tagClasses = {
    primary: "bg-primary",
    slate: "bg-slate",
    medium: "bg-medium",
    dark: "bg-dark"
  };
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg border border-light shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group" }, timer ? /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-0 z-10 bg-slate text-white text-[10px] font-bold px-2 py-1 rounded-br-lg flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u23F0"), " ", tag) : tag ? /* @__PURE__ */ React.createElement("div", { className: `absolute top-0 left-0 z-10 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg ${tagClasses[tagColor] || "bg-medium"}` }, tag) : null, /* @__PURE__ */ React.createElement("div", { className: "relative w-full aspect-square bg-white p-4 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: image,
      alt: title,
      className: "max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm border border-light" }, /* @__PURE__ */ React.createElement("span", { className: "text-primary" }, rating), /* @__PURE__ */ React.createElement(Star, { className: "w-3 h-3 fill-primary text-primary" }), /* @__PURE__ */ React.createElement("span", { className: "text-light font-normal" }, "| ", reviews)), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold shadow-sm border border-light text-medium" }, weight)), /* @__PURE__ */ React.createElement("div", { className: "p-3 flex flex-col flex-grow" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-dark text-sm truncate", title }, title), /* @__PURE__ */ React.createElement("p", { className: "text-medium text-xs truncate mb-2", title: subtitle }, subtitle), /* @__PURE__ */ React.createElement("div", { className: "mt-auto flex items-center gap-2 mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-lg text-dark" }, "\u20B9", price), originalPrice && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "text-light line-through text-sm" }, "\u20B9", originalPrice), /* @__PURE__ */ React.createElement("span", { className: "text-primary text-xs font-bold" }, discount, "% OFF"))), /* @__PURE__ */ React.createElement("button", { className: "w-full bg-primary text-white font-bold py-2 rounded text-sm hover:bg-opacity-90 transition-colors" }, "Add to cart")));
}
export {
  ProductCard as default
};
