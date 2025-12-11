const Section1 = () => {
  return (
    <nav data-section="section-1" className="w-full flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <div className="w-full bg-black border-b border-[#222222]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
          
          {/* Left Section: Logo & Main Links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group text-decoration-none">
              {/* NVIDIA Eye Logo SVG */}
              <svg 
                viewBox="0 0 24 24" 
                className="w-[28px] h-[28px] text-[#76b900] fill-current"
                aria-label="NVIDIA Logo"
              >
                <path d="M21.8 12.6c-.2-2.5-1.4-4.5-3.2-5.9-.4-.3-.9-.2-1.1.2-.2.4-.1.9.3 1.1 1.4 1.1 2.2 2.6 2.3 4.4.1 3.2-2.4 5.9-5.6 6.1-3.2.2-6-2.2-6.2-5.4-.2-3 2-5.6 5-6 .5-.1.8-.5.7-1-.1-.5-.5-.8-1-.7-3.8.5-6.6 3.8-6.3 7.6.3 4.1 3.8 7.2 7.9 6.9 3.8-.3 6.9-3.4 7.2-7.3z" />
                <path d="M17.5 12.4c-.1-1.5-.9-2.9-2-3.8-.4-.3-.9-.2-1.1.2-.2.4-.1.9.3 1.1.8.6 1.3 1.5 1.4 2.4.1 1.9-.9 3.7-2.7 4.2-2 .6-4.1-.7-4.6-2.7-.5-1.9 1.1-4 3-4.4.5-.1.8-.5.7-1-.1-.5-.5-.8-1-.7-2.8.6-4.7 3.2-4.1 6 0 .1.1.2.1.3.5 2.7 3.2 4.4 5.9 3.9 2.6-.5 4.4-2.9 4.1-5.5z" />
                <path d="M12.8 12.2c0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6 0-.9.7-1.6 1.6-1.6.9 0 1.6.7 1.6 1.6z" />
              </svg>
              
              <div className="flex items-baseline gap-[3px]">
                <span className="text-white font-bold text-[19px] tracking-tight leading-none">NVIDIA</span>
                <span className="text-[#666666] text-[19px] leading-none">.</span>
                <span className="text-[#999999] font-normal text-[19px] tracking-tight leading-none">DEVELOPER</span>
              </div>
            </a>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 ml-2">
              <a href="/" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Home</a>
              <a href="/blog" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Blog</a>
              <a href="#" data-external className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Forums</a>
              <a href="#" data-external className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Docs</a>
              <a href="/downloads" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Downloads</a>
              <a href="#" data-external className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Training</a>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-5">
            <button className="text-[#cccccc] hover:text-white transition-colors" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <a href="#" data-external className="flex items-center justify-center border border-[#76b900] text-white px-4 py-[5px] text-[14px] font-bold hover:bg-[#76b900] transition-colors">
              Join
            </a>
            
            <button className="text-[#cccccc] hover:text-white transition-colors" aria-label="User Profile">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="w-full bg-[#1a1a1a]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[40px] flex items-center">
          <div className="flex items-center gap-8">
            {['Topics', 'Platforms and Tools', 'Industries', 'Resources'].map((item) => (
              <button key={item} className="group flex items-center gap-1.5 text-[#999999] hover:text-white text-[13px] font-medium transition-colors">
                {item}
                <svg className="w-2.5 h-2.5 fill-current opacity-70 group-hover:opacity-100 mt-[1px]" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};