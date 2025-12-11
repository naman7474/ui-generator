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
      linkText: "Watch On-Demand",
      link: "#"
    },
    {
      img: "./assets/img-8.jpg",
      title: "Digital Twins for Physical AI Learning Path",
      linkText: "Explore Curriculum",
      link: "#"
    },
    {
      img: "./assets/img-9.jpg",
      title: "Universal Scene Description (OpenUSD) Learning Path",
      linkText: "Explore Curriculum",
      link: "#"
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
      time: "02:03:20",
      tags: ["Talk", "Highly Rated"],
      title: "Quantum Computing: Where ...",
      author: "Ben Bloom, Atom Computing",
      desc: "Doors open at 9:00 a.m. Session begins at 10:00 a.m. NVIDIA founder and CEO Jensen Huang hosts industry leaders from Alice & Bob, Atom Computing..."
    },
    {
      img: "./assets/img-11.png",
      time: "53:14",
      tags: ["Talk", "Highly Rated"],
      title: "Frontiers of AI and Computing:...",
      author: "Bill Dally, NVIDIA",
      desc: "As artificial intelligence continues to reshape the world, the intersection of deep learning and high performance computing becomes increasingly ..."
    },
    {
      img: "./assets/img-12.png",
      time: "39:33",
      tags: ["Talk", "Highly Rated"],
      title: "AI for Humanoid Robots",
      author: "Pieter Abbeel, University of California, Berkeley",
      desc: "Humanoid robotics hardware is seeing a major acceleration in progress. It's reasonable to expect commercially viable humanoid hardware to exist ..."
    }
  ];

  const topicItems = [
    { icon: "./assets/img-22.svg", label: "Artificial Intelligence" },
    { icon: "./assets/img-23.jpg", label: "Graphics and Rendering" },
    { icon: "./assets/img-24.svg", label: "Design and Simulation" },
    { icon: "./assets/img-25.jpg", label: "High-Performance Computing" },
    { icon: "./assets/img-26.svg", label: "Autonomous Vehicles" },
  ];

  const industryItems = [
    { icon: "./assets/img-27.svg", label: "Healthcare" },
    { icon: "./assets/img-28.svg", label: "Robotics" },
    { icon: "./assets/img-29.png", label: "Game Development" },
    { icon: "./assets/img-30.svg", label: "Financial Services" },
    { icon: "./assets/img-31.svg", label: "Telecommunication" },
  ];

  const ChevronRight = () => (
    <svg className="w-2.5 h-2.5 text-[#76B900] ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
  );

  const SmallChevron = () => (
    <svg className="w-2 h-2 text-gray-800 mt-1.5 mr-2 flex-shrink-0" viewBox="0 0 8 12" fill="currentColor"><path d="M2 0L0.59 1.41L5.17 6L0.59 10.59L2 12L8 6L2 0Z"/></svg>
  );

  return (
    <main data-section="tutorials" className="w-full bg-white font-sans text-[#1a1a1a]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Tutorials Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Tutorials</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {tutorials.map((item, idx) => (
              <div key={idx} className="flex flex-col border border-gray-200 bg-white h-full hover:shadow-lg transition-shadow duration-200">
                <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs text-gray-500 mb-2">{item.date}</span>
                  <h3 className="text-lg font-bold leading-tight mb-4 flex-grow">{item.title}</h3>
                  <a href={item.link} className="text-[#76B900] font-bold text-sm flex items-center hover:underline" data-external="true">
                    Read More <ChevronRight />
                  </a>
                </div>
              </div>
            ))}
            
            {/* Latest Releases Sidebar */}
            <div className="bg-[#F8F8F8] p-6 border border-gray-200 h-full">
              <h3 className="text-xl font-bold mb-4">Latest Releases</h3>
              <ul className="space-y-3">
                {latestReleases.map((release, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <SmallChevron />
                    <a href="#" className="hover:text-[#76B900] transition-colors" data-external="true">{release}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((item, idx) => (
              <div key={idx} className="flex flex-col border border-gray-200 bg-white h-full hover:shadow-lg transition-shadow duration-200">
                <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs text-gray-500 mb-2">{item.date}</span>
                  <h3 className="text-lg font-bold leading-tight mb-4 flex-grow">{item.title}</h3>
                  <a href={item.link} className="text-[#76B900] font-bold text-sm flex items-center hover:underline" data-external="true">
                    Read More <ChevronRight />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Training Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Training</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {training.map((item, idx) => (
              <div key={idx} className="flex flex-col border border-gray-200 bg-white h-full hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                   <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold leading-tight mb-4 flex-grow">{item.title}</h3>
                  <a href={item.link} className="text-[#76B900] font-bold text-sm flex items-center hover:underline" data-external="true">
                    {item.linkText} <ChevronRight />
                  </a>
                </div>
              </div>
            ))}

            {/* Additional Resources Sidebar */}
            <div className="bg-white p-0 h-full">
              <h3 className="text-xl font-bold mb-4">Additional Resources</h3>
              <ul className="space-y-3">
                {additionalResources.map((resource, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <SmallChevron />
                    <a href="#" className="hover:text-[#76B900] transition-colors" data-external="true">{resource}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* On-Demand Videos Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">On-Demand Videos</h2>
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
            <h3 className="text-xl font-bold">GTC Top Talks</h3>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm font-bold text-[#76B900] hover:underline" data-external="true">See All</a>
              <div className="flex space-x-1">
                <button className="w-8 h-8 bg-[#76B900] text-white flex items-center justify-center hover:bg-[#6a9e00]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button className="w-8 h-8 bg-[#76B900] text-white flex items-center justify-center hover:bg-[#6a9e00]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <div key={idx} className="flex flex-col border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img src={video.img} alt={video.title} className="w-full h-56 object-cover" />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.time}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#76B900]"></div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex space-x-2 mb-3">
                    {video.tags.map((tag, tIdx) => (
                      <span key={tIdx} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag === 'Talk' ? 'bg-[#D97804] text-white border-[#D97804]' : 'bg-white text-gray-600 border-gray-300'}`}>
                        {tag}
                      </span>
                    ))}
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold leading-tight mb-1">{video.title}</h3>
                  <p className="text-xs font-bold text-gray-800 mb-2">{video.author}</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{video.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Banner Section */}
      <section className="relative w-full h-[300px] overflow-hidden">
        <img src="./assets/img-33.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl">
            Access the latest NVIDIA developer tools, technology, and training.
          </h2>
          <button className="bg-[#76B900] text-black font-bold py-3 px-8 text-lg hover:bg-[#6a9e00] transition-colors">
            Learn More
          </button>
        </div>
      </section>

      {/* Find Tools or Topics Section */}
      <section className="bg-[#F8F9FA] py-16 border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Find Tools or Topics</h2>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full py-3 pl-4 pr-12 border border-gray-300 rounded-none focus:outline-none focus:border-[#76B900]"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-[#76B900]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </div>

          {/* Browse by Topic */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-6">Browse by Topic</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topicItems.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-40 hover:shadow-md transition-shadow cursor-pointer">
                  <img src={item.icon} alt={item.label} className="w-12 h-12 mb-4 object-contain" />
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center justify-center h-40">
                 <a href="#" className="text-[#76B900] font-bold flex items-center hover:underline" data-external="true">
                   View All Topics <ChevronRight />
                 </a>
              </div>
            </div>
          </div>

          {/* Browse by Industry */}
          <div className="mb-16">
            <h3 className="text-xl font-bold mb-6">Browse by Industry</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {industryItems.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-40 hover:shadow-md transition-shadow cursor-pointer">
                  <img src={item.icon} alt={item.label} className="w-12 h-12 mb-4 object-contain" />
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </div>
              ))}
               <div className="flex items-center justify-center h-40">
                 <a href="#" className="text-[#76B900] font-bold flex items-center hover:underline" data-external="true">
                   View All Industries <ChevronRight />
                 </a>
              </div>
            </div>
          </div>

          {/* Platforms & Tools Links */}
          <div>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold">Platforms & Tools</h3>
               <a href="#" className="text-[#76B900] font-bold text-sm flex items-center hover:underline" data-external="true">
                 View All Platforms & Tools <ChevronRight />
               </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
              <div>
                <h4 className="font-bold mb-4">Simulation</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>Omniverse</a></li>
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>Cosmos World Foundation Models</a></li>
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>OpenUSD</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Accelerated Computing</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>CUDA® Toolkit</a></li>
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>CUDA-X Libraries</a></li>
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>Nsight Profiling and Debugging Tools</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">AI Training and Inference</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>AI Inference</a></li>
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>Data Science</a></li>
                  <li><a href="#" className="hover:text-[#76B900] flex items-center" data-external="true"><span className="mr-2 font-bold text-black text-xs">&gt;</span>RTX AI Apps</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Cloud Development</h4>
                <ul className="space-y-2