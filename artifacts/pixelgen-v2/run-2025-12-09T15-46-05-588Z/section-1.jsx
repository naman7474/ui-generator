const Section2 = () => {
  return (
    <div data-section="section-2" className="w-full flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-black w-full h-[60px] flex items-center justify-between px-4 lg:px-8 xl:px-16">
        
        {/* Left Group: Logo + Nav */}
        <div className="flex items-center h-full">
          {/* Logo */}
          <a href="/" className="flex items-center mr-8 group no-underline select-none">
            {/* NVIDIA Spiral Logo Approximation */}
            <svg className="h-6 w-auto mr-2 text-[#76b900] fill-current" viewBox="0 0 24 24">
               <path d="M21.9 10.2c-.2-3.6-2.3-6.4-5.2-7.8.6 1.3.8 2.8.5 4.3-.4 2.1-2 3.8-4.1 4.3-1.6.4-3.2-.1-4.4-1.1 1.1 2.3 3.5 3.8 6.2 3.8 3.3 0 6.1-2.3 6.9-5.5z" />
               <path d="M3.2 12.2c0-3.3 1.8-6.2 4.5-7.9-.8 1.4-1.1 3.1-.7 4.8.5 2.3 2.3 4.1 4.6 4.6 1.8.4 3.6-.1 4.9-1.2-1.2 2.5-3.9 4.2-6.9 4.2-3.7 0-6.8-2.6-7.7-6.1-.1-.1-.1-.3-.1-.4h1.4z" />
            </svg>
            <div className="flex items-baseline text-white">
                <span className="font-bold text-[22px] tracking-tight leading-none">NVIDIA</span>
                <span className="mx-1.5 w-1 h-1 bg-gray-500 rounded-full self-center mb-1"></span>
                <span className="font-normal text-[22px] tracking-tight leading-none text-gray-100">DEVELOPER</span>
            </div>
          </a>

          {/* Main Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-[#cccccc] text-[15px] font-medium h-full pt-1">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="#" data-external className="hover:text-white transition-colors">Forums</a>
            <a href="#" data-external className="hover:text-white transition-colors">Docs</a>
            <a href="/downloads" className="hover:text-white transition-colors">Downloads</a>
            <a href="#" data-external className="hover:text-white transition-colors">Training</a>
          </nav>
        </div>

        {/* Right Group: Actions */}
        <div className="flex items-center gap-5 text-[#cccccc]">
          <button className="hover:text-white transition-colors p-1" aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <a href="#" data-external className="border border-[#76b900] text-white px-5 py-1 text-[14px] font-bold hover:bg-[#76b900] transition-colors leading-normal">
            Join
          </a>
          <button className="hover:text-white transition-colors p-1" aria-label="User Profile">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="3" />
              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#1a1a1a] w-full h-[40px] flex items-center px-4 lg:px-8 xl:px-16">
        <div className="flex items-center gap-8 text-[#999999] text-[13px] font-medium">
            {["Topics", "Platforms and Tools", "Industries", "Resources"].map((item) => (
                <div key={item} className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group">
                    {item}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mt-[2px] transform group-hover:rotate-180 transition-transform duration-200">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};