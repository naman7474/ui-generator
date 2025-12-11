const Section9 = () => {
  return (
    <section data-section="about-us" className="w-full bg-white py-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        
        {/* Left Column: Logo & Copyright */}
        <div className="md:col-span-5 flex flex-col justify-between h-full min-h-[140px]">
          <div className="mb-8 md:mb-0">
            <img 
              src="./assets/img-60.png" 
              alt="Kilrr Logo" 
              className="w-[140px] h-auto object-contain" 
            />
          </div>
          <div className="mt-auto hidden md:block">
            <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-medium">
              © 2025 - KILRR
            </p>
          </div>
        </div>

        {/* Middle Column: About Us */}
        <div className="md:col-span-4">
          <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gray-800 uppercase mb-8">
            About Us
          </h3>
          <p className="text-gray-500 text-[15px] leading-7 font-light max-w-md">
            We crave good clean food, but we are also lazy like you all. And, that's why we made these instant marinades.
          </p>
        </div>

        {/* Right Column: Help & About */}
        <div className="md:col-span-3 md:pl-12">
          <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gray-800 uppercase mb-8">
            Help & About
          </h3>
          <ul className="flex flex-col space-y-3">
            <li>
              <a href="#" className="text-gray-500 text-[15px] font-light hover:text-gray-900 transition-colors">
                Our Policies
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-500 text-[15px] font-light hover:text-gray-900 transition-colors">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Mobile Copyright */}
        <div className="md:hidden mt-4">
            <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-medium">
              © 2025 - KILRR
            </p>
        </div>

      </div>
    </section>
  );
};