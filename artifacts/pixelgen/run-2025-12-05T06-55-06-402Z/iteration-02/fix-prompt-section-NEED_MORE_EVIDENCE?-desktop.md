```jsx
import React from 'react';

export default function NeedMoreEvidence() {
  const faqs = [
    "What's in each pack?",
    "How do I cook?",
    "What's the shelf life?",
    "How much chicken per pack?",
    "What if I need to make more?",
    "Why not buy pre-marinated chicken?",
    "What about other flavor masalas?",
  ];

  return (
    <section data-section="NEED MORE EVIDENCE?" className="bg-white py-16 px-4 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center font-serif text-3xl font-medium tracking-widest text-[#1a1a1a] md:text-4xl uppercase">
          Need More Evidence?
        </h2>
        <div className="border-t border-gray-200">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button className="group flex w-full items-center justify-between py-6 text-left focus:outline-none">
                <span className="text-lg font-bold text-gray-900 md:text-xl">
                  {faq}
                </span>
                <span className="text-2xl font-light text-gray-400 group-hover:text-gray-900">
                  +
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```