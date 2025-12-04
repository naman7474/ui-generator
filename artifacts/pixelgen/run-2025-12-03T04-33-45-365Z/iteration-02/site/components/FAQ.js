import React, { useState } from "https://esm.sh/react@18";
import { Plus, Minus } from "https://esm.sh/lucide-react";
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a perfect blend of spices and marinades needed for 500g of meat or veggies. No preservatives, just pure flavor." },
  { q: "How do I cook?", a: "Just mix the marinade with your choice of protein or vegetable, let it sit for 15-30 mins, and cook on a pan or grill. Simple!" },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is optimized for 450g to 500g of chicken or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated food always tastes better than frozen pre-marinated options. Plus, you control the quality of the meat." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more regional and international flavors launching soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 px-4 max-w-3xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-light text-center mb-12 uppercase tracking-widest" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, faqs.map((faq, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "border-b border-gray-100 pb-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => toggle(index),
      className: "w-full flex justify-between items-center py-3 text-left hover:text-brand-orange transition-colors"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-base md:text-lg text-gray-800" }, faq.q),
    openIndex === index ? /* @__PURE__ */ React.createElement(Minus, { size: 18 }) : /* @__PURE__ */ React.createElement(Plus, { size: 18 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 text-sm leading-relaxed pb-2" }, faq.a)
  )))));
}
export {
  FAQ as default
};
