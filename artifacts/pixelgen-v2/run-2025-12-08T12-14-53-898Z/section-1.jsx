const Section2 = () => {
  // Social icons data with SVG paths
  const socialIcons = [
    {
      name: "Facebook",
      viewBox: "0 0 24 24",
      path: <path fill="currentColor" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    },
    {
      name: "X",
      viewBox: "0 0 24 24",
      path: <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    },
    {
      name: "Instagram",
      viewBox: "0 0 24 24",
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </g>
      )
    },
    {
      name: "Youtube",
      viewBox: "0 0 24 24",
      path: (
        <path fill="currentColor" d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02l5.75-3.27-5.75-3.27z" />
      )
    },
    {
      name: "Email",
      viewBox: "0 0 24 24",
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </g>
      )
    }
  ];

  return (
    <div data-section="section-2" className="w-full bg-black text-white pt-16 pb-8 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-20">
          
          {/* Column 1: Brand, Social, App */}
          <div className="flex flex-col items-start">
            <img 
              src="./assets/img-78.png" 
              alt="BBLUNT" 
              className="h-10 w-auto object-contain mb-8" 
            />
            
            <div className="flex space-x-3 mb-8">
              {socialIcons.map((icon, index) => (
                <div 
                  key={index} 
                  className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-white hover:border-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox={icon.viewBox}
                  >
                    {icon.path}
                  </svg>
                </div>
              ))}
            </div>

            <p className="text-[15px] text-[#999999] mb-6 leading-relaxed max-w-[260px]">
              Get the App to track your order status smoothly
            </p>

            <div className="flex flex-col space-y-3">
              <img 
                src="./assets/img-79.png" 
                alt="Download on Android" 
                className="h-[48px] w-auto object-contain cursor-pointer" 
              />
              <img 
                src="./assets/img-80.webp" 
                alt="Download on iOS" 
                className="h-[48px] w-auto object-contain cursor-pointer" 
              />
            </div>
          </div>

          {/* Column 2: About Us */}
          <div>
            <h3 className="text-[17px] font-bold mb-6 text-white">About Us</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Blogs</a></li>
            </ul>
          </div>

          {/* Column 3: Useful Links & My Account */}
          <div className="flex flex-col">
            <div className="mb-10">
              <h3 className="text-[17px] font-bold mb-6 text-white">Useful Links</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Return Policy</a></li>
                <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[17px] font-bold mb-6 text-white">My Account</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Profile</a></li>
                <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Orders</a></li>
                <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Addresses</a></li>
              </ul>
            </div>
          </div>

          {/* Column 4: Our Salons */}
          <div>
            <h3 className="text-[17px] font-bold mb-6 text-white">Our Salons</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Mumbai</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Hyderabad</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Bangalore</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Gurugram</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Guwahati</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Kolkata</a></li>
            </ul>
          </div>

          {/* Column 5: Categories */}
          <div>
            <h3 className="text-[17px] font-bold mb-6 text-white">Categories</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">All Products</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Hair Styling</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Hair Colour</a></li>
              <li><a href="#" className="text-[14px] text-[#999999] hover:text-white transition-colors">Hair Care</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#222222] pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-[12px] text-[#666666]">
            © 2025 Honasa Consumer Limited. All rights reserved.
          </p>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <span className="text-[12px] text-[#666666]">100% Payment Protection, Easy Return Policy</span>
            <div className="flex items-center gap-2">
              <img src="./assets/img-81.svg" alt="visa" className="h-6 w-auto" />
              <img src="./assets/img-82.svg" alt="master" className="h-6 w-auto" />
              <img src="./assets/img-83.svg" alt="american express" className="h-6 w-auto" />
              <img src="./assets/img-84.svg" alt="rupay" className="h-6 w-auto" />
              <img src="./assets/img-85.svg" alt="netbanking" className="h-6 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};