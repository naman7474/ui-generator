import React from "https://esm.sh/react@18";
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[350px] md:h-[500px] bg-gray-900 overflow-hidden flex items-center justify-center" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=2000&auto=format&fit=crop",
      alt: "Spices Background",
      className: "absolute inset-0 w-full h-full object-cover opacity-50"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 text-center text-white px-4 max-w-4xl mx-auto" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-7xl font-black uppercase tracking-tighter mb-6 drop-shadow-2xl leading-none" }, "Get Killer Taste", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "text-3xl md:text-6xl font-bold tracking-normal" }, "With Zero Fuss")), /* @__PURE__ */ React.createElement("div", { className: "mt-8 relative inline-block" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://placehold.co/400x250/D35400/white?text=KILRR+PACK",
      alt: "Product Pack",
      className: "mx-auto shadow-2xl rounded-lg transform rotate-[-3deg] border-4 border-white/20"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute -top-6 -right-6 bg-white text-brand-orange rounded-full w-20 h-20 flex items-center justify-center font-black text-xs uppercase rotate-12 shadow-lg border-2 border-brand-orange" }, "As Seen", /* @__PURE__ */ React.createElement("br", null), "On TV"))));
}
export {
  Hero as default
};
