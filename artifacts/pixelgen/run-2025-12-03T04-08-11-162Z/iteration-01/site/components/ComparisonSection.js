import React, { useState, useRef } from "https://esm.sh/react@18";
import { ChevronLeft, ChevronRight } from "https://esm.sh/lucide-react";
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
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("p", { className: "text-[#C04B28] text-xs font-bold uppercase tracking-widest mb-2" }, "A KILRR Idea That'll Change Your Life"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-light uppercase tracking-wide" }, "Slay The Mess, Savor The Taste")), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "relative w-full h-[400px] md:h-[600px] overflow-hidden cursor-col-resize group",
      ref: containerRef,
      onMouseMove: handleMouseMove,
      onTouchMove: handleTouchMove
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 w-full h-full" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=1600&q=80",
        alt: "Clean Result",
        className: "w-full h-full object-cover"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-8 right-8 bg-white/90 px-4 py-2 rounded text-sm font-bold uppercase shadow-lg" }, "With KILRR")),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0 h-full overflow-hidden",
        style: { width: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement(
        "img",
        {
          src: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=1600&q=80",
          alt: "Messy Prep",
          className: "absolute top-0 left-0 h-full max-w-none w-[100vw] object-cover"
        }
      ),
      /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-8 left-8 bg-white/90 px-4 py-2 rounded text-sm font-bold uppercase shadow-lg" }, "Before KILRR")
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute top-0 bottom-0 w-1 bg-white cursor-col-resize flex items-center justify-center",
        style: { left: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border-2 border-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex text-white" }, /* @__PURE__ */ React.createElement(ChevronLeft, { size: 14 }), /* @__PURE__ */ React.createElement(ChevronRight, { size: 14 })))
    )
  ));
}
export {
  ComparisonSection as default
};
