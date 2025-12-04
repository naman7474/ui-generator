import React from "https://esm.sh/react@18.2.0?dev";
function Hero() {
  return /* @__PURE__ */ React.createElement("section", { className: "relative w-full h-[500px] bg-gray-900 overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop",
      alt: "Spices and Food",
      className: "absolute inset-0 w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 h-full flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-4xl md:text-6xl font-display font-bold text-white uppercase tracking-wide drop-shadow-lg max-w-3xl leading-tight" }, "Get Killer Taste ", /* @__PURE__ */ React.createElement("br", null), " With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=400&q=80",
      alt: "Product Pack",
      className: "w-48 h-auto mx-auto rounded-lg shadow-2xl border-2 border-white/20 rotate-3 hover:rotate-0 transition-transform duration-500"
    }
  ))));
}
export {
  Hero as default
};
