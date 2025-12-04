import React from "https://esm.sh/react@18";
function Hero() {
  return /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden flex items-center justify-center" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop",
      alt: "Spices and Food",
      className: "absolute inset-0 w-full h-full object-cover opacity-60"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 text-center text-white px-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl md:text-6xl font-bold uppercase tracking-wide mb-4 drop-shadow-lg" }, "Get Killer Taste", /* @__PURE__ */ React.createElement("br", null), "With Zero Fuss"), /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://placehold.co/300x200/C8553D/white?text=KILRR+PACK",
      alt: "Product Pack",
      className: "mx-auto shadow-2xl rounded-md transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
    }
  ))));
}
export {
  Hero as default
};
