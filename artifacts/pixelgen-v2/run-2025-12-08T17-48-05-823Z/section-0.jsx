const Section1 = () => {
  return (
    <div 
      data-section="section-1" 
      className="w-full h-[90px] flex items-center justify-between px-8 md:px-12 lg:px-20 bg-transparent"
    >
      {/* Logo */}
      <a href="#" className="flex-shrink-0">
        <img 
          src="./assets/img-0.png" 
          alt="KILRR Logo" 
          className="w-[135px] h-[49px] object-contain" 
        />
      </a>

      {/* Right Actions */}
      <div className="flex items-center gap-8">
        {/* Cart Icon */}
        <button 
          aria-label="Cart" 
          className="text-[#111827] hover:opacity-70 transition-opacity"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>

        {/* User Icon with Lightning Bolt */}
        <button 
          aria-label="Account" 
          className="relative text-[#111827] hover:opacity-70 transition-opacity"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {/* Lightning Bolt Badge */}
          <div className="absolute -bottom-1 -right-1 text-[#f59e0b]">
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              stroke="none"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};