import { Star } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
const testimonials = [
  {
    image: "./assets/images/e63b0294b5.png",
    name: "Kaustubh Mathur",
    date: "10/12/2024",
    review: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good."
  },
  {
    image: "./assets/images/b9830437c0.png",
    name: "Sarthak Bhosle",
    date: "02/07/2025",
    review: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!"
  },
  {
    image: "./assets/images/673645b972.png",
    name: "Om More",
    date: "04/06/2025",
    review: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!"
  },
  {
    image: "./assets/images/5fca62ced7.png",
    name: "Sagar Shinde",
    date: "14/03/2024",
    review: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result."
  },
  {
    image: "./assets/images/31eea7a719.png",
    name: "Vrinda Paul",
    date: "21/01/2024",
    review: "Flavor Bombs for Chicken Lovers! \u{1F525} Loved the KILRR variety pack! Rich, perfectly balanced flavors. Makes marination super easy and tasty."
  }
];
const TestimonialCard = ({ testimonial }) => /* @__PURE__ */ React.createElement("div", { className: "border border-zinc-200 rounded-lg p-4 text-center bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("img", { src: testimonial.image, alt: testimonial.name, className: "w-full h-40 object-cover rounded-md mb-4" }), /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm" }, testimonial.name), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center my-2" }, [...Array(5)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, size: 16, className: "text-yellow-400 fill-current" }))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-zinc-500 mb-2" }, testimonial.date), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-zinc-600 leading-relaxed" }, testimonial.review));
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "150K+ GANG MEMBERS", className: "bg-zinc-50 py-16 px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-[#c77955] font-semibold tracking-wider" }, "THEY'RE SCREAMING WITH JOY"), /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-bold tracking-wider text-zinc-800 mt-2" }, "150K+ GANG MEMBERS")), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6" }, testimonials.map((item, index) => /* @__PURE__ */ React.createElement(TestimonialCard, { key: index, testimonial: item }))));
}
export {
  Testimonials as default
};
