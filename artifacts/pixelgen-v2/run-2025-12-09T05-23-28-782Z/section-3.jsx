const Section4 = () => {
  const products = [
    {
      id: 1,
      title: "Tandoori Blast",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Drop a bomb of tandoori flavor on your taste buds.",
      mainImg: "./assets/img-4.png",
      thumbnails: ["./assets/img-8.png", "./assets/img-9.png", "./assets/img-10.png", "./assets/img-11.png"]
    },
    {
      id: 2,
      title: "Saza-E-KaaliMirch",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Break the barriers of ordinary with this bold, tantalizing flavor.",
      mainImg: "./assets/img-12.png",
      thumbnails: ["./assets/img-16.png", "./assets/img-17.png", "./assets/img-18.png", "./assets/img-19.png"]
    },
    {
      id: 3,
      title: "Paapi Pudina",
      price: "₹69",
      oldPrice: "₹70",
      desc: "The tang hits, world fades & you get caught licking your fingers.",
      mainImg: "./assets/img-20.png",
      thumbnails: ["./assets/img-24.png", "./assets/img-25.png", "./assets/img-26.png", "./assets/img-27.png"]
    },
    {
      id: 4,
      title: "Dhaniya Mirchi Aur Woh",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
      mainImg: "./assets/img-28.png",
      thumbnails: ["./assets/img-32.png", "./assets/img-33.png", "./assets/img-34.png", "./assets/img-35.png"]
    },
    {
      id: 5,
      title: "Gangs of Awadh",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Experience 26 flavor notes come together to create a taste symphony like no other.",
      mainImg: "./assets/img-36.png",
      thumbnails: ["./assets/img-40.png", "./assets/img-41.png", "./assets/img-42.png", "./assets/img-43.png"]
    },
    {
      id: 6,
      title: "Shawarma Ji Ka Beta",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Flavor that hits like a late night stroll down a food bazaar.",
      mainImg: "./assets/img-44.png",
      thumbnails: ["./assets/img-48.png", "./assets/img-49.png", "./assets/img-50.png", "./assets/img-51.png"]
    }
  ];

  return (
    <section data-section="new-flavor-everyday" className="w-full bg-white py-16 relative font-sans">
      {/* Floating Cart Icon */}
      <div className="absolute top-10 right-4 md:right-10 z-50">
        <button className="relative bg-[#C05E38] w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-[#a04e2f] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-white text-[#C05E38] text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full border border-[#C05E38]">0</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center mb-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl uppercase tracking-[0.2em] text-black mb-10 text-center font-normal">
            NEW FLAVOR EVERYDAY
          </h2>
          
          <div className="flex items-center justify-center">
            {/* Tikkas Button */}
            <div className="flex items-center bg-[#C05E38] text-white rounded-l-full pl-6 pr-2 py-1 h-12 cursor-pointer transition-transform hover:scale-105">
              <span className="font-bold uppercase text-sm tracking-wider mr-3">TIKKAS</span>
              <img src="./assets/img-2.png" alt="Tikkas" className="w-10 h-10 rounded-full object-cover" />
            </div>
            
            {/* Gravies Button */}
            <div className="flex items-center bg-white border border-[#4CAF50] text-[#4CAF50] rounded-r-full pl-4 pr-2 py-1 h-12 relative -ml-px cursor-pointer transition-transform hover:scale-105 z-10">
              <div className="absolute -top-3 left-3 bg-[#4CAF50] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">
                NEW LAUNCH
              </div>
              <div className="flex items-center">
                <span className="font-bold uppercase text-sm tracking-wider mr-3">GRAVIES</span>
                <img src="./assets/img-3.png" alt="Gravies" className="w-10 h-10 rounded-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="flex flex-col gap-24">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
              {/* Left Column: Images */}
              <div className="w-full md:w-[55%] flex flex-col">
                <div className="w-full overflow-hidden rounded-xl shadow-sm">
                  <img 
                    src={product.mainImg} 
                    alt={product.title} 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex flex-row gap-3 mt-5">
                  {product.thumbnails.map((thumb, index) => (
                    <div key={index} className="border border-gray-200 rounded p-0.5 cursor-pointer hover:border-[#C05E38] transition-colors">
                      <img 
                        src={thumb} 
                        alt={`${product.title} thumbnail ${index + 1}`} 
                        className="w-[52px] h-[41px] object-cover rounded-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="w-full md:w-[45%] flex flex-col pt-2 md:pt-4">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-black">
                  {product.title}
                </h3>
                <div className="flex items-center mt-2 mb-5">
                  <span className="text-lg font-bold text-black">{product.price}</span>
                  <span className="text-sm text-red-500 line-through ml-3 font-medium">{product.oldPrice}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-md">
                  {product.desc}
                </p>
                <div>
                  <button className="bg-[#C05E38] text-white px-8 py-2.5 rounded text-sm font-bold uppercase tracking-wider hover:bg-[#a04e2f] transition-colors shadow-sm">
                    + ADD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="flex justify-center mt-24 mb-8">
          <button className="bg-[#C05E38] text-white px-12 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-[#a04e2f] transition-colors shadow-md">
            SHOW MORE (+5)
          </button>
        </div>
      </div>
    </section>
  );
};