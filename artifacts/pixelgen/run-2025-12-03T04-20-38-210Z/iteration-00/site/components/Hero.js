import React from "https://esm.sh/react@18";
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1928&auto=format&fit=crop",
      alt: "Hero Background",
      className: "absolute inset-0 w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 h-full flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl font-display font-bold text-white uppercase tracking-wide mb-4 drop-shadow-lg" }, "Get Killer Taste ", /* @__PURE__ */ React.createElement("br", null), " With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-8 relative group" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=300&q=80",
      alt: "Product Pack",
      className: "w-48 h-48 object-contain rounded-lg shadow-2xl rotate-[-5deg] border-4 border-white/10"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute -right-12 top-1/2 -translate-y-1/2 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full rotate-12 shadow-lg" }, "READY IN 15 MINS"))));
}
export {
  Hero as default
};
