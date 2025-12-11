const Section1 = () => {
  return (
    <nav data-section="section-1" className="w-full flex flex-col font-sans">
      {/* Top Bar */}
      <div className="w-full bg-black h-[56px] flex items-center justify-between px-4 lg:px-8">
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center h-full">
          {/* Logo */}
          <a href="/" className="flex items-center mr-8 group no-underline">
            <svg
              className="h-[26px] w-auto mr-2 fill-[#76b900]"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="NVIDIA Logo"
            >
              <path d="M24 10.9c-0.4-3.4-2.2-6.4-5-8.3 0.2 0.6 0.3 1.2 0.3 1.8 0 3.8-3.1 6.9-6.9 6.9 -0.7 0-1.3-0.1-1.9-0.3 0.8 1.8 2.6 3.1 4.7 3.1 2.9 0 5.2-2.3 5.2-5.2 0-0.7-0.1-1.3-0.4-1.9z" />
              <path d="M12.4 1.5c-5 0-9.3 2.9-11.4 7.1 0.8-0.5 1.7-0.8 2.7-0.8 2.9 0 5.2 2.3 5.2 5.2 0 0.5-0.1 1-0.3 1.5 2.9-0.7 5.1-3.3 5.1-6.4 0-3.6-3-6.6-6.6-6.6z" />
              <path d="M1.5 13.6c0 3.6 1.8 6.9 4.6 8.9 -0.2-0.6-0.3-1.2-0.3-1.8 0-2.9 2.3-5.2 5.2-5.2 0.6 0 1.2 0.1 1.8 0.3 -1.9-2-4.7-3.2-7.7-3.2 -2.9 0-5.2 2.3-5.2 5.2 0 0.6 0.1 1.2 0.4 1.9z" />
            </svg>
            <div className="flex items-baseline leading-none">
              <span className="text-white font-bold text-[21px] tracking-tight">NVIDIA</span>
              <span className="text-[#cccccc] font-normal text-[21px] ml-[5px] tracking-tight">DEVELOPER</span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 ml-2">
            <a href="/" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Home</a>
            <a href="/blog" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Blog</a>
            <a href="#" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors" data-external>Forums</a>
            <a href="#" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors" data-external>Docs</a>
            <a href="/downloads" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors">Downloads</a>
            <a href="#" className="text-[#cccccc] hover:text-white text-[15px] font-medium transition-colors" data-external>Training</a>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center space-x-5">
          {/* Search */}
          <button className="text-[#cccccc] hover:text-white transition-colors focus:outline-none" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Join Button */}
          <a href="#" className="border border-[#76b900] text-white px-[18px] py-[5px] text-[14px] font-bold hover:bg-[#76b900] transition-colors leading-none" data-external>
            Join
          </a>

          {/* User Profile */}
          <button className="text-[#cccccc] hover:text-white transition-colors focus:outline-none" aria-label="User Profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-[#1a1a1a] h-[44px] flex items-center px-4 lg:px-8 border-t border-[#333333]">
        <div className="flex items-center space-x-8">
          {['Topics', 'Platforms and Tools', 'Industries', 'Resources'].map((item) => (
            <button key={item} className="flex items-center text-[#999999] hover:text-white text-[14px] font-medium transition-colors group focus:outline-none">
              {item}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1.5 fill-current opacity-80 group-hover:opacity-100 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};