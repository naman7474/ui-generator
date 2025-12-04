import React from "https://esm.sh/react@18";
import { ShoppingCart, User } from "https://esm.sh/lucide-react";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "bg-black text-white text-xs font-bold text-center py-2 tracking-[1px] uppercase" }, "Free Shipping Over \u20B9399"), /* @__PURE__ */ React.createElement("div", { className: "relative flex justify-center md:justify-between items-center px-5 py-4 md:px-12 md:py-5" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl md:text-4xl font-display font-bold text-brand-rust tracking-tighter" }, "KILRR"), /* @__PURE__ */ React.createElement("div", { className: "absolute right-5 top-1/2 -translate-y-1/2 md:static md:translate-y-0 flex items-center gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-brand-rust transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hidden md:block hover:text-brand-rust transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 })))));
}
export {
  Header as default
};
