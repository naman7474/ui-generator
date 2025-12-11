import { Search, User, ShoppingCart } from 'https://esm.sh/lucide-react@0.555.0?deps=react@18,react-dom@18&dev&target=es2018';


import React from 'https://esm.sh/react@18?dev&target=es2018';
function Hero() {
  return /* @__PURE__ */ React.createElement("section", { "data-section": "section", className: "relative bg-black" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent" }, /* @__PURE__ */ React.createElement("img", { src: "./assets/images/1f223ac12b.png", alt: "KILRR Logo", className: "h-8 md:h-10" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4 text-white" }, /* @__PURE__ */ React.createElement(Search, { className: "h-6 w-6 cursor-pointer" }), /* @__PURE__ */ React.createElement(User, { className: "h-6 w-6 cursor-pointer" }), /* @__PURE__ */ React.createElement(ShoppingCart, { className: "h-6 w-6 cursor-pointer" }))), /* @__PURE__ */ React.createElement("img", { src: "./assets/images/3b124f78c6.png", alt: "KILRR Hero Banner", className: "w-full h-auto object-cover" }));
}
export {
  Hero as default
};
