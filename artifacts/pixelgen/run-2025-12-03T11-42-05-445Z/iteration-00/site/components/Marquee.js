import React from 'https://esm.sh/react@18?dev';
function Marquee() {
  const items = [
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS"
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "bg-brand-pink py-3 overflow-hidden whitespace-nowrap border-b border-brand-orange/10" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex animate-marquee space-x-8" }, items.map((text, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "text-brand-orange text-xs md:text-sm font-bold tracking-widest uppercase" }, text, " ", /* @__PURE__ */ React.createElement("span", { className: "mx-4 text-gray-400" }, "|"))), items.map((text, i) => /* @__PURE__ */ React.createElement("span", { key: `dup-${i}`, className: "text-brand-orange text-xs md:text-sm font-bold tracking-widest uppercase hidden md:inline" }, text, " ", /* @__PURE__ */ React.createElement("span", { className: "mx-4 text-gray-400" }, "|")))));
}
export {
  Marquee as default
};
