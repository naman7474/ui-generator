import React from "https://esm.sh/react@18";
import { ShoppingCart, User } from "https://esm.sh/lucide-react";
function Header() {
  return /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-50 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "bg-black text-white text-[10px] text-center py-2 tracking-widest uppercase font-medium" }, "Free Shipping Over \u20B9399"), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-4 flex justify-between items-center border-b border-gray-100 relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-1 text-center md:text-left" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl font-extrabold text-[#C04B28] tracking-tighter" }, "KILRR")), /* @__PURE__ */ React.createElement("div", { className: "md:hidden w-10" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6 ml-auto" }, /* @__PURE__ */ React.createElement("button", { className: "hover:text-[#C04B28] transition-colors" }, /* @__PURE__ */ React.createElement(User, { size: 20 })), /* @__PURE__ */ React.createElement("button", { className: "hover:text-[#C04B28] transition-colors" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 20 })))));
}
export {
  Header as default
};
