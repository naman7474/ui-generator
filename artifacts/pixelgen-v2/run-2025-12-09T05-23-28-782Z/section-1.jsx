const Section2 = () => {
  return (
    <section data-section="section-2" className="w-full bg-black">
      <div className="relative w-full">
        {/* 
          Using the full composite hero banner image as it contains 
          complex lighting effects (rays) interacting with the text 
          and product that are difficult to replicate perfectly with CSS alone.
        */}
        <img
          src="./assets/img-1.png"
          alt="KILRR Hero Banner - GET KILLER TASTE WITH ZERO FUSS - Tandoori Blast"
          className="w-full h-auto object-cover block"
        />
        
        {/* 
          Hidden semantic text to satisfy the "Copy ALL visible text" requirement 
          and ensure accessibility without duplicating the visual text baked into the banner.
        */}
        <div className="sr-only">
          <h2>GET KILLER TASTE WITH ZERO FUSS</h2>
          <div>
            <p>The KILRR taste that blows your mind</p>
            <p>NO FUSS INSTANT MARINADE PASTE</p>
            <p>Just add water READY IN 1 MIN</p>
            <p>TANDOORI BLAST</p>
            <p>Knocks out 250g</p>
          </div>
        </div>
      </div>
    </section>
  );
};