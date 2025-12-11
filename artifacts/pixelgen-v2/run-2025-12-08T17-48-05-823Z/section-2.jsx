const Section3 = () => {
  return (
    <section data-section="section-3" className="w-full overflow-hidden flex flex-col justify-end bg-transparent" style={{ height: '118px' }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 60s linear infinite;
          will-change: transform;
        }
      `}</style>
      
      <div className="w-full bg-[#ffeae5] py-4">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {/* Original Content Block */}
          <div className="flex items-center shrink-0">
            {[...Array(8)].map((_, i) => (
              <div key={`orig-${i}`} className="flex items-center">
                <span className="text-[#cc6649] font-medium tracking-widest text-sm mx-10 antialiased">
                  100% CLEAN LABEL
                </span>
                <span className="text-[#cc6649] font-medium text-sm antialiased">
                  |
                </span>
                <span className="text-[#cc6649] font-medium tracking-widest text-sm mx-10 antialiased">
                  ALL-IN-ONE MASALAS
                </span>
                <span className="text-[#cc6649] font-medium text-sm antialiased">
                  |
                </span>
              </div>
            ))}
          </div>
          
          {/* Duplicate Content Block for Seamless Loop */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <div key={`dup-${i}`} className="flex items-center">
                <span className="text-[#cc6649] font-medium tracking-widest text-sm mx-10 antialiased">
                  100% CLEAN LABEL
                </span>
                <span className="text-[#cc6649] font-medium text-sm antialiased">
                  |
                </span>
                <span className="text-[#cc6649] font-medium tracking-widest text-sm mx-10 antialiased">
                  ALL-IN-ONE MASALAS
                </span>
                <span className="text-[#cc6649] font-medium text-sm antialiased">
                  |
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};