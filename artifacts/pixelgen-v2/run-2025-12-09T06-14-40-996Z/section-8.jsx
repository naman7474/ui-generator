const Section9 = () => {
  return (
    <section data-section="about-us" className="w-full bg-white py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-y-0">
        
        {/* Left Column: Logo & Copyright */}
        <div className="md:col-span-4 flex flex-col justify-between h-full min-h-[160px]">
          {/* Logo */}
          <div className="flex-shrink-0">
             <img 
               src="./assets/img-60.png" 
               alt="Kilrr Logo" 
               className="w-[140px] h-[50px] object-contain object-left" 
             />
          </div>
          
          {/* Copyright */}
          <div className="mt-auto pt-12 md:pt-0">
            <p className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-medium">
              © 2025 - KILRR
            </p>
          </div>
        </div>

        {/* Middle Column: About Us */}
        <div className="md:col-span-4 md:col-start-5">
          <h3 className="text-[13px] font-medium uppercase tracking-[0.15em] text-gray-900 mb-8">
            ABOUT US
          </h3>
          <p className="text-gray-500 text-[16px] leading-relaxed font-light max-w-sm">
            We crave good clean food, but we are also lazy like you all. And, that's why we made these instant marinades.
          </p>
        </div>

        {/* Right Column: Help & About */}
        <div className="md:col-span-3 md:col-start-10 md:pl-12">
          <h3 className="text-[13px] font-medium uppercase tracking-[0.15em] text-gray-900 mb-8">
            HELP & ABOUT
          </h3>
          <ul className="flex flex-col space-y-5">
            <li>
              <a href="/pages/our-policies" className="text-gray-500 hover:text-gray-900 text-[16px] font-light transition-colors">
                Our Policies
              </a>
            </li>
            <li>
              <a href="/pages/contact-us" className="text-gray-500 hover:text-gray-900 text-[16px] font-light transition-colors">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
};