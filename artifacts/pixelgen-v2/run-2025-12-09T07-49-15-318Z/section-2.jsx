const Section3 = () => {
  const [activeAccordion, setActiveAccordion] = React.useState(null);
  const [sortOpen, setSortOpen] = React.useState(false);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const products = [
    {
      id: 1,
      images: ["./assets/img-2.jpg", "./assets/img-3.jpg"],
      category: "Combos",
      title: "Hair Fall Control Shampoo & Conditioner Combo for Stronger Hair",
      rating: 4.8,
      reviews: 392,
      price: 566,
      originalPrice: 754,
      discount: "25% OFF",
      badge: "Bestseller",
      meta: "Pack of 2"
    },
    {
      id: 2,
      images: ["./assets/img-4.jpg", "./assets/img-5.jpg"],
      category: "Shampoo",
      title: "Hair Fall Control Shampoo with Pea Protein & Caffeine for Stronger Hair - 300 ml",
      rating: 4.8,
      reviews: 542,
      price: 355,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "300ml"
    },
    {
      id: 3,
      images: ["./assets/img-6.jpg", "./assets/img-7.jpg"],
      category: "Hair Mask",
      title: "Advanced Smoothening Keratin Hair Mask with Keratin & Hyaluronic Acid - 150 g",
      rating: 4.7,
      reviews: 119,
      price: 699,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "150g"
    },
    {
      id: 4,
      images: ["./assets/img-8.jpg", "./assets/img-9.jpg"],
      category: "Kits",
      title: "Hair Fall Control Trio",
      rating: 4.7,
      reviews: 96,
      price: 940,
      originalPrice: 1253,
      discount: "25% OFF",
      badge: "Bestseller",
      meta: "Pack of 3"
    },
    {
      id: 5,
      images: ["./assets/img-10.jpg", "./assets/img-11.jpg"],
      category: "Kits",
      title: "Hair Fall Control Kit",
      rating: 4.8,
      reviews: 99,
      price: 940,
      originalPrice: 1253,
      discount: "25% OFF",
      badge: "Bestseller",
      meta: "Pack of 3"
    },
    {
      id: 6,
      images: ["./assets/img-12.jpg", "./assets/img-13.jpg"],
      category: "Hair Styling",
      title: "Hot Shot Heat Protection Mist with Grapeseed Oil & Provitamin B5 - 150 ml",
      rating: 4.7,
      reviews: 270,
      price: 499,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "150ml"
    },
    {
      id: 7,
      images: ["./assets/img-14.jpg", "./assets/img-15.jpg"],
      category: "Hair Mask",
      title: "7 in 1 Repair & Revive Hair Mask for Upto 100% Damage Repair - 250g",
      rating: 4.7,
      reviews: 261,
      price: 499,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "250g"
    },
    {
      id: 8,
      images: ["./assets/img-16.jpg", "./assets/img-17.jpg"],
      category: "Combos",
      title: "Intense Moisture Shampoo & Conditioner Power Duo",
      rating: 4.9,
      reviews: 237,
      price: 599,
      originalPrice: 798,
      discount: "25% OFF",
      badge: "Bestseller",
      meta: "Pack of 2"
    },
    {
      id: 9,
      images: ["./assets/img-18.jpg", "./assets/img-19.jpg"],
      category: "Conditioner",
      title: "Hair Fall Control Conditioner for Stronger Hair - 250 g",
      rating: 4.8,
      reviews: 332,
      price: 399,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "250g"
    },
    {
      id: 10,
      images: ["./assets/img-20.jpg", "./assets/img-21.jpg"],
      category: "Shampoo",
      title: "Advanced Smoothening Shampoo with Keratin & Hyaluronic Acid - 300ml",
      rating: 4.7,
      reviews: 166,
      price: 355,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "300ml"
    },
    {
      id: 11,
      images: ["./assets/img-22.jpg", "./assets/img-23.jpg"],
      category: "Shampoo",
      title: "Intense Moisture Shampoo with Jojoba and Vitamin E for Dry & Frizzy Hair - 300 ml",
      rating: 4.8,
      reviews: 465,
      price: 399,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "300ml"
    },
    {
      id: 12,
      images: ["./assets/img-24.jpg", "./assets/img-25.jpg"],
      category: "Shampoo",
      title: "Anti-Dandruff Shampoo For a Clear & Healthy Scalp 300 ml",
      rating: 4.7,
      reviews: 181,
      price: 355,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "300ml"
    },
    {
      id: 13,
      images: ["./assets/img-26.jpg", "./assets/img-27.jpg"],
      category: "Combos",
      title: "Advanced Smoothening Straight Hair Must-Haves",
      rating: 4.8,
      reviews: 39,
      price: 641,
      originalPrice: 854,
      discount: "25% OFF",
      badge: "Trending",
      meta: "Pack of 2"
    },
    {
      id: 14,
      images: ["./assets/img-28.jpg", "./assets/img-29.jpg"],
      category: "Combos",
      title: "Anti-Dandruff Combo For a Clear & Healthy Scalp (300 ml + 250 g)",
      rating: 4.8,
      reviews: 97,
      price: 566,
      originalPrice: 754,
      discount: "25% OFF",
      badge: "Bestseller",
      meta: "Pack of 2"
    },
    {
      id: 15,
      images: ["./assets/img-30.jpg", "./assets/img-31.jpg"],
      category: "Hair Mask",
      title: "Intense Moisture Hair Mask with Jojoba Oil & Vitamin E for Nourished & Shiny Hair- 250 g",
      rating: 4.8,
      reviews: 205,
      price: 499,
      originalPrice: null,
      discount: null,
      badge: "Bestseller",
      meta: "250g"
    }
  ];

  const faqs = [
    {
      question: "Will This Work for Oily Scalp?",
      answer: "Yes, Hair Fall Control Heat Hair Spa Mask works for oily scalp and is ideal for all hair types...."
    },
    {
      question: "Will This Duo Make My Hair Thicker?",
      answer: "While the Hair Fall Control Combo can strengthen your hair, it cannot change the texture of your hai..."
    },
    {
      question: "I Have Brittle Hair. Will This Combo Work For Me?",
      answer: ""
    }
  ];

  return (
    <main data-section="section-3" className="w-full bg-white font-sans relative">
      {/* Hero Banner */}
      <div className="w-full">
        <img 
          src="./assets/img-1.jpg" 
          alt="Banner" 
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Breadcrumbs */}
      <div className="w-full flex justify-center py-6">
        <nav className="text-sm text-gray-500">
          <a href="/" className="hover:text-black">Home</a>
          <span className="mx-2">›</span>
          <a href="/collections/all" className="text-black">All</a>
        </nav>
      </div>

      {/* Filter & Sort Bar */}
      <div className="max-w-[1400px] mx-auto px-4 mb-8 flex justify-between items-center">
        <button className="flex items-center gap-2 border border-gray-200 px-6 py-2.5 text-sm font-medium hover:border-black transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          FILTER
        </button>

        <div className="relative">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort by:</span>
            <button 
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1 font-medium"
            >
              Featured
              <svg className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          
          {sortOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg z-20 py-1">
              {["Featured", "Best selling", "Alphabetically, A-Z", "Alphabetically, Z-A", "Price, low to high", "Price, high to low", "Date, old to new", "Date, new to old"].map((opt) => (
                <button key={opt} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1400px] mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col">
              {/* Image Container */}
              <div className="relative aspect-square mb-3 overflow-hidden bg-gray-50">
                <img 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-2"
                />
                <img 
                  src={product.images[1]} 
                  alt={product.title} 
                  className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                
                {/* Badge */}
                {product.badge && (
                  <div className={`absolute top-0 left-0 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider ${product.badge === 'Trending' ? 'bg-[#84CC16]' : 'bg-[#F43F5E]'}`}>
                    {product.badge}
                    <div className={`absolute top-0 right-[-6px] w-0 h-0 border-t-[12px] border-b-[12px] border-l-[6px] border-t-transparent border-b-transparent ${product.badge === 'Trending' ? 'border-l-[#84CC16]' : 'border-l-[#F43F5E]'} hidden`}></div> 
                    {/* Note: The screenshot shows a simple ribbon/flag style. Using simple rect for pixel match with screenshot which looks like a rect with a small fold effect or just a rect. */}
                    <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/20 transform translate-y-full skew-x-45 origin-top-left hidden"></div>
                  </div>
                )}
                
                {/* Meta (Pack/Size) */}
                {product.meta && (
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-medium text-gray-700 shadow-sm">
                    {product.meta}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow">
                <div className="text-[11px] font-bold text-gray-900 mb-1">{product.category}</div>
                <h3 className="text-[13px] font-bold text-gray-900 leading-tight mb-2 line-clamp-2 min-h-[2.5em]">
                  {product.title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="text-[11px] font-medium">{product.rating}</span>
                  <span className="text-[11px] text-gray-400">|</span>
                  <span className="text-[11px] text-gray-500">{product.reviews}</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4 mt-auto">
                  <span className="text-sm font-bold">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                      <span className="text-xs text-[#E31E24] font-medium">{product.discount}</span>
                    </>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button className="w-full bg-black text-white text-sm font-bold py-3 hover:bg-gray-800 transition-colors uppercase tracking-wide">
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-16 mb-20">
          <button className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
            Load more
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-[800px] mx-auto px-4 mb-24">
        <h2 className="text-2xl font-medium text-center mb-8">FAQ</h2>
        <div className="border-t border-gray-200">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${activeAccordion === index ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pb-4 text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2">
        <div className="bg-white shadow-lg rounded-lg px-4 py-2 mb-2 text-xs font-medium text-gray-700 animate-bounce origin-bottom-right">
          Hey, lets chat
        </div>
        <button className="bg-white rounded-full shadow-xl p-0 w-14 h-14 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
          <img src="./assets/img-40.png" alt="bubble-icon" className="w-full h-full object-cover" />
        </button>
      </div>
    </main>
  );
};