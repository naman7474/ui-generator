import React from "https://esm.sh/react@18";
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full bg-gray-900 overflow-hidden" }, /* @__PURE__ */ React.createElement("picture", null, /* @__PURE__ */ React.createElement(
    "source",
    {
      media: "(min-width: 769px)",
      srcSet: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1928&auto=format&fit=crop"
    }
  ), /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80",
      alt: "Hero Background",
      className: "w-full h-auto md:h-[600px] object-cover opacity-80 md:opacity-60"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:bg-black/40" }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white uppercase tracking-wide drop-shadow-xl leading-tight" }, "Get Killer Taste ", /* @__PURE__ */ React.createElement("br", null), " With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "md:hidden mt-4 bg-brand-rust text-white text-xs font-bold px-4 py-1 rounded-full rotate-[-2deg] shadow-lg" }, "MARINADE READY IN 15 MINS")));
}
export {
  Hero as default
};
