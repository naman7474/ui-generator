import React from "https://esm.sh/react@18?dev";
function Marquee() {
  const items = [
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS"
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[#FCEFE9] py-3 overflow-hidden whitespace-nowrap border-b border-[#EAD4CB]" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex animate-marquee" }, items.map((text, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "mx-8 text-xs md:text-sm font-medium text-brand-orange tracking-widest uppercase" }, "| \xA0 ", text)), items.map((text, i) => /* @__PURE__ */ React.createElement("span", { key: `dup-${i}`, className: "mx-8 text-xs md:text-sm font-medium text-brand-orange tracking-widest uppercase" }, "| \xA0 ", text))));
}
export {
  Marquee as default
};
