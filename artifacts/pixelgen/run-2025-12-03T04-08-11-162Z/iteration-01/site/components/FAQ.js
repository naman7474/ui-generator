import React, { useState } from "https://esm.sh/react@18";
import { Plus, Minus } from "https://esm.sh/lucide-react";
const FAQS = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly blended mix of spices and marinades needed for 500g of meat or veggies. No preservatives, just pure flavor." },
  { q: "How do I cook?", a: "Just mix the marinade with your choice of protein or vegetable, let it sit for 15-20 mins, and cook it in a pan, oven, or air fryer." },
  { q: "What's the shelf life?", a: "Our marinades have a shelf life of 9 months when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is optimized for 450g to 500g of chicken or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated food always tastes better than frozen or pre-packaged marinated meat which may have preservatives." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more regional and international flavors coming soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-light text-center mb-12 uppercase tracking-wide" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-gray-100" }, FAQS.map((faq, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "py-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOpenIndex(openIndex === index ? null : index),
      className: "w-full flex justify-between items-center text-left hover:text-[#C04B28] transition-colors group"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-sm md:text-base uppercase tracking-wide group-hover:text-[#C04B28]" }, faq.q),
    openIndex === index ? /* @__PURE__ */ React.createElement(Minus, { size: 16 }) : /* @__PURE__ */ React.createElement(Plus, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 text-sm leading-relaxed" }, faq.a)
  )))));
}
export {
  FAQ as default
};
