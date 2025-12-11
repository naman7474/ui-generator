import { ShoppingCart, Menu } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
function Header() {
  return /* @__PURE__ */ React.createElement("header", { "data-section": "section" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[rgb(30,30,30)] text-white text-center py-2.5 text-xs md:text-sm font-bold tracking-wider" }, "FREE SHIPPING OVER \u20B9399"), /* @__PURE__ */ React.createElement("div", { className: "bg-white py-4 px-6 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto flex justify-between items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement(Menu, { className: "w-6 h-6 md:hidden text-[rgb(30,30,30)]" }), /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "./assets/images/1f223ac12b.png",
      alt: "KILRR Logo",
      className: "h-8 md:h-12 object-contain"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement(ShoppingCart, { className: "w-6 h-6 text-[rgb(30,30,30)]" })))));
}
export {
  Header as default
};
