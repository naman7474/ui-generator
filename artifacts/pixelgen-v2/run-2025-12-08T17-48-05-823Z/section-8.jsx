const Section9 = () => {
  return (
    <section data-section="about-us" className="w-full bg-white py-20 lg:py-24 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row">
        
        {/* Left Column: Logo & Copyright */}
        <div className="w-full md:w-5/12 flex flex-col justify-between min-h-[180px] mb-12 md:mb-0">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="./assets/img-60.png" 
              alt="Kilrr Logo" 
              className="w-[140px] h-[50px] object-contain" 
            />
          </div>
          
          {/* Copyright */}
          <div className="mt-auto">
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-medium">
              © 2025 - KILRR
            </p>
          </div>
        </div>

        {/* Middle Column: About Us */}
        <div className="w-full md:w-4/12 mb-12 md:mb-0">
          <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gray-800 mb-6 uppercase">
            About Us
          </h3>
          <p className="text-gray-500 text-[15px] leading-7 font-light max-w-[320px]">
            We crave good clean food, but we are also lazy like you all. And, that's why we made these instant marinades.
          </p>
        </div>

        {/* Right Column: Help & About */}
        <div className="w-full md:w-3/12 pl-0 md:pl-8 lg:pl-16">
          <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gray-800 mb-6 uppercase">
            Help & About
          </h3>
          <ul className="flex flex-col space-y-4">
            <li>
              <a href="#" className="text-gray-500 text-[15px] font-light hover:text-gray-800 transition-colors">
                Our Policies
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-500 text-[15px] font-light hover:text-gray-800 transition-colors">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
};