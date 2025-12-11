import React from 'https://esm.sh/react@18?dev&target=es2018';
const reviews = [
  {
    name: "Kaustubh Mathur",
    img: "./assets/images/e63b0294b5.png",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good."
  },
  {
    name: "Sarthak Bhosle",
    img: "./assets/images/b9830437c0.png",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!"
  },
  {
    name: "Om More",
    img: "./assets/images/673645b972.png",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!"
  },
  {
    name: "Sagar Shinde",
    img: "./assets/images/5fca62ced7.png",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result."
  },
  {
    name: "Vrinda Paul",
    img: "./assets/images/31eea7a719.png",
    text: "Loved the KILRR variety pack! Rich, perfectly balanced flavors. Makes marination super easy and tasty."
  },
  {
    name: "Diksha Dutta",
    img: "./assets/images/64dc0fe49b.png",
    text: "I absolutely loved this chicken masala! The aroma is rich and instantly reminds you of traditional Indian kitchens."
  }
];
function Reviews() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "150K+ GANG MEMBERS", className: "py-16 px-4 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif text-center tracking-wider text-gray-900 mb-4 uppercase" }, "150K+ Gang Members"), /* @__PURE__ */ React.createElement("p", { className: "text-center text-gray-500 mb-12 uppercase tracking-widest font-bold" }, "They're Screaming With Joy"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" }, reviews.map((review, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "bg-gray-50 p-6 rounded-xl flex flex-col items-center text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md" }, /* @__PURE__ */ React.createElement("img", { src: review.img, alt: review.name, className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg mb-2" }, review.name), /* @__PURE__ */ React.createElement("div", { className: "flex text-yellow-400 mb-3" }, "\u2605\u2605\u2605\u2605\u2605"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, '"', review.text, '"'))))));
}
export {
  Reviews as default
};
