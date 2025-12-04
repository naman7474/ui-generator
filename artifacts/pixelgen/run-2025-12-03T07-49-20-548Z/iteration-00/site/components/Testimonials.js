import React from "https://esm.sh/react@18?dev";
import { Star } from "https://esm.sh/lucide-react?dev";
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
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-gray-50" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange text-xs font-bold uppercase tracking-widest mb-2" }, "THEY'RE SCREAMING WITH JOY"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-serif" }, "150K+ GANG MEMBERS")), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto hide-scrollbar px-4 md:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 w-max mx-auto" }, reviews.map((review) => /* @__PURE__ */ React.createElement("div", { key: review.id, className: "w-[300px] bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "h-40 mb-4 overflow-hidden rounded" }, /* @__PURE__ */ React.createElement("img", { src: review.image, alt: "Review Food", className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 mb-2" }, [...Array(5)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, size: 12, className: "fill-brand-orange text-brand-orange" }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center text-xs text-gray-500 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-gray-900" }, review.name), /* @__PURE__ */ React.createElement("span", null, review.date)), /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm mb-2" }, review.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600 leading-relaxed" }, review.text))))));
}
export {
  Testimonials as default
};
