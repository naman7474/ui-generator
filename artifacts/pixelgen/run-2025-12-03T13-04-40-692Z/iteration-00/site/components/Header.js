import { Search, ShoppingCart, User, Menu } from 'https://esm.sh/lucide-react?dev';


import React from 'https://esm.sh/react@18?dev';
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "w-full sticky top-0 z-50 bg-[rgb(255,255,255)] shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[rgb(0,102,204)] text-[rgb(255,255,255)] text-[10px] md:text-xs py-2 px-4 text-center font-medium tracking-wide" }, "Buy any 2 Products & Get 2 Best Sellers FREE | Use Code : DOUBLEFUN | Extra 5% Off on Prepaid Orders"), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-3 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement(Menu, { className: "w-6 h-6 md:hidden text-[rgb(84,84,84)]" }), /* @__PURE__ */ React.createElement("a", { href: "#", className: "flex items-center" }, /* @__PURE__ */ React.createElement("img", { src: "assets/images/d62380c279.svg", alt: "Aqualogica", className: "h-8" }))), /* @__PURE__ */ React.createElement("nav", { className: "hidden lg:flex items-center gap-6 text-sm font-medium text-[rgb(84,84,84)]" }, /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-[rgb(0,102,204)]" }, "Range"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-[rgb(0,102,204)]" }, "Routine"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-[rgb(0,102,204)]" }, "Skin Concern"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-[rgb(0,102,204)]" }, "Our Story"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-[rgb(0,102,204)]" }, "Track order"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-[rgb(0,102,204)]" }, "Water for all"), /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:text-[rgb(0,102,204)]" }, "Need Help?")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex items-center border border-[rgb(204,204,204)] rounded-full px-3 py-1.5 w-64" }, /* @__PURE__ */ React.createElement(Search, { className: "w-4 h-4 text-[rgb(204,204,204)]" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search for...",
      className: "ml-2 w-full outline-none text-sm text-[rgb(80,80,80)] placeholder-[rgb(204,204,204)]"
    }
  )), /* @__PURE__ */ React.createElement(User, { className: "w-6 h-6 text-[rgb(84,84,84)] cursor-pointer" }), /* @__PURE__ */ React.createElement("div", { className: "relative cursor-pointer" }, /* @__PURE__ */ React.createElement(ShoppingCart, { className: "w-6 h-6 text-[rgb(84,84,84)]" }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-[rgb(0,102,204)] text-[rgb(255,255,255)] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full" }, "0")))));
}
export {
  Header as default
};
