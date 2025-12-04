import React, { useState } from 'https://esm.sh/react@18?dev';
import { Plus, Minus } from 'https://esm.sh/react@18?dev';
const FAQS = [
  { q: "What's in each pack?", a: "Each pack contains a complete marinade mix with premium spices, oil, and natural tenderizers. No preservatives added." },
  { q: "How do I cook?", a: "Just coat your protein or veggies with the pack contents, let it sit for 15-30 mins, and cook on a pan, oven, or grill." },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is perfect for 450g - 500g of chicken, paneer, or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs proportional to the quantity of your main ingredient." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated food always tastes better than frozen or pre-marinated options that sit on shelves for days." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for our upcoming range of curries and biryani mixes." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-serif text-center mb-12 uppercase tracking-wide" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, FAQS.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "border-b border-gray-200 pb-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full flex justify-between items-center py-2 text-left hover:text-brand-orange transition-colors",
      onClick: () => setOpenIndex(openIndex === idx ? null : idx)
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-lg" }, faq.q),
    openIndex === idx ? /* @__PURE__ */ React.createElement(Minus, { size: 20 }) : /* @__PURE__ */ React.createElement(Plus, { size: 20 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 leading-relaxed" }, faq.a)
  ))))));
}
export {
  FAQ as default
};
