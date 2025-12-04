import React from 'https://esm.sh/react@18?dev';
import { Star } from 'https://esm.sh/react@18?dev';
const REVIEWS = [
  {
    id: 1,
    name: "Kaustubh Mathur",
    date: "10/12/2024",
    title: "Amazing taste, without effort",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
    image: "assets/images/b975cbabed.png"
  },
  {
    id: 2,
    name: "Sarthak Bhosle",
    date: "02/07/2025",
    title: "These flavours are insane.",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire!",
    image: "assets/images/b975cbabed.png"
  },
  {
    id: 3,
    name: "Om More",
    date: "04/06/2025",
    title: "Reordering again fs!",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
    image: "assets/images/b975cbabed.png"
  },
  {
    id: 4,
    name: "Sagar Shinde",
    date: "14/03/2024",
    title: "Unexpected Surprise",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect result.",
    image: "assets/images/b975cbabed.png"
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange text-xs font-bold tracking-widest uppercase mb-2" }, "They're screaming with joy"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif" }, "150K+ GANG MEMBERS")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" }, REVIEWS.map((review) => /* @__PURE__ */ React.createElement("div", { key: review.id, className: "bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-video mb-4 overflow-hidden rounded bg-gray-200" }, /* @__PURE__ */ React.createElement("img", { src: review.image, alt: "Food result", className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center mb-2" }, [...Array(5)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, size: 12, className: "fill-brand-orange text-brand-orange" })), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400 ml-auto" }, review.date)), /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm mb-1" }, review.name), /* @__PURE__ */ React.createElement("h5", { className: "font-bold text-xs mb-2 text-gray-700" }, review.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600 leading-relaxed" }, review.text))))));
}
export {
  Testimonials as default
};
