import React from 'https://esm.sh/react@18?dev';
const categories = [
  { name: "Sunscreen", color: "bg-[rgb(242,242,242)]" },
  { name: "Fragrance", color: "bg-[rgb(242,242,242)]" },
  { name: "Moisturizer", color: "bg-[rgb(242,242,242)]" },
  { name: "Cleansers", color: "bg-[rgb(242,242,242)]" },
  { name: "Serum", color: "bg-[rgb(242,242,242)]" },
  { name: "Toners", color: "bg-[rgb(242,242,242)]" },
  { name: "Lip Care", color: "bg-[rgb(242,242,242)]" },
  { name: "Dew Drops", color: "bg-[rgb(242,242,242)]" }
];
function CategoryCircles() {
  return /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 overflow-x-auto scrollbar-hide pb-2" }, categories.map((cat, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex flex-col items-center min-w-[80px] cursor-pointer group" }, /* @__PURE__ */ React.createElement("div", { className: `w-20 h-20 rounded-full ${cat.color} mb-2 border-2 border-transparent group-hover:border-[rgb(0,102,204)] transition-all overflow-hidden shadow-sm` }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "assets/images/d62380c279.svg",
      alt: cat.name,
      className: "w-full h-full object-contain opacity-80 p-2"
    }
  )), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-[rgb(84,84,84)] text-center" }, cat.name)))));
}
export {
  CategoryCircles as default
};
