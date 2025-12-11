import React from 'https://esm.sh/react@18?dev&target=es2018';
export default function Section7() {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: `<section data-section="Slay The Mess" class="w-full bg-white py-12 md:py-16">
  <div class="container mx-auto px-4 mb-8 md:mb-12 text-center">
    <p class="text-[#D9534F] font-medium tracking-widest uppercase text-sm md:text-base mb-3">
      A KILRR IDEA THAT'LL CHANGE YOUR LIFE
    </p>
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-sans text-black uppercase tracking-wide">
      SLAY THE MESS, SAVOR THE TASTE
    </h2>
  </div>

  <div class="relative w-full max-w-[1920px] mx-auto h-[400px] md:h-[500px] lg:h-[600px] flex overflow-hidden select-none">
    <!-- Left Side: The Mess -->
    <div class="relative w-1/2 h-full overflow-hidden">
      <img 
        src="./assets/images/06081bb5de.png" 
        alt="Messy ingredients preparation" 
        class="absolute inset-0 w-full h-full object-cover object-center" 
      />
    </div>

    <!-- Right Side: The Solution -->
    <div class="relative w-1/2 h-full overflow-hidden">
      <img 
        src="./assets/images/fd2e6dd86e.png" 
        alt="Clean product packaging" 
        class="absolute inset-0 w-full h-full object-cover object-center" 
      />
    </div>

    <!-- Center Slider Handle Visual -->
    <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white -translate-x-1/2 z-10 shadow-sm"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
      <div class="w-12 h-12 md:w-14 md:h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-xl text-white border-2 border-white">
        <div class="flex items-center gap-0.5">
          <i data-icon="ChevronLeft"></i>
          <i data-icon="ChevronRight"></i>
        </div>
      </div>
    </div>
  </div>
</section>` }
  });
}