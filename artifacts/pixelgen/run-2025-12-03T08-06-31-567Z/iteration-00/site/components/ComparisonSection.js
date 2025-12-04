import React, { useState, useRef, useEffect } from "https://esm.sh/react@18.2.0?dev";
import { ChevronLeft, ChevronRight } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
function ComparisonSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const handleMove = (event) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(x / rect.width * 100, 100));
    setSliderPosition(percent);
  };
  const handleTouchMove = (event) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(x / rect.width * 100, 100));
    setSliderPosition(percent);
  };
  useEffect(() => {
    const handleUp = () => isDragging.current = false;
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange uppercase tracking-widest text-sm font-bold mb-2" }, "A KILRR idea that'll change your life"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-display font-bold uppercase" }, "Slay the mess, Savor the taste")), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-5xl" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: containerRef,
      className: "relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl cursor-ew-resize select-none",
      onMouseDown: () => isDragging.current = true,
      onMouseMove: handleMove,
      onTouchStart: () => isDragging.current = true,
      onTouchMove: handleTouchMove
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1505253758473-96b701d2cd3e?q=80&w=2000&auto=format&fit=crop",
        alt: "Clean Result",
        className: "absolute inset-0 w-full h-full object-cover"
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2000&auto=format&fit=crop",
        alt: "Messy Ingredients",
        className: "absolute inset-0 w-full h-full object-cover",
        style: { clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }
      }
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0 bg-black/10 pointer-events-none",
        style: { clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }
      }
    )),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 flex items-center justify-center",
        style: { left: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-0" }, /* @__PURE__ */ React.createElement(ChevronLeft, { size: 16 }), /* @__PURE__ */ React.createElement(ChevronRight, { size: 16 })))
    ),
    /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-bold pointer-events-none" }, "THE MESS"),
    /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-4 right-4 bg-brand-orange/80 text-white px-3 py-1 rounded text-sm font-bold pointer-events-none" }, "THE TASTE")
  )));
}
export {
  ComparisonSection as default
};
