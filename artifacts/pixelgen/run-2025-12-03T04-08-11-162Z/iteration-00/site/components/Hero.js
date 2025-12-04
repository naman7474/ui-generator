import React from "https://esm.sh/react@18";
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] md:h-[500px] bg-black overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2000&auto=format&fit=crop",
      alt: "Hero Food",
      className: "w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl font-black text-white uppercase leading-tight drop-shadow-lg" }, "Get Killer Taste", /* @__PURE__ */ React.createElement("br", null), "With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=300&q=80",
      alt: "Product Pack",
      className: "w-48 h-auto rotate-12 shadow-2xl border-4 border-white/10 rounded-lg"
    }
  ))));
}
export {
  Hero as default
};
