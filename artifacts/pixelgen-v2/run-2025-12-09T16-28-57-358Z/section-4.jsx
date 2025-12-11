const Section5 = () => {
  return (
    <footer data-section="section-5" className="w-full font-sans">
      {/* Top Section: Black Background with Green Top Border */}
      <div className="w-full bg-black border-t-[5px] border-[#76B900] py-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Left Side: Newsletter Signup */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center lg:justify-start">
            {/* Envelope Icon */}
            <div className="text-white shrink-0">
              <svg width="42" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
                <rect x="2" y="4" width="20" height="16" />
                <path d="M2 4l10 7 10-7" />
              </svg>
            </div>
            {/* Text */}
            <h3 className="text-white font-bold text-xl tracking-wide whitespace-nowrap">
              Sign up for NVIDIA News
            </h3>
            {/* Button */}
            <button className="bg-[#76B900] hover:bg-[#66a000] text-black font-bold py-2.5 px-6 text-base transition-colors rounded-none whitespace-nowrap">
              Subscribe
            </button>
          </div>

          {/* Right Side: Socials & Blog Link */}
          <div className="flex flex-col items-center lg:items-end gap-2 w-full lg:w-auto">
            {/* Social Icons Row */}
            <div className="flex flex-wrap justify-center lg:justify-end items-center gap-4 mb-1">
              <span className="text-[#cccccc] text-base font-medium mr-2">Follow NVIDIA Developer</span>
              
              {/* Facebook */}
              <a href="#" data-external className="text-[#cccccc] hover:text-white transition-colors">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                </svg>
              </a>
              
              {/* Instagram */}
              <a href="#" data-external className="text-[#cccccc] hover:text-white transition-colors">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* LinkedIn */}
              <a href="#" data-external className="text-[#cccccc] hover:text-white transition-colors">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              
              {/* X (Twitter) */}
              <a href="#" data-external className="text-[#cccccc] hover:text-white transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a href="#" data-external className="text-[#cccccc] hover:text-white transition-colors">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>
            </div>
            
            {/* Blog Link */}
            <div className="text-[#cccccc] text-sm text-center lg:text-right">
              Find more news and tutorials on <a href="/blog" className="text-white border-b-2 border-[#76B900] hover:text-[#76B900] transition-colors pb-[1px]">NVIDIA Technical Blog</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Dark Grey Background */}
      <div className="w-full bg-[#222222] py-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
             {/* NVIDIA Eye Logo SVG */}
             <svg className="w-9 h-9 fill-[#76B900]" viewBox="0 0 24 24">
                <path d="M21.6 10.8c-0.2-0.1-0.3-0.2-0.5-0.2 -0.2 0-0.4 0.1-0.5 0.2 -1.4 1.4-3.3 2.3-5.4 2.3 -4.2 0-7.6-3.4-7.6-7.6 0-1.5 0.4-2.9 1.2-4.1 0.1-0.2 0.1-0.4 0-0.6 -0.1-0.2-0.3-0.3-0.5-0.3 -0.1 0-0.2 0-0.3 0.1 -4.6 1.6-7.9 6-7.9 11.1 0 6.5 5.3 11.8 11.8 11.8 5.1 0 9.5-3.3 11.1-7.9 0.1-0.2 0-0.4-0.1-0.6 -0.1-0.2-0.3-0.3-0.5-0.3 -0.3 0-0.6 0.1-0.8 0.1z M12.8 5.6c0 0.2-0.2 0.4-0.4 0.4 -3.1 0-5.6 2.5-5.6 5.6 0 0.2-0.2 0.4-0.4 0.4s-0.4-0.2-0.4-0.4c0-3.5 2.9-6.4 6.4-6.4 0.2 0 0.4 0.2 0.4 0.4z" />
             </svg>
             <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-2xl tracking-tight">NVIDIA</span>
                <span className="text-white font-bold text-2xl tracking-tight">DEVELOPER</span>
             </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[#cccccc] text-sm mb-4">
            <a href="#" data-external className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-[#cccccc] px-1">|</span>
            <a href="#" data-external className="hover:text-white transition-colors">Your Privacy Choices</a>
            <span className="text-[#cccccc] px-1">|</span>
            <a href="#" data-external className="hover:text-white transition-colors">Terms of Use</a>
            <span className="text-[#cccccc] px-1">|</span>
            <a href="#" data-external className="hover:text-white transition-colors">Accessibility</a>
            <span className="text-[#cccccc] px-1">|</span>
            <a href="#" data-external className="hover:text-white transition-colors">Corporate Policies</a>
            <span className="text-[#cccccc] px-1">|</span>
            <a href="#" data-external className="hover:text-white transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <div className="text-[#888888] text-xs">
            Copyright © 2025 NVIDIA Corporation
          </div>

        </div>
      </div>
    </footer>
  );
};