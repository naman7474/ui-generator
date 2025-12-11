const Section5 = () => {
  return (
    <footer data-section="section-5" className="w-full font-sans">
      {/* Top Section: Black Background */}
      <div className="bg-black w-full py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Left: Newsletter Signup */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center lg:justify-start">
            {/* Envelope Icon */}
            <div className="text-white flex-shrink-0">
              <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-9">
                <rect x="1" y="1" width="46" height="34" stroke="white" strokeWidth="1.5"/>
                <path d="M1 1L24 20L47 1" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            
            <span className="text-white text-xl font-bold tracking-tight text-center sm:text-left">
              Sign up for NVIDIA News
            </span>
            
            <button className="bg-[#76b900] hover:bg-[#6aa600] text-black font-bold text-base py-2 px-6 transition-colors duration-200 whitespace-nowrap">
              Subscribe
            </button>
          </div>

          {/* Right: Social & Blog */}
          <div className="flex flex-col items-center lg:items-end gap-1 w-full lg:w-auto">
            {/* Social Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-1">
              <span className="text-[#a1a1a1] text-base font-medium">Follow NVIDIA Developer</span>
              <div className="flex items-center gap-3 text-[#a1a1a1]">
                {/* Facebook */}
                <a href="#" data-external className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                </a>
                {/* Instagram */}
                <a href="#" data-external className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="#" data-external className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                {/* X (Twitter) */}
                <a href="#" data-external className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                </a>
                {/* YouTube */}
                <a href="#" data-external className="hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </a>
              </div>
            </div>
            {/* Blog Link */}
            <div className="text-sm text-[#a1a1a1] text-center lg:text-right">
              Find more news and tutorials on <a href="/blog" className="text-white border-b border-[#76b900] pb-[1px] hover:text-[#76b900] transition-colors">NVIDIA Technical Blog</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Dark Gray Background */}
      <div className="bg-[#222222] w-full py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          
          {/* Logo */}
          <div className="mb-8">
             <div className="flex items-center select-none">
                {/* Green Swirl Icon */}
                <svg className="h-8 w-10 mr-2" viewBox="0 0 64 64" fill="#76b900">
                  <path d="M4 32c0-11 6-21 15-26 1.5-.8 3.5-.5 4.5 1s.5 3.5-1 4.5C16 15 12 23 12 32s4 17 10.5 20.5c1.5 1 2 3 1 4.5s-3 2-4.5 1C10 53 4 43 4 32z"/>
                  <path d="M32 4c-1.7