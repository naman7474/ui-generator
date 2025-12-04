import React from 'https://esm.sh/react@18?dev';
const productImages = ["/assets/images/722835edaa.jpg", "/assets/images/bd0f2dca23.jpg", "/assets/images/b04e8d74c7.jpg", "/assets/images/30ac2fd156.jpg", "/assets/images/f42711648f.jpg"];
const categories = [{ name: "Sunscreen", color: "bg-light-bg", img: productImages[0] }, { name: "Fragrance", color: "bg-light-bg", img: productImages[1] }, { name: "Moisturizer", color: "bg-light-bg", img: productImages[2] }, { name: "Cleansers", color: "bg-light-bg", img: productImages[3] }, { name: "Serum", color: "bg-light-bg", img: productImages[4] }, { name: "Toners", color: "bg-light-bg", img: productImages[0] }, { name: "Lip Care", color: "bg-light-bg", img: productImages[1] }, { name: "Dew Drops", color: "bg-light-bg", img: productImages[2] }];
function CategoryRow() {
  return /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex overflow-x-auto space-x-6 pb-4 hide-scrollbar justify-start md:justify-center" }, categories.map((cat, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group" }, /* @__PURE__ */ React.createElement("div", { className: `w-20 h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary-blue transition-all ${cat.color}` }, /* @__PURE__ */ React.createElement("img", { src: cat.img, alt: cat.name, className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-medium-text" }, cat.name)))));
}
export {
  CategoryRow as default
};
