import React, { useState, useRef } from 'https://esm.sh/react@18?dev';
import { ChevronLeft, ChevronRight } from 'https://esm.sh/react@18?dev';
function ComparisonSlider() {
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
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange text-xs font-bold tracking-widest uppercase mb-2" }, "A KILRR IDEA THAT'LL CHANGE YOUR LIFE"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif uppercase" }, "Slay the mess, savor the taste")), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "relative w-full h-[400px] md:h-[600px] overflow-hidden cursor-col-resize group",
      ref: containerRef,
      onMouseMove: handleMouseMove,
      onTouchMove: handleTouchMove
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "assets/images/b975cbabed.png",
        alt: "Clean Result",
        className: "w-full h-full object-cover"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-8 right-8 bg-white/80 px-4 py-2 rounded font-bold text-sm uppercase tracking-widest" }, "The Result")),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0 overflow-hidden",
        style: { width: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement(
        "img",
        {
          src: "assets/images/3b124f78c6.png",
          alt: "Messy Ingredients",
          className: "w-full h-full object-cover max-w-none",
          style: { width: containerRef.current ? containerRef.current.offsetWidth : "100vw" }
        }
      ),
      /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-8 left-8 bg-white/80 px-4 py-2 rounded font-bold text-sm uppercase tracking-widest" }, "The Mess")
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute top-0 bottom-0 w-1 bg-white cursor-col-resize flex items-center justify-center shadow-xl",
        style: { left: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex" }, /* @__PURE__ */ React.createElement(ChevronLeft, { size: 14 }), /* @__PURE__ */ React.createElement(ChevronRight, { size: 14 })))
    )
  ));
}
export {
  ComparisonSlider as default
};
