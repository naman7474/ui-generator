import React, { useState } from "https://esm.sh/react@18?dev";
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly blended mix of spices and marinades required for 500g of meat or veggies." },
  { q: "How do I cook?", a: "Just mix the marinade with your choice of protein or vegetable, let it sit for 15-30 mins, and cook on a pan or grill." },
  { q: "What's the shelf life?", a: "Our packs have a shelf life of 9 months from the date of manufacturing when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is sufficient for 450-500 grams of chicken, paneer, or vegetables." },
  { q: "What if I need to make more?", a: "Simply use multiple packs proportional to the quantity of meat or veggies you are cooking." },
  { q: "Why not buy pre-marinated chicken?", a: "Freshly marinated food always tastes better and is healthier than pre-packaged marinated meat which may contain preservatives." },
  { q: "What about other flavor masalas?", a: "We are constantly innovating! Stay tuned for more exciting flavors launching soon." }
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-sans text-center mb-12 uppercase tracking-widest" }, "NEED MORE EVIDENCE?"), /* @__PURE__ */ React.createElement("div", { className: "border-t border-gray-200" }, faqs.map((faq, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "border-b border-gray-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full py-5 flex justify-between items-center text-left focus:outline-none group",
      onClick: () => toggle(index)
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-sm md:text-base font-medium text-gray-800 group-hover:text-brand-orange transition-colors" }, faq.q),
    /* @__PURE__ */ React.createElement("span", { className: "text-xl font-light text-gray-400" }, openIndex === index ? "\u2212" : "+")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100 pb-5" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 leading-relaxed" }, faq.a)
  ))))));
}
export {
  FAQ as default
};
