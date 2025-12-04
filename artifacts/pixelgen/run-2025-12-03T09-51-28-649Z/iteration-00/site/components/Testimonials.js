import React from 'https://esm.sh/react@18?dev';
const reviews = [
  {
    id: 1,
    name: "Kaustubh Mathur",
    date: "10/12/2024",
    title: "Amazing taste, without effort",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    name: "Sarthak Bhosle",
    date: "02/07/2025",
    title: "These flavours are insane.",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    name: "Om More",
    date: "04/06/2025",
    title: "Reordering again fs!",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 4,
    name: "Sagar Shinde",
    date: "14/03/2024",
    title: "Unexpected Surprise",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result.",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=200&q=80"
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-10" }, /* @__PURE__ */ React.createElement("p", { className: "text-brand-orange text-sm font-bold uppercase tracking-widest mb-2" }, "They're screaming with joy"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-heading font-medium uppercase" }, "150K+ Gang Members")), /* @__PURE__ */ React.createElement("div", { className: "flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x" }, reviews.map((review) => /* @__PURE__ */ React.createElement("div", { key: review.id, className: "min-w-[300px] md:min-w-[350px] snap-center bg-gray-50 p-4 rounded-lg border border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "h-40 overflow-hidden rounded-md mb-4" }, /* @__PURE__ */ React.createElement("img", { src: review.image, alt: "Review Food", className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-brand-orange text-xs mb-2" }, "\u2605\u2605\u2605\u2605\u2605", /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 ml-2 font-normal" }, review.date)), /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm mb-1" }, review.name), /* @__PURE__ */ React.createElement("h5", { className: "font-bold text-xs uppercase mb-2" }, review.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600 leading-relaxed" }, review.text))))));
}
export {
  Testimonials as default
};
