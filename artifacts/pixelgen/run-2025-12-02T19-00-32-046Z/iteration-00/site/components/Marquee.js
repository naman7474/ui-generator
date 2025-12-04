import React from "https://esm.sh/react@18";
function Marquee() {
  const text = "CLEAN LABEL  |  ALL-IN-ONE MASALAS  |  100% CLEAN LABEL  |  ALL-IN-ONE MASALAS  |  100% CLEAN LABEL  |  ALL-IN-ONE MASALAS";
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[#F4DCD6] text-brand-orange py-3 overflow-hidden whitespace-nowrap" }, /* @__PURE__ */ React.createElement("div", { className: "inline-block animate-marquee text-xs font-bold tracking-widest uppercase" }, /* @__PURE__ */ React.createElement("span", { className: "mx-4" }, text), /* @__PURE__ */ React.createElement("span", { className: "mx-4" }, text), /* @__PURE__ */ React.createElement("span", { className: "mx-4" }, text)));
}
export {
  Marquee as default
};
