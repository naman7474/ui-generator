import React from 'https://esm.sh/react@18?dev&target=es2018';
function Marquee() {
  const marqueeItems = Array(6).fill(null);
  return /* @__PURE__ */ React.createElement("section", { "data-section": "section", className: "bg-[#f9e9e4] py-3 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex whitespace-nowrap animate-marquee" }, marqueeItems.map((_, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "flex items-center mx-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-zinc-700 tracking-widest" }, "100% CLEAN LABEL"), /* @__PURE__ */ React.createElement("span", { className: "mx-4 text-zinc-400" }, "|"), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-zinc-700 tracking-widest" }, "ALL-IN-ONE MASALAS")))));
}
export {
  Marquee as default
};
