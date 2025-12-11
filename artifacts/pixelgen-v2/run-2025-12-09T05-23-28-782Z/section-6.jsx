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
      answer: "Our products are sealed for freshness. Please refer to the packaging for the specific expiration date."
    },
    {
      question: "How much chicken per pack?",
      answer: "Each pack is designed to perfectly season a specific quantity of chicken. Check the pack instructions for details."
    },
    {
      question: "What if I need to make more?",
      answer: "You can easily combine multiple packs to scale up the recipe for larger meals."
    },
    {
      question: "Why not buy pre-marinated chicken?",
      answer: "Cooking with our mix ensures you use fresh meat and have full control over the quality and flavor intensity."
    },
    {
      question: "What about other flavor masalas?",
      answer: "Chicken Tikka,..."
    }
  ];

  return (
    <section data-section="need-more-evidence-" className="w-full bg-white py-20 px-6 md:px-12">
      <div className="max-w-[840px] mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-serif tracking-widest mb-16 text-black uppercase">
          NEED MORE EVIDENCE?
        </h2>
        
        <div className="w-full flex flex-col">
          {items.map((item, index) => (
            <div key={index} className="border-t border-gray-200 last:border-b border-opacity-70">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none group bg-transparent cursor-pointer"
              >
                <span className="text-lg font-normal tracking-wide text-gray-900 group-hover:text-gray-600 transition-colors font-sans">
                  {item.question}
                </span>
                <span className="ml-4 flex-shrink-0 text-gray-800 flex items-center justify-center">
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}
                  >
                    <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </span>
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-gray-600 font-light leading-relaxed text-base">
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