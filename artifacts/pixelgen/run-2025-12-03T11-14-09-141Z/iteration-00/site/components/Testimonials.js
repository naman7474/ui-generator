import React from 'https://esm.sh/react@18?dev';
const reviews = [
  {
    id: 1,
    name: "Kaustubh Mathur",
    date: "10/12/2024",
    rating: 5,
    title: "Amazing taste, without effort",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
    img: "assets/images/e63b0294b5.png"
  },
  {
    id: 2,
    name: "Sarthak Bhosle",
    date: "02/07/2025",
    rating: 5,
    title: "These flavours are insane.",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!",
    img: "assets/images/b9830437c0.png"
  },
  {
    id: 3,
    name: "Om More",
    date: "04/06/2025",
    rating: 5,
    title: "Reordering again fs!",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
    img: "assets/images/673645b972.png"
  },
  {
    id: 4,
    name: "Sagar Shinde",
    date: "14/03/2024",
    rating: 5,
    title: "Unexpected Surprise",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result.",
    img: "assets/images/5fca62ced7.png"
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(212,79,34)] uppercase text-sm font-bold tracking-widest mb-2" }, "They're Screaming With Joy"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-heading uppercase" }, "150K+ Gang Members")), /* @__PURE__ */ React.createElement("div", { className: "flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x" }, reviews.map((review) => /* @__PURE__ */ React.createElement("div", { key: review.id, className: "min-w-[300px] md:min-w-[350px] bg-white p-4 rounded-lg shadow-sm snap-center border border-[rgb(255,233,188)]" }, /* @__PURE__ */ React.createElement("div", { className: "h-48 mb-4 overflow-hidden rounded-md" }, /* @__PURE__ */ React.createElement("img", { src: review.img, alt: "Review food", className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm" }, review.name), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-[rgb(127,127,127)]" }, review.date)), /* @__PURE__ */ React.createElement("div", { className: "flex text-[rgb(212,79,34)] mb-2 text-xs" }, "\u2605".repeat(review.rating)), /* @__PURE__ */ React.createElement(.js"h5", { className: "font-bold text-sm mb-2" }, review.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-[rgb(45,55,72)] leading-relaxed" }, review.text))))));
}
export {
  Testimonials as default
};
