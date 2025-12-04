import React from 'https://esm.sh/react@18?dev';
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] md:h-[500px] bg-black overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "assets/images/3b124f78c6.png",
      alt: "Spices and Chicken",
      className: "w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl font-heading font-bold text-white uppercase leading-tight drop-shadow-lg" }, "Get Killer Taste", /* @__PURE__ */ React.createElement("br", null), "With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "assets/images/2fe97aa2e5.png",
      alt: "Product Pack",
      className: "w-48 h-auto md:w-64 object-contain drop-shadow-2xl transform rotate-[-5deg] border-4 border-[rgba(255,255,255,0.25)] rounded-lg"
    }
  ))));
}
export {
  Hero as default
};
