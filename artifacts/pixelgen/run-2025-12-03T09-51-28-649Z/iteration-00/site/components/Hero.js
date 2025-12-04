import React from 'https://esm.sh/react@18?dev';
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop",
      alt: "Spices Background",
      className: "absolute inset-0 w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 h-full flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl font-heading font-bold text-white uppercase tracking-wide mb-4 drop-shadow-lg" }, "Get Killer Taste ", /* @__PURE__ */ React.createElement("br", null), " With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://placehold.co/300x200/222/orange?text=KILRR+PACK",
      alt: "Product Pack",
      className: "w-48 md:w-64 shadow-2xl rotate-[-5deg] border-4 border-white/10 rounded-lg"
    }
  ))));
}
export {
  Hero as default
};
