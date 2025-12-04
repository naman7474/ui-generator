import React, { useState } from "https://esm.sh/react@18.2.0?dev";
function ProductCard({ product }) {
  const [mainImage, setMainImage] = useState(product.images[0]);
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-8 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-gray-100" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: mainImage,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 overflow-x-auto pb-2" }, product.images.map((img, idx) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: idx,
      onClick: () => setMainImage(img),
      className: `w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${mainImage === img ? "border-brand-orange" : "border-transparent"}`
    },
    /* @__PURE__ */ React.createElement("img", { src: img, alt: "", className: "w-full h-full object-cover" })
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 md:pl-8 flex flex-col justify-center h-full py-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-display font-bold uppercase mb-2" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-8 leading-relaxed max-w-md" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-brand-orange text-white px-8 py-3 w-fit font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors" }, "+ Add")));
}
export {
  ProductCard as default
};
