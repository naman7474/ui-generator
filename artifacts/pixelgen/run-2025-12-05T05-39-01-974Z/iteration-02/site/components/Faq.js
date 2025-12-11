import { ChevronDown } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React, { useState } from 'https://esm.sh/react@18?dev&target=es2018';
const faqs = [
  { question: "What's in each pack?", answer: "The perfect mix of spices, herbs, dried vegetables \u2013 everything you need for your marinade or your gravy." },
  { question: "How do I cook?", answer: "Chicken Tikka, 1. Add water & oil to spice mix 2. Marinate chicken 3. Cook like you usually do. Chicken Gravy, 1. Saute chicken 2. Add water & masala 3. Cook for 30 min" },
  { question: "What's the shelf life?", answer: "You can store the masala packs for 6 months. But we think, you won't be able to resist the temptation to use them for so long." },
  { question: "How much chicken per pack?", answer: "Tikkas Masalas marinate 250g chicken & the Gravy Masalas make 500g chicken." },
  { question: "What if I need to make more?", answer: "It's simple Maths. If 250g needs 1 pack + 3 tbsp water; 500g needs 2X, that's 2 packs + 6 tbsp water." },
  { question: "Why not buy pre-marinated chicken?", answer: "Seriously!? Do you even know what's in it & for how long it's been lying in your vendor's fridge? Didn't think you would ask!" },
  { question: "What about other flavor masalas?", answer: "Almost all require you to add the wet ingredients \u2013 onion, ginger, garlic, chilli, curd.. why pay to waste time?" }
];
const FaqItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);
  return /* @__PURE__ */ React.createElement("div", { className: "border-b border-gray-200" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setIsOpen(!isOpen), className: "w-full text-left py-4 flex justify-between items-center focus:outline-none" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-gray-800" }, faq.question), /* @__PURE__ */ React.createElement(ChevronDown, { className: `transform transition-transform duration-300 text-gray-500 ${isOpen ? "rotate-180" : ""}` })), isOpen && /* @__PURE__ */ React.createElement("div", { className: "pb-4 pr-8 text-gray-600 text-sm" }, faq.answer));
};
function Faq() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "NEED MORE EVIDENCE?", className: "py-16 bg-gray-50" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 max-w-3xl" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tighter" }, "NEED MORE EVIDENCE?")), /* @__PURE__ */ React.createElement("div", null, faqs.map((faq, index) => /* @__PURE__ */ React.createElement(FaqItem, { key: index, faq })))));
}
export {
  Faq as default
};
