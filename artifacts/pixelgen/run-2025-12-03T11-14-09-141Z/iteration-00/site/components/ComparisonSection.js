import React, { useState, useRef } from 'https://esm.sh/react@18?dev';
function ComparisonSection() {
  const [sliderValue, setSliderValue] = useState(50);
  const containerRef = useRef(null);
  const handleInput = (e) => {
    setSliderValue(e.target.value);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 text-center mb-10" }, /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(212,79,34)] uppercase text-sm font-bold tracking-widest mb-2" }, "A KILRR Idea That'll Change Your Life"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-heading uppercase" }, "Slay The Mess, Savor The Taste")), /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-5xl mx-auto h-[400px] md:h-[500px] relative overflow-hidden group select-none" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 w-full h-full" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "assets/images/fd2e6dd86e.png",
      alt: "Clean Result",
      className: "w-full h-full object-cover"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 right-4 bg-white px-3 py-1 text-xs font-bold rounded uppercase" }, "After")), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute inset-0 w-full h-full overflow-hidden",
      style: { width: `${sliderValue}%` }
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "assets/images/06081bb5de.png",
        alt: "Messy Ingredients",
        className: "w-full h-full object-cover max-w-none",
        style: { width: "100vw", maxWidth: "1024px" }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 left-4 bg-white px-3 py-1 text-xs font-bold rounded uppercase" }, "Before")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10",
      style: { left: `${sliderValue}%` }
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[rgb(30,30,30)] rounded-full flex items-center justify-center border-2 border-white shadow-lg" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "white", className: "w-5 h-5" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" })))
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "0",
      max: "100",
      value: sliderValue,
      onChange: handleInput,
      className: "absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
    }
  )));
}
export {
  ComparisonSection as default
};
