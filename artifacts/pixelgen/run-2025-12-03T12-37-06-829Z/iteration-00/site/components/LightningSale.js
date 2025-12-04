import React from 'https://esm.sh/react@18?dev';
import ProductCard from "./ProductCard.js";
const products = [
  {
    id: 1,
    title: "Glow+ Dewy Sunscreen Gel",
    subtitle: "Broad Spectrum SPF 50+",
    rating: 4.8,
    reviews: 103,
    weight: "160g",
    price: 838,
    originalPrice: 1198,
    discount: "30% OFF",
    timer: "5h:52m:42s",
    image: "assets/images/722835edaa.jpg"
  },
  {
    id: 2,
    title: "Glow+ Fluid Moisturizer",
    subtitle: "Lightweight Hydration",
    rating: 4.8,
    reviews: 86,
    weight: "140ml",
    price: 449,
    originalPrice: 898,
    discount: "50% OFF",
    timer: "5h:52m:42s",
    image: "assets/images/bd0f2dca23.jpg"
  },
  {
    id: 3,
    title: "Illuminate+ Body Lotion",
    subtitle: "For Glowing Skin",
    rating: 4.8,
    reviews: 57,
    weight: "125g",
    price: 499,
    originalPrice: 999,
    discount: "50% OFF",
    timer: "5h:52m:42s",
    image: "assets/images/b04e8d74c7.jpg"
  },
  {
    id: 4,
    title: "Refresh+ Perfume Body Mist Set",
    subtitle: "Pack of 3",
    rating: 4.7,
    reviews: 96,
    weight: "450ml",
    price: 1047,
    originalPrice: 1497,
    discount: "30% OFF",
    timer: "5h:52m:42s",
    image: "assets/images/30ac2fd156.jpg"
  },
  {
    id: 5,
    title: "Glow+ Jello Moisturizer",
    subtitle: "Oil-free Hydration",
    rating: 4.9,
    reviews: 233,
    weight: "50g",
    price: 1257,
    originalPrice: 1796,
    discount: "30% OFF",
    timer: "5h:52m:42s",
    image: "assets/images/f42711648f.jpg"
  }
];
function LightningSale() {
  return /* @__PURE__ */ React.createElement("section", { className: "py-12 bg-gradient-to-b from-[rgb(242,242,242)] to-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-center mb-8 text-gray-900" }, "Lightning Sale"), /* @__PURE__ */ React.createElement("div", { className: "flex overflow-x-auto space-x-4 pb-4 lg:grid lg:grid-cols-5 lg:gap-4 lg:space-x-0" }, products.map((product) => /* @__PURE__ */ React.createElement(ProductCard, { key: product.id, product, isLightning: true }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mt-8" }, /* @__PURE__ */ React.createElement("button", { className: "px-8 py-2 border border-[rgb(0,102,204)] text-[rgb(0,102,204)] font-semibold rounded-md hover:bg-[rgb(242,242,242)] transition-colors" }, "View all Lightning Sale"))));
}
export {
  LightningSale as default
};
