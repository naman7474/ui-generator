const Section3 = () => {
  return (
    <div data-section="section-3" className="w-full h-[64px] bg-[#3e5700] flex items-center justify-between px-4 md:px-8 relative font-sans overflow-hidden">
      {/* Left Content: Connect Text */}
      <div className="flex items-center flex-shrink-0 z-0">
        <span className="text-black font-bold text-lg tracking-tight whitespace-nowrap">
          Connect with NVIDIA
        </span>
      </div>

      {/* Center Overlay: Cookie Consent Notification */}
      {/* Positioned absolutely to match the screenshot's overlay appearance */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-md px-5 py-3 w-auto max-w-[600px] hidden md:flex items-center justify-center z-10">
        <p className="text-black text-[11px] leading-tight font-normal text-left">
          NVIDIA and our third-party partners use cookies and other tools to collect and record information you provide as well as information about your interactions with...
        </p>
      </div>

      {/* Right Content: Action Button and Close Icon */}
      <div className="flex items-center gap-4 flex-shrink-0 z-0">
        <button className="bg-black text-white text-sm font-bold px-4 py-2 hover:bg-gray-900 transition-colors whitespace-nowrap">
          Sign Up for Gaming
        </button>
        <button className="text-black hover:text-gray-300 transition-colors p-1" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};