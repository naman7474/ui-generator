const Section2 = () => {
  return (
    <div data-section="section-2" className="w-full font-sans">
      {/* Top Navigation Bar */}
      <div className="w-full bg-black flex items-center justify-between px-4 md:px-8 h-[72px]">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 select-none">
          {/* Logo Icon - Using SVG to approximate the NVIDIA eye logo */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 text-[#76b900] fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5-3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm5 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
          </svg>
          <div className="flex items-baseline text-white text-[22px] leading-none tracking-tight">
            <span className="font-bold">NVIDIA</span>
            <span className="ml-1.5 font-normal text-[#e0e0e0]">DEVELOPER</span>
          </div>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 text-[#cccccc] text-[16px] font-medium">
          <a href="/" className="hover:text-white transition-colors duration-200">Home</a>
          <a href="/blog" className="hover:text-white transition-colors duration-200">Blog</a>
          <a href="#" data-external className="hover:text-white transition-colors duration-200">Forums</a>
          <a href="#" data-external className="hover:text-white transition-colors duration-200">Docs</a>
          <a href="/downloads" className="hover:text-white transition-colors duration-200">Downloads</a>
          <a href="#" data-external className="hover:text-white transition-colors duration-200">Training</a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          <button className="text-[#cccccc] hover:text-white transition-colors p-1" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <a 
            href="#" 
            data-external
            className="border border-[#76b900] text-white px-5 py-1.5 text-[14px] font-bold hover:bg-[#76b900] transition-colors duration-200"
          >
            Join
          </a>

          <button className="text-[#cccccc] hover:text-white transition-colors p-1" aria-label="User Profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="w-full bg-[#1a1a1a] flex items-center px-4 md:px-8 h-[46px] border-t border-[#333333]">
        <nav className="flex items-center gap-8 text-[#999999] text-[14px] font-normal">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors duration-200 group">
            Topics 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors duration-200 group">
            Platforms and Tools 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors duration-200 group">
            Industries 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors duration-200 group">
            Resources 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </nav>
      </div>
    </div>
  );
};