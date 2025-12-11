const Section3 = () => {
  return (
    <section 
      data-section="section-3" 
      className="w-full flex flex-col justify-end bg-transparent" 
      style={{ height: '118px' }}
    >
      <div className="w-full bg-[#FFE4DC] py-3.5 overflow-hidden flex items-center select-none">
        <div className="flex whitespace-nowrap animate-marquee text-[#C55F3E] text-[13px] font-medium tracking-[0.2em]">
          {/* Repeating content enough times to ensure seamless scrolling on large screens */}
          {Array(20).fill(null).map((_, i) => (
            <React.Fragment key={i}>
              <span className="shrink-0">100% CLEAN LABEL</span>
              <span className="mx-10 shrink-0">|</span>
              <span className="shrink-0">ALL-IN-ONE MASALAS</span>
              <span className="mx-10 shrink-0">|</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <style>{`
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 60s linear infinite;
          will-change: transform;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};