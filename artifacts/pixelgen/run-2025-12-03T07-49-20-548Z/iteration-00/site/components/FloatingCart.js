import React from "https://esm.sh/react@18?dev";
import { ShoppingCart } from "https://esm.sh/lucide-react?dev";
function FloatingCart() {
  return /* @__PURE__ */ React.createElement("button", { className: "fixed bottom-8 right-8 bg-brand-orange text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-2 -right-2 bg-white text-brand-orange text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-brand-orange" }, "0")));
}
export {
  FloatingCart as default
};
