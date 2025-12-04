import React from "https://esm.sh/react@18";
import { ShoppingCart, User } from "https://esm.sh/lucide-react";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-50 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#1a1a1a] text-white text-xs text-center py-2 tracking-widest uppercase font-medium" }, "Free Shipping Over \u20B9599"), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-4 flex justify-between items-center border-b border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl font-extrabold text-[#C8553D] tracking-tighter" }, "KILRR"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-[#C8553D] transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-[#C8553D] transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 })))));
}
export {
  Header as default
};
