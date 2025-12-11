const Section3 = () => {
  const sections = [
    {
      title: "Hair Care BFFs",
      products: [
        {
          img: "./assets/img-7.jpg",
          title: "Hot Shot Heat Protection Mist with Grapeseed Oil & Provitamin B5 - 150 ml",
          desc: "Prevents Damage | Upto 230° Celsius Protection",
          rating: "4.7",
          reviews: "270",
          price: "499",
          badge: "Best Seller",
          badgeColor: "bg-[#FF6B6B]",
          size: "150ml"
        },
        {
          img: "./assets/img-9.jpg",
          title: "Hair Fall Control Shampoo with Pea Protein & Caffeine for Stronger Hair - 300 ml",
          desc: "Reduces Up to 93% Hair Fall| Adds Shine",
          rating: "4.8",
          reviews: "542",
          price: "355",
          badge: "Best Seller",
          badgeColor: "bg-[#FF6B6B]",
          size: "300ml"
        },
        {
          img: "./assets/img-11.jpg",
          title: "Hair Fall Control Conditioner for Stronger Hair - 250 g",
          desc: "Reduces Up to 93% Hair Fall| Softens Hair & Adds Shine",
          rating: "4.8",
          reviews: "332",
          price: "399",
          badge: "Best Seller",
          badgeColor: "bg-[#FF6B6B]",
          size: "250g"
        },
        {
          img: "./assets/img-13.jpg",
          title: "7 in 1 Repair & Revive Hair Mask for Upto 100% Damage Repair - 250g",
          desc: "Addresses 7 Signs of Hair Damage | Enriched with Ceramides & Argan Oil",
          rating: "4.7",
          reviews: "261",
          price: "499",
          badge: "Best Seller",
          badgeColor: "bg-[#FF6B6B]",
          size: "250g"
        }
      ]
    },
    {
      title: "For Hair Fall Control",
      products: [
        {
          img: "./assets/img-31.jpg",
          title: "Hair Fall Control Scalp Hair Tonic 50 ml",
          desc: "Controls Hair Fall | Improves Hair Growth",
          rating: "4.9",
          reviews: "119",
          price: "499",
          badge: "Trending",
          badgeColor: "bg-[#8BC34A]",
          size: "50ml"
        },
        {
          img: "./assets/img-33.jpg",
          title: "Hair Fall Control Heat Hair Spa Mask with Pea Protein & Caffeine for Salon-Like Hair...",
          desc: "Salon-Like Hair Spa in Just 5 Minutes* | Reduces Hair Fall & Strengthens Hair",
          rating: "4.7",
          reviews: "32",
          price: "349",
          badge: null,
          size: "70g"
        },
        {
          img: "./assets/img-35.jpg",
          title: "Hair Fall Control Shampoo & Conditioner Combo for Stronger Hair",
          desc: "Controls Hair Fall | Strengthens & Nourishes Hair",
          rating: "4.8",
          reviews: "392",
          price: "566",
          oldPrice: "754",
          discount: "25% off",
          badge: "Best Seller",
          badgeColor: "bg-[#FF6B6B]",
          size: "Pack of 2"
        },
        {
          img: "./assets/img-37.jpg",
          title: "Hair Fall Control Trio",
          desc: "Reduces Hair Fall | Strengthens Hair | Enriched with Shine Tonic",
          rating: "4.7",
          reviews: "96",
          price: "940",
          oldPrice: "1,253",
          discount: "25% off",
          badge: "Best Seller",
          badgeColor: "bg-[#FF6B6B]",
          size: "Pack of 3"
        }
      ]
    },
    {
      title: "For Party Ready Hair at Home",
      products: [
        {
          img: "./assets/img-46.jpg",
          title: "Hot Shot Finish Spray For Radiant Shine - 200 ml",
          desc: "Adds Shine | Lends Hair Glossy Finish",
          rating: "4.5",
          reviews: "82",
          price: "599",
          badge: "Trending",
          badgeColor: "bg-[#8BC34A]",
          size: "200ml"
        },
        {
          img: "./assets/img-48.jpg",
          title: "Refresh Dry Shampoo to Instantly Refresh & Add Volume - 150 ml",
          desc: "Benzene-Free | Leaves No Residue",
          rating: "4.8",
          reviews: "54",
          price: "577",
          badge: null,
          isSoldOut: true,
          size: "150ml"
        },
        {
          img: "./assets/img-50.jpg",
          title: "Refresh Dry Shampoo to Instantly Refresh & Add Volume - 50 ml",
          desc: "Travel-Friendly | Benzene-Free | Leaves No Residue",
          rating: "4.7",
          reviews: "32",
          price: "310",
          badge: "New Launch",
          badgeColor: "bg-[#8BC34A]",
          size: "50ml"
        },
        {
          img: "./assets/img-52.jpg",
          title: "Hot Shot Stylist In a Bottle Combo",
          desc: "Protects from Heat Damage | Keeps Hairstyle Intact",
          rating: "5.0",
          reviews: "81",
          price: "824",
          oldPrice: "1,098",
          discount: "25% off",
          badge: "Best Seller",
          badgeColor: "bg-[#FF6B6B]",
          size: "Pack of 2"
        }
      ]
    },
    {
      title: "Salon Secret High Shine Creme Hair Colour",
      products: [
        {
          img: "./assets/img-27.jpg",
          title: "High Shine Conditioning Hair Colour - Coffee Natural Brown (Shade 4.31)",
          desc: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "4.6",
          reviews: "88",
          price: "199",
          badge: "New Launch",
          badgeColor: "bg-[#8BC34A]"
        },
        {
          img: "./assets/img-21.jpg",
          title: "High Shine Conditioning Hair Colour - Chocolate Dark Brown (Shade 3)",
          desc: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "4.8",
          reviews: "120",
          price: "199",
          badge: "New Launch",
          badgeColor: "bg-[#8BC34A]"
        },
        {
          img: "./assets/img-62.jpg",
          title: "High Shine Conditioning Hair Colour - Honey Light Golden Brown (Shade 5.32)",
          desc: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "4.6",
          reviews: "75",
          price: "199",
          badge: "New Launch",
          badgeColor: "bg-[#8BC34A]"
        },
        {
          img: "./assets/img-64.jpg",
          title: "High Shine Conditioning Hair Colour - Mahogany Reddish Brown (Shade 4.56)",
          desc: "Intense High Shine Hair Colour at Home | Colour Outside, Care Inside | Powered by MaliPeptide...",
          rating: "5.0",
          reviews: "45",
          price: "199",
          badge: "New Launch",
          badgeColor: "bg-[#8BC34A]"
        }
      ]
    }
  ];

  return (
    <main data-section="hair-care-bffs" className="w-full bg-white font-sans">
      {/* Hero Banner */}
      <div className="w-full relative">
        <img 
          src="./assets/img-1.jpg" 
          alt="Moisture Marvels for Salon-Like Hair" 
          className="w-full h-auto object-cover"
        />
        <div className="absolute bottom-[10%] left-[5%] md:bottom-[15%] md:left-[10%]">
          <button className="bg-white text-black px-6 py-2 md:px-8 md:py-3 font-bold text-sm md:text-lg hover:bg-gray-100 transition-colors uppercase tracking-wide">
            SHOP NOW
          </button>
        </div>
      </div>

      {/* Product Sections */}
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-16">
            <h2 className="text-[28px] md:text-[32px] text-center font-medium mb-8 text-black">
              {section.title}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.products.map((item, pIdx) => (
                <div key={pIdx} className="flex flex-col h-full border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 rounded-xl p-4 relative group bg-white">
                  {/* Image */}
                  <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg bg-[#F7F7F7]">
                    <img 
                      src={item.img} 
                      alt={item.title}
                      className="w-full h-full object-contain mix-blend-multiply p-2"
                    />
                    {/* Badge */}
                    {item.badge && (
                      <span className={`absolute top-0 left-0 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-lg ${item.badgeColor} uppercase tracking-wider`}>
                        {item.badge}
                      </span>
                    )}
                    {/* Sold Out Overlay */}
                    {item.isSoldOut && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-md">
                          <span className="text-xs font-bold text-black">Sold Out</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-[14px] font-bold text-black leading-tight mb-2 line-clamp-2 min-h-[40px]">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-[#00AFEF] mb-2 line-clamp-2 min-h-[32px]">
                      {item.desc}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      <span className="text-[#FFC107] text-sm mr-1">★</span>
                      <span className="text-[12px] font-medium">{item.rating}</span>
                      <span className="mx-1 text-gray-300">|</span>
                      <span className="text-[12px] text-black">{item.reviews}</span>
                    </div>

                    {/* Size */}
                    <div className="text-[12px] text-gray-500 mb-2 h-4">
                      {item.size || ""}
                    </div>

                    {/* Price */}
                    <div className="flex items-center mt-auto mb-4">
                      <span className="text-[16px] font-bold text-black mr-2">₹{item.price}</span>
                      {item.oldPrice && (
                        <span className="text-[12px] text-gray-500 line-through mr-2">