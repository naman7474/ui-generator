import React from "https://esm.sh/react@18";
import { Plus } from "https://esm.sh/lucide-react";
function MarqueeStrip() {
  const marqueeItems = [
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL"
  ];
  const deals = [
    { id: 1, title: "TIKKA MASALAS", price: 629, old: 700, img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=300&q=80" },
    { id: 2, title: "GRAVY MASALAS", price: 585, old: 640, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80" }
  ];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "hidden md:block bg-brand-peach text-brand-rust py-4 overflow-hidden whitespace-nowrap border-b border-brand-rust/20" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-16 text-sm font-bold tracking-widest uppercase" }, marqueeItems.map((item, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "flex items-center" }, item, i !== marqueeItems.length - 1 && /* @__PURE__ */ React.createElement("span", { className: "mx-8 text-brand-rust/40" }, "|"))))), /* @__PURE__ */ React.createElement("div", { className: "md:hidden py-8 px-4 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "h-[1px] bg-brand-rust w-8" }), /* @__PURE__ */ React.createElement("h3", { className: "font-display text-xl uppercase text-brand-rust" }, "Get Killer Deals"), /* @__PURE__ */ React.createElement("div", { className: "h-[1px] bg-brand-rust w-8" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, deals.map((deal) => /* @__PURE__ */ React.createElement("div", { key: deal.id, className: "bg-[#1a1a1a] rounded-lg overflow-hidden text-white pb-3" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-square overflow-hidden mb-2" }, /* @__PURE__ */ React.createElement("img", { src: deal.img, alt: deal.title, className: "w-full h-full object-cover" })), /* @__PURE__ */ React.createElement("div", { className: "px-2" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm uppercase mb-1 leading-tight" }, deal.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-lg" }, "\u20B9", deal.price), /* @__PURE__ */ React.createElement("span", { className: "text-gray-500 text-xs line-through" }, "\u20B9", deal.old)), /* @__PURE__ */ React.createElement("button", { className: "w-full bg-brand-rust text-white text-xs font-bold py-2 uppercase flex items-center justify-center gap-1 hover:bg-orange-700" }, /* @__PURE__ */ React.createElement(Plus, { size: 12 }), " Add")))))));
}
export {
  MarqueeStrip as default
};
