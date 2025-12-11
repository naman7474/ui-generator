const Section1 = () => {
  return (
    <header data-section="section-1" className="w-full bg-black h-16 flex items-center justify-between px-4 lg:px-8 font-sans">
      <div className="flex items-center h-full">
        {/* Logo */}
        <a href="/" className="flex items-center mr-8">
          <img 
            src="./assets/img-0.svg" 
            alt="Home" 
            className="w-[141px] h-[26px] object-contain" 
          />
        </a>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-[15px] text-[#cccccc]">
          <a href="/" className="hover:text-white transition-colors">Home</a>
          <a href="/blog" className="hover:text-white transition-colors">Blog</a>
          <a href="#" data-external className="hover:text-white transition-colors">Forums</a>
          <a href="#" data-external className="hover:text-white transition-colors">Docs</a>
          <a href="/downloads" className="hover:text-white transition-colors">Downloads</a>
          <a href="#" data-external className="hover:text-white transition-colors">Training</a>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center">
        {/* Search Icon */}
        <button className="text-[#cccccc] hover:text-white p-2 mr-2" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Join Button */}
        <a 
          href="#" 
          data-external 
          className="px-4 py-1 border border-[#76b900] text-white text-sm font-medium hover:bg-[#76b900] hover:text-black transition-colors mx-2"
        >
          Join
        </a>

        {/* User Profile Icon */}
        <button className="text-[#cccccc] hover:text-white p-2 ml-2" aria-label="User Profile">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};