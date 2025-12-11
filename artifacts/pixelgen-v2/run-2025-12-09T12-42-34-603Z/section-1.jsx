const Section2 = () => {
  return (
    <div data-section="section-2" className="w-full font-sans">
      {/* Top Navigation Bar */}
      <div className="w-full bg-black h-[60px] flex items-center justify-between px-4 lg:px-8">
        
        {/* Left Side: Logo and Main Links */}
        <div className="flex items-center h-full">
          {/* Logo Area */}
          <a href="/" className="flex items-center mr-8 no-underline group">
            {/* Logo Icon Placeholder - Using placeholder as requested for specific graphics */}
            <img 
              src="https://placehold.co/36x26/76b900/76b900.png" 
              alt="NVIDIA Logo" 
              className="h-6 w-auto mr-2 object-contain" 
            />
            <div className="flex items-baseline">
              <span className="text-white font-bold text-xl tracking-tight">NVIDIA</span>
              <span className="text-gray-500 mx-0.5 font-bold">.</span>
              <span className="text-gray-300 font-normal text-xl tracking-wide group-hover:text-white transition-colors">DEVELOPER</span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-[15px] font-medium text-gray-300 h-full">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="#" data-external className="hover:text-white transition-colors">Forums</a>
            <a href="#" data-external className="hover:text-white transition-colors">Docs</a>
            <a href="/downloads" className="hover:text-white transition-colors">Downloads</a>
            <a href="#" data-external className="hover:text-white transition-colors">Training</a>
          </nav>
        </div>

        {/* Right Side: Search, Join, User */}
        <div className="flex items-center space-x-5">
          {/* Search Icon */}
          <button className="text-gray-300 hover:text-white transition-colors focus:outline-none" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Join Button */}
          <a href="#" data-external className="flex items-center justify-center border border-[#76b900] text-white px-4 py-1 text-[14px] font-bold hover:bg-[#76b900] transition-colors">
            Join
          </a>

          {/* User Profile Icon */}
          <button className="text-gray-300 hover:text-white transition-colors focus:outline-none" aria-label="User Profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="w-full bg-[#1a1a1a] h-[40px] flex items-center px-4 lg:px-8">
        <nav className="flex items-center space-x-8 text-[14px] font-medium text-[#999999]">
          {['Topics', 'Platforms and Tools', 'Industries', 'Resources'].map((item) => (
            <div key={item} className="flex items-center cursor-pointer hover:text-white transition-colors group">
              <span>{item}</span>
              <svg className="w-2.5 h-2.5 ml-2 fill-current pt-0.5 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24">
                 <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};