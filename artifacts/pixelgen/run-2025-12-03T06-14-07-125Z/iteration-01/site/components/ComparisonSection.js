import React, { useState, useRef } from "https://esm.sh/react@18?dev";
function ComparisonSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width * 100;
    setSliderPosition(percentage);
  };
  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percentage = x / rect.width * 100;
    setSliderPosition(percentage);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-10" }, /* @__PURE__ */ React.createElement("h4", { className: "text-brand-orange font-bold uppercase tracking-widest text-sm mb-2" }, "A KILRR Idea That'll Change Your Life"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-serif font-bold uppercase" }, "Slay The Mess, Savor The Taste")), /* @__PURE__ */ React.createElement("div", { className: "max-w-5xl mx-auto px-4" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: containerRef,
      className: "relative w-full h-[300px] md:h-[500px] overflow-hidden cursor-col-resize select-none rounded-xl shadow-2xl",
      onMouseMove: handleMouseMove,
      onTouchMove: handleTouchMove
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0 w-full h-full bg-cover bg-center",
        style: { backgroundImage: 'url("https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1000&auto=format&fit=crop")' }
      },
      /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 right-4 bg-white/90 px-3 py-1 rounded text-xs font-bold uppercase z-10" }, "With KILRR")
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0 w-full h-full bg-cover bg-center border-r-4 border-white",
        style: {
          backgroundImage: 'url("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop")',
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold uppercase z-10" }, "Without KILRR")
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute top-0 bottom-0 w-1 bg-white cursor-col-resize flex items-center justify-center z-20",
        style: { left: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center shadow-lg border-2 border-white" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 9l4-4 4 4m0 6l-4 4-4-4", transform: "rotate(90 12 12)" })))
    )
  )));
}
export {
  ComparisonSection as default
};
