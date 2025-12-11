const Section4 = () => {
  const tutorials = [
    {
      img: "./assets/img-0.png",
      date: "December 04, 2025",
      title: "Simplify GPU Programming with NVIDIA CUDA Tile in Python",
      link: "#"
    },
    {
      img: "./assets/img-1.gif",
      date: "December 03, 2025",
      title: "How to Enhance 3D Gaussian Reconstruction Quality for Simulation",
      link: "#"
    },
    {
      img: "./assets/img-2.png",
      date: "December 01, 2025",
      title: "Train Small Orchestration Agents to Solve Big Problems",
      link: "#"
    }
  ];

  const latestReleases = [
    "CUDA Toolkit 13.0",
    "DLSS 4",
    "HPC SDK 25.7",
    "Nsight Systems 2025.3.1",
    "PhysicsNeMo 25.06",
    "RAPIDS 25.06",
    "Sionna 1.1.0",
    "TensorRT 10",
    "Triton Inference Server 2.59.0"
  ];

  const news = [
    {
      img: "./assets/img-3.png",
      date: "December 05, 2025",
      title: "NVIDIA Kaggle Grandmasters Win Artificial General Intelligence Competition",
      link: "#"
    },
    {
      img: "./assets/img-4.jpg",
      date: "December 04, 2025",
      title: "Focus on Your Algorithm—NVIDIA CUDA Tile Handles the Hardware",
      link: "#"
    },
    {
      img: "./assets/img-5.png",
      date: "December 02, 2025",
      title: "NVIDIA-Accelerated Mistral 3 Open Models Deliver Efficiency, Accuracy at Any Scale",
      link: "#"
    },
    {
      img: "./assets/img-6.jpg",
      date: "November 19, 2025",
      title: "Building Better Qubits with GPU-Accelerated Computing",
      link: "#"
    }
  ];

  const training = [
    {
      img: "./assets/img-7.jpg",
      title: "Webinar: What’s New With NVIDIA Certification",
      link: "#",
      cta: "Watch On-Demand"
    },
    {
      img: "./assets/img-8.jpg",
      title: "Digital Twins for Physical AI Learning Path",
      link: "#",
      cta: "Explore Curriculum"
    },
    {
      img: "./assets/img-9.jpg",
      title: "Universal Scene Description (OpenUSD) Learning Path",
      link: "#",
      cta: "Explore Curriculum"
    }
  ];

  const additionalResources = [
    "Instructor-Led Workshops",
    "Self-Paced Courses",
    "Full Course Catalog",
    "Learning Paths",
    "Certification",
    "Enterprise Training Solutions",
    "Free Courses",
    "Training Videos On Demand"
  ];

  const videos = [
    {
      img: "./assets/img-10.png",
      duration: "02:03:20",
      tags: ["Talk", "Highly Rated"],
      title: "Quantum Computing: Where ...",
      author: "Ben Bloom, Atom Computing",
      desc: "Doors open at 9:00 a.m.  Session begins at 10:00 a.m. NVIDIA founder and CEO Jensen Huang hosts industry leaders from Alice & Bob, Atom Computing..."
    },
    {
      img: "./assets/img-11.png",
      duration: "53:14",
      tags: ["Talk", "Highly Rated"],
      title: "Frontiers of AI and Computing:...",
      author: "Bill Dally, NVIDIA",
      desc: "As artificial intelligence continues to reshape the world, the intersection of deep learning and high performance computing becomes increasingly ..."
    },
    {
      img: "./assets/img-12.png",
      duration: "39:33",
      tags: ["Talk", "Highly Rated"],
      title: "AI for Humanoid Robots",
      author: "Pieter Abbeel, University of California, Berkeley",
      desc: "Humanoid robotics hardware is seeing a major acceleration in progress. It's reasonable to expect commercially viable humanoid hardware to exist ..."
    }
  ];

  const topics = [
    { icon: "./assets/img-22.svg", title: "Artificial Intelligence" },
    { icon: "./assets/img-23.jpg", title: "Graphics and Rendering" },
    { icon: "./assets/img-24.svg", title: "Design and Simulation" },
    { icon: "./assets/img-25.jpg", title: "High-Performance Computing" },
    { icon: "./assets/img-26.svg", title: "Autonomous Vehicles" }
  ];

  const industries = [
    { icon: "./assets/img-27.svg", title: "Healthcare" },
    { icon: "./assets/img-28.svg", title: "Robotics" },
    { icon: "./assets/img-29.png", title: "Game Development" },
    { icon: "./assets/img-30.svg", title: "Financial Services" },
    { icon: "./assets/img-31.svg", title: "Telecommunication" }
  ];

  const platformLinks = {
    "Simulation": ["Omniverse", "Cosmos World Foundation Models", "OpenUSD"],
    "Accelerated Computing": ["CUDA® Toolkit", "CUDA-X Libraries", "Nsight Profiling and Debugging Tools"],
    "AI Training and Inference": ["AI Inference", "Data Science", "RTX AI Apps"],
    "Cloud Development": ["Developer Sandbox", "API Catalog", "NVIDIA DGX Cloud", "NGC Catalog"]
  };

  return (
    <main data-section="tutorials" className="w-full font-sans text-[#1a1a1a] bg-white">
      {/* Top Section Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Tutorials Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Tutorials</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Cards */}
            {tutorials.map((item, idx) => (
              <div key={idx} className="border border-gray-200 bg-white flex flex-col h-full group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-xs text-gray-500 mb-2">{item.date}</p>
                  <h3 className="text-base font-bold mb-4 leading-snug flex-grow">{item.title}</h3>
                  <div className="mt-auto flex items-center text-[#76b900] font-semibold text-sm">
                    Read More <span className="ml-1 text-lg leading-none">&rsaquo;</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Latest Releases Sidebar */}
            <div className="pl-2 pt-2">
              <h3 className="text-lg font-bold mb-4">Latest Releases</h3>
              <ul className="space-y-3">
                {latestReleases.map((release, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600 hover:text-[#76b900] cursor-pointer">
                    <span className="mr-2 font-bold text-gray-400 text-xs mt-1">&gt;</span>
                    <span>{release}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* News Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((item, idx) => (
              <div key={idx} className="border border-gray-200 bg-white flex flex-col h-full group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-xs text-gray-500 mb-2">{item.date}</p>
                  <h3 className="text-base font-bold mb-4 leading-snug flex-grow">{item.title}</h3>
                  <div className="mt-auto flex items-center text-[#76b900] font-semibold text-sm">
                    Read More <span className="ml-1 text-lg leading-none">&rsaquo;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Training</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Cards */}
            {training.map((item, idx) => (
              <div key={idx} className="border border-gray-200 bg-white flex flex-col h-full group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-base font-bold mb-4 leading-snug flex-grow">{item.title}</h3>
                  <div className="mt-auto flex items-center text-[#76b900] font-semibold text-sm">
                    {item.cta} <span className="ml-1 text-lg leading-none">&rsaquo;</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Additional Resources Sidebar */}
            <div className="pl-2 pt-2">
              <h3 className="text-lg font-bold mb-4">Additional Resources</h3>
              <ul className="space-y-3">
                {additionalResources.map((res, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600 hover:text-[#76b900] cursor-pointer">
                    <span className="mr-2 font-bold text-gray-400 text-xs mt-1">&gt;</span>
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* On-Demand Videos Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">On-Demand Videos</h2>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">GTC Top Talks</h3>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm font-bold text-[#76b900] hover:underline">See All</a>
              <div className="flex space-x-1">
                <button className="w-8 h-8 bg-[#76b900] text-white flex items-center justify-center hover:bg-[#6a9e00] transition-colors">
                  <span className="text-xl leading-none pb-1">&lsaquo;</span>
                </button>
                <button className="w-8 h-8 bg-[#76b900] text-white flex items-center justify-center hover:bg-[#6a9e00] transition-colors">
                  <span className="text-xl leading-none pb-1">&rsaquo;</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <div key={idx} className="border border-gray-200 bg-white flex flex-col h-full group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative h-56 overflow-hidden bg-black">
                  <img src={video.img} alt={video.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#76b900]"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex space-x-2 mb-3">
                    {video.tags.map((tag, tIdx) => (
                      <span key={tIdx} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag === 'Talk' ? 'bg-[#eebf00] text-black border-[#eebf00]' : 'bg-white text-gray-600 border-gray-300'}`}>
                        {tag}
                      </span>
                    ))}
                    <div className="ml-auto flex-grow text-right">
                       <span className="text-gray-400 text-lg leading-none cursor-pointer hover:text-black">⋮</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 leading-tight">{video.title}</h3>
                  <p className="text-xs font-bold text-gray-800 mb-3">{video.author}</p>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{video.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="relative w-full h-[300px] mb-0">
        <img src="./assets/img-33.jpg" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-white text-2xl md:text-3xl font-bold max-w-2xl mb-6 leading-tight">
            Access the latest NVIDIA developer tools, technology, and training.
          </h2>
          <button className="bg-[#76b900] text-black font-bold py-3 px-8 hover:bg-[#8ad100] transition-colors text-sm">
            Learn More
          </button>
        </div>
      </div>

      {/* Bottom Gray Section */}
      <div className="bg-[#f8f9fa] py-16 w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Find Tools or Topics */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8">Find Tools or Topics</h2>
            <div className="max-w-3xl mx-auto">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full p-4 border border-gray-300 rounded-sm focus:outline-none focus:border-[#76b900] shadow-sm"
              />
            </div>
          </div>

          {/* Browse by Topic */}
          <div className="mb-16">
            <h3 className="text-xl font-bold mb-6">Browse by Topic</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              {topics.map((topic, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-40 hover:shadow-md cursor-pointer transition-shadow group">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center">
                    <img src={topic.icon} alt={topic.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-[#76b900]">{topic.title}</span>
                </div>
              ))}
              <div className="flex items-center justify-center h-40">
                <a href="#" className="text-sm font-bold text-black hover:text-[#76b900] flex items-center">
                  View All Topics <span className="ml-1 text-lg leading-none text-[#76b900]">&rsaquo;</span>
                </a>
              </div>
            </div>
          </div>

          {/* Browse by Industry */}
          <div className="mb-20">
            <h3 className="text-xl font-bold mb-6">Browse by Industry</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              {industries.map((ind, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-40 hover:shadow-md cursor-pointer transition-shadow group">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center">
                    <img src={ind.icon} alt={ind.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-[#76b900]">{ind.title}</span>
                </div>
              ))}
              <div className="flex items-center justify-center h-40">
                <a href="#" className="text-sm font-bold text-black hover:text-[#76b900] flex items-center">
                  View All Industries <span className="ml-1 text-lg leading-none text-[#76b900]">&rsaquo;</span>
                </a>
              </div>
            </div>
          </div>

          {/* Platforms & Tools Footer */}
          <div>
            <h3 className="text-xl font-bold mb-8">Platforms & Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {Object.entries(platformLinks).map(([category, links], idx) => (
                <div key={idx}>
                  <h4 className="text-xs font-bold text-black mb-4 uppercase tracking-wide">{category}</h4>
                  <ul className="space-y-2">
                    {links.map((link, lIdx) => (
                      <li key={lIdx} className="flex items-start text-xs text-gray-600 hover:text-[#76b900] cursor-pointer">
                        <span className="mr-2 font-bold text-gray-400 text-[10px] mt-0.5">&gt;</span>
                        <span>{link}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex items-end justify-start lg:justify-end pb-2">
                 <a href="#" className="text-sm font-bold text-black hover:text-[#76b900] flex items-center">
                  View All Platforms & Tools <span className="ml-1 text-lg leading-none text-[#76b900]">&rsaquo;</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};