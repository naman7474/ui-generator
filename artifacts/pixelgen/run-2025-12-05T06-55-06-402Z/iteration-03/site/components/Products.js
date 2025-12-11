import React from 'https://esm.sh/react@18?dev&target=es2018';
const products = [
  { name: "Tandoori Blast", img: "./assets/images/8bee64915c.png" },
  { name: "Saza-E-KaaliMirch", img: "./assets/images/47553d85b2.png" },
  { name: "Paapi Pudina", img: "./assets/images/e5948e9067.png" },
  { name: "Dhaniya Mirchi", img: "./assets/images/1a7d73102c.png" },
  { name: "Gangs of Awadh", img: "./assets/images/a4f1e17947.png" },
  { name: "Shawarma Ji", img: "./assets/images/efbabe3856.png" }
];
function Products() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "NEW FLAVOR EVERYDAY", className: "py-16 px-4 bg-white" }, /* @__PURE__ */ React.createElement("h2", { className: "text-center text-3xl md:text-4xl font-sans text-[rgb(30,30,30)] uppercase tracking-[0.15em] mb-12 font-bold" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" }, products.map((product, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex flex-col items-center" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: product.img,
      alt: product.name,
      className: "w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
    }
  )))));
}
export {
  Products as default
};
