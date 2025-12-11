const Section8 = () => {
  return (
    <section data-section="about-us" className="w-full bg-white py-24 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Logo & Copyright */}
        <div className="md:col-span-3 flex flex-col justify-between h-full min-h-[180px]">
          <div className="mb-8 md:mb-0">
            <img 
              src="./assets/img-60.png" 
              alt="Kilrr Logo" 
              className="w-[140px] h-[50px] object-contain" 
            />
          </div>
          <div className="mt-auto">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">
              © 2025 - KILRR
            </p>
          </div>
        </div>

        {/* Middle Column: About Us */}
        <div className="md:col-span-5 md:pl-12">
          <h3 className="text-[11px] font-medium tracking-[0.2em] text-gray-900 uppercase mb-8">
            About Us
          </h3>
          <p className="text-gray-500 leading-7 text-[15px] font-normal max-w-md">
            We crave good clean food, but we are also lazy like you all. And, that's why we made these instant marinades.
          </p>
        </div>

        {/* Right Column: Help & About */}
        <div className="md:col-span-4 md:pl-24">
          <h3 className="text-[11px] font-medium tracking-[0.2em] text-gray-900 uppercase mb-8">
            Help & About
          </h3>
          <ul className="flex flex-col space-y-4">
            <li>
              <a href="#" className="text-gray-500 text-[15px] font-normal hover:text-gray-900 transition-colors">
                Our Policies
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-500 text-[15px] font-normal hover:text-gray-900 transition-colors">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
};