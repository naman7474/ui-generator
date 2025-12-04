import React, { useState } from "https://esm.sh/react@18?dev";
import { Plus, Minus } from "https://esm.sh/lucide-react?dev";
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a pre-mixed marinade paste made with authentic spices, oil, and natural ingredients. No preservatives!" },
  { q: "How do I cook?", a: "Just coat your protein or veggies with the paste, let it sit for 15-30 mins, and cook on a pan, oven, or grill." },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is sufficient for 450-500g of chicken, paneer, or veggies." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated food always tastes better than frozen pre-marinated options. Plus, you control the quality of the meat." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more regional and international flavors." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 px-4 max-w-3xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-serif text-center mb-12 uppercase" }, "NEED MORE EVIDENCE?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, faqs.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "border-b border-gray-200 pb-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOpenIndex(openIndex === idx ? null : idx),
      className: "w-full flex justify-between items-center text-left py-2 hover:text-brand-orange transition-colors"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-lg" }, faq.q),
    openIndex === idx ? /* @__PURE__ */ React.createElement(Minus, { size: 20 }) : /* @__PURE__ */ React.createElement(Plus, { size: 20 })
  ), openIndex === idx && /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-gray-600 leading-relaxed animate-fadeIn" }, faq.a)))));
}
export {
  FAQ as default
};
