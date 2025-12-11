const Section3 = () => {
  const [hoveredProduct, setHoveredProduct] = React.useState(null);

  // Helper to generate product data
  const createProduct = (id, img1, img2, title, price, rating, reviews, badge, categoryOverride) => {
    const sizeMatch = title.match(/(\d+\s?[ml|g|gm|kg]+)/i);
    const size = sizeMatch ? sizeMatch[0] : "";
    
    let category = categoryOverride;
    if (!category) {
      const t = title.toLowerCase();
      if (t.includes("shampoo")) category = "Shampoo";
      else if (t.includes("conditioner")) category = "Conditioner";
      else if (t.includes("mask")) category = "Hair Mask";
      else if (t.includes("serum")) category = "Hair Serum";
      else if (t.includes("colour") || t.includes("color")) category = "Hair Colour";
      else if (t.includes("spray") || t.includes("mist") || t.includes("gel")) category = "Hair Styling";
      else if (t.includes("tonic")) category = "Hair Tonic";
      else category = "Hair Care";
    }

    return {
      id,
      images: [img1, img2],
      title,
      price,
      rating,
      reviews,
      badge,
      size,
      category
    };
  };

  // Exact data for visible products (First 12)
  const mostLoved = [
    createProduct(1, "./assets/img-3.jpg", "./assets/img-4.jpg", "Hot Shot Heat Protection Mist with Grapeseed Oil & Provitamin B5 - 150 ml", "499", "4.7", "270", "Bestseller", "Hair Styling"),
    createProduct(2, "./assets/img-5.jpg", "./assets/img-6.jpg", "Hair Fall Control Shampoo with Pea Protein & Caffeine for Stronger Hair - 300 ml", "355", "4.8", "542", "Bestseller", "Shampoo"),
    createProduct(3, "./assets/img-7.jpg", "./assets/img-8.jpg", "Hair Fall Control Conditioner for Stronger Hair - 250 g", "399", "4.8", "332", "Bestseller", "Conditioner"),
    createProduct(4, "./assets/img-9.jpg", "./assets/img-10.jpg", "7 in 1 Repair & Revive Hair Mask for Upto 100% Damage Repair - 250g", "499", "4.7", "261", "Bestseller", "Hair Mask"),
    createProduct(5, "./assets/img-11.jpg", "./assets/img-12.jpg", "Anti-Dandruff Shampoo For a Clear & Healthy Scalp 300 ml", "355", "4.7", "181", "Bestseller", "Shampoo"),
    createProduct(6, "./assets/img-13.jpg", "./assets/img-14.jpg", "Hot Shot Hold Spray for Instant & Firm Hold - 300 ml", "599", "4.8", "142", "Bestseller", "Hair Styling"),
    createProduct(7, "./assets/img-15.jpg", "./assets/img-16.jpg", "Intense Moisture Shampoo with Jojoba and Vitamin E for Dry & Frizzy Hair - 300 ml", "399", "4.8", "465", "Bestseller", "Shampoo"),
    createProduct(8, "./assets/img-17.jpg", "./assets/img-18.jpg", "High Shine Conditioning Hair Colour - Chocolate Dark Brown (Shade 3)", "399", "4.6", "80", "New Launch", "Hair Colour"),
    createProduct(9, "./assets/img-19.jpg", "./assets/img-20.jpg", "Hair Fall Control Hair Mask with Pea Protein & Caffeine for Stronger Hair -250 g", "499", "4.7", "93", "Bestseller", "Hair Mask"),
    createProduct(10, "./assets/img-21.jpg", "./assets/img-22.jpg", "Intense Moisture Hair Mask with Jojoba Oil & Vitamin E for Nourished & Shiny Hair- 250 g", "499", "4.8", "205", "Bestseller", "Hair Mask"),
    createProduct(11, "./assets/img-23.jpg", "./assets/img-24.jpg", "High Shine Conditioning Hair Colour - Coffee Natural Brown (Shade 4.31)", "399", "4.6", "89", "New Launch", "Hair Colour"),
    createProduct(12, "./assets/img-25.jpg", "./assets/img-26.jpg", "Intense Moisture Conditioner with Vitamin E & Jojoba for Dry & Frizzy Hair - 250 g", "399", "4.9", "203", "Bestseller", "Conditioner"),
  ];

  // Data for remaining products based on image list
  const otherProducts = [
    createProduct(13, "./assets/img-27.jpg", "./assets/img-28.jpg", "High Shine Conditioning Hair Colour - Honey Light Golden Brown (Shade 5.32)", "399", "4.7", "65", "New Launch"),
    createProduct(14, "./assets/img-29.jpg", "./assets/img-30.jpg", "Advanced Smoothening Shampoo with Keratin & Hyaluronic Acid - 300ml", "399", "4.8", "120", "Bestseller"),
    createProduct(15, "./assets/img-31.jpg", "./assets/img-32.jpg", "7 in 1 Repair & Revive Night Cream to Heal & Protect Hair Overnight - 200ml", "499", "4.6", "45", "Trending"),
    createProduct(16, "./assets/img-33.jpg", "./assets/img-34.jpg", "Hot Shot Finish Spray For Radiant Shine - 200 ml", "550", "4.7", "88", "Bestseller"),
    createProduct(17, "./assets/img-35.jpg", "./assets/img-36.jpg", "Anti-Dandruff Conditioner For Smooth & Nourished Hair - 250 g", "399", "4.7", "150", "Bestseller"),
    createProduct(18, "./assets/img-37.jpg", "./assets/img-38.jpg", "Hair Fall Control Scalp Hair Tonic 50 ml", "799", "4.5", "30", "Expert"),
    createProduct(19, "./assets/img-39.jpg", "./assets/img-40.jpg", "Advanced Smoothening Conditioner with Keratin & Hyaluronic Acid - 250 g", "399", "4.8", "110", "Bestseller"),
    createProduct(20, "./assets/img-41.jpg", "./assets/img-42.jpg", "Intense Shine Hair Mask with Rice & Silk Protein for Softer, Smoother & Shinier Hair - 250 g", "499", "4.9", "210", "Trending"),
    createProduct(21, "./assets/img-43.jpg", "./assets/img-44.jpg", "Advanced Smoothening Serum Cream with Keratin & Hyaluronic Acid - 200 ml", "450", "4.7", "95", "Expert"),
    createProduct(22, "./assets/img-45.jpg", "./assets/img-46.jpg", "Intense Moisture Hair Serum with Vitamin E & Jojoba Oil for 30X Frizz Reduction for Upto 72 Hours* - 70 ml", "499", "4.8", "320", "Bestseller"),
    createProduct(23, "./assets/img-47.jpg", "./assets/img-48.jpg", "High Shine Conditioning Hair Colour - Mahogany Reddish Brown  (Shade 4.56)", "399", "4.6", "75", "New Launch"),
    createProduct(24, "./assets/img-49.jpg", "./assets/img-50.jpg", "Curly Hair Conditioner with Coconut Water & Jojoba Oil - 250 gm", "399", "4.7", "180", "Bestseller"),
    createProduct(25, "./assets/img-51.jpg", "./assets/img-52.jpg", "7 in 1 Repair & Revive Conditioner for Upto 100% Damage Repair - 250g", "399", "4.8", "140", "Bestseller"),
    createProduct(26, "./assets/img-53.jpg", "./assets/img-54.jpg", "Refresh Dry Shampoo to Instantly Refresh & Add Volume - 150 ml", "550", "4.6", "220", "Trending"),
    createProduct(27, "./assets/img-55.jpg", "./assets/img-56.jpg", "Curly Hair Shampoo with Coconut Water & Jojoba Oil - 300 ml", "399", "4.7", "190", "Bestseller"),
    createProduct(28, "./assets/img-57.jpg", "./assets/img-58.jpg", "Chocolate Dark Brown 5 Minute Shampoo Hair Colour - 20ml X 5", "499", "4.5", "60", "New Launch"),
    createProduct(29, "./assets/img-59.jpg", "./assets/img-60.jpg", "Advanced Smoothening Keratin Hair Mask with Keratin & Hyaluronic Acid - 150 g", "499", "4.8", "130", "Expert"),
    createProduct(30, "./assets/img-61.jpg", "./assets/img-62.jpg", "7 in 1 Repair & Revive Oil Hair Serum for Upto 100% Damage Repair - 70ml", "450", "4.7", "85", "Bestseller"),
    createProduct(31, "./assets/img-63.jpg", "./assets/img-64.jpg", "Intense Shine Shampoo with Rice & Silk Protein for 23X* Shinier Hair - 300 ml", "399", "4.8", "160", "Trending"),
    createProduct(32, "./assets/img-65.jpg", "./assets/img-66.jpg", "Hair Finishing Gel Stick for Sleek & Clean Hairdo - 10ml", "399", "4.6", "90", "Trending"),
    createProduct(33, "./assets/img-67.jpg", "./assets/img-68.jpg", "Intense Moisture Lamellar Treatment Water", "499", "4.7", "55", "Expert"),
    createProduct(34, "./assets/img-71.jpg", "./assets/img-72.jpg", "High Shine Conditioning Hair Colour - Natural Black (Shade 1)", "399", "4.8", "200", "Bestseller"),
    createProduct(35, "./assets/img-73.jpg", "./assets/img-74.jpg", "Intense Shine Hair Serum with Rice & Silk Protein for 10X Shinier Hair for upto 72 hours* - 70 ml", "499", "4.8", "110", "Trending"),
    createProduct(36, "./assets/img-81.jpg", "./assets/img-82.jpg", "Salon Secret High Shine Crème Hair Colour Coffee Natural Brown - 100 g", "199", "4.6", "300", "Bestseller"),
    createProduct(37, "./assets/img-83.jpg", "./assets/img-84.jpg", "Salon Secret High Shine Crème Hair Colour - Cherry Red - 100 g", "199", "4.5", "150", "Trending"),
    createProduct(38, "./assets/img-85.jpg", "./assets/img-86.jpg", "Salon Secret High Shine Crème Hair Colour - Natural Black- 100 g", "199", "4.7", "400", "Bestseller"),
    createProduct(39, "./assets/img-87.jpg", "./assets/img-88.jpg", "Curl Defining Leave-in Cream for Nourished & Frizz-Free Curls - 150 g", "450", "4.7", "120", "Expert"),
    createProduct(40, "./assets/img-89.jpg", "./assets/img-90.jpg", "Bond Repair Treatment Hair Mask - 250g", "599", "4.9", "80", "New Launch"),
    createProduct(41, "./assets/img-91.jpg", "./assets/img-92.jpg", "Intense Moisture Heat Hair Spa Mask with Jojoba Oil & Vitamin E for Salon-Like Hair Spa at Home - 70 g", "299", "4.7", "60", "Trending"),
    createProduct(42, "./assets/img-93.jpg", "./assets/img-94.jpg", "Bond Repair Shampoo - 300ml", "499", "4.8", "90", "New Launch"),
    createProduct(43, "./assets/img-95.jpg", "./assets/img-96.jpg", "Natural Black 5 Minute Shampoo Hair Colour - 20ml X 5", "499", "4.6", "70", "New Launch"),
    createProduct(44, "./assets/img-97.jpg", "./assets/img-98.jpg", "Refresh Dry Shampoo to Instantly Refresh & Add Volume - 50 ml", "250", "4.5", "180", "Bestseller"),
    createProduct(45, "./assets/img-99.jpg", "./assets/img-100.jpg", "Advanced Smoothening Heat Hair Spa Mask with Keratin & Hyaluronic Acid - 70g", "299", "4.7", "50", "Expert"),
    createProduct(46, "./assets/img-101.jpg", "./assets/img-102.jpg", "Intense Shine Conditioner with Rice & Silk Protein for Softer, Smoother & Shinier Hair - 250 g", "399", "4.8", "140", "Trending"),
    createProduct(47, "./assets/img-103.jpg", "./assets/img-104.jpg", "Bond Repair Conditioner - 250g", "499", "4.8", "85", "New Launch"),
    createProduct(48, "./assets/img-105.jpg", "./assets/img-106.jpg", "Hair Fall Control Heat Hair Spa Mask with Pea Protein & Caffeine for Salon-Like Hair Spa at Home - 70 g", "299", "4.7", "65", "Trending"),
    createProduct(49, "./assets/img-107.jpg", "./assets/img-108.jpg", "Curl Defining Hydra-Mist Serum 150 ml", "450", "4.6", "110", "Expert"),
    createProduct(50, "./assets/img-109.jpg", "./assets/img-110.jpg", "High Shine Conditioning Hair Colour - Wine Deep Burgundy (Shade 4.20)", "399", "4.7", "95", "New Launch"),
  ];

  // Distribute products into sections
  const trending = otherProducts.slice(0, 8);
  const expertRange = otherProducts.slice(8, 20);
  const salonColour = otherProducts.slice(20, 28);
  const exploreMore = otherProducts.slice(28);

  const StarIcon = () => (
    <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );

  const ProductCard = ({ product }) => {
    const isHovered = hoveredProduct === product.id;
    
    return (
      <div 
        className="flex flex-col bg-white group cursor-pointer"
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-0 left-0 z-10 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider ${
              product.badge === 'Bestseller' ? 'bg-[#FF4061]' : 
              product.badge === 'New Launch' ? 'bg-[#FF6B35]' : 'bg-black'
            }`}>
              {product.badge}
            </div>
          )}
          
          {/* Images */}
          <img 
            src={product.images[0]} 
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          />
          <img 
            src={product.images[1]} 
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Size Badge */}
          {product.size && (
            <div className="absolute bottom-2 right-2 bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 rounded-sm shadow-sm">
              {product.size}
            </div>
          )}
        </div>

        <div className="pt-3 pb-4 flex flex-col flex-grow">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {product.category}
          </div>
          <h3 className="text-[13px] font-bold text-black leading-tight line-clamp-2 h-9 mb-1">
            {product.title}
          </h3>
          
          <div className="flex items-center gap-1 mb-2">
            <StarIcon />
            <span className="text-[11px] font-bold text-black">{product.rating}</span>
            <span className="text-gray-300 text-[10px]">|</span>
            <span className="text-[11px] font-medium text-gray-500">{product.reviews}</span>
          </div>

          <div className="mt-auto">
            <div className="text-[14px] font-bold text-black mb-3">
              ₹{product.price}
            </div>
            <button className="w-full bg-black text-white py-2.5 text-[12px] font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SectionGrid = ({ title, items }) => (
    <div className="mb-12">
      <h2 className="text-center text-[28px] md:text-[32px] font-medium text-black mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );

  return (
    <main data-section="most-loved" className="w-full bg-white relative font-sans">
      {/* Hero Banner */}
      <div className="w-full">
        <img src="./assets/img-1.jpg" alt="Buy 3 for 999" className="w-full h-auto object-cover block" />
      </div>

      {/* Steps Bar */}
      <div className="w-full">
        <img src="./assets/img-2.jpg" alt="How To Shop" className="w-full h-auto object-cover block" />
      </div>

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-4 py-10">
        <SectionGrid title="Most Loved" items={mostLoved} />
        <SectionGrid title="Trending" items={trending} />
        <SectionGrid title="Expert Hair Care Range" items={expertRange} />
        <SectionGrid title="For Salon Like Colour at Home" items={salonColour} />
        <SectionGrid title="Explore more" items={exploreMore} />
      </div>

      {/* Footer App Section */}
      <div className="w-full bg-white pt-8 pb-12 flex flex-col items-center justify-center border-t border-gray-100">
        <div className="mb-4">
          <img src="./assets/img-111.png" alt="BBLUNT" className="h-12 w-auto object-contain" />
        </div>
        <p className="text-lg font-medium text-black mb-6">Experience the BBLUNT App</p>
        <div className="flex gap-4">
          <a href="#" className="block w-[160px]">
            <img src="./assets/img-112.png" alt="Download on Android" className="w-full h-auto" />
          </a>
          <a href="#" className="block w-[160px]">
            <img src="./assets/img-113.webp" alt="Download on iOS" className="w-full h-auto" />
          </a>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-800 relative mr-2 animate-bounce origin-bottom-right">
          Hey, lets chat
          <div className="absolute -bottom-1 right-4 w-3 h-3 bg-white transform rotate-45"></div>
        </div>
        <button className="w-14 h-14 rounded-full shadow-xl overflow-hidden hover:scale-105 transition-transform">
          <img src="./assets/img-114.png" alt="Chat" className="w-full h-full object-cover" />
        </button>
      </div>
    </main>
  );
};