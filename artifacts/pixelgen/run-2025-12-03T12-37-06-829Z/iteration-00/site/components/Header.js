import { Search, User, ShoppingBag, ChevronDown } from 'lucide-react';


import React from 'https://esm.sh/react@18?dev';
function Header() {
  const navItems = ["Range", "Routine", "Skin concern", "Our Story", "Track order", "Water for all", "Need Help?"];
  return /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-50 bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto px-4 py-3 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0 mr-8" }, /* @__PURE__ */ React.createElement("a", { href: "#", className: "text-2xl font-bold text-[rgb(0,102,204)] tracking-tight" }, /* @__PURE__ */ React.createElement("img", { src: "assets/images/d62380c279.svg", alt: "Aqualogica Logo", className: "h-8" }))), /* @__PURE__ */ React.createElement("nav", { className: "hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-700" }, navItems.map((item) => /* @__PURE__ */ React.createElement("div", { key: item, className: "flex items-center cursor-pointer hover:text-[rgb(0,102,204)]" }, item, ["Range", "Routine", "Skin concern"].includes(item) && /* @__PURE__ */ React.createElement(ChevronDown, { size: 14, className: "ml-1" })))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4 flex-1 lg:flex-none justify-end" }, /* @__PURE__ */ React.createElement("div", { className: "relative hidden md:block w-64" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search For M...",
      className: "w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-[rgb(0,102,204)]"
    }
  ), /* @__PURE__ */ React.createElement(Search, { className: "absolute right-3 top-2.5 text-gray-400", size: 18 })), /* @__PURE__ */ React.createElement("button", { className: "text-gray-700 hover:text-[rgb(0,102,204)]" }, /* @__PURE__ */ React.createElement(User, { size: 24 })), /* @__PURE__ */ React.createElement("button", { className: "text-gray-700 hover:text-[rgb(0,102,204)] relative" }, /* @__PURE__ */ React.createElement(ShoppingBag, { size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center" }, "0")))));
}
export {
  Header as default
};
