import React, { useState } from 'https://esm.sh/react@18?dev';
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly measured blend of premium spices and marinades needed for 500g of meat or veggies. No preservatives, just pure flavor." },
  { q: "How do I cook?", a: "Just mix the marinade with your choice of protein or vegetables, let it sit for 15-30 minutes, and cook on a pan, oven, or grill. It's that simple!" },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is designed to perfectly marinate 450g to 500g of chicken, paneer, or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly. 2 packs for 1kg, and so on." },
  { q: "Why not buy pre-marinated chicken?", a: "Fresh is always better! With KILRR, you choose your own fresh meat quality and hygiene, we just provide the killer taste." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more regional and international flavors launching soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-heading text-center mb-12 uppercase tracking-wide" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, faqs.map((faq, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "border-b border-[rgb(255,233,188)]" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => toggleFAQ(index),
      className: "w-full py-4 flex justify-between items-center text-left focus:outline-none group"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-medium text-[rgb(30,30,30)] group-hover:text-[rgb(212,79,34)] transition-colors" }, faq.q),
    /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-light text-[rgb(127,127,127)]" }, openIndex === index ? "\u2212" : "+")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(45,55,72)] text-sm leading-relaxed" }, faq.a)
  ))))));
}
export {
  FAQ as default
};
