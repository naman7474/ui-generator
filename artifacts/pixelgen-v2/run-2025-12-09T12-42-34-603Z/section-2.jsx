const Section3 = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div 
      data-section="section-3" 
      className="w-full bg-[#76B900] flex justify-center items-center py-3 px-4 md:px-8"
      style={{ backgroundColor: 'rgb(118, 185, 0)' }}
    >
      <div className="w-full max-w-[1400px] flex items-center justify-between gap-4 md:gap-6">
        <div className="bg-white py-3 px-4 md:px-5 text-sm text-black w-full font-sans leading-normal shadow-sm">
          NVIDIA and our third-party partners use cookies and other tools to collect and record information you provide as well as information about your interactions with
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
          aria-label="Close cookie banner"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M1 11L11 1" stroke="#76B900" strokeWidth="2" strokeLinecap="round" strokeJoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};