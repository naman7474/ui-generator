import React, { useState, useRef, useEffect } from "https://esm.sh/react@18.2.0?dev";
import { ArrowRight, ArrowLeft } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
function ComparisonSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const handleMove = (event) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    let position = (clientX - containerRect.left) / containerRect.width * 100;
    position = Math.max(0, Math.min(100, position));
    setSliderPosition(position);
  };
  const handleMouseDown = () => {
    isDragging.current = true;
  };
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  const handleMouseMove = (e) => {
    if (isDragging.current) handleMove(e);
  };
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-gray-50" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("p", { className: "text-kilrr-orange font-bold uppercase tracking-widest text-sm mb-2" }, "A KILRR IDEA THAT'LL CHANGE YOUR LIFE"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif" }, "SLAY THE MESS, SAVOR THE TASTE")), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: containerRef,
      className: "relative w-full max-w-5xl mx-auto h-[300px] md:h-[500px] overflow-hidden rounded-xl cursor-ew-resize select-none shadow-2xl",
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onTouchStart: handleMouseDown,
      onTouchMove: handleMove
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 w-full h-full" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1505253758473-96b701d2cd3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        alt: "Clean Result",
        className: "w-full h-full object-cover"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded text-xs font-bold" }, "WITH KILRR")),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0 h-full overflow-hidden",
        style: { width: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement(
        "img",
        {
          src: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
          alt: "Messy Ingredients",
          className: "absolute top-0 left-0 h-full max-w-none",
          style: { width: containerRef.current ? containerRef.current.offsetWidth : "100%" }
        }
      ),
      /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-4 left-4 bg-white/80 px-3 py-1 rounded text-xs font-bold" }, "WITHOUT KILRR")
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center",
        style: { left: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 bg-kilrr-orange rounded-full flex items-center justify-center shadow-lg border-2 border-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex text-white" }, /* @__PURE__ */ React.createElement(ArrowLeft, { size: 12 }), /* @__PURE__ */ React.createElement(ArrowRight, { size: 12 })))
    )
  )));
}
export {
  ComparisonSlider as default
};
