import { Star, CheckCircle } from 'https://esm.sh/lucide-react?dev';


import React from 'https://esm.sh/react@18?dev';
const reviews = [
  {
    name: "Roshni Sharma",
    text: "Super Serum for Your Skin. No matter whether you have oily or dry skin, this super serum works amazingly on every skin type.",
    image: "assets/images/d62380c279.svg"
  },
  {
    name: "Pari Sahni",
    text: "What a Great Find! I wasn't sure of buying from a new brand, but this one really surprised me for good. Brilliant product that has hydrated.",
    image: "assets/images/d62380c279.svg"
  },
  {
    name: "Ayushi Thakur",
    text: "All My Faves In One. Absolutely loved this bundle of hydrating essentials. Everything in here gives my skin long-lasting hydration for perfect glow.",
    image: "assets/images/d62380c279.svg"
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-16 bg-[rgb(242,242,242)]" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-bold text-[rgb(29,29,29)] mb-2" }, "Don't Just Take Our Word For It"), /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(80,80,80)]" }, "Hear it from our Fam'")), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-3 gap-6" }, reviews.map((review, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "bg-[rgb(255,255,255)] p-6 rounded-xl shadow-sm text-center border border-[rgb(204,204,204)]" }, /* @__PURE__ */ React.createElement("div", { className: "w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[rgb(242,242,242)]" }, /* @__PURE__ */ React.createElement("img", { src: review.image, alt: review.name, className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1 mb-2 text-[rgb(0,102,204)] text-xs font-bold uppercase tracking-wide" }, /* @__PURE__ */ React.createElement(CheckCircle, { className: "w-3 h-3" }), " Verified Customer"), /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-[rgb(29,29,29)] mb-2" }, review.name), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-1 mb-4" }, [...Array(5)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, className: "w-4 h-4 fill-[rgb(0,102,204)] text-[rgb(0,102,204)]" }))), /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(80,80,80)] text-sm leading-relaxed" }, '"', review.text, '"'))))));
}
export {
  Testimonials as default
};
