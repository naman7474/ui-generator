const Section3 = () => {
  const items = [
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
    "ALL-IN-ONE MASALAS",
    "100% CLEAN LABEL",
  ];

  return (
    <section data-section="section-3" className="w-full h-[118px] flex items-center justify-center bg-transparent overflow-hidden">
      <style>
        {`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 60s linear infinite;
          }
        `}
      </style>
      <div className="w-full bg-[#ffece5] py-3.5 flex overflow-hidden select-none">
        <div className="flex animate-marquee min-w-full shrink-0 items-center">
          {items.map((text, index) => (
            <div key={`a-${index}`} className="flex items-center">
              <span className="text-[#c85a3c] font-semibold tracking-widest text-sm whitespace-nowrap px-8">
                {text}
              </span>
              <span className="text-[#c85a3c] font-light text-sm">|</span>
            </div>
          ))}
        </div>
        <div className="flex animate-marquee min-w-full shrink-0 items-center" aria-hidden="true">
          {items.map((text, index) => (
            <div key={`b-${index}`} className="flex items-center">
              <span className="text-[#c85a3c] font-semibold tracking-widest text-sm whitespace-nowrap px-8">
                {text}
              </span>
              <span className="text-[#c85a3c] font-light text-sm">|</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};