import React from "https://esm.sh/react@18.2.0?dev";
function Ticker() {
  const items = [
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "NO PRESERVATIVES",
    "AUTHENTIC TASTE",
    "READY IN MINUTES"
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "bg-brand-pink overflow-hidden py-3 border-y border-red-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex whitespace-nowrap animate-marquee" }, [...Array(4)].map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex" }, items.map((item, index) => /* @__PURE__ */ React.createElement("span", { key: index, className: "mx-4 text-xs md:text-sm font-medium text-brand-orange tracking-widest uppercase flex items-center" }, item, /* @__PURE__ */ React.createElement("span", { className: "ml-8 text-gray-300" }, "|")))))), /* @__PURE__ */ React.createElement("style", null, `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `));
}
export {
  Ticker as default
};
