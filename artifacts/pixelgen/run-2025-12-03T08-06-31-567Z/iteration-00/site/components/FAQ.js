import React, { useState } from "https://esm.sh/react@18.2.0?dev";
import { Plus, Minus } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
const FAQS = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly measured blend of premium spices, dehydrated herbs, and natural flavor enhancers. No preservatives, no MSG, just pure flavor." },
  { q: "How do I cook?", a: "It's simple! 1. Mix the masala with oil/yogurt. 2. Coat your protein/veggies. 3. Cook (Pan fry, Air fry, or Grill). No extra salt or spices needed." },
  { q: "What's the shelf life?", a: "Our masalas stay fresh for 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One single-use pack is perfect for 400-500g of chicken, paneer, or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshness! Marinating fresh meat yourself ensures better texture and hygiene compared to store-bought pre-marinated meats." },
  { q: "What about other flavor masalas?", a: "We are constantly experimenting in the KILRR lab. Stay tuned for new drops every month!" }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-display font-bold uppercase text-center mb-12" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, FAQS.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "border-b border-gray-100" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full py-5 flex justify-between items-center text-left hover:text-brand-orange transition-colors",
      onClick: () => setOpenIndex(openIndex === idx ? null : idx)
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-lg" }, faq.q),
    openIndex === idx ? /* @__PURE__ */ React.createElement(Minus, { size: 20 }) : /* @__PURE__ */ React.createElement(Plus, { size: 20 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? "max-h-40 opacity-100 pb-5" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 leading-relaxed" }, faq.a)
  ))))));
}
export {
  FAQ as default
};
