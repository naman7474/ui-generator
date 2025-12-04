import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'https://esm.sh/react@18?dev';

import React from 'https://esm.sh/react@18?dev';
const reviews = [
  {
    name: "Roshni Sharma",
    initial: "R",
    color: "bg-primary",
    text: "Super Serum For Your Skin. No matter whether you have oily or dry skin, this super serum works amazingly on every skin type. Enriched with hydration.",
    stars: 5
  },
  {
    name: "Pari Sahni",
    initial: "P",
    color: "bg-slate",
    text: "What a Great Find! I wasn't sure of buying from a new brand, but this one really surprised me for good. Brilliant product that has hydrated.",
    stars: 5
  },
  {
    name: "Ayushi Thakur",
    initial: "A",
    color: "bg-medium",
    text: "All My Faves In One. Absolutely loved this bundle of hydrating essentials. Everything in here gives my skin long-lasting hydration for perfect glow.",
    stars: 5
  }
];
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-12 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-2 text-dark" }, "Don't Just Take Our Word For It"), /* @__PURE__ */ React.createElement("p", { className: "text-center text-medium mb-10" }, "Hear it from our Fam'"), /* @__PURE__ */ React.createElement("div", { className: "relative flex items-center justify-center" }, /* @__PURE__ */ React.createElement("button", { className: "absolute left-0 md:left-10 z-10 bg-light p-2 rounded-full text-white hover:bg-medium" }, /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl" }, reviews.map((review, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "bg-bgLight p-6 rounded-xl flex flex-col items-center text-center" }, /* @__PURE__ */ React.createElement("div", { className: `w-16 h-16 ${review.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 border-4 border-white shadow-sm` }, review.initial), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-primary text-xs font-bold mb-1" }, /* @__PURE__ */ React.createElement(CheckCircle, { className: "w-3 h-3" }), " Verified Customer"), /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-dark mb-2" }, review.name), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 mb-4" }, [...Array(review.stars)].map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, className: "w-4 h-4 fill-primary text-primary" }))), /* @__PURE__ */ React.createElement("p", { className: "text-medium text-sm leading-relaxed" }, review.text)))), /* @__PURE__ */ React.createElement("button", { className: "absolute right-0 md:right-10 z-10 bg-primary p-2 rounded-full text-white hover:bg-opacity-90" }, /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-6 h-6" }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-2 mt-6" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-primary" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-light" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 rounded-full bg-light" }))));
}
export {
  Testimonials as default
};
