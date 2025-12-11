const Section3 = () => {
  return (
    <section data-section="section-3" className="w-full h-[118px] flex items-center justify-center bg-white overflow-hidden">
      <div className="w-full bg-[#ffece5] py-3.5">
        <div className="flex items-center justify-center gap-12 whitespace-nowrap select-none">
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-[#c25e3e] text-sm font-medium tracking-[0.15em]">
                100% CLEAN LABEL
              </span>
              <span className="text-[#c25e3e] text-sm font-medium">
                |
              </span>
              <span className="text-[#c25e3e] text-sm font-medium tracking-[0.15em]">
                ALL-IN-ONE MASALAS
              </span>
              <span className="text-[#c25e3e] text-sm font-medium">
                |
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};