const Section4 = () => {
  const cards = [
    {
      title: "CUDA Toolkit",
      desc: "Toolkit for GPU-accelerated apps: libraries, debugging/optimization tools, a C/C++ compiler, and a runtime.",
    },
    {
      title: "NVIDIA HPC SDK",
      desc: "A comprehensive suite of C, C++, and Fortran compilers, libraries, and tools for GPU-accelerating HPC applications.",
    },
    {
      title: "CUDA-X Libraries",
      desc: "GPU-accelerated libraries delivering improved performance across a wide variety of application domains.",
    },
    {
      title: "Jetson",
      desc: "Embedded solutions for automomous machines and edge computing.",
    },
    {
      title: "Isaac",
      desc: "Robotic AI development and simulation platform.",
    },
    {
      title: "Clara",
      desc: "Frameworks for AI-powered imaging, genomics, and smart sensors.",
    },
    {
      title: "DRIVE",
      desc: "Platform for autonomous vehicles, data center-hosted simulation, and neural network training.",
    },
    {
      title: "Metropolis",
      desc: "Solutions for smart cities, intelligent video analytics, and more.",
    },
    {
      title: "Gameworks",
      desc: "Tools, samples and libraries for real-time graphics and physics.",
    },
    {
      title: "Riva",
      desc: "Framework for multimodal conversational AI.",
    },
    {
      title: "Developer Tools",
      desc: "IDE plugins, debugging, performance optimization, and other tools.",
    },
    {
      title: "Graphics Research Tools",
      desc: "Tools, libraries, and samples from NVIDIA Research.",
    },
    {
      title: "Omniverse",
      desc: "A powerful multi-GPU real-time simulation and collaboration platform for 3D production pipelines.",
    },
  ];

  return (
    <main data-section="developer-downloads" className="w-full font-sans">
      {/* Top Banner Section */}
      <div className="w-full bg-[#999999] py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Text Content */}
            <div className="flex-1 max-w-3xl text-left">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-black leading-tight mb-6">
                NVIDIA Optimized Containers, Models, and More
              </h2>
              <p className="text-black text-lg leading-relaxed mb-8 max-w-2xl">
                Deploy the latest GPU optimized AI and HPC containers, pre-trained models, resources and industry specific application frameworks from NGC and speed up your AI and HPC application development and deployment.
              </p>
              <button className="bg-[#76b900] text-black font-bold text-base py-3 px-6 hover:bg-[#6aa600] transition-colors duration-200">
                Explore NGC
              </button>
            </div>
            
            {/* Image Content */}
            <div className="flex-1 flex justify-center lg:justify-end w-full">
              <img 
                src="./assets/img-0.png" 
                alt="Deploy the latest GPU optimized AI and HPC containers" 
                className="w-full max-w-[630px] h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Download Centers Grid Section */}
      <div className="w-full bg-[#f2f2f2] py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
            Download Centers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <div 
                key={index} 
                className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center h-full min-h-[320px]"
              >
                <h3 className="text-xl font-bold text-black mb-4">
                  {card.title}
                </h3>
                <p className="text-[15px] text-gray-800 leading-relaxed mb-8 flex-grow">
                  {card.desc}
                </p>
                <a 
                  href="#" 
                  className="text-[#76b900] font-bold text-sm flex items-center hover:underline mt-auto"
                  data-external
                >
                  Learn more <span className="ml-1 text-lg leading-none">&rsaquo;</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};