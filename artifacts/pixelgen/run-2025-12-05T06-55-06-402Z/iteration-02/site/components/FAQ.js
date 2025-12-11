import { Plus, Minus } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React, { useState } from 'https://esm.sh/react@18?dev&target=es2018';
const faqs = [
  {
    question: "What's in each pack?",
    answer: "The perfect mix of spices, herbs, dried vegetables \u2013 everything you need for your marinade or your gravy."
  },
  {
    question: "How do I cook?",
    answer: "Chicken Tikka: 1. Add water & oil to spice mix. 2. Marinate chicken. 3. Cook like you usually do. Chicken Gravy: 1. Saute chicken. 2. Add water & masala. 3. Cook for 30 min."
  },
  {
    question: "What's the shelf life?",
    answer: "You can store the masala packs for 6 months. But we think, you won't be able to resist the temptation to use them for so long."
  },
  {
    question: "How much chicken per pack?",
    answer: "Tikkas Masalas marinate 250g chicken & the Gravy Masalas make 500g chicken. It's simple Maths. If 250g needs 1 pack + 3 tbsp water; 500g needs 2X, that's 2 packs + 6 tbsp water."
  },
  {
    question: "What if I need to make more?",
    answer: "Just use multiple packs! The ratios scale perfectly."
  },
  {
    question: "Why not buy pre-marinated chicken?",
    answer: "Seriously!? Do you even know what's in it & for how long it's been lying in your vendor's fridge? Didn't think you would ask!"
  },
  {
    question: "What about other flavor masalas?",
    answer: "Almost all require you to add the wet ingredients \u2013 onion, ginger, garlic, chilli, curd.. why pay to waste time?"
  }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { "data-section": "NEED MORE EVIDENCE?", className: "py-16 px-4 max-w-3xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-serif text-center mb-12 text-[#1C1C1C]" }, "NEED MORE EVIDENCE?"), /* @__PURE__ */ React.createElement("div", { className: "border-t border-gray-200" }, faqs.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "border-b border-gray-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full py-6 flex justify-between items-center text-left hover:text-[#D05C35] transition-colors",
      onClick: () => setOpenIndex(openIndex === idx ? null : idx)
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-lg font-medium text-[#1C1C1C]" }, faq.question),
    openIndex === idx ? /* @__PURE__ */ React.createElement(Minus, { size: 20 }) : /* @__PURE__ */ React.createElement(Plus, { size: 20 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 leading-relaxed" }, faq.answer)
  )))));
}
export {
  FAQ as default
};
