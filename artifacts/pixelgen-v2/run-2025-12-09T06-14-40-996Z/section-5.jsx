const Section6 = () => {
  const [sliderPosition, setSliderPosition] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const containerRef = React.useRef(null);

  // Update container width on mount and resize to ensure inner image scales correctly
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMove = React.useCallback((clientX) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      // Clamp percentage between 0 and 100
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    }
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onTouchStart = () => setIsDragging(true);

  React.useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handleMove]);

  return (
    <section data-section="slay-the-mess-savor-the-taste" className="w-full bg-white py-12 md:py-16 flex flex-col items-center">
      {/* Header Content */}
      <div className="text-center mb-10 md:mb-12 px-4">
        <h3 className="text-[#D97757] font-medium tracking-[0.15em] text-xs md:text-sm mb-3 md:mb-4 uppercase">
          A KILRR IDEA THAT'LL CHANGE YOUR LIFE
        </h3>
        <h2 className="text-black text-3xl md:text-4xl lg:text-[42px] font-normal tracking-wide uppercase font-sans">
          SLAY THE MESS, SAVOR THE TASTE
        </h2>
      </div>

      {/* Comparison Slider */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[1260px] aspect-[1260/477] cursor-ew-resize select-none overflow-hidden group"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={(e) => handleMove(e.clientX)}
      >
        {/* Background Image (Before/Messy) - Always visible, sits behind */}
        <img 
          src="./assets/img-58.png" 
          alt="Before comparison image" 
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Foreground Image (After/Clean) - Clipped by parent div width */}
        <div 
          className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none select-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src="./assets/img-59.png" 
            alt="After comparison image" 
            className="absolute top-0 left-0 max-w-none h-full object-cover select-none"
            // Important: Inner image must match the full container width to align perfectly with background
            style={{ width: containerWidth ? `${containerWidth}px` : '100%' }} 
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-black cursor-ew-resize z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center shadow-lg">
             {/* Chevron Right Icon */}
             <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-0.5">
                <path d="M1.5 1L8.5 8L1.5 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
        </div>
      </div>
    </section>
  );
};