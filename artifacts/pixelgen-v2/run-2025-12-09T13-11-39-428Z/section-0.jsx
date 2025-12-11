const Section1 = () => {
  return (
    <nav data-section="section-1" className="w-full flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <div className="w-full bg-black h-[64px] flex items-center justify-between px-4 md:px-8 lg:px-12 border-b border-gray-900/30">
        {/* Left Side: Logo & Links */}
        <div className="flex items-center h-full">
          {/* Logo */}
          <a href="/" className="flex items-center mr-8 shrink-0">
            <img 
              src="https://placehold.co/190x32/000000/FFFFFF/png?text=NVIDIA+DEVELOPER" 
              alt="NVIDIA Developer" 
              className="h-[24px] object-contain opacity-90 hover:opacity-100 transition-opacity" 
            />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-[#cccccc]">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="#" data-external className="hover:text-white transition-colors">Forums</a>
            <a href="#" data-external className="hover:text-white transition-colors">Docs</a>
            <a href="/downloads" className="hover:text-white transition-colors">Downloads</a>
            <a href="#" data-external className="hover:text-white transition-colors">Training</a>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-6">
          {/* Search Icon */}
          <button className="text-gray-300 hover:text-white transition-colors" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Join Button */}
          <a 
            href="#" 
            className="border border-[#76b900] text-[#76b900] px-5 py-1.5 text-[14px] font-bold leading-none hover:bg-[#76b900] hover:text-black transition-all"
          >
            Join
          </a>

          {/* User Icon */}
          <button className="text-gray-300 hover:text-white transition-colors" aria-label="User Profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="w-full bg-[#1a1a1a] h-[42px] flex items-center px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-8 text-[14px] text-[#999999] font-medium">
          {['Topics', 'Platforms and Tools', 'Industries', 'Resources'].map((item) => (
            <div key={item} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
              <span>{item}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 fill-current pt-0.5 opacity-80 group-hover:opacity-100" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};