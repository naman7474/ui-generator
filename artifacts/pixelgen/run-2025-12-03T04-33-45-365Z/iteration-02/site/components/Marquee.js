import React from "https://esm.sh/react@18";
function Marquee() {
  const text = "100% CLEAN LABEL  |  ALL-IN-ONE MASALAS  |  100% CLEAN LABEL  |  ALL-IN-ONE MASALAS  |  ";
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[#FFF0EB] text-brand-orange py-3 overflow-hidden border-b border-brand-orange/10" }, /* @__PURE__ */ React.createElement("div", { className: "marquee-container" }, /* @__PURE__ */ React.createElement("div", { className: "marquee-content text-xs md:text-sm font-bold tracking-[0.2em]" }, text.repeat(6))));
}
export {
  Marquee as default
};
