import React from "https://esm.sh/react@18";
import { Star } from "https://esm.sh/lucide-react";
const reviews = [
  {
    id: 1,
    name: "Kaustubh Mathur",
    date: "10/12/2024",
    title: "Amazing taste, without effort",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Sarthak Bhosle",
    date: "02/07/2025",
    title: "These flavours are insane.",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Om More",
    date: "04/06/2025",
    title: "Reordering again fs!",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Sagar Shinde",
    date: "14/03/2024",
    title: "Unexpected Surprise",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop"
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange text-xs font-bold uppercase tracking-widest mb-3" }, "They're screaming with joy"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-light uppercase tracking-wide" }, "150K+ Gang Members")), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto no-scrollbar px-4 md:px-8 pb-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex md:grid md:grid-cols-4 gap-6 w-max md:w-full mx-auto max-w-7xl" }, reviews.map((review) => /* @__PURE__ */ React.createElement("div", { key: review.id, className: "w-[280px] md:w-auto flex-shrink-0 bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow" }, /* @__PURE__ */ React.createElement("div", { className: "h-40 overflow-hidden rounded-md mb-4 bg-gray-100" }, /* @__PURE__ */ React.createElement("img", { src: review.image, alt: "Review Food", className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-sm" }, review.name), /* @__PURE__ */ React.createElement("div", { className: "flex" }, [...Array(5)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, size: 12, className: "fill-brand-orange text-brand-orange" })))), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-gray-400 mb-3" }, review.date), /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-xs mb-2 uppercase" }, review.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600 leading-relaxed" }, review.text))))));
}
export {
  Testimonials as default
};
