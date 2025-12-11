import { ShoppingCart, User } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
function Header() {
  return /* @__PURE__ */ React.createElement("header", { "data-section": "section", className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#1c1c1c] text-white text-center py-2 text-xs font-medium" }, /* @__PURE__ */ React.createElement("p", null, "FREE SHIPPING OVER \u20B9399")), /* @__PURE__ */ React.createElement("div", { className: "bg-white border-b" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20" }, /* @__PURE__ */ React.createElement("a", { href: "#", "aria-label": "KILRR Home" }, /* @__PURE__ */ React.createElement("img", { src: "./assets/images/1f223ac12b.png", alt: "KILRR Logo", className: "h-10 w-auto" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement("button", { className: "relative", "aria-label": "Shopping Cart" }, /* @__PURE__ */ React.createElement(ShoppingCart, { className: "h-6 w-6 text-zinc-800" })), /* @__PURE__ */ React.createElement("button", { "aria-label": "User Account" }, /* @__PURE__ */ React.createElement(User, { className: "h-6 w-6 text-zinc-800" }))))));
}
export {
  Header as default
};
