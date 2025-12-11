import React from 'https://esm.sh/react@18?dev&target=es2018';
export default function Section4() {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: `<section data-section="New Flavor Everyday" class="bg-white py-16 font-sans">
  <div class="container mx-auto px-4 max-w-6xl">
    <!-- Header -->
    <h2 class="text-3xl md:text-4xl text-center tracking-[0.2em] uppercase mb-10 text-gray-900">New Flavor Everyday</h2>
    
    <!-- Tabs -->
    <div class="flex justify-center items-center gap-6 mb-20">
      <!-- Tikka Tab -->
      <button class="group flex items-center gap-3 bg-[#c25e3e] text-white pl-6 pr-2 py-1.5 rounded-full transition-transform hover:scale-105 shadow-sm">
        <span class="font-bold tracking-wide text-sm">TIKKAS</span>
        <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
          <img src="{./assets/images/bcaf3edfec.png}" alt="Tikkas" class="w-full h-full object-cover">
        </div>
      </button>
      
      <!-- Gravy Tab -->
      <div class="relative">
        <div class="absolute -top-3 left-4 bg-[#4a8b3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 leading-none tracking-tighter">NEW LAUNCH</div>
        <button class="group flex items-center gap-3 bg-white border border-gray-300 text-gray-500 pl-6 pr-2 py-1.5 rounded-full transition-transform hover:scale-105 hover:border-gray-400">
          <span class="font-bold tracking-wide text-sm">GRAVIES</span>
          <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
            <img src="{./assets/images/6770cf37a9.png}" alt="Gravies" class="w-full h-full object-cover">
          </div>
        </button>
      </div>
    </div>

    <!-- Product List -->
    <div class="space-y-24">
      
      <!-- Product 1: TANDOORI BLAST -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="space-y-4">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            <img src="{./assets/images/8bee64915c.png}" alt="Tandoori Blast" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <img src="{./assets/images/f8a29418d1.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/5e6236cd69.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/2f3be75642.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/94e3c8408a.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
          </div>
        </div>
        <div class="flex flex-col items-start">
          <h3 class="text-xl font-bold uppercase tracking-wide mb-2 text-gray-900">TANDOORI BLAST</h3>
          <div class="flex items-center gap-3 mb-4 text-lg">
            <span class="font-bold text-gray-900">₹69</span>
            <span class="text-red-400 line-through text-base">₹70</span>
          </div>
          <p class="text-gray-600 mb-8 leading-relaxed">Drop a bomb of tandoori flavor on your taste buds.</p>
          <button class="bg-[#c25e3e] text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-[#a64d30] transition-colors shadow-sm">
            + ADD
          </button>
        </div>
      </div>

      <!-- Product 2: SAZA-E-KAALIMIRCH -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="space-y-4">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            <img src="{./assets/images/37401f88bf.png}" alt="Saza-E-Kaalimirch" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <img src="{./assets/images/20808bad77.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/c5343ca209.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/f51bd7550b.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/d3c44e0811.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
          </div>
        </div>
        <div class="flex flex-col items-start">
          <h3 class="text-xl font-bold uppercase tracking-wide mb-2 text-gray-900">SAZA-E-KAALIMIRCH</h3>
          <div class="flex items-center gap-3 mb-4 text-lg">
            <span class="font-bold text-gray-900">₹69</span>
            <span class="text-red-400 line-through text-base">₹70</span>
          </div>
          <p class="text-gray-600 mb-8 leading-relaxed">Break the barriers of ordinary with this bold, tantalizing flavor.</p>
          <button class="bg-[#c25e3e] text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-[#a64d30] transition-colors shadow-sm">
            + ADD
          </button>
        </div>
      </div>

      <!-- Product 3: PAAPI PUDINA -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="space-y-4">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            <img src="{./assets/images/e1f6f7cd45.png}" alt="Paapi Pudina" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <img src="{./assets/images/8219c43ee2.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/a2fd89ac87.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/d5b44f23d6.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/cdfcd22745.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
          </div>
        </div>
        <div class="flex flex-col items-start">
          <h3 class="text-xl font-bold uppercase tracking-wide mb-2 text-gray-900">PAAPI PUDINA</h3>
          <div class="flex items-center gap-3 mb-4 text-lg">
            <span class="font-bold text-gray-900">₹69</span>
            <span class="text-red-400 line-through text-base">₹70</span>
          </div>
          <p class="text-gray-600 mb-8 leading-relaxed">The tang hits, world fades & you get caught licking your fingers.</p>
          <button class="bg-[#c25e3e] text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-[#a64d30] transition-colors shadow-sm">
            + ADD
          </button>
        </div>
      </div>

      <!-- Product 4: DHANIYA MIRCHI AUR WOH -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="space-y-4">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            <img src="{./assets/images/f78975083c.png}" alt="Dhaniya Mirchi Aur Woh" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <img src="{./assets/images/1befab133d.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/53fadd0317.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/8950a1169c.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/48aebc55e3.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
          </div>
        </div>
        <div class="flex flex-col items-start">
          <h3 class="text-xl font-bold uppercase tracking-wide mb-2 text-gray-900">DHANIYA MIRCHI AUR WOH</h3>
          <div class="flex items-center gap-3 mb-4 text-lg">
            <span class="font-bold text-gray-900">₹69</span>
            <span class="text-red-400 line-through text-base">₹70</span>
          </div>
          <p class="text-gray-600 mb-8 leading-relaxed">Is it the herbs, chillies or something out of the world that makes this flavor irresistible? It's a mystery.</p>
          <button class="bg-[#c25e3e] text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-[#a64d30] transition-colors shadow-sm">
            + ADD
          </button>
        </div>
      </div>

      <!-- Product 5: GANGS OF AWADH -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="space-y-4">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            <img src="{./assets/images/47553d85b2.png}" alt="Gangs of Awadh" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <img src="{./assets/images/69436da95e.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/6e400c95cb.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/8c53fab112.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/009c709b14.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
          </div>
        </div>
        <div class="flex flex-col items-start">
          <h3 class="text-xl font-bold uppercase tracking-wide mb-2 text-gray-900">GANGS OF AWADH</h3>
          <div class="flex items-center gap-3 mb-4 text-lg">
            <span class="font-bold text-gray-900">₹69</span>
            <span class="text-red-400 line-through text-base">₹70</span>
          </div>
          <p class="text-gray-600 mb-8 leading-relaxed">Experience 26 flavor notes come together to create a taste symphony like no other.</p>
          <button class="bg-[#c25e3e] text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-[#a64d30] transition-colors shadow-sm">
            + ADD
          </button>
        </div>
      </div>

      <!-- Product 6: SHAWARMA JI KA BETA -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="space-y-4">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            <img src="{./assets/images/fc841e80a7.png}" alt="Shawarma Ji Ka Beta" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <img src="{./assets/images/06721bbd8b.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/2415f478f0.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/a5425f301e.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
            <img src="{./assets/images/dd49ccfe30.png}" class="w-16 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:border-[#c25e3e] transition-colors">
          </div>
        </div>
        <div class="flex flex-col items-start">
          <h3 class="text-xl font-bold uppercase tracking-wide mb-2 text-gray-900">SHAWARMA JI KA BETA</h3>
          <div class="flex items-center gap-3 mb-4 text-lg">
            <span class="font-bold text-gray-900">₹69</span>
            <span class="text-red-400 line-through text-base">₹70</span>
          </div>
          <p class="text-gray-600 mb-8 leading-relaxed">Flavor that hits like a late night stroll down a food bazaar.</p>
          <button class="bg-[#c25e3e] text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-[#a64d30] transition-colors shadow-sm">
            + ADD
          </button>
        </div>
      </div>

    </div>

    <!-- Footer Button -->
    <div class="mt-20 text-center">
      <button class="bg-[#c25e3e] text-white px-10 py-3 rounded font-bold uppercase tracking-wide hover:bg-[#a64d30] transition-colors shadow-md">
        SHOW MORE (+5)
      </button>
    </div>
  </div>
</section>` }
  });
}