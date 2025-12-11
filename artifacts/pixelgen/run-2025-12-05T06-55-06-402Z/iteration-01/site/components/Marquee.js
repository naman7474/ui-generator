import React from 'https://esm.sh/react@18?dev&target=es2018';
function Marquee() {
  const items = [
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS"
  ];
  return /* @__PURE__ */ React.createElement("section", { "data-section": "Marquee", className: "bg-[#FCECE8] py-4 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center gap-8 md:gap-16 whitespace-nowrap overflow-x-auto hide-scrollbar px-4" }, items.map((text, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center gap-8" }, /* @__PURE__ */ React.createElement("span", { className: "text-[#D05C35] text-[10px] md:text-xs font-bold tracking-[0.15em]" }, text), /* @__PURE__ */ React.createElement("span", { className: "text-[#D05C35] opacity-50" }, "|")))));
}
export {
  Marquee as default
};
