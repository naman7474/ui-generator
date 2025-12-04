import React, { useState, useRef } from "https://esm.sh/react@18";
function ComparisonSection() {
  const [sliderValue, setSliderValue] = useState(50);
  const containerRef = useRef(null);
  const handleInput = (e) => {
    setSliderValue(e.target.value);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange uppercase tracking-widest text-sm font-bold mb-2" }, "A KILRR Idea That'll Change Your Life"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-display font-medium uppercase" }, "Slay The Mess, Savor The Taste")), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-5xl" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl select-none group" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=1600&q=80",
      alt: "Clean Result",
      className: "absolute inset-0 w-full h-full object-cover"
    }
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute inset-0 overflow-hidden",
      style: { width: `${sliderValue}%` }
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=1600&q=80",
        alt: "Messy Ingredients",
        className: "absolute inset-0 w-full h-full object-cover max-w-none",
        style: { width: "100vw", maxWidth: "1024px" }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-4 left-4 bg-white/80 px-3 py-1 rounded text-xs font-bold" }, "THE MESS")
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-4 right-4 bg-brand-orange/90 text-white px-3 py-1 rounded text-xs font-bold" }, "THE TASTE"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "0",
      max: "100",
      value: sliderValue,
      onChange: handleInput,
      className: "absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
    }
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute top-0 bottom-0 w-1 bg-white z-10 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]",
      style: { left: `${sliderValue}%` }
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center shadow-lg border-2 border-white" }, /* @__PURE__ */ React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "m9 18 6-6-6-6" }), /* @__PURE__ */ React.createElement("path", { d: "m15 18-6-6 6-6" })))
  ))));
}
export {
  ComparisonSection as default
};
