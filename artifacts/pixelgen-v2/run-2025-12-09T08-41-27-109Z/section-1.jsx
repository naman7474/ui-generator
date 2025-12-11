const Section2 = () => {
  return (
    <header 
      data-section="item-added-to-your-cart" 
      className="w-full bg-black text-white h-[72px] flex items-center justify-between px-4 lg:px-8 xl:px-12 font-sans"
    >
      {/* Logo Section */}
      <div className="flex-shrink-0 flex items-center">
        <a href="/" className="block">
          <img 
            src="./assets/img-0.png" 
            alt="BBlunt" 
            className="h-[42px] w-auto object-contain" 
          />
        </a>
      </div>

      {/* Navigation Links - Desktop */}
      <nav className="hidden xl:flex items-center gap-8 h-full ml-8">
        {['Product', 'Hair Care', 'Hair Colour', 'Hair Styling', 'Salon'].map((item) => (
          <div key={item} className="group flex items-center gap-1.5 cursor-pointer h-full select-none">
            <span className="text-[15px] font-bold tracking-wide text-white group-hover:text-gray-300 transition-colors">
              {item}
            </span>
            <svg 
              className="w-3 h-3 text-white stroke-current stroke-[3] group-hover:text-gray-300 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ))}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6 ml-auto">
        {/* Search Bar */}
        <div className="relative hidden lg:block w-[280px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            className="w-full bg-black border border-white rounded-[4px] py-2 pl-10 pr-4 text-sm text-white focus:outline-none placeholder-transparent"
            placeholder="Search"
          />
        </div>

        {/* User Profile Icon with Shine Squad Bolt */}
        <div className="relative cursor-pointer group">
          <svg className="w-[26px] h-[26px] text-white group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {/* Lightning Bolt Badge */}
          <div className="absolute -bottom-1 -right-1.5">
             <svg className="w-3.5 h-3.5 text-[#FDB913] fill-current" viewBox="0 0 24 24">
               <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
             </svg>
          </div>
        </div>

        {/* Cart Icon */}
        <div className="relative cursor-pointer group">
          <svg className="w-[26px] h-[26px] text-white group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <div className="absolute -top-1.5 -right-1.5 bg-[#0095D9] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            0
          </div>
        </div>
      </div>
    </header>
  );
};