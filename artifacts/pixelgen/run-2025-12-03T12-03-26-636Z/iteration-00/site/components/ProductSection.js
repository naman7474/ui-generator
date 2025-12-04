import React from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
function ProductSection({ title, products, viewAllText, bgColor = "bg-white", showFilters = false }) {
  return /* @__PURE__ */ React.createElement("section", { className: `py-10 ${bgColor}` }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-6 text-dark" }, title), showFilters && /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-center gap-2 mb-8" }, ["Best Sellers", "Sunscreen", "Fragrance", "Moisturizer", "Cleansers", "Serum", "Toner", "Lip Care", "Body", "Dew Drops"].map((filter, idx) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: idx,
      className: `px-4 py-1.5 rounded-full text-sm border transition-colors ${idx === 0 ? "bg-primary text-white border-primary" : "bg-white text-medium border-light hover:border-primary hover:text-primary"}`
    },
    filter
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product }))), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("button", { className: "border border-primary text-primary px-8 py-2 rounded font-medium hover:bg-primary hover:text-white transition-colors" }, viewAllText))));
}
export {
  ProductSection as default
};
