const Section3 = () => {
  const posts = [
    {
      date: "Oct 03, 2025",
      title: "Enable Gang Scheduling and Workload Prioritization in Ray with NVIDIA KAI...",
      excerpt: "NVIDIA KAI Scheduler is now natively integrated with KubeRay, bringing the same scheduling...",
      readTime: "10 MIN READ"
    },
    {
      date: "Sep 10, 2025",
      title: "Maximizing Low-Latency Networking Performance for Financial Services wit...",
      excerpt: "Ultra-low latency and reliable packet delivery are critical requirements for modern...",
      readTime: "10 MIN READ"
    },
    {
      date: "Sep 09, 2025",
      title: "How to Connect Distributed Data Centers Into Large AI Factories...",
      excerpt: "AI scaling is incredibly complex, and new techniques in training and inference are continually...",
      readTime: "6 MIN READ"
    },
    {
      date: "Sep 03, 2025",
      title: "North-South Networks: The Key to Faster Enterprise AI Workloads",
      excerpt: "In AI infrastructure, data fuels the compute engine. With evolving agentic AI systems, where multipl...",
      readTime: "9 MIN READ"
    }
  ];

  return (
    <footer data-section="section-3" className="w-full bg-[#eeeeee] py-10 relative font-sans">
      <div className="max-w-[1400px] mx-auto px-12 relative">
        
        {/* Left Navigation Button */}
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-12 flex items-center justify-center bg-[#b4d868] hover:bg-[#a3c65a] transition-colors -ml-4 lg:-ml-12 cursor-pointer"
          aria-label="Previous"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 1L1 7L5 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white p-6 flex flex-col h-full min-h-[320px] shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-gray-200">
              <div className="text-xs text-gray-600 mb-3 font-medium tracking-wide">
                {post.date}
              </div>
              <h3 className="text-[18px] leading-snug font-bold text-black mb-3 line-clamp-3">
                {post.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-auto text-[10px] font-bold text-black uppercase tracking-wider">
                {post.readTime}
              </div>
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-12 flex items-center justify-center bg-[#76b900] hover:bg-[#6aa600] transition-colors -mr-4 lg:-mr-12 cursor-pointer"
          aria-label="Next"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 1L7 7L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      </div>

      {/* Bottom decorative bar */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-white border-t border-gray-200 flex justify-between items-end">
         <div className="w-8 h-full bg-[#76b900]"></div>
         <div className="w-8 h-full bg-[#76b900]"></div>
      </div>
    </footer>
  );
};