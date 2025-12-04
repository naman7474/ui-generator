import React, { useState } from 'https://esm.sh/react@18?dev';
import { Plus, Minus } from 'https://esm.sh/react@18?dev';
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly blended mix of spices and marinades needed for 500g of meat or veggies. No preservatives, just pure flavor." },
  { q: "How do I cook?", a: "Just mix the contents of the pack with your choice of protein or veggies, let it marinate for 15-30 mins, and cook on a pan or grill." },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is optimized for 450g to 500g of chicken or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated food always tastes better. Plus, you control the quality of the meat you buy." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more regional and international flavors coming soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-brand-light container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-light uppercase text-center mb-12" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, faqs.map((faq, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "border-b border-gray-200 pb-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => toggle(index),
      className: "w-full flex justify-between items-center text-left py-2 hover:text-brand-orange transition-colors"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-lg" }, faq.q),
    openIndex === index ? /* @__PURE__ */ React.createElement(Minus, { size: 20 }) : /* @__PURE__ */ React.createElement(Plus, { size: 20 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 leading-relaxed" }, faq.a)
  )))));
}
export {
  FAQ as default
};
