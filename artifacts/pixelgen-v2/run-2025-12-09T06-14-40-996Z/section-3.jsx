const Section4 = () => {
  const items = [
    {
      id: 1,
      title: "TANDOORI BLAST",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Drop a bomb of tandoori flavor on your taste buds.",
      mainImg: "./assets/img-4.png",
      thumbs: [
        "./assets/img-8.png",
        "./assets/img-9.png",
        "./assets/img-10.png",
        "./assets/img-11.png",
      ],
    },
    {
      id: 2,
      title: "SAZA-E-KAALIMIRCH",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Break the barriers of ordinary with this bold, tantalizing flavor.",
      mainImg: "./assets/img-12.png",
      thumbs: [
        "./assets/img-15.png",
        "./assets/img-16.png",
        "./assets/img-17.png",
        "./assets/img-18.png",
      ],
    },
    {
      id: 3,
      title: "PAAPI PUDINA",
      price: "₹69",
      oldPrice: "₹70",
      desc: "The tang hits, world fades & you get caught licking your fingers.",
      mainImg: "./assets/img-19.png",
      thumbs: [
        "./assets/img-23.png",
        "./assets/img-24.png",
        "./assets/img-25.png",
        "./assets/img-26.png",
      ],
    },
    {
      id: 4,
      title: "DHANIYA MIRCHI AUR WOH",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.",
      mainImg: "./assets/img-27.png",
      thumbs: [
        "./assets/img-31.png",
        "./assets/img-32.png",
        "./assets/img-33.png",
        "./assets/img-34.png",
      ],
    },
    {
      id: 5,
      title: "GANGS OF AWADH",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Experience 26 flavor notes come together to create a taste symphony like no other.",
      mainImg: "./assets/img-35.png",
      thumbs: [
        "./assets/img-39.png",
        "./assets/img-40.png",
        "./assets/img-41.png",
        "./assets/img-42.png",
      ],
    },
    {
      id: 6,
      title: "SHAWARMA JI KA BETA",
      price: "₹69",
      oldPrice: "₹70",
      desc: "Flavor that hits like a late night stroll down a food bazaar.",
      mainImg: "./assets/img-43.png",
      thumbs: [
        "./assets/img-47.png",
        "./assets/img-48.png",
        "./assets/img-49.png",
        "./assets/img-50.png",
      ],
    },
  ];

  return (
    <section data-section="new-flavor-everyday" className="w-full bg-white py-16 relative font-sans">
      {/* Floating Cart Icon */}
      <div className="absolute top-8 right-4 z-30 md:right-12">
        <div className="relative bg-[#D35400] text-white p-3 rounded-full shadow-xl cursor-pointer hover:bg-[#b54500] transition-colors w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-white text-[#D35400] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#D35400] shadow-sm">
            0
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-normal tracking-[0.15em] uppercase mb-10 text-gray-900">
            New Flavor Everyday
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-6">
            {/* Tikkas Badge */}
            <button className="group relative flex items-center bg-[#C0562F] text-white rounded-full pl-8 pr-1 py-1 h-14 shadow-md transition-transform hover:scale-105">
              <span className="font-bold text-lg tracking-wider mr-4">TIKKAS</span>
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-white">
                <img
                  src="./assets/img-2.png"
                  alt="Tikkas"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Gravies Badge */}
            <button className="group relative flex items-center bg-white text-gray-800 border border-[#4CAF50] rounded-full pl-6 pr-1 py-1 h-14 shadow-sm transition-transform hover:scale-105">
              <div className="flex flex-col items-start mr-4">
                <span className="text-[10px] text-[#4CAF50] font-bold uppercase leading-none mb-0.5">
                  NEW LAUNCH
                </span>
                <span className="font-bold text-lg tracking-wider leading-none">
                  GRAVIES
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-gray-100">
                <img
                  src="./assets/img-3.png"
                  alt="Gravies"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-24">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-start"
            >
              {/* Image Section */}
              <div className="w-full md:w-1/2">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-4 shadow-sm">
                  <img
                    src={item.mainImg}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  {item.thumbs.map((thumb, idx) => (
                    <div
                      key={idx}
                      className="w-[52px] h-[41px] border border-gray-200 rounded overflow-hidden cursor-pointer hover:border-[#C0562F] transition-colors"
                    >
                      <img
                        src={thumb}
                        alt={`${item.title} thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 flex flex-col justify-center pt-2 md:pt-8">
                <h3 className="text-xl md:text-2xl font-bold uppercase text-black mb-3 tracking-wide">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-lg font-bold text-black">{item.price}</span>
                  <span className="text-lg text-gray-400 line-through font-normal">
                    {item.oldPrice}
                  </span>
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed max-w-md text-[15px]">
                  {item.desc}
                </p>
                <button className="bg-[#C0562F] hover:bg-[#a54623] text-white font-bold py-2 px-8 rounded text-sm tracking-wider w-fit transition-colors uppercase">
                  + ADD
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        <div className="mt-24 text-center">
          <button className="bg-[#C0562F] hover:bg-[#a54623] text-white font-bold py-3 px-12 rounded text-sm tracking-wider transition-colors uppercase shadow-md">
            Show More (+5)
          </button>
        </div>
      </div>
    </section>
  );
};