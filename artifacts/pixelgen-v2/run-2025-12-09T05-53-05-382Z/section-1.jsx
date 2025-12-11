const Section2 = () => {
  return (
    <footer data-section="about-us" className="w-full bg-white pt-14 pb-8 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start">
          
          {/* Logo Column */}
          <div className="mb-10 md:mb-0 md:w-1/4 flex-shrink-0">
            <img 
              src="./assets/img-1.png" 
              alt="Kilrr Logo" 
              className="w-[140px] h-auto object-contain"
            />
          </div>

          {/* About Us Column */}
          <div className="mb-10 md:mb-0 md:w-5/12 lg:w-1/3 md:pl-4">
            <h3 className="text-[11px] font-medium tracking-[0.15em] text-gray-800 uppercase mb-5">
              About Us
            </h3>
            <p className="text-[15px] leading-7 text-gray-500 font-normal">
              We crave good clean food, but we are also lazy like you all. And, that's why we made these instant marinades.
            </p>
          </div>

          {/* Help & About Column */}
          <div className="md:w-1/4 flex flex-col md:items-start md:pl-10 lg:pl-24">
            <h3 className="text-[11px] font-medium tracking-[0.15em] text-gray-800 uppercase mb-5">
              Help & About
            </h3>
            <div className="flex flex-col space-y-4">
              <span className="text-[15px] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                Our Policies
              </span>
              <span className="text-[15px] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                Contact Us
              </span>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-20 md:mt-24">
          <p className="text-[10px] tracking-[0.1em] text-gray-500 uppercase font-medium">
            © 2025 - KILRR
          </p>
        </div>
      </div>
    </footer>
  );
};