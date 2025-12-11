import { Plus } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
const faqs = [
  "What's in each pack?",
  "How do I cook?",
  "What's the shelf life?",
  "How much chicken per pack?",
  "What if I need to make more?",
  "Why not buy pre-marinated chicken?",
  "What about other flavor masalas?"
];
const AccordionItem = ({ question }) => /* @__PURE__ */ React.createElement("div", { className: "border-b border-zinc-200" }, /* @__PURE__ */ React.createElement("button", { className: "w-full flex justify-between items-center text-left py-5" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-medium text-zinc-700" }, question), /* @__PURE__ */ React.createElement(Plus, { size: 24, className: "text-zinc-500" })));
function FAQ() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "NEED MORE EVIDENCE?", className: "py-16 px-4 sm:px-6 lg:px-8 border-t mt-8" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-bold tracking-wider text-zinc-800" }, "NEED MORE EVIDENCE?")), /* @__PURE__ */ React.createElement("div", { className: "max-w-3xl mx-auto" }, faqs.map((question, index) => /* @__PURE__ */ React.createElement(AccordionItem, { key: index, question }))));
}
export {
  FAQ as default
};
