import React from "https://esm.sh/react@18.2.0?dev";
import { ShoppingCart, User } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "bg-kilrr-dark text-white text-center py-2 text-xs font-bold tracking-widest uppercase" }, "Free Shipping Over \u20B9599"), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-4 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-kilrr-orange tracking-tighter", style: { fontFamily: "Playfair Display" } }, "KILRR")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-kilrr-orange transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-kilrr-orange transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 })))));
}
export {
  Header as default
};
