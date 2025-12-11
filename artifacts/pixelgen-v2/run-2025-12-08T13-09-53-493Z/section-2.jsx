const Section3 = () => {
  const products = [
    {
      id: 1,
      name: "TANDOORI BLAST",
      price: 69,
      originalPrice: 70,
      description: "Drop a bomb of tandoori flavor on your taste buds.",
      mainImage: "./assets/img-4.png",
      thumbnails: [
        "./assets/img-8.png",
        "./assets/img-9.png",
        "./assets/img-10.png",
        "./assets/img-11.png",
      ],
    },
    {
      id: 2,
      name: "SAZA-E-KAALIMIRCH",
      price: 69,
      originalPrice: 70,
      description: "Break the barriers of ordinary with this bold, tantalizing flavor.",
      mainImage: "./assets/img-12.png",
      thumbnails: [
        "./assets/img-16.png",
        "./assets/img-17.png",
        "./assets/img-18.png",
        "./assets/img-19.png",
      ],
    },
    {
      id: 3,
      name: "PAAPI PUDINA",
      price: 69,
      originalPrice: 70,
      description: "The tang hits, world fades & you get caught licking your fingers.",
      mainImage: "./assets/img-20.png",
      thumbnails: [
        "./assets/img-24.png",
        "./assets/img-25.png",
        "./assets/img-26.png",
        "./assets/img-27.png",
      ],
    },
    {
      id: 4,
      name: "DHANIYA MIRCHI AUR WOH",
      price: 69,
      originalPrice: 70,
      description: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
      mainImage: "./assets/img-28.png",
      thumbnails: [
        "./assets/img-31.png",
        "./assets/img-32.png",
        "./assets/img-33.png",
        "./assets/img-34.png",
      ],
    },
    {
      id: 5,
      name: "GANGS OF AWADH",
      price: 69,
      originalPrice: 70,
      description: "Experience 26 flavor notes come together to create a taste symphony like no other.",
      mainImage: "./assets/img-35.png",
      thumbnails: [
        "./assets/img-39.png",
        "./assets/img-40.png",
        "./assets/img-41.png",
        "./assets/img-42.png",
      ],
    },
    {
      id: 6,
      name: "SHAWARMA JI KA BETA",
      price: 69,
      originalPrice: 70,
      description: "Flavor that hits like a late night stroll down a food bazaar.",
      mainImage: "./assets/img-43.png",
      thumbnails: [
        "./assets/img-47.png",
        "./assets/img-48.png",
        "./assets/img-49.png",
        "./assets/img-50.png",
      ],
    },
  ];

  return (
    <section data-section="new-flavor-everyday" className="w-full bg-white py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-20">
          <h2 className="text-3xl md:text-4xl font-normal tracking-[0.2em] text-gray-900 mb-10 text-center uppercase">
            New Flavor Everyday
          </h2>
          
          <div className="flex items-center gap-6">
            {/* Tikkas Button (Active) */}
            <button className="flex items-center gap-3 bg-[#C0562F] text-white pl-5 pr-2 py-1.5 rounded-full shadow-md transition-transform hover:scale-105">
              <span className="font-bold tracking-wider text-sm uppercase">Tikkas</span>
              <img 
                src="./assets/img-2.png" 
                alt="Tikkas" 
                className="w-9 h-9 rounded-full object-cover border-2 border-white/20" 
              />
            </button>

            {/* Gravies Button (Inactive) */}
            <div className="relative">
              <div className="absolute -top-5 left-0 right-0 flex justify-center">
                 <span className="text-[10px] font-bold text-[#2E7D32] bg-white px-1 uppercase tracking-tight whitespace-nowrap">
                   New Launch
                 </span>
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-16 h-[1px] bg-[#2E7D32] mt-[1px]"></div>
              </div>
              <button className="flex items-center gap-3 bg-white text-gray-800 border border-gray-300 pl-5 pr-2 py-1.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                <span className="font-bold tracking-wider text-sm uppercase">Gravies</span>
                <img 
                  src="./assets/img-3.png" 
                  alt="Gravies" 
                  className="w-9 h-9 rounded-full object-cover" 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-24">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              {/* Left Column: Images */}
              <div className="w-full lg:w-[532px] flex-shrink-0 flex flex-col gap-3">
                <div className="w-full rounded-xl overflow-hidden shadow-sm">
                  <img 
                    src={product.mainImage} 
                    alt={product.name} 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                </div>
                
                {/* Spice Level & Thumbnails */}
                <div className="flex flex-col gap-2">
                  {/* Chili Icons */}
                  <div className="flex gap-1 pl-1">
                     {[...Array(5)].map((_, i) => (
                       <svg key={i} className="w-5 h-5 text-[#C0562F] fill-current transform -rotate-12" viewBox="0 0 24 24">
                         <path d="M17.64 4.3C16.3 3.33 14.88 3 13.5 3c-2.5 0-4.5 1.5-5.5 3.5-.5 1-1 2.5-1 4.5 0 3.5 2 6.5 5 8.5 1.5 1 3.5 1.5 5.5 1.5 1.5 0 3-.5 4-1.5 1.5-1.5 2.5-3.5 2.5-6 0-3.5-2-6.5-5-8.5-.5-.3-1-.7-1.36-1.2z" />
                       </svg>
                     ))}
                  </div>
                  
                  {/* Thumbnails */}
                  <div className="flex gap-3 mt-1">
                    {product.thumbnails.map((thumb, idx) => (
                      <div key={idx} className="w-[52px] h-[41px] border border-gray-200 rounded overflow-hidden cursor-pointer hover:border-[#C0562F] transition-colors">
                        <img src={thumb} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="flex flex-col pt-2 lg:pt-4 max-w-xl">
                <h3 className="text-xl md:text-2xl font-bold text-black uppercase tracking-wide mb-3">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-lg font-bold text-black">₹{product.price}</span>
                  <span className="text-lg font-normal text-[#C0562F] line-through decoration-[#C0562F]">₹{product.originalPrice}</span>
                </div>
                
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 font-light">
                  {product.description}
                </p>
                
                <button className="bg-[#C0562F] hover:bg-[#a64625] text-white font-semibold py-2.5 px-8 rounded shadow-sm w-fit transition-colors uppercase text-sm tracking-wider">
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="flex justify-center mt-24 mb-8">
          <button className="bg-[#C0562F] hover:bg-[#a64625] text-white font-medium py-3 px-10 rounded shadow-md transition-colors uppercase text-sm tracking-wide">
            Show More (+5)
          </button>
        </div>
      </div>
    </section>
  );
};