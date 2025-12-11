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
      desc: "Embedded solutions for autonomous machines and edge computing.",
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
      <h1 className="sr-only">Developer Downloads</h1>

      {/* Top Hero Section */}
      <div className="w-full bg-[#909090] py-16 md:py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12">
          <div className="w-full lg:w-1/2 text-black">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              NVIDIA Optimized Containers, Models, and More
            </h2>
            <p className="text-base md:text-lg mb-8 max-w-3xl leading-relaxed">
              Deploy the latest GPU optimized AI and HPC containers, pre-trained
              models, resources and industry specific application frameworks
              from NGC and speed up your AI and HPC application development and
              deployment.
            </p>
            <a
              href="#"
              data-external
              className="inline-block bg-[#76b900] hover:bg-[#6a9e00] text-black font-bold py-3 px-8 text-lg transition-colors duration-200"
            >
              Explore NGC
            </a>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <img
              src="./assets/img-0.png"
              alt="Deploy the latest GPU optimized AI and HPC containers"
              className="w-full max-w-[630px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Bottom Grid Section */}
      <div className="w-full bg-[#f2f2f2] py-16 md:py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12 md:mb-16">
            Download Centers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className="bg-white p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
              >
                <h3 className="text-xl font-bold text-black mb-4">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-700 mb-8 leading-relaxed flex-grow">
                  {card.desc}
                </p>
                <a
                  href="#"
                  data-external
                  className="text-black font-bold text-sm flex items-center hover:text-[#76b900] transition-colors mt-auto group"
                >
                  Learn more
                  <span className="text-[#76b900] ml-1 group-hover:translate-x-1 transition-transform">
                    &gt;
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};