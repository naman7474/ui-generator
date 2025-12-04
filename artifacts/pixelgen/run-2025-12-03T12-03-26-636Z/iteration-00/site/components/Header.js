import { Search, ShoppingCart, User, Menu } from 'https://esm.sh/react@18?dev';

import React from 'https://esm.sh/react@18?dev';
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "w-full z-50" }, /* @__PURE__ */ React.createElement("div", { className: "bg-primary text-white text-xs md:text-sm text-center py-2 px-4 font-medium" }, "Buy any 2 Products & Get 2 Best Sellers FREE | Use Code : DOUBLEFUN | Extra 5% Off on Prepaid Orders"), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow-sm sticky top-0" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-3 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("button", { className: "lg:hidden" }, /* @__PURE__ */ React.createElement(Menu, { className: "w-6 h-6 text-medium" })), /* @__PURE__ */ React.createElement("a", { href: "#", className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("img", { src: "assets/images/d62380c279.svg", alt: "Aqualogica", className: "h-8 md:h-10" }))), /* @__PURE__ */ React.createElement("nav", { className: "hidden lg:flex items-center gap-6 text-sm font-medium text-medium" }, /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-primary" }, "Range"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-primary" }, "Routine"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-primary" }, "Skin Concern"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-primary" }, "Our Story"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-primary" }, "Track order"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-primary" }, "Water for all"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-primary" }, "Need Help?")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex items-center border border-light rounded-full px-3 py-1.5 w-64" }, /* @__PURE__ */ React.createElement(Search, { className: "w-4 h-4 text-light" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search for a...",
      className: "ml-2 w-full outline-none text-sm text-medium placeholder-light"
    }
  )), /* @__PURE__ */ React.createElement("button", { className: "text-medium hover:text-primary" }, /* @__PURE__ */ React.createElement(User, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("button", { className: "text-medium hover:text-primary relative" }, /* @__PURE__ */ React.createElement(ShoppingCart, { className: "w-6 h-6" }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" }, "0"))))));
}
export {
  Header as default
};
