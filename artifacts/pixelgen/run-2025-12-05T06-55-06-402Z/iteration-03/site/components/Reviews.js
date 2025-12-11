import React from 'https://esm.sh/react@18?dev&target=es2018';
const reviews = [
  {
    name: "Kaustubh Mathur",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
    img: "./assets/images/e63b0294b5.png"
  },
  {
    name: "Sarthak Bhosle",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!",
    img: "./assets/images/b9830437c0.png"
  },
  {
    name: "Om More",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
    img: "./assets/images/673645b972.png"
  },
  {
    name: "Sagar Shinde",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result.",
    img: "./assets/images/5fca62ced7.png"
  },
  {
    name: "Vrinda Paul",
    text: "Loved the KILRR variety pack! Rich, perfectly balanced flavors. Makes marination super easy and tasty.",
    img: "./assets/images/31eea7a719.png"
  },
  {
    name: "Diksha Dutta",
    text: "I absolutely loved this chicken masala! The aroma is rich and instantly reminds you of traditional Indian kitchens.",
    img: "./assets/images/64dc0fe49b.png"
  }
];
function Reviews() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "150K+ GANG MEMBERS", className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-center text-3xl md:text-4xl font-sans text-[rgb(30,30,30)] uppercase tracking-[0.15em] mb-2 font-bold" }, "150K+ GANG MEMBERS"), /* @__PURE__ */ React.createElement("p", { className: "text-center text-[rgb(127,127,127)] mb-12 tracking-widest uppercase font-bold" }, "THEY'RE SCREAMING WITH JOY"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8" }, reviews.map((review, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center border border-[rgb(229,231,235)]" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: review.img,
      alt: review.name,
      className: "w-24 h-24 rounded-full mb-4 object-cover"
    }
  ), /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg mb-2 text-[rgb(30,30,30)]" }, review.name), /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(127,127,127)] text-sm leading-relaxed" }, '"', review.text, '"'))))));
}
export {
  Reviews as default
};
