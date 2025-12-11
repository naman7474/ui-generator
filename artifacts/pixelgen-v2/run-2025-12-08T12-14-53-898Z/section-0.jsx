const Section1 = () => {
  const [isChatOpen, setIsChatOpen] = React.useState(true);

  const ProductCard = ({ product }) => {
    return (
      <div className="flex flex-col h-full bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300 rounded-md overflow-hidden group relative">
        {/* Badge */}
        {product.tag && (
          <div
            className={`absolute top-0 left-0 z-10 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wide ${
              product.tag === "Best Seller"
                ? "bg-[#FF5353]"
                : "bg-[#8BC34A]"
            }`}
          >
            {product.tag}
          </div>
        )}

        {/* Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-3 text-left">
          {/* Title */}
          <h3 className="text-[13px] font-semibold text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[34px]">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-[11px] text-[#009DAE] mb-2 line-clamp-2 min-h-[32px]">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-1">
            <span className="text-yellow-400 text-xs mr-1">★</span>
            <span className="text-[11px] font-bold text-gray-800">
              {product.rating}
            </span>
            <span className="mx-1 text-gray-300 text-[10px]">|</span>
            <span className="text-[11px] text-gray-500">
              {product.reviews}
            </span>
          </div>

          {/* Size/Pack Info */}
          <div className="text-[11px] text-gray-500 mb-2">
            {product.size}
          </div>

          {/* Price */}
          <div className="mt-auto flex items-center gap-2 mb-3">
            <span className="text-[15px] font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[12px] text-gray-400 line-through decoration-gray-400">
                ₹{product.originalPrice}
              </span>
            )}
            {product.discount && (
              <span className="text-[12px] text-[#FF5353] font-medium">
                {product.discount}
              </span>
            )}
          </div>

          {/* Button */}
          <button className="w-full bg-black text-white text-[13px] font-bold py-2.5 rounded hover:bg-gray-800 transition-colors uppercase tracking-wide">
            Add to cart
          </button>
        </div>
      </div>
    );
  };

  const sections = [
    {
      title: "Hair Care BFFs",
      products: [
        {
          id: 1,
          image: "./assets/img-7.jpg",
          tag: "Best Seller",
          title: "Hot Shot Heat Protection Mist with Grapeseed Oil & Provitamin B5 - 150 ml",
          description: "Prevents Damage | Upto 230° Celsius Protection",
          rating: "4.7",
          reviews: "269",
          size: "150ml",
          price: "499",
        },
        {
          id: 2,
          image: "./assets/img-9.jpg",
          tag: "Best Seller",
          title: "Hair Fall Control Shampoo with Pea Protein & Caffeine for Stronger Hair - 300 ml",
          description: "Reduces Up to 93% Hair Fall| Adds Shine",
          rating: "4.8",
          reviews: "538",
          size: "300ml",
          price: "355",
        },
        {
          id: 3,
          image: "./assets/img-11.jpg",
          tag: "Best Seller",
          title: "Hair Fall Control Conditioner for Stronger Hair - 250 g",
          description: "Reduces Up to 93% Hair Fall| Softens Hair & Adds Shine",
          rating: "4.8",
          reviews: "331",
          size: "250g",
          price: "399",
        },
        {
          id: 4,
          image: "./assets/img-13.jpg",
          tag: "Best Seller",
          title: "7 in 1 Repair & Revive Hair Mask for Upto 100% Damage Repair - 250g",
          description: "Addresses 7 Signs of Hair Damage | Enriched with Ceramides & Argan Oil",
          rating: "4.7",
          reviews: "260",
          size: "250g",
          price: "499",
        },
      ],
    },
    {
      title: "For Hair Fall Control",
      products: [
        {
          id: 5,
          image: "./assets/img-31.jpg",
          tag: "Trending",
          title: "Hair Fall Control Scalp Hair Tonic 50 ml",
          description: "Controls Hair Fall | Improves Hair Growth",
          rating: "4.9",
          reviews: "119",
          size: "50ml",
          price: "499",
        },
        {
          id: 6,
          image: "./assets/img-33.jpg",
          tag: null,
          title: "Hair Fall Control Heat Hair Spa Mask with Pea Protein & Caffeine for Salon-Like Hair...",
          description: "Salon-Like Hair Spa in Just 5 Minutes* | Reduces Hair Fall & Strengthens Hair",
          rating: "4.7",
          reviews: "32",
          size: "70g",
          price: "349",
        },
        {
          id: 7,
          image: "./assets/img-35.jpg",
          tag: "Best Seller",
          title: "Hair Fall Control Shampoo & Conditioner Combo for Stronger Hair",
          description: "Controls Hair Fall | Strengthens & Nourishes Hair",
          rating: "4.8",
          reviews: "392",
          size: "Pack of 2",
          price: "566",
          originalPrice: "754",
          discount: "25% off",
        },
        {
          id: 8,
          image: "./assets/img-37.jpg",
          tag: "Best Seller",
          title: "Hair Fall Control Trio",
          description: "Reduces Hair Fall | Strengthens Hair | Enriched with Shine Tonic",
          rating: "4.7",
          reviews: "96",
          size: "Pack of 3",
          price: "940",
          originalPrice: "1,253",
          discount: "25% off",
        },
      ],
    },
    {
      title: "For Party Ready Hair at Home",
      products: [
        {
          id: 9,
          image: "./assets/img-46.jpg",
          tag: "Trending",
          title: "Hot Shot Finish Spray For Radiant Shine - 200 ml",
          description: "Adds Shine | Lends Hair Glossy Finish",
          rating: "4.5",
          reviews: "82",
          size: "200ml",
          price: "599",
        },
        {
          id: 10,
          image: "./assets/img-48.jpg",
          tag: null,
          title: "Refresh Dry Shampoo to Instantly Refresh & Add Volume - 150 ml",
          description: "Benzene-Free | Leaves No Residue",
          rating: "4.8",
          reviews: "54",
          size: "150ml",
          price: "577",
        },
        {
          id: 11,
          image: "./assets/img-50.jpg",
          tag: "New Launch",
          title: "Refresh Dry Shampoo to Instantly Refresh & Add Volume - 50 ml",
          description: "Travel-Friendly | Benzene-Free | Leaves No Residue",
          rating: "4.7",
          reviews: "32",
          size: "50ml",
          price: "310",
        },
        {
          id: 12,
          image: "./assets/img-52.jpg",
          tag: "Best Seller",
          title: "Hot Shot Stylist In a Bottle Combo",
          description: "Protects from Heat Damage | Keeps Hairstyle Intact",
          rating: "5.0",
          reviews: "81",
          size: "Pack of 2",
          price: "824",
          originalPrice: "1,098",
          discount: "25% off",
        },
      ],
    },
    {
      title: "Salon Secret High Shine Creme Hair Colour",
      products: [
        {
          id: 13,
          image: "./assets/img-27.jpg",
          tag: "New Launch",
          title: "High Shine Conditioning Hair Colour - Coffee Natural Brown (Shade 4.31)",
          description: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "4.6",
          reviews: "89",
          size: "130g",
          price: "399",
        },
        {
          id: 14,
          image: "./assets/img-21.jpg",
          tag: "New Launch",
          title: "High Shine Conditioning Hair Colour - Chocolate Dark Brown (Shade 3)",
          description: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "4.6",
          reviews: "79",
          size: "130g",
          price: "399",
        },
        {
          id: 15,
          image: "./assets/img-62.jpg",
          tag: "New Launch",
          title: "High Shine Conditioning Hair Colour - Honey Light Golden Brown (Shade 5.32)",
          description: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "4.5",
          reviews: "69",
          size: "130g",
          price: "399",
        },
        {
          id: 16,
          image: "./assets/img-64.jpg",
          tag: "New Launch",
          title: "High Shine Conditioning Hair Colour - Mahogany Reddish Brown (Shade 4.56)",
          description: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "5.0",
          reviews: "1",
          size: "130g",
          price: "399",
        },
      ],
    },
  ];

  return (
    <main data-section="hair-care-bffs" className="w-full bg-white font-sans pb-20">
      {/* Hero Banner */}
      <div className="w-full relative">
        <img
          src="./assets/img-1.jpg"
          alt="BBlunt Moisture Marvels"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Product Sections */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">
        {sections.map((section, index) => (
          <div key={index} className="pt-12 pb-4">
            <h2 className="text-[28px] md:text-[32px] text-center font-normal text-black mb-10">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
              {section.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white shadow-lg rounded-lg p-3 mb-3 relative max-w-[200px] animate-fade-in">
            <button 
              onClick={() => setIsChatOpen(false)}
              className="absolute -top-2 -right-2 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-300"
            >
              ✕
            </button>
            <p className="text-sm text-gray-800">Hey, lets chat</p>
          </div>
        )}
        <button className="w-14 h-14 rounded-full shadow-xl overflow-hidden transition-transform hover:scale-105 focus:outline-none">
          <img 
            src="./assets/img-86.png" 
            alt="Chat" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </main>
  );
};