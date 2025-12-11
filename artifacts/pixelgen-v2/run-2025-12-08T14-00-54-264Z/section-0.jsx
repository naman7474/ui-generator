const Section1 = () => {
  return (
    <div data-section="section-1" className="w-full h-[90px] flex items-center justify-between px-6 md:px-12 bg-transparent">
      {/* Logo */}
      <div className="flex-shrink-0">
        <img 
          src="./assets/img-0.png" 
          alt="KILRR Logo" 
          className="w-[135px] h-[49px] object-contain" 
        />
      </div>
      
      {/* Icons */}
      <div className="flex items-center gap-6">
        {/* Cart Icon */}
        <button className="text-[#0f172a] hover:opacity-70 transition-opacity" aria-label="Shopping Cart">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
        
        {/* User Icon with Lightning Badge */}
        <button className="relative text-[#0f172a] hover:opacity-70 transition-opacity" aria-label="User Profile">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <div className="absolute -bottom-1 -right-1 text-[#f59e0b]">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
             </svg>
          </div>
        </button>
      </div>
    </div>
  );
};