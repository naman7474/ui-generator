const Section5 = () => {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const containerRef = React.useRef(null);
  const isDragging = React.useRef(false);

  const handleMove = (clientX) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    }
  };

  const onMouseDown = () => {
    isDragging.current = true;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  // Handle touch events separately to prevent scrolling while dragging
  const onTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    const handleGlobalMouseMove = (e) => {
      if (isDragging.current) {
        handleMove(e.clientX);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  return (
    <section data-section="slay-the-mess-savor-the-taste" className="w-full bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Header Content */}
        <div className="text-center mb-10 md:mb-14">
          <h3 className="text-[#D47656] font-bold tracking-[0.15em] text-xs md:text-sm mb-4 uppercase">
            A KILRR IDEA THAT'LL CHANGE YOUR LIFE
          </h3>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-black font-normal uppercase tracking-wide">
            SLAY THE MESS, SAVOR THE TASTE
          </h2>
        </div>

        {/* Comparison Slider */}
        <div 
          ref={containerRef}
          className="relative w-full max-w-[1260px] aspect-[1260/477] group cursor-ew-resize select-none overflow-hidden shadow-sm"
          onMouseDown={onMouseDown}
          onTouchMove={onTouchMove}
          style={{ touchAction: 'none' }}
        >
          {/* Background Image (Before/Mess) - Always visible fully, sits behind */}
          <img 
            src="./assets/img-58.png" 
            alt="Before comparison image" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Foreground Image (After/Clean) - Clipped based on slider position */}
          {/* We clip from the right side, revealing this image from left to right as we drag right */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img 
              src="./assets/img-59.png" 
              alt="After comparison image" 
              className="absolute inset-0 w-full h-full object-cover max-w-none" 
            />
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-black pointer-events-none z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Handle Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg transition-transform duration-100 group-active:scale-110">
               {/* Chevron Right Icon */}
               <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 1L8.5 8L1.5 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};