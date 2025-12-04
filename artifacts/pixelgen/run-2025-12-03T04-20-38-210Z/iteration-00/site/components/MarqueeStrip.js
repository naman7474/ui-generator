import React from "https://esm.sh/react@18";
function MarqueeStrip() {
  const items = [
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL"
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[#FAD7D5] text-brand-orange py-3 overflow-hidden whitespace-nowrap border-b border-brand-orange/20" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-center gap-8 md:gap-16 text-xs md:text-sm font-bold tracking-widest uppercase" }, items.map((item, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "flex items-center" }, item, i !== items.length - 1 && /* @__PURE__ */ React.createElement("span", { className: "mx-8 text-brand-orange/40" }, "|")))));
}
export {
  MarqueeStrip as default
};
