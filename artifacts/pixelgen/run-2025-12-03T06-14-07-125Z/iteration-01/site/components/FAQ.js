import React, { useState } from "https://esm.sh/react@18?dev";
const faqs = [
  { q: "What's in each pack?", a: "Each pack contains a perfectly measured blend of premium spices, herbs, and natural ingredients needed to create the specific dish. No preservatives, just pure flavor." },
  { q: "How do I cook?", a: "It's super simple! Just mix the marinade with your choice of protein or veggies, let it sit for a bit, and then cook it in a pan, oven, or air fryer. Detailed instructions are on the back of every pack." },
  { q: "What's the shelf life?", a: "Our masalas have a shelf life of 12 months from the date of manufacture when stored in a cool, dry place." },
  { q: "How much chicken per pack?", a: "One pack is sufficient for approximately 500g to 1kg of chicken or vegetables, depending on your spice preference." },
  { q: "What if I need to make more?", a: "You can easily scale up! Use two packs for 1kg-1.5kg of meat/veggies. Adjust salt to taste if needed." },
  { q: "Why not buy pre-marinated chicken?", a: "Pre-marinated often contains preservatives and lower quality meat. With KILRR, you choose your own fresh quality ingredients and just add our clean flavor bomb." },
  { q: "What about other flavor masalas?", a: "We are constantly experimenting in our food lab! Stay tuned for new launches every month." }
];
function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return /* @__PURE__ */ React.createElement("div", { className: "border-b border-gray-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "w-full py-6 flex justify-between items-center text-left focus:outline-none",
      onClick: () => setIsOpen(!isOpen)
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-lg font-medium text-gray-800" }, question),
    /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-light text-gray-400" }, isOpen ? "\u2212" : "+")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100 mb-6" : "max-h-0 opacity-0"}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 leading-relaxed" }, answer)
  ));
}
function FAQ() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 px-4 md:px-12 max-w-4xl mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-serif font-bold text-center uppercase mb-12" }, "Need More Evidence?"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, faqs.map((faq, index) => /* @__PURE__ */ React.createElement(AccordionItem, { key: index, question: faq.q, answer: faq.a }))));
}
export {
  FAQ as default
};
