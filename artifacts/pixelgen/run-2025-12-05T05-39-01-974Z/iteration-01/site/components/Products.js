import { ShoppingCart } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
const products = [
  {
    name: "TANDOORI BLAST",
    price: "\u20B969",
    oldPrice: "\u20B970",
    description: "Drop a bomb of tandoori flavor on your taste buds.",
    mainImage: "./assets/images/8bee64915c.png",
    thumbnails: ["./assets/images/f8a29418d1.png", "./assets/images/5e6236cd69.png", "./assets/images/2f3be75642.png", "./assets/images/94e3c8408a.png"]
  },
  {
    name: "SAZA-E-KAALIMIRCH",
    price: "\u20B969",
    oldPrice: "\u20B970",
    description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
    mainImage: "./assets/images/47553d85b2.png",
    thumbnails: ["./assets/images/20808bad77.png", "./assets/images/c5343ca209.png", "./assets/images/f51bd7550b.png", "./assets/images/d3c44e0811.png"]
  },
  {
    name: "PAAPI PUDINA",
    price: "\u20B969",
    oldPrice: "\u20B970",
    description: "The tang hits, world fades & you get caught licking your fingers.",
    mainImage: "./assets/images/e5948e9067.png",
    thumbnails: ["./assets/images/8219c43ee2.png", "./assets/images/a2fd89ac87.png", "./assets/images/d5b44f23d6.png", "./assets/images/cdfcd22745.png"]
  },
  {
    name: "DHANIYA MIRCHI AUR WOH",
    price: "\u20B969",
    oldPrice: "\u20B970",
    description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
    mainImage: "./assets/images/1a7d73102c.png",
    thumbnails: ["./assets/images/1befab133d.png", "./assets/images/53fadd0317.png", "./assets/images/8950a1169c.png", "./assets/images/48aebc55e3.png"]
  },
  {
    name: "GANGS OF AWADH",
    price: "\u20B969",
    oldPrice: "\u20B970",
    description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
    mainImage: "./assets/images/a4f1e17947.png",
    thumbnails: ["./assets/images/69436da95e.png", "./assets/images/6e400c95cb.png", "./assets/images/8c53fab112.png", "./assets/images/009c709b14.png"]
  },
  {
    name: "SHAWARMA JI KA BETA",
    price: "\u20B969",
    oldPrice: "\u20B970",
    description: "Flavor that hits like a late night stroll down a food bazaar.",
    mainImage: "./assets/images/efbabe3856.png",
    thumbnails: ["./assets/images/06721bbd8b.png", "./assets/images/2415f478f0.png", "./assets/images/a5425f301e.png", "./assets/images/dd49ccfe30.png"]
  }
];
const ProductCard = ({ product }) => {
  const [activeImage, setActiveImage] = React.useState(product.mainImage);
  return /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("img", { src: activeImage, alt: product.name, className: "w-full rounded-lg shadow-md" }), /* @__PURE__ */ React.createElement("div", { className: "flex space-x-2 mt-4" }, product.thumbnails.map((thumb, index) => /* @__PURE__ */ React.createElement("button", { key: index, onClick: () => setActiveImage(product.mainImage), className: `w-1/4 border-2 ${activeImage === product.mainImage ? "border-[#c77955]" : "border-transparent"} rounded-md overflow-hidden` }, /* @__PURE__ */ React.createElement("img", { src: thumb, alt: `${product.name} thumbnail ${index + 1}`, className: "w-full h-full object-cover" }))))), /* @__PURE__ */ React.createElement("div", { className: "text-left" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold tracking-wide" }, product.name), /* @__PURE__ */ React.createElement("div", { className: "my-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold mr-2" }, product.price), /* @__PURE__ */ React.createElement("span", { className: "text-xl text-zinc-500 line-through" }, product.oldPrice)), /* @__PURE__ */ React.createElement("p", { className: "text-zinc-600 mb-6" }, product.description), /* @__PURE__ */ React.createElement("button", { className: "bg-[#c77955] text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors" }, "+ ADD")));
};
function Products() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "NEW FLAVOR EVERYDAY", className: "py-16 px-4 sm:px-6 lg:px-8 relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-8 right-8" }, /* @__PURE__ */ React.createElement("button", { className: "bg-[#c77955] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg" }, /* @__PURE__ */ React.createElement(ShoppingCart, { size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" }, "0"))), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl md:text-4xl font-bold tracking-widest text-zinc-800" }, "NEW FLAVOR EVERYDAY"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center space-x-4 mt-8" }, /* @__PURE__ */ React.createElement("button", { className: "flex flex-col items-center space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("img", { src: "./assets/images/6770cf37a9.png", alt: "Tikkas", className: "w-20 h-20 rounded-full border-2 border-[#c77955] p-1" })), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-[#c77955]" }, "TIKKAS")), /* @__PURE__ */ React.createElement("button", { className: "flex flex-col items-center space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("img", { src: "./assets/images/bcaf3edfec.png", alt: "Gravies", className: "w-20 h-20 rounded-full" }), /* @__PURE__ */ React.createElement("span", { className: "absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full -translate-y-1/2 translate-x-1/4" }, "NEW LAUNCH")), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-zinc-600" }, "GRAVIES")))), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto mt-12 divide-y divide-zinc-200" }, products.map((product, index) => /* @__PURE__ */ React.createElement(ProductCard, { key: index, product }))), /* @__PURE__ */ React.createElement("div", { className: "text-center mt-12" }, /* @__PURE__ */ React.createElement("button", { className: "bg-[#c77955] text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors" }, "SHOW MORE (+5)")));
}
export {
  Products as default
};
