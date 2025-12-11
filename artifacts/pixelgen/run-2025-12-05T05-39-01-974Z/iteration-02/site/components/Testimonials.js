import React from 'https://esm.sh/react@18?dev&target=es2018';
const testimonials = [
  { imgSrc: "./assets/images/e63b0294b5.png", name: "Kaustubh Mathur", quote: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good." },
  { imgSrc: "./assets/images/b9830437c0.png", name: "Sarthak Bhosle", quote: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!" },
  { imgSrc: "./assets/images/673645b972.png", name: "Om More", quote: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!" },
  { imgSrc: "./assets/images/5fca62ced7.png", name: "Sagar Shinde", quote: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result." },
  { imgSrc: "./assets/images/31eea7a719.png", name: "Vrinda Paul", quote: "Loved the KILRR variety pack! Rich, perfectly balanced flavors. Makes marination super easy and tasty." },
  { imgSrc: "./assets/images/64dc0fe49b.png", name: "Diksha Dutta", quote: "I absolutely loved this chicken masala! The aroma is rich and instantly reminds you of traditional Indian kitchens." }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "150K+ GANG MEMBERS", className: "py-16 bg-gray-50" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tighter" }, "150K+ GANG MEMBERS"), /* @__PURE__ */ React.createElement("p", { className: "text-md text-gray-600 mt-2 uppercase tracking-wider" }, "THEY'RE SCREAMING WITH JOY")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" }, testimonials.map((testimonial, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "bg-white p-6 rounded-lg shadow-sm" }, /* @__PURE__ */ React.createElement("img", { src: testimonial.imgSrc, alt: testimonial.name, className: "w-full rounded-md mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm italic mb-4" }, '"', testimonial.quote, '"'), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-right text-gray-800" }, "- ", testimonial.name))))));
}
export {
  Testimonials as default
};
