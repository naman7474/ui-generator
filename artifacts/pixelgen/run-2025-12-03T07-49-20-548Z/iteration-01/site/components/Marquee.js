import React from "https://esm.sh/react@18?dev";
function Marquee() {
  const items = [
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "NO PRESERVATIVES",
    "AUTHENTIC TASTE",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "NO PRESERVATIVES",
    "AUTHENTIC TASTE"
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "bg-brand-peach py-3 overflow-hidden whitespace-nowrap border-b border-[#EAD4CB]" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex animate-marquee" }, items.map((text, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "mx-8 text-xs font-bold text-brand-orange tracking-widest uppercase" }, "| \xA0 ", text)), items.map((text, i) => /* @__PURE__ */ React.createElement("span", { key: `dup-${i}`, className: "mx-8 text-xs font-bold text-brand-orange tracking-widest uppercase" }, "| \xA0 ", text))));
}
export {
  Marquee as default
};
