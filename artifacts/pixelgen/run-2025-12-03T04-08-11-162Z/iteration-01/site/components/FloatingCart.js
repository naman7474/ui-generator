import React from "https://esm.sh/react@18";
import { ShoppingCart } from "https://esm.sh/lucide-react";
function FloatingCart({ count }) {
  return /* @__PURE__ */ React.createElement("button", { className: "fixed bottom-6 right-6 bg-[#C04B28] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 24 }), count >= 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-2 -right-2 bg-white text-[#C04B28] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#C04B28]" }, count)));
}
export {
  FloatingCart as default
};
