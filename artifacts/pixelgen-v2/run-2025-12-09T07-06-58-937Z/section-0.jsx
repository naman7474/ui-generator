const Section1 = () => {
  return (
    <div data-section="section-1" className="w-full h-[90px] flex items-center justify-between px-8 md:px-12 bg-transparent">
      {/* Logo */}
      <a href="/" className="flex-shrink-0">
        <img 
          src="./assets/img-0.png" 
          alt="KILRR Logo" 
          className="w-[135px] h-[49px] object-contain" 
        />
      </a>

      {/* Icons */}
      <div className="flex items-center gap-6">
        {/* Cart Icon */}
        <a href="#" data-external className="text-[#1c1c1c] hover:opacity-70 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </a>

        {/* User Icon with Lightning Bolt */}
        <a href="#" data-external className="relative text-[#1c1c1c] hover:opacity-70 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <div className="absolute -bottom-0.5 -right-0.5">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
        </a>
      </div>
    </div>
  );
};