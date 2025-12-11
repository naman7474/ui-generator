import React from 'https://esm.sh/react@18?dev&target=es2018';
export default function Section8() {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: `<section data-section="announcement-bar" class="w-full bg-gray-900 text-white py-2.5">
  <div class="container mx-auto px-4 flex justify-center items-center">
    <p class="text-xs md:text-sm font-medium tracking-wider uppercase text-center">
      FREE SHIPPING OVER ₹399
    </p>
  </div>
</section>` }
  });
}