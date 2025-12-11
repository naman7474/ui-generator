const Section1 = () => {
  return (
    <div data-section="section-1" className="w-full h-[90px] bg-white flex items-center justify-between px-6 md:px-12">
      {/* Logo Section */}
      <a href="/" className="flex-shrink-0">
        <img 
          src="./assets/img-0.png" 
          alt="KILRR Logo" 
          className="h-[49px] w-auto object-contain" 
        />
      </a>

      {/* Icons Section */}
      <div className="flex items-center gap-8">
        {/* Shopping Cart Icon */}
        <a href="#" data-external className="text-[#1a1a1a] hover:opacity-70 transition-opacity">
          <svg 
            width="26" 
            height="26" 
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
        </a>

        {/* User Icon with Lightning Bolt */}
        <a href="#" data-external className="relative text-[#1a1a1a] hover:opacity-70 transition-opacity group">
          <svg 
            width="26" 
            height="26" 
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
          
          {/* Lightning Bolt Overlay */}
          <div className="absolute -bottom-1 -right-2">
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="#F59E0B" 
              stroke="#F59E0B" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
};