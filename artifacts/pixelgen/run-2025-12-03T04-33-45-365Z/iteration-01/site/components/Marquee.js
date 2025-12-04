import React from "https://esm.sh/react@18";
function Marquee() {
  const text = "CLEAN LABEL  |  ALL-IN-ONE MASALAS  |  100% CLEAN LABEL  |  ALL-IN-ONE MASALAS  |  100% CLEAN LABEL  |  ALL-IN-ONE MASALAS  |  ";
  return /* @__PURE__ */ React.createElement("div", { className: "bg-[#FADCD5] text-brand-orange py-3 overflow-hidden border-b border-brand-orange/20" }, /* @__PURE__ */ React.createElement("div", { className: "marquee-container" }, /* @__PURE__ */ React.createElement("div", { className: "marquee-content text-xs md:text-sm font-bold tracking-widest" }, text.repeat(4))));
}
export {
  Marquee as default
};
