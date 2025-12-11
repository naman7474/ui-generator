const Section3 = () => {
  return (
    <div data-section="section-3" className="w-full bg-[#253800] h-[64px] flex items-center justify-center relative overflow-hidden">
      <div className="bg-white h-full w-full max-w-[1280px] flex items-center px-6">
        <p className="text-[13px] md:text-[14px] text-black font-sans leading-normal">
          NVIDIA and our third-party partners use cookies and other tools to collect and record information you provide as well as information about your interactions with
        </p>
      </div>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full flex items-center justify-center z-10 hover:bg-gray-900 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L10 10M2 10L10 2" stroke="#76b900" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};