const Section1 = () => {
  return (
    <section data-section="section-1" className="w-full bg-black relative">
      {/* 
        The provided hero image (img-1.png) appears to be a complete composite 
        containing the background, the stylized text, and the central product placement 
        with lighting effects that would be impossible to recreate perfectly with 
        separate CSS overlays given the assets provided.
        
        The other images (img-61 to img-71) are small product thumbnails (185x131px) 
        which are too small to be the central hero element (approx 250px+ height in screenshot)
        and are likely for a different section or a carousel not shown in the static screenshot.
      */}
      <img 
        src="./assets/img-1.png" 
        alt="KILRR Hero Banner - Get Killer Taste With Zero Fuss" 
        className="w-full h-auto object-cover block"
      />
      
      {/* Hidden text for Accessibility and SEO since the text is embedded in the image */}
      <div className="sr-only">
        <h1>GET KILLER TASTE WITH ZERO FUSS</h1>
        <div>
          <p>The KILRR taste that blows your mind</p>
          <p>NO FUSS INSTANT MARINADE PASTE</p>
          <p>Just add water</p>
          <p>READY IN 1 MIN</p>
          <p>TANDOORI BLAST</p>
          <p>Knocks out 250g</p>
        </div>
      </div>
    </section>
  );
};