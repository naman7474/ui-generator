import React, { useState } from 'https://esm.sh/react@18?dev';
function ProductCard({ product }) {
  const [mainImage, setMainImage] = useState(product.images[0]);
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row gap-8 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-[4/3] w-full overflow-hidden rounded-lg mb-4 bg-[rgb(255,233,188)]" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: mainImage,
      alt: product.title,
      className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 overflow-x-auto pb-2" }, product.images.map((img, idx) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: idx,
      onClick: () => setMainImage(img),
      className: `w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${mainImage === img ? "border-[rgb(212,79,34)]" : "border-transparent"}`
    },
    /* @__PURE__ */ React.createElement("img", { src: img, alt: "thumbnail", className: "w-full h-full object-cover" })
  )))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-1/2 md:pl-8 flex flex-col justify-center h-full py-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-heading font-bold uppercase mb-2" }, product.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold" }, "\u20B9", product.price), /* @__PURE__ */ React.createElement("span", { className: "text-[rgb(127,127,127)] line-through text-sm" }, "\u20B9", product.originalPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-[rgb(45,55,72)] mb-8 leading-relaxed" }, product.description), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "bg-[rgb(212,79,34)] text-white px-8 py-3 rounded font-bold uppercase text-sm hover:bg-[rgb(196,79,34)] transition-colors shadow-md" }, "+ Add"))));
}
export {
  ProductCard as default
};
