import { ShoppingCart, User } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
function Header() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "Header", className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#1C1C1C] text-white text-[10px] tracking-[0.15em] py-2.5 text-center font-medium" }, "FREE SHIPPING OVER \u20B9399"), /* @__PURE__ */ React.createElement("nav", { className: "flex justify-between items-center px-6 md:px-12 py-4 bg-white sticky top-0 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "./assets/images/1f223ac12b.png",
      alt: "KILRR Logo",
      className: "h-8 md:h-10 w-auto object-contain"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "text-gray-800 hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("button", { className: "text-gray-800 hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(User, { className: "w-5 h-5" })))));
}
export {
  Header as default
};
