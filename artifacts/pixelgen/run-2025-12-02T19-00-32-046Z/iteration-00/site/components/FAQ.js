import React, { useState } from "https://esm.sh/react@18";
import { Plus, Minus } from "https://esm.sh/lucide-react";
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly measured blend of premium spices and marinades needed for 500g of chicken or veggies." },
  { q: "How do I cook?", a: "Just mix the marinade with your protein/veggies, let it sit for 15-30 mins, and cook on a pan, oven, or air fryer." },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is sufficient for 450-500g of chicken or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs proportional to the quantity of meat or veggies you are cooking." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated chicken at home ensures better hygiene, quality of meat, and no preservatives compared to store-bought pre-marinated options." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more exciting regional and international flavors coming soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-serif text-center mb-12 uppercase tracking-wide" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-gray-100" }, faqs.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "py-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOpenIndex(openIndex === idx ? null : idx),
      className: "w-full flex justify-between items-center text-left hover:text-brand-orange transition-colors"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-gray-800" }, faq.q),
    openIndex === idx ? /* @__PURE__ */ React.createElement(Minus, { size: 16 }) : /* @__PURE__ */ React.createElement(Plus, { size: 16 })
  ), openIndex === idx && /* @__PURE__ */ React.createElement("div", { className: "mt-3 text-gray-500 text-sm leading-relaxed" }, faq.a))))));
}
export {
  FAQ as default
};
