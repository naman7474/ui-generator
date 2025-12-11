const Section2 = () => {
  return (
    <footer data-section="about-us" className="w-full bg-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <a href="/">
              <img 
                src="./assets/img-1.png" 
                alt="Kilrr Logo" 
                className="h-[50px] w-auto object-contain" 
              />
            </a>
          </div>

          {/* About Us Section */}
          <div className="flex-1 max-w-[400px] md:mx-auto">
            <h3 className="text-xs font-medium tracking-[0.15em] text-gray-800 uppercase mb-4">
              About Us
            </h3>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              We crave good clean food, but we are also lazy like you all. And, that's why we made these instant marinades.
            </p>
          </div>

          {/* Help & About Section */}
          <div className="flex-shrink-0 min-w-[140px]">
            <h3 className="text-xs font-medium tracking-[0.15em] text-gray-800 uppercase mb-4">
              Help & About
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="/pages/our-policies" className="text-gray-500 hover:text-gray-900 text-[15px] transition-colors">
                  Our Policies
                </a>
              </li>
              <li>
                <a href="/pages/contact-us" className="text-gray-500 hover:text-gray-900 text-[15px] transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-16">
          <p className="text-[10px] tracking-[0.1em] text-gray-500 uppercase">
            &copy; 2025 - KILRR
          </p>
        </div>
      </div>
    </footer>
  );
};