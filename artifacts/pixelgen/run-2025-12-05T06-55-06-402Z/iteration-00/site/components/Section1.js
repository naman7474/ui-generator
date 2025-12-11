import React from 'https://esm.sh/react@18?dev&target=es2018';
export default function Section1() {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: `<section data-section="Hero Banner" class="w-full flex flex-col font-sans">
  <div class="bg-black text-white text-center py-2.5 px-4">
    <p class="text-xs font-bold tracking-widest uppercase">FREE SHIPPING OVER ₹399</p>
  </div>
  <div class="w-full">
    <img src="./assets/images/3b124f78c6.png" alt="Hero Banner" class="w-full h-auto object-cover block" />
  </div>
</section>` }
  });
}