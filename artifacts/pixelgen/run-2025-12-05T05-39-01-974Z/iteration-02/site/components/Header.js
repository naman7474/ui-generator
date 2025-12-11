import { Search, User, ShoppingCart } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
function Header() {
  return /* @__PURE__ */ React.createElement("header", { "data-section": "Header", className: "bg-white text-[#1c1c1c] sticky top-0 z-50 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1280px] mx-auto px-4 md:px-8 flex justify-between items-center py-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-8" }, /* @__PURE__ */ React.createElement("a", { href: "#" }, /* @__PURE__ */ React.createElement("img", { src: "./assets/images/1f223ac12b.png", alt: "KILRR Logo", className: "h-9" })), /* @__PURE__ */ React.createElement("nav", { className: "hidden md:flex gap-8" }, /* @__PURE__ */ React.createElement("a", { href: "#", className: "text-xs font-bold tracking-[0.2em] uppercase hover:text-[#ff6b35]" }, "TIKKAS"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "text-xs font-bold tracking-[0.2em] uppercase hover:text-[#ff6b35]" }, "GRAVIES"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "text-xs font-bold tracking-[0.2em] uppercase hover:text-[#ff6b35]" }, "COMBOS"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-[#ff6b35]" }, /* @__PURE__ */ React.createElement(Search, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-[#ff6b35]" }, /* @__PURE__ */ React.createElement(User, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-[#ff6b35]" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })))));
}
export {
  Header as default
};
