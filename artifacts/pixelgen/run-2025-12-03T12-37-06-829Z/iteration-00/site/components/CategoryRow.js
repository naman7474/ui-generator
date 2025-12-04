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
function CategoryRow() {
  return /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex space-x-6 overflow-x-auto no-scrollbar pb-2 justify-start lg:justify-center" }, categories.map((cat, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex flex-col items-center min-w-[80px] cursor-pointer group" }, /* @__PURE__ */ React.createElement("div", { className: `w-20 h-20 rounded-full ${cat.color} mb-2 overflow-hidden border-2 border-transparent group-hover:border-[rgb(0,102,204)] transition-all flex items-center justify-center` }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: `assets/images/722835edaa.jpg`,
      alt: cat.name,
      className: "w-full h-full object-cover opacity-80 mix-blend-multiply"
    }
  )), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-gray-700 text-center" }, cat.name)))));
}
export {
  CategoryRow as default
};
