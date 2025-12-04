import React, { useState } from "https://esm.sh/react@18.2.0?dev";
import { Plus, Minus } from "https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0?dev";
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a complete marinade mix with premium spices, herbs, and natural ingredients needed for the specific dish. No preservatives added." },
  { q: "How do I cook?", a: "Just mix the pack contents with oil/yogurt as directed, coat your protein/veggies, and cook! Pan fry, air fry, or grill." },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is sufficient for 450g - 500g of chicken or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs proportional to the quantity of meat or vegetables you are cooking." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinating ensures better texture and hygiene compared to pre-marinated meats sitting on shelves." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more regional and international flavors coming soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-serif text-center mb-12 uppercase tracking-wide" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, faqs.map((faq, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "border-b border-gray-200 pb-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full flex justify-between items-center py-2 text-left hover:text-kilrr-orange transition-colors",
      onClick: () => setOpenIndex(openIndex === index ? null : index)
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-lg" }, faq.q),
    openIndex === index ? /* @__PURE__ */ React.createElement(Minus, { size: 20 }) : /* @__PURE__ */ React.createElement(Plus, { size: 20 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 leading-relaxed" }, faq.a)
  ))))));
}
export {
  FAQ as default
};
