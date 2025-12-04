import React, { useState } from "https://esm.sh/react@18";
import { Plus, Minus } from "https://esm.sh/lucide-react";
const FAQS = [
  { q: "What's in each pack?", a: "Each pack contains a pre-mixed marinade paste made with premium spices, herbs, and oil. No preservatives, no artificial colors." },
  { q: "How do I cook?", a: "Just coat your protein or veggies with the paste, let it sit for 15 mins, and cook on a pan, oven, or grill. It's that simple!" },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months when stored in a cool, dry place. Refrigerate after opening." },
  { q: "How much chicken per pack?", a: "One pack is perfect for 450g - 500g of chicken, paneer, or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-display font-medium uppercase text-center mb-12" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "border-t border-gray-200" }, FAQS.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "border-b border-gray-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => toggle(idx),
      className: "w-full flex justify-between items-center text-left py-5 hover:text-brand-rust transition-colors"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-bold text-lg" }, faq.q),
    openIndex === idx ? /* @__PURE__ */ React.createElement(Minus, { size: 20 }) : /* @__PURE__ */ React.createElement(Plus, { size: 20 })
  ), openIndex === idx && /* @__PURE__ */ React.createElement("div", { className: "pb-5 text-gray-600 leading-relaxed" }, faq.a))))));
}
export {
  FAQ as default
};
