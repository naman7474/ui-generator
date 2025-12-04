import React from "https://esm.sh/react@18?dev";
import { ChevronRight } from "https://esm.sh/lucide-react?dev";
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex relative w-full h-[600px] bg-gray-900 overflow-hidden items-center justify-center" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop",
      alt: "Kitchen Scene",
      className: "absolute inset-0 w-full h-full object-cover opacity-40"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 text-center px-4 max-w-4xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-5xl lg:text-7xl font-bold text-white uppercase tracking-wide drop-shadow-xl leading-tight", style: { fontFamily: "Impact, sans-serif" } }, "Get Killer Taste", /* @__PURE__ */ React.createElement("br", null), "With Zero Fuss"), /* @__PURE__ */ React.createElement("button", { className: "mt-8 bg-brand-orange text-white px-8 py-3 text-lg font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors rounded" }, "Shop Now"))), /* @__PURE__ */ React.createElement("div", { className: "md:hidden" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] bg-gray-100 overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
      alt: "Cooking Timer",
      className: "w-full h-full object-cover"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/30 flex items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white/90 p-6 rounded-lg text-center shadow-2xl border-4 border-brand-orange" }, /* @__PURE__ */ React.createElement("span", { className: "block text-4xl font-bold text-brand-dark" }, "58"), /* @__PURE__ */ React.createElement("span", { className: "block text-sm font-bold uppercase tracking-widest text-brand-orange" }, "Seconds"), /* @__PURE__ */ React.createElement("span", { className: "block text-xs mt-2 font-medium" }, "To Marinade Perfection")))), /* @__PURE__ */ React.createElement("div", { className: "bg-brand-orange text-white py-3 px-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("span", null, "Get Killer Deals"), /* @__PURE__ */ React.createElement(ChevronRight, { size: 16 }), /* @__PURE__ */ React.createElement("span", null, "Express Delivery"), /* @__PURE__ */ React.createElement(ChevronRight, { size: 16 }), /* @__PURE__ */ React.createElement("span", null, "Best Prices"))));
}
export {
  Hero as default
};
