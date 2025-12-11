const Section7 = () => {
  const [openIndex, setOpenIndex] = React.useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const items = [
    {
      question: "What's in each pack?",
      answer: "The perfect mix of spices, herbs, dried vegetables – everything you need for your marinade or your g..."
    },
    {
      question: "How do I cook?",
      answer: "1. Add water & oil to spice mix..."
    },
    {
      question: "What's the shelf life?",
      answer: "12 months from the date of manufacture."
    },
    {
      question: "How much chicken per pack?",
      answer: "Each pack is designed for 1kg of chicken."
    },
    {
      question: "What if I need to make more?",
      answer: "You can combine multiple packs easily."
    },
    {
      question: "Why not buy pre-marinated chicken?",
      answer: "Freshly marinating gives better texture and flavor control."
    },
    {
      question: "What about other flavor masalas?",
      answer: "Chicken Tikka,..."
    }
  ];

  return (
    <section data-section="need-more-evidence-" className="w-full bg-white py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl text-center font-normal tracking-[0.1em] mb-16 md:mb-20 text-black uppercase font-sans">
          NEED MORE EVIDENCE?
        </h2>
        
        <div className="w-full border-b border-gray-200">
          {items.map((item, index) => (
            <div key={index} className="border-t border-gray-200">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full py-6 md:py-8 flex justify-between items-center text-left focus:outline-none group bg-transparent cursor-pointer"
              >
                <span className="text-lg md:text-xl text-gray-900 font-normal tracking-wide">
                  {item.question}
                </span>
                <span className="text-2xl text-gray-500 font-light ml-6 flex-shrink-0 select-none transition-transform duration-200">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-40 opacity-100 pb-8' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};