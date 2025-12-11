const Section5 = () => {
  const reviews = [
    {
      name: "Kaustubh Mathur",
      date: "10/12/2024",
      rating: 5,
      title: "Amazing taste, without effort",
      body: "Worth the money. Tastes so good. Easy to make. So tasty and yummy. Spice-levels are good.",
      img: "./assets/img-52.png",
    },
    {
      name: "Sarthak Bhosle",
      date: "02/07/2025",
      rating: 5,
      title: "These flavours are insane.",
      body: "Impulse buy was a win! Not a gimmick. Insanely tasty and easy Indian marinades. Kaalimirch is fire! Just go for it!",
      img: "./assets/img-53.png",
    },
    {
      name: "Om More",
      date: "04/06/2025",
      rating: 5,
      title: "Reordering again fs!",
      body: "Mind blown! Tried it on everything (paneer, bhindi, etc.). GF thought I cooked a fancy dinner. Must reorder!",
      img: "./assets/img-54.png",
    },
    {
      name: "Sagar Shinde",
      date: "14/03/2024",
      rating: 5,
      title: "Unexpected Surprise",
      body: "The flavor is restaurant-grade, trust me! Air-fry chicken thighs for 180/20min for a perfect and delicious result.",
      img: "./assets/img-55.png",
    },
    {
      name: "Vrinda Paul",
      date: "21/01/2024",
      rating: 5,
      title: "Flavor Bombs for Chicken Lovers! 🍗🔥",
      body: "Loved the KILRR variety pack! Rich, perfectly balanced flavors. Makes marination super easy and tasty.",
      img: "./assets/img-56.png",
    },
    {
      name: "Diksha Dutta ",
      date: "15/01/2024",
      rating: 5,
      title: "Easy to make and very tasty.",
      body: "",
      img: "./assets/img-57.png",
    },
  ];

  return (
    <section data-section="150k-gang-members" className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 px-4">
          <h3 className="text-[#D05C43] font-medium tracking-wider text-sm uppercase mb-2">
            THEY'RE SCREAMING WITH JOY
          </h3>
          <h2 className="text-3xl md:text-4xl font-normal text-black">
            150K+ GANG MEMBERS
          </h2>
        </div>

        {/* Reviews Carousel */}
        <div className="w-full overflow-x-auto pb-8 px-4 md:px-8 scrollbar-hide">
          <div className="flex gap-4 w-max">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="w-[280px] md:w-[300px] flex-shrink-0 border border-gray-200 rounded-lg p-5 flex flex-col bg-white h-full"
              >
                {/* Name */}
                <div className="text-black font-medium text-base mb-1">
                  {review.name}
                </div>

                {/* Stars & Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-[#F59E0B]">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {review.date && (
                    <span className="text-xs text-gray-500">{review.date}</span>
                  )}
                </div>

                {/* Title */}
                <div className="font-bold text-black text-sm leading-tight mb-2">
                  {review.title}
                </div>

                {/* Body */}
                {review.body && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-grow">
                    {review.body}
                  </p>
                )}

                {/* Image */}
                <div className="mt-auto pt-2">
                  <img
                    src={review.img}
                    alt={review.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};