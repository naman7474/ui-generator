import React from 'https://esm.sh/react@18?dev';
const categories = [
  { name: "Sunscreen" },
  { name: "Fragrance" },
  { name: "Moisturizer" },
  { name: "Cleansers" },
  { name: "Serum" },
  { name: "Toners" },
  { name: "Lip Care" },
  { name: "Body" },
  { name: "Dew Drops" }
];
function CategoryCircles() {
  return /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-6 overflow-x-auto scrollbar-hide" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 md:justify-center min-w-max" }, categories.map((cat, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex flex-col items-center gap-2 cursor-pointer group" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 md:w-20 md:h-20 rounded-full bg-bgLight border border-light flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden" }, /* @__PURE__ */ React.createElement("img", { src: "assets/images/d62380c279.svg", alt: cat.name, className: "w-10 h-10 opacity-50" })), /* @__PURE__ */ React.createElement("span", { className: "text-xs md:text-sm font-medium text-medium" }, cat.name)))));
}
export {
  CategoryCircles as default
};
