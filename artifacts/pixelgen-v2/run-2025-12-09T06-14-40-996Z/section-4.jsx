const Section5 = () => {
  const reviews = [
    {
      name: "Kaustubh Mathur",
      date: "10/12/2024",
      title: "Amazing taste, without effort",
      text: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
      img: "./assets/img-52.png",
      stars: 5
    },
    {
      name: "Sarthak Bhosle",
      date: "02/07/2025",
      title: "These flavours are insane.",
      text: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!",
      img: "./assets/img-53.png",
      stars: 5
    },
    {
      name: "Om More",
      date: "04/06/2025",
      title: "Reordering again fs!",
      text: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
      img: "./assets/img-54.png",
      stars: 5
    },
    {
      name: "Sagar Shinde",
      date: "14/03/2024",
      title: "Unexpected Surprise",
      text: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result.",
      img: "./assets/img-55.png",
      stars: 5
    },
    {
      name: "Vrinda Paul",
      date: "21/01/2024",
      title: "Flavor Bombs for Chicken Lovers! 🍗🔥",
      text: "Loved the KILRR variety pack! Rich, perfectly balanced flavors. Makes marination super easy and tasty.",
      img: "./assets/img-56.png",
      stars: 5
    },
    {
      name: "Diksha Dutta",
      date: "15/01/2024",
      title: "Easy to make and very tasty.",
      text: "Really enjoyed the flavors. It made cooking dinner so much faster and the taste was authentic.",
      img: "./assets/img-57.png",
      stars: 5
    }
  ];

  return (
    <section data-section="150k-gang-members" className="w-full py-12 md:py-16 bg-white">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 px-4">
          <h3 className="text-[#D06F51] font-medium tracking-widest text-sm md:text-base uppercase mb-2">
            THEY'RE SCREAMING WITH JOY
          </h3>
          <h2 className="text-3xl md:text-5xl font-normal text-black">
            150K+ GANG MEMBERS
          </h2>
        </div>

        {/* Reviews Scroll Container */}
        <div className="w-full overflow-x-auto pb-8 px-4 hide-scrollbar">
          <div className="flex gap-4 md:gap-6 w-max mx-auto md:mx-0 lg:mx-auto">
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="w-[280px] md:w-[300px] flex-shrink-0 border border-gray-100 rounded-sm bg-white p-4 flex flex-col h-full"
              >
                {/* Image Area */}
                <div className="w-full h-[180px] md:h-[200px] mb-4 overflow-hidden rounded-sm bg-gray-50">
                  <img 
                    src={review.img} 
                    alt={review.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-grow">
                  <div className="text-gray-900 font-medium text-base mb-1">
                    {review.name}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex space-x-0.5">
                      {[...Array(review.stars)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-[#F97316] fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{review.date}</span>
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 mb-2 leading-tight">
                    {review.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};