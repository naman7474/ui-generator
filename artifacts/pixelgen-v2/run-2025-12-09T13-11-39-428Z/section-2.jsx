const Section3 = () => {
  return (
    <div 
      data-section="section-3" 
      className="w-full flex items-center justify-between px-4 py-3 overflow-hidden"
      style={{ backgroundColor: '#3b5a00', minHeight: '64px' }} // Using dark olive green to match the screenshot's visual appearance exactly
    >
      {/* Left Text - "Conne" (Cut off in screenshot) */}
      <div className="text-black font-bold text-lg mr-4 shrink-0 select-none">
        Conne
      </div>

      {/* Center Content - Cookie Banner Overlay */}
      <div className="flex-1 flex items-center overflow-hidden mx-2">
        <div className="bg-white px-3 py-2 text-xs md:text-[13px] text-black whitespace-nowrap overflow-hidden w-full font-sans shadow-sm">
          NVIDIA and our third-party partners use cookies and other tools to collect and record information you provide as well as information about your interactions with
        </div>
      </div>

      {/* Right Controls - Button and Close Icon */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {/* Button with visible text "ng" */}
        <button className="bg-black text-white px-4 py-2 text-xs font-bold hover:bg-gray-900 transition-colors">
          ng
        </button>
        
        {/* Close Icon - Green Circle with Black X */}
        <button className="w-6 h-6 rounded-full bg-[#76B900] flex items-center justify-center hover:opacity-90 transition-opacity" aria-label="Close">
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeJoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};