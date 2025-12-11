const Section2 = () => {
  return (
    <div data-section="section-2" className="w-full flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <div className="w-full bg-black h-[60px] flex items-center justify-between px-4 lg:px-12 xl:px-24 z-50 relative">
        
        {/* Left Side: Logo and Primary Nav */}
        <div className="flex items-center h-full">
          {/* Logo Area */}
          <a href="/" className="flex items-center gap-2 mr-10 text-white no-underline group shrink-0">
            {/* NVIDIA Eye Logo SVG */}
            <svg 
              viewBox="0 0 24 24" 
              className="h-6 w-auto fill-[#76b900]" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="NVIDIA Logo"
            >
               <path d="M21.8 9.6c-.4-4.8-4.3-8.5-9.1-8.5C7.2 1.1 2.7 5.6 2.7 11.1c0 2.4.9 4.6 2.4 6.3.2.2.5.2.7 0 .2-.2.2-.5 0-.7-1.3-1.5-2.1-3.5-2.1-5.6 0-4.9 4-8.9 8.9-8.9 4.3 0 7.9 3.1 8.7 7.3.1.3.4.5.7.4.3-.1.5-.4.4-.7z"/>
               <path d="M17.5 11.1c0-3.5-2.9-6.4-6.4-6.4-3.5 0-6.4 2.9-6.4 6.4 0 1.6.6 3.1 1.6 4.2.2.2.5.2.7 0 .2-.2.2-.5 0-.7-.8-1-1.3-2.2-1.3-3.5 0-2.9 2.4-5.3 5.3-5.3 2.9 0 5.3 2.4 5.3 5.3 0 1.3-.5 2.5-1.3 3.5-.2.2-.2.5 0 .7.2.2.5.2.7 0 1-1.1 1.6-2.6 1.6-4.2z"/>
               <path d="M14.3 11.1c0-1.8-1.4-3.2-3.2-3.2-1.8 0-3.2 1.4-3.2 3.2 0 .8.3 1.5.8 2.1.2.2.5.2.7 0 .2-.2.2-.5 0-.7-.3-.4-.5-.9-.5-1.4 0-1.2 1-2.1 2.1-2.1 1.2 0 2.1 1 2.1 2.1 0 .5-.2 1-.5 1.4-.2.2-.2.5 0 .7.2.2.5.2.7 0 .5-.6.8-1.3.8-2.1z"/>
            </svg>
            <div className="flex items-baseline">
              <span className="font-bold text-[19px] tracking-tight text-white leading-none">NVIDIA</span>
              <span className="mx-[3px] w-[3px] h-[3px] bg-gray-400 rounded-full self-center mb-[2px]"></span>
              <span className="text-[19px] text-gray-300 tracking-tight font-normal leading-none">DEVELOPER</span>
            </div>
          </a>

          {/* Primary Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-gray-400 h-full">
            <a href="/" className="hover:text-white transition-colors h-full flex items-center">Home</a>
            <a href="/blog" className="hover:text-white transition-colors h-full flex items-center">Blog</a>
            <a href="#" data-external className="hover:text-white transition-colors h-full flex items-center">Forums</a>
            <a href="#" data-external className="hover:text-white transition-colors h-full flex items-center">Docs</a>
            <a href="/downloads" className="hover:text-white transition-colors h-full flex items-center">Downloads</a>
            <a href="#" data-external className="hover:text-white transition-colors h-full flex items-center">Training</a>
          </nav>
        </div>

        {/* Right Side: Utilities */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button className="text-gray-300 hover:text-white transition-colors p-1" aria-label="Search">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* Join Button */}
          <a href="#" data-external className="border border-[#76b900] text-white px-4 py-[4px] text-[14px] font-bold hover:bg-[#76b900] transition-colors leading-snug">
            Join
          </a>
          
          {/* User Profile */}
          <button className="text-gray-300 hover:text-white transition-colors p-1" aria-label="User Profile">
            <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Sub-Navigation Bar */}
      <div className="w-full bg-[#1a1a1a] h-[40px] flex items-center px-4 lg:px-12 xl:px-24">
        <nav className="flex items-center gap-8 text-[14px] text-gray-400 font-medium">
          {['Topics', 'Platforms and Tools', 'Industries', 'Resources'].map((item) => (
            <div key={item} className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group">
              <span>{item}</span>
              <svg className="w-3 h-3 mt-[1px] text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};