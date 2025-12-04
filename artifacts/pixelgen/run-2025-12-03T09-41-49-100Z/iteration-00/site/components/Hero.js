import React from 'https://esm.sh/react@18?dev';
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop",
      alt: "Spices and Food",
      className: "w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-white uppercase tracking-wide drop-shadow-lg" }, "Get Killer Taste", /* @__PURE__ */ React.createElement("br", null), "With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=400&auto=format&fit=crop",
      alt: "Product Pack",
      className: "w-48 h-48 object-contain drop-shadow-2xl rotate-12 border-4 border-white/20 rounded-lg"
    }
  ))));
}
export {
  Hero as default
};
