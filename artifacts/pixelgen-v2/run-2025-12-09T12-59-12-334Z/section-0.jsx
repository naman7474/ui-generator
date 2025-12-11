const Section1 = () => {
  return (
    <header data-section="section-1" className="w-full bg-black h-16 flex items-center justify-between px-4 md:px-8 font-sans">
      <div className="flex items-center h-full">
        {/* Logo */}
        <a href="/" className="flex-shrink-0 mr-8 block">
          <img 
            src="./assets/img-0.svg" 
            alt="Home" 
            className="h-[26px] w-auto object-contain" 
          />
        </a>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[#CCCCCC] text-[15px] font-normal">
          <a href="/" className="hover:text-white transition-colors">Home</a>
          <a href="/blog" className="hover:text-white transition-colors">Blog</a>
          <a href="#" data-external className="hover:text-white transition-colors">Forums</a>
          <a href="#" data-external className="hover:text-white transition-colors">Docs</a>
          <a href="/downloads" className="hover:text-white transition-colors">Downloads</a>
          <a href="#" data-external className="hover:text-white transition-colors">Training</a>
        </nav>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-5 text-[#CCCCCC]">
        {/* Search Icon */}
        <button className="hover:text-white p-1 focus:outline-none flex items-center justify-center" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Join Button */}
        <a 
          href="#" 
          data-external 
          className="text-[#76B900] border border-[#76B900] px-4 py-1 font-bold text-sm hover:bg-[#76B900] hover:text-black transition-colors leading-normal"
        >
          Join
        </a>

        {/* User Icon */}
        <button className="hover:text-white p-1 focus:outline-none flex items-center justify-center" aria-label="User Profile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M18 18.5C18 16.5 15.5 15 12 15C8.5 15 6 16.5 6 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
};