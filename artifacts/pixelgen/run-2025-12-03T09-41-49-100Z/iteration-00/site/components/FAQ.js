import React, { useState } from 'https://esm.sh/react@18?dev';
import { Plus, Minus } from 'https://esm.sh/react@18?dev';
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly measured blend of premium spices and natural ingredients needed for the dish." },
  { q: "How do I cook?", a: "Just mix the marinade with your choice of protein or veggies and cook. No extra onions, tomatoes, or ginger-garlic paste needed!" },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is sufficient for 450-500g of chicken, paneer, or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs proportional to the quantity of your main ingredient." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinating at home ensures better hygiene, quality of meat, and no preservatives compared to pre-marinated store-bought options." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more exciting regional and international flavors coming soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl text-center font-light uppercase tracking-widest mb-12" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, faqs.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "border-b border-gray-200 pb-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full flex justify-between items-center text-left py-2 hover:text-brand-orange transition-colors",
      onClick: () => setOpenIndex(openIndex === idx ? null : idx)
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-sm md:text-base" }, faq.q),
    openIndex === idx ? /* @__PURE__ */ React.createElement(Minus, { size: 16 }) : /* @__PURE__ */ React.createElement(Plus, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm leading-relaxed pr-8" }, faq.a)
  )))));
}
export {
  FAQ as default
};
