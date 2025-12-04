import React from "https://esm.sh/react@18.2.0?dev";
import { ShoppingCart, User } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-40 bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-black text-white text-center py-2 text-xs tracking-widest uppercase font-medium" }, "Free Shipping Over \u20B9599"), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-4 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-24" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-display font-bold text-brand-orange tracking-tighter cursor-pointer" }, "KILRR")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 })))));
}
export {
  Header as default
};
