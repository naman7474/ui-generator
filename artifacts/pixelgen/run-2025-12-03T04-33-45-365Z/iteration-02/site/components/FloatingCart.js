import React from "https://esm.sh/react@18";
import { ShoppingCart } from "https://esm.sh/lucide-react";
function FloatingCart() {
  return /* @__PURE__ */ React.createElement("button", { className: "fixed bottom-6 right-6 bg-brand-orange text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 border-4 border-white" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 26 }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-3 -right-3 bg-white text-brand-orange text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-brand-orange" }, "0")));
}
export {
  FloatingCart as default
};
