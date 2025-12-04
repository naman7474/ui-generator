import React from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
function ProductSection({ title, products, hasTabs, tabs, viewAllText, bgColor = "bg-[rgb(255,255,255)]" }) {
  return /* @__PURE__ */ React.createElement("section", { className: `py-12 ${bgColor}` }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-8 text-[rgb(29,29,29)]" }, title), hasTabs && /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-center gap-2 mb-8" }, tabs.map((tab, idx) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: idx,
      className: `px-4 py-2 rounded-full text-sm font-medium transition-colors ${idx === 0 ? "bg-[rgb(0,102,204)] text-[rgb(255,255,255)]" : "bg-[rgb(255,255,255)] border border-[rgb(204,204,204)] text-[rgb(80,80,80)] hover:border-[rgb(0,102,204)] hover:text-[rgb(0,102,204)]"}`
    },
    tab
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), viewAllText && /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("button", { className: "border border-[rgb(0,102,204)] text-[rgb(0,102,204)] px-8 py-2.5 rounded-md font-bold text-sm hover:bg-[rgb(0,102,204)] hover:text-[rgb(255,255,255)] transition-colors" }, viewAllText))));
}
export {
  ProductSection as default
};
