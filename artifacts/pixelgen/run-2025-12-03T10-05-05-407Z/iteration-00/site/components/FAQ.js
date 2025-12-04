import React, { useState } from 'https://esm.sh/react@18?dev';
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a complete marinade mix with spices, herbs, and natural tenderizers. No preservatives!" },
  { q: "How do I cook?", a: "Just coat your protein or veggies with the mix, let it sit for 15 mins, and cook on a pan, oven, or grill." },
  { q: "What's the shelf life?", a: "Our packs stay fresh for 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is perfect for 500g to 750g of chicken, paneer, or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs! The ratio scales perfectly." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated food tastes better and you control the quality of the meat/veggies you use." },
  { q: "What about other flavor masalas?", a: "We are constantly experimenting! Stay tuned for new drops every month." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-heading font-medium uppercase text-center mb-12" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-[#7f7f7f]" }, faqs.map((faq, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "py-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full flex justify-between items-center text-left focus:outline-none group",
      onClick: () => toggle(idx)
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-sm md:text-base font-medium text-[#1f2937] group-hover:text-brand-orange transition-colors" }, faq.q),
    /* @__PURE__ */ React.createElement("span", { className: "text-xl font-light text-[#7f7f7f]" }, openIndex === idx ? "\u2212" : "+")
  ), openIndex === idx && /* @__PURE__ */ React.createElement("div", { className: "mt-3 text-sm text-[#2d3748] leading-relaxed" }, faq.a))))));
}
export {
  FAQ as default
};
