import React from "https://esm.sh/react@18";
import { ShoppingCart, User } from "https://esm.sh/lucide-react";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#1a1a1a] text-white text-xs font-bold text-center py-2 tracking-widest uppercase" }, "Free Shipping Over \u20B9599"), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-4 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl font-black text-brand-orange tracking-tighter" }, "KILRR"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 })))));
}
export {
  Header as default
};
