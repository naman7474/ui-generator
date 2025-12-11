import { ChevronLeft, ChevronRight } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React, { useState, useRef, useEffect } from 'https://esm.sh/react@18?dev&target=es2018';
function Comparison() {
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
  const handleMouseDown = () => {
    isDragging.current = true;
  };
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  useEffect(() => {
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("section", { "data-section": "SLAY THE MESS, SAVOR THE TASTE", className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-[#D05C35] text-xs font-bold tracking-[0.2em] uppercase mb-3" }, "A KILRR IDEA THAT'LL CHANGE YOUR LIFE"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif text-[#1C1C1C]" }, "SLAY THE MESS, SAVOR THE TASTE")), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: containerRef,
      className: "relative w-full max-w-6xl mx-auto h-[300px] md:h-[500px] overflow-hidden cursor-ew-resize select-none",
      onMouseDown: handleMouseDown
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "./assets/images/fd2e6dd86e.png",
        alt: "After",
        className: "absolute top-0 left-0 w-full h-full object-cover"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute top-0 left-0 h-full overflow-hidden",
        style: { width: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement(
        "img",
        {
          src: "./assets/images/06081bb5de.png",
          alt: "Before",
          className: "absolute top-0 left-0 max-w-none h-full object-cover",
          style: { width: containerRef.current ? containerRef.current.offsetWidth : "100%" }
        }
      )
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center",
        style: { left: `${sliderPosition}%` }
      },
      /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-[#1C1C1C]" }, /* @__PURE__ */ React.createElement("div", { className: "flex -space-x-1" }, /* @__PURE__ */ React.createElement(ChevronLeft, { size: 14 }), /* @__PURE__ */ React.createElement(ChevronRight, { size: 14 })))
    )
  ));
}
export {
  Comparison as default
};
