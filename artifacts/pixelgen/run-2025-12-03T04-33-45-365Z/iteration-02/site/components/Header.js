import React from "https://esm.sh/react@18";
import { ShoppingCart, User, Menu } from "https://esm.sh/lucide-react";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "bg-white py-4 px-4 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "md:hidden" }, /* @__PURE__ */ React.createElement(Menu, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "text-3xl md:text-4xl text-brand-orange font-brush tracking-wider transform -rotate-2" }, "KILRR"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 md:gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors hidden md:block" }, /* @__PURE__ */ React.createElement(User, { size: 22 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 22 }))));
}
export {
  Header as default
};
