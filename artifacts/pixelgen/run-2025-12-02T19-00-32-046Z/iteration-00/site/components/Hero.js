import React from "https://esm.sh/react@18";
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1600&q=80",
      alt: "Spices and Food",
      className: "w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl font-black text-white uppercase tracking-wide leading-tight drop-shadow-lg" }, "Get Killer Taste", /* @__PURE__ */ React.createElement("br", null), "With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-brand-orange text-white px-4 py-1 text-sm font-bold uppercase inline-block transform -rotate-2" }, "Taste that blows your mind"))));
}
export {
  Hero as default
};
