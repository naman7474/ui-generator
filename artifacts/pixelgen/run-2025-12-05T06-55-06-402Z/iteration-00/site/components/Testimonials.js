import { Star } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
const reviews = [
  {
    name: "Kaustubh Mathur",
    date: "10/12/2024",
    title: "Amazing taste, without effort",
    text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
    image: "./assets/images/e63b0294b5.png"
  },
  {
    name: "Sarthak Bhosle",
    date: "02/07/2025",
    title: "These flavours are insane.",
    text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!",
    image: "./assets/images/b9830437c0.png"
  },
  {
    name: "Om More",
    date: "04/06/2025",
    title: "Reordering again fs!",
    text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
    image: "./assets/images/673645b972.png"
  },
  {
    name: "Sagar Shinde",
    date: "14/03/2024",
    title: "Unexpected Surprise",
    text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result.",
    image: "./assets/images/5fca62ced7.png"
  },
  {
    name: "Vrinda Paul",
    date: "21/01/2024",
    title: "Flavor Bombs for Chicken Lovers! \u{1F357}\u{1F525}",
    text: "Loved the KILRR variety pack! Rich, perfectly balanced flavors. Makes marination super easy and tasty.",
    image: "./assets/images/31eea7a719.png"
  },
  {
    name: "Diksha Dutta",
    date: "15/02/2024",
    title: "Authentic Aroma",
    text: "I absolutely loved this chicken masala! The aroma is rich and instantly reminds you of traditional Indian kitchens.",
    image: "./assets/images/64dc0fe49b.png"
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "150K+ GANG MEMBERS", className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-[#D05C35] text-xs font-bold tracking-[0.2em] uppercase mb-3" }, "THEY'RE SCREAMING WITH JOY"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-serif text-[#1C1C1C]" }, "150K+ GANG MEMBERS")), /* @__PURE__ */ React.createElement("div", { className: "max-w-[1400px] mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" }, reviews.map((review, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 mb-4" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: review.image,
      alt: review.name,
      className: "w-12 h-12 rounded-full object-cover"
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm text-[#1C1C1C]" }, review.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex text-[#D05C35]" }, [...Array(5)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, size: 12, fill: "currentColor" }))), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400" }, review.date)))), /* @__PURE__ */ React.createElement("h5", { className: "font-bold text-sm mb-2 text-[#1C1C1C]" }, review.title), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 leading-relaxed" }, review.text))))));
}
export {
  Testimonials as default
};
