const Section4 = () => {
  const [activeImages, setActiveImages] = React.useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });

  const products = [
    {
      id: 1,
      name: "TANDOORI BLAST",
      price: 69,
      originalPrice: 70,
      description: "Drop a bomb of tandoori flavor on your taste buds.",
      spiceLevel: 4,
      images: [
        "./assets/img-4.png",
        "./assets/img-5.png",
        "./assets/img-6.png",
        "./assets/img-7.png",
      ],
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
      description:
        "Break the barriers of ordinary with this bold, tantalizing flavor.",
      spiceLevel: 4,
      images: [
        "./assets/img-12.png",
        "./assets/img-13.png",
        "./assets/img-14.png",
        "./assets/img-15.png",
      ],
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
      description:
        "The tang hits, world fades & you get caught licking your fingers.",
      spiceLevel: 0,
      images: [
        "./assets/img-20.png",
        "./assets/img-21.png",
        "./assets/img-22.png",
        "./assets/img-23.png",
      ],
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
      description:
        "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
      spiceLevel: 5,
      images: [
        "./assets/img-28.png",
        "./assets/img-29.png",
        "./assets/img-30.png",
        "./assets/img-31.png",
      ],
      thumbnails: [
        "./assets/img-32.png",
        "./assets/img-33.png",
        "./assets/img-34.png",
        "./assets/img-35.png",
      ],
    },
    {
      id: 5,
      name: "GANGS OF AWADH",
      price: 69,
      originalPrice: 70,
      description:
        "Experience 26 flavor notes come together to create a taste symphony like no other.",
      spiceLevel: 3,
      images: [
        "./assets/img-36.png",
        "./assets/img-37.png",
        "./assets/img-38.png",
        "./assets/img-39.png",
      ],
      thumbnails: [
        "./assets/img-40.png",
        "./assets/img-41.png",
        "./assets/img-42.png",
        "./assets/img-43.png",
      ],
    },
    {
      id: 6,
      name: "SHAWARMA JI KA BETA",
      price: 69,
      originalPrice: 70,
      description:
        "Flavor that hits like a late night stroll down a food bazaar.",
      spiceLevel: 0,
      images: [
        "./assets/img-44.png",
        "./assets/img-45.png",
        "./assets/img-46.png",
        "./assets/img-47.png",
      ],
      thumbnails: [
        "./assets/img-48.png",
        "./assets/img-49.png",
        "./assets/img-50.png",
        "./assets/img-51.png",
      ],
    },
  ];

  const handleThumbnailClick = (productId, index) => {
    setActiveImages((prev) => ({ ...prev, [productId]: index }));
  };

  const ChiliIcon = ({ filled }) => (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 ${filled ? "text-[#C0562F]" : "text-gray-300"}`}
      fill="currentColor"
    >
      <path d="M12.5,2C12.5,2 12.6,4.6 11.5,6.5C10.4,8.4 8.5,9.5 8.5,9.5C8.5,9.5 8.5,9.5 8.5,9.5C8.5,9.5 10.5,9.5 12,11C13.5,12.5 13.5,14.5 13.5,14.5C13.5,14.5 13.5,14.5 13.5,14.5C13.5,14.5 14.6,12.6 16.5,11.5C18.4,10.4 21,10.5 21,10.5C21,10.5 18,10.5 16,8.5C14,6.5 14,3.5 14,3.5C14,3.5 13.5,3.5 12.5,2M5,15C5,15 6,14 7,14C8,14 9,15 9,16C9,17 8,18 7,18C6,18 5,17 5,16C5,15.5 5,15 5,15M3,17C3,17 4,16 5,16C6,16 7,17 7,18C7,19 6,20 5,20C4,20 3,19 3,18C3,17.5 3,17 3,17M7,19C7,19 8,18 9,18C10,18 11,19 11,20C11,21 10,22 9,22C8,22 7,21 7,20C7,19.5 7,19 7,19Z" />
      <path d="M17.5,12C15.5,12 14,13.5 14,15.5C14,17.5 15.5,19 17.5,19C19.5,19 21,17.5 21,15.5C21,13.5 19.5,12 17.5,12Z" />
      {/* Simplified chili shape for visual match */}
      <path d="M16.8,5.7C16.8,5.7 15.6,6.6 15.1,8.2C14.6,9.8 15.1,11.5 15.1,11.5C15.1,11.5 13.8,10.6 12.8,9.6C11.8,8.6 10.9,7.3 10.9,7.3C10.9,7.3 12.6,7.8 14.2,7.3C15.8,6.8 16.8,5.7 16.8,5.7M19.5,12.5C19.5,12.5 18.5,12.5 17.5,13.5C16.5,14.5 16.5,15.5 16.5,15.5C16.5,15.5 17.5,15.5 18.5,14.5C19.5,13.5 19.5,12.5 19.5,12.5M10.5,10.5C10.5,10.5 11.5,11.5 11.5,12.5C11.5,13.5 10.5,14.5 10.5,14.5C10.5,14.5 9.5,13.5 9.5,12.5C9.5,11.5 10.5,10.5 10.5,10.5Z" opacity="0" />
      <path d="M17.66 10.6C17.1 10.26 16.5 10.05 15.87 10.05C14.5 10.05 13.29 10.79 12.64 11.9C12.28 11.7 11.9 11.56 11.5 11.5C9.57 11.5 8 13.07 8 15C8 16.93 9.57 18.5 11.5 18.5C12.15 18.5 12.76 18.32 13.28 18C13.77 19.18 14.93 20 16.25 20C17.91 20 19.25 18.66 19.25 17C19.25 16.5 19.13 16.03 18.92 15.61C19.58 14.96 20 14.03 20 13C20 11.73 19.08 10.67 17.88 10.45C17.81 10.5 17.74 10.55 17.66 10.6M11.5 17C10.4 17 9.5 16.1 9.5 15C9.5 13.9 10.4 13 11.5 13C12.6 13 13.5 13.9 13.5 15C13.5 16.1 12.6 17 11.5 17M16.25 18.5C15.42 18.5 14.75 17.83 14.75 17C14.75 16.17 15.42 15.5 16.25 15.5C17.08 15.5 17.75 16.17 17.75 17C17.75 17.83 17.08 18.5 16.25 18.5M17.5 14C16.67 14 16 13.33 16 12.5C16 11.67 16.67 11 17.5 11C18.33 11 19 11.67 19 12.5C19 13.33 18.33 14 17.5 14Z" opacity="0"/>
      <path d="M19.6,6.5C19.6,6.5 18.5,7.6 17.5,7.6C16.5,7.6 15.5,6.5 15.5,6.5C15.5,6.5 16.5,5.5 17.5,5.5C18.5,5.5 19.6,6.5 19.6,6.5M17.5,3C15,3 13,5 13,7.5C13,10 15,12 17.5,12C20,12 22,10 22,7.5C22,5 20,3 17.5,3Z" opacity="0"/>
      <path d="M12.9,14.3L12.9,14.3C12.3,13.2 11.2,12.5 10,12.5C8.6,12.5 7.5,13.6 7.5,15C7.5,16.4 8.6,17.5 10,17.5C11.2,17.5 12.3,16.8 12.9,15.7C13.5,16.8 14.6,17.5 15.8,17.5C17.2,17.5 18.3,16.4 18.3,15C18.3,13.6 17.2,12.5 15.8,12.5C14.6,12.5 13.5,13.2 12.9,14.3Z" opacity="0"/>
      <path d="M17.13 5.36C17.5 5.15 17.92 5.04 18.36 5.04C19.6 5.04 20.6 6.04 20.6 7.29C20.6 8.53 19.6 9.53 18.36 9.53C17.92 9.53 17.5 9.42 17.13 9.21C16.76 9.42 16.34 9.53 15.9 9.53C14.66 9.53 13.66 8.53 13.66 7.29C13.66 6.04 14.66 5.04 15.9 5.04C16.34 5.04 16.76 5.15 17.13 5.36M18.36 8.03C18.77 8.03 19.1 7.7 19.1 7.29C19.1 6.87 18.77 6.54 18.36 6.54C17.94 6.54 17.61 6.87 17.61 7.29C17.61 7.7 17.94 8.03 18.36 8.03M15.9 8.03C16.31 8.03 16.64 7.7 16.64 7.29C16.64 6.87 16.31 6.54 15.9 6.54C15.49 6.54 15.15 6.87 15.15 7.29C15.15 7.7 15.49 8.03 15.9 8.03Z" opacity="0"/>
      <path d="M6.5,5.5C6.5,5.5 7.5,6.5 8.5,6.5C9.5,6.5 10.5,5.5 10.5,5.5C10.5,5.5 9.5,4.5 8.5,4.5C7.5,4.5 6.5,5.5 6.5,5.5M8.5,2C6,2 4,4 4,6.5C4,9 6,11 8.5,11C11,11 13,9 13,6.5C13,4 11,2 8.5,2Z" opacity="0"/>
      <path d="M12,2C12,2 12,2 12,2C12,2 12,2 12,2C12,2 12,2 12,2C12,2 12,2 12,2Z" />
      <path d="M19.07 15.88C19.07 15.88 18.5 16.5 17.5 16.5C16.5 16.5 16 15.88 16 15.88C16 15.88 16.5 15.25 17.5 15.25C18.5 15.25 19.07 15.88 19.07 15.88M17.5 13C15.5 13 14 14.5 14 16.5C14 18.5 15.5 20 17.5 20C19.5 20 21 18.5 21 16.5C21 14.5 19.5 13 17.5 13Z" opacity="0"/>
      <path d="M17.5,12C15.5,12 14,13.5 14,15.5C14,17.5 15.5,19 17.5,19C19.5,19 21,17.5 21,15.5C21,13.5 19.5,12 17.5,12Z" opacity="0"/>
      <path d="M12.5,2C12.5,2 12.6,4.6 11.5,6.5C10.4,8.4 8.5,9.5 8.5,9.5C8.5,9.5 8.5,9.5 8.5,9.5C8.5,9.5 10.5,9.5 12,11C13.5,12.5 13.5,14.5 13.5,14.5C13.5,14.5 13.5,14.5 13.5,14.5C13.5,14.5 14.6,12.6 16.5,11.5C18.4,10.4 21,10.5 21,10.5C21,10.5 18,10.5 16,8.5C14,6.5 14,3.5 14,3.5C14,3.5 13.5,3.5 12.5,2Z" />
    </svg>
  );

  return (
    <section
      data-section="new-flavor-everyday"
      className="w-full bg-white py-16 relative"
    >
      {/* Floating Cart Icon */}
      <div className="absolute top-8 right-8 z-20 hidden lg:block">
        <div className="bg-[#C0562F] w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div className="absolute -top-1 -right-1 bg-white text-[#C0562F] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#C0562F]">
            0
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-normal tracking-[0.25em] uppercase mb-10 text-gray-900">
            New Flavor Everyday
          </h2>

          {/* Toggles */}
          <div className="flex justify-center items-center gap-6">
            {/* Tikkas Button */}
            <div className="flex items-center bg-[#C0562F] rounded-full pl-6 pr-1 py-1 cursor-pointer shadow-sm">
              <span className="text-white font-bold text-sm tracking-wide mr-3">
                TIKKAS
              </span>
              <img
                src="./assets/img-2.png"
                alt="Tikkas"
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            </div>

            {/* Gravies Button */}
            <div className="relative flex flex-col items-center cursor-pointer group">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#3A7D44] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap z-10">
                NEW LAUNCH
              </div>
              <div className="flex items-center bg-white border border-[#3A7D44] rounded-full pl-6 pr-1 py-1 shadow-sm">
                <span className="text-[#3A7D44] font-bold text-sm tracking-wide mr-3">
                  GRAVIES
                </span>
                <img
                  src="./assets/img-3.png"
                  alt="Gravies"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#3A7D44]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-24">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16"
            >
              {/* Left: Images */}
              <div className="w-full lg:w-[55%]">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-4">
                  <img
                    src={product.images[activeImages[product.id]]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Spice Level & Thumbnails Container */}
                <div className="flex flex-col gap-3">
                  {/* Spice Level */}
                  {product.spiceLevel > 0 && (
                    <div className="flex gap-1 pl-1">
                      {[...Array(5)].map((_, i) => (
                        <ChiliIcon key={i} filled={i < product.spiceLevel} />
                      ))}
                    </div>
                  )}
                  
                  {/* Thumbnails */}
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.thumbnails.map((thumb, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleThumbnailClick(product.id, idx)}
                        className={`relative w-[52px] h-[41px] flex-shrink-0 rounded overflow-hidden border transition-all ${
                          activeImages[product.id] === idx
                            ? "border-[#C0562F] ring-1 ring-[#C0562F]"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={thumb}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="w-full lg:w-[45%] flex flex-col items-start">
                <h3 className="text-xl font-bold uppercase tracking-wide text-black mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-black font-bold text-sm">
                    ₹{product.price}
                  </span>
                  <span className="text-[#D8706C] text-sm line-through decoration-[#D8706C]">
                    ₹{product.originalPrice}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-md">
                  {product.description}
                </p>
                <button className="bg-[#C0562F] hover:bg-[#a64624] text-white text-sm font-bold py-2 px-8 rounded uppercase tracking-wider transition-colors">
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="mt-20 flex justify-center">
          <button className="bg-[#C0562F] hover:bg-[#a64624] text-white text-sm font-medium py-3 px-8 rounded shadow-md transition-colors">
            Show More (+5)
          </button>
        </div>
      </div>
    </section>
  );
};