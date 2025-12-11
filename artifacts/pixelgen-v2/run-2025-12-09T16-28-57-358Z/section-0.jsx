const Section1 = () => {
  return (
    <nav data-section="section-1" className="w-full flex flex-col font-sans antialiased">
      {/* Top Bar */}
      <div className="w-full bg-black h-[60px] flex items-center justify-between px-4 md:px-8 lg:px-16 xl:px-24 z-50 relative">
        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center gap-8 h-full">
          {/* Logo Area */}
          <a href="/" className="flex items-center gap-2 text-white no-underline group h-full">
            {/* NVIDIA Logo Icon (Approximation) */}
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-8 text-[#76b900] fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 4C6.48 4 2 8.48 2 14c0 1.5.35 2.92.97 4.21.16.33.59.46.91.28.32-.18.44-.58.28-.9C3.53 16.5 3.25 15.28 3.25 14c0-4.83 3.92-8.75 8.75-8.75 4.83 0 8.75 3.92 8.75 8.75 0 1.28-.28 2.5-.91 3.59-.16.32-.04.72.28.9.32.18.75.05.91-.28.62-1.29.97-2.71.97-4.21 0-5.52-4.48-10-10-10z" />
              <path d="M12 7.5c-3.59 0-6.5 2.91-6.5 6.5 0 1.05.25 2.04.7 2.92.17.33.57.46.9.29.33-.17.46-.57.29-.9-.33-.65-.51-1.38-.51-2.16 0-2.84 2.31-5.15 5.15-5.15 2.84 0 5.15 2.31 5.15 5.15 0 .78-.18 1.51-.51 2.16-.17.33-.04.73.29.9.33.17.73.04.9-.29.45-.88.7-1.87.7-2.92 0-3.59-2.91-6.5-6.5-6.5z" />
              <circle cx="12" cy="14" r="2" />
            </svg>
            
            <div className="flex items-baseline tracking-tight">
              <span className="font-bold text-xl text-white">NVIDIA</span>
              <span className="mx-1.5 w-1 h-1 bg-[#999] rounded-full self-center mb-1"></span>
              <span className="font-normal text-xl text-white uppercase">DEVELOPER</span>
            </div>
          </a>

          {/* Main Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-[#cccccc] h-full">
            <a href="/" className="hover:text-white transition-colors h-full flex items-center">Home</a>
            <a href="/blog" className="hover:text-white transition-colors h-full flex items-center">Blog</a>
            <a href="#" data-external className="hover:text-white transition-colors h-full flex items-center">Forums</a>
            <a href="#" data-external className="hover:text-white transition-colors h-full flex items-center">Docs</a>
            <a href="/downloads" className="hover:text-white transition-colors h-full flex items-center">Downloads</a>
            <a href="#" data-external className="hover:text-white transition-colors h-full flex items-center">Training</a>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-5">
          <button aria-label="Search" className="text-white hover:text-[#76b900] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <a href="#" data-external className="border border-[#76b900] text-white px-5 py-1 text-[15px] font-bold hover:bg-[#76b900] transition-colors leading-normal">
            Join
          </a>
          
          <button aria-label="User Profile" className="text-white hover:text-[#76b900] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-[#1a1a1a] h-[40px] flex items-center px-4 md:px-8 lg:px-16 xl:px-24 border-t border-[#333]">
        <div className="flex items-center gap-8 text-sm text-[#999999]">
          {['Topics', 'Platforms and Tools', 'Industries', 'Resources'].map((item) => (
            <div key={item} className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group h-full">
              <span>{item}</span>
              <svg className="w-3 h-3 mt-0.5 group-hover:text-[#76b900] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};