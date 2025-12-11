const Section2 = () => {
  return (
    <section data-section="section-2" className="w-full pt-[68px] bg-transparent">
      <div className="w-full bg-[#ffece5] py-[15px] overflow-hidden flex items-center">
        {/* 
          The content is shifted left with a negative margin to replicate the 
          cut-off text "...AS" seen in the screenshot.
        */}
        <div className="flex items-center whitespace-nowrap -ml-[155px]">
          {Array(10).fill(null).map((_, index) => (
            <React.Fragment key={index}>
              <span className="text-[#c25e3e] font-medium tracking-[0.15em] text-[13px] uppercase">
                All-in-one Masalas
              </span>
              <span className="text-[#c25e3e] mx-[36px] text-[13px]">|</span>
              <span className="text-[#c25e3e] font-medium tracking-[0.15em] text-[13px] uppercase">
                100% Clean Label
              </span>
              <span className="text-[#c25e3e] mx-[36px] text-[13px]">|</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};