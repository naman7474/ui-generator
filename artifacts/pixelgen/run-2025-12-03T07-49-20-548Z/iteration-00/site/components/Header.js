import React from "https://esm.sh/react@18?dev";
import { ShoppingCart, User } from "https://esm.sh/lucide-react?dev";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-50 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#1a1a1a] text-white text-xs text-center py-2 tracking-widest uppercase" }, "Free Shipping Over \u20B9599"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-brand-orange tracking-tighter", style: { fontFamily: "cursive" } }, "KILRR")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 })))));
}
export {
  Header as default
};
