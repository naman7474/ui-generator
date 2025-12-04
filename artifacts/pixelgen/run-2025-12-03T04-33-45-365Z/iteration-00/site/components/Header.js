import React from "https://esm.sh/react@18";
import { ShoppingCart, User } from "https://esm.sh/lucide-react";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "bg-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-brand-orange tracking-tighter" }, "KILRR"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-orange transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 }))));
}
export {
  Header as default
};
