const Section6 = () => {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    // Prevent default text selection behavior
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    // Prevent scrolling while dragging
    // e.preventDefault(); // Note: blocking touchstart default can be problematic for scrolling, handled via CSS touch-action
  };

  const updateSliderPosition = React.useCallback((clientX) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.min(100, Math.max(0, percentage)));
    }
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updateSliderPosition(e.clientX);
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging) {
        updateSliderPosition(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, updateSliderPosition]);

  // Handle click to jump
  const handleContainerClick = (e) => {
    updateSliderPosition(e.clientX);
  };

  return (
    <section 
      data-section="slay-the-mess-savor-the-taste" 
      className="w-full bg-transparent py-12 md:py-16 lg:py-20 flex flex-col items-center"
    >
      {/* Header Content */}
      <div className="text-center mb-8 md:mb-12 px-4">
        <h3 className="text-[#D97757] text-xs md:text-sm font-bold tracking-[0.15em] uppercase mb-3 md:mb-4">
          A KILRR IDEA THAT'LL CHANGE YOUR LIFE
        </h3>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-black uppercase tracking-wide">
          SLAY THE MESS, SAVOR THE TASTE
        </h2>
      </div>

      {/* Comparison Slider */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[1260px] aspect-[1260/477] mx-auto select-none group cursor-ew-resize overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleContainerClick}
      >
        {/* Background Image (After / Clean) - Always fully visible underneath */}
        <img 
          src="./assets/img-59.png" 
          alt="After comparison image" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Foreground Image (Before / Mess) - Clipped based on slider */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
          }}
        >
          <img 
            src="./assets/img-58.png" 
            alt="Before comparison image" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-black z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};