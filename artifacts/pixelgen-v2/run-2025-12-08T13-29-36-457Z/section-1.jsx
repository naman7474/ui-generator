const Section2 = () => {
  return (
    <footer data-section="about-us" className="w-full bg-white pt-16 pb-8 px-6 md:px-12 lg:px-20 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
        
        {/* Logo Column */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <img 
            src="./assets/img-1.png" 
            alt="Kilrr Logo" 
            className="w-36 md:w-[140px] h-auto object-contain" 
          />
        </div>

        {/* About Us Column */}
        <div className="flex flex-col max-w-[440px] md:mx-auto">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-800 uppercase mb-6">
            About Us
          </h3>
          <p className="text-gray-500 text-[15px] leading-7 font-normal">
            We crave good clean food, but we are also lazy like you all. And, that's why we made these instant marinades.
          </p>
        </div>

        {/* Help & About Column */}
        <div className="flex flex-col min-w-[140px]">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-800 uppercase mb-6">
            Help & About
          </h3>
          <div className="flex flex-col gap-4">
            <span className="text-gray-500 text-[15px] cursor-pointer hover:text-gray-800 transition-colors">
              Our Policies
            </span>
            <span className="text-gray-500 text-[15px] cursor-pointer hover:text-gray-800 transition-colors">
              Contact Us
            </span>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-24 text-[11px] tracking-[0.15em] text-gray-500 uppercase font-medium">
        © 2025 - KILRR
      </div>
    </footer>
  );
};