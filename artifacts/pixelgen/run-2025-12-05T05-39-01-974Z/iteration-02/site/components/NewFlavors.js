import React from 'https://esm.sh/react@18?dev&target=es2018';
const products = [
  { name: "Tandoori Blast", imgSrc: "./assets/images/8bee64915c.png" },
  { name: "Saza-E-KaaliMirch", imgSrc: "./assets/images/47553d85b2.png" },
  { name: "Paapi Pudina", imgSrc: "./assets/images/e5948e9067.png" },
  { name: "Dhaniya Mirchi Aur Woh", imgSrc: "./assets/images/1a7d73102c.png" },
  { name: "Gangs of Awadh", imgSrc: "./assets/images/a4f1e17947.png" },
  { name: "Shawarma Ji Ka Beta", imgSrc: "./assets/images/efbabe3856.png" }
];
function NewFlavors() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "NEW FLAVOR EVERYDAY", className: "py-16 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tighter" }, "NEW FLAVOR EVERYDAY")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" }, products.map((product, index) => /* @__PURE__ */ React.createElement("div", { key: index }, /* @__PURE__ */ React.createElement("div", { className: "overflow-hidden rounded-lg border" }, /* @__PURE__ */ React.createElement("img", { src: product.imgSrc, alt: product.name, className: "w-full h-auto object-cover" })), /* @__PURE__ */ React.createElement("h3", { className: "mt-4 text-lg font-bold text-center text-gray-800" }, product.name))))));
}
export {
  NewFlavors as default
};
