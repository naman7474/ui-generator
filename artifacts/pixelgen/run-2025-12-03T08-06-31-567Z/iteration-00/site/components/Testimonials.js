import React from "https://esm.sh/react@18.2.0?dev";
import { Star } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
const REVIEWS = [
  {
    id: 1,
    name: "Kaustubh Mathur",
    date: "10/12/2024",
    title: "Amazing taste, without effort",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
    img: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Sarthak Bhosle",
    date: "02/07/2025",
    title: "These flavours are insane.",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire!",
    img: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    id: 3,
    name: "Om More",
    date: "04/06/2025",
    title: "Reordering again fs!",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
    img: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    id: 4,
    name: "Sagar Shinde",
    date: "14/03/2024",
    title: "Unexpected Surprise",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect result.",
    img: "https://randomuser.me/api/portraits/men/11.jpg"
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange uppercase tracking-widest text-sm font-bold mb-2" }, "They're screaming with joy"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-display font-bold uppercase" }, "150K+ Gang Members")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" }, REVIEWS.map((review) => /* @__PURE__ */ React.createElement("div", { key: review.id, className: "bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("img", { src: review.img, alt: review.name, className: "w-10 h-10 rounded-full object-cover" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm" }, review.name), /* @__PURE__ */ React.createElement("div", { className: "flex text-brand-orange" }, [...Array(5)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, size: 12, fill: "currentColor" }))))), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-400 mb-2" }, review.date), /* @__PURE__ */ React.createElement("h5", { className: "font-bold text-sm mb-2" }, review.title), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 leading-relaxed" }, review.text))))));
}
export {
  Testimonials as default
};
