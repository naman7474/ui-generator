const Section6 = () => {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef(null);

  const handleMove = React.useCallback((clientX) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(percentage);
    }
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMove]);

  // Handle click on container to jump to position
  const handleClick = (e) => {
    handleMove(e.clientX);
  };

  return (
    <section 
      data-section="slay-the-mess-savor-the-taste" 
      className="w-full py-12 md:py-16 flex flex-col items-center bg-transparent"
    >
      <div className="text-center mb-10 px-4">
        <p className="text-[#D97757] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-4">
          A KILRR IDEA THAT'LL CHANGE YOUR LIFE
        </p>
        <h2 className="text-3xl md:text-5xl font-normal text-black tracking-wide">
          SLAY THE MESS, SAVOR THE TASTE
        </h2>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-[1260px] aspect-[1260/477] group cursor-ew-resize select-none overflow-hidden"
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onClick={handleClick}
      >
        {/* Background Image (After - Right Side) */}
        <img 
          src="./assets/img-59.png" 
          alt="After comparison image" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Foreground Image (Before - Left Side) - Clipped */}
        <img 
          src="./assets/img-58.png" 
          alt="Before comparison image" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
          }}
        />

        {/* Slider Handle Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-black z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider Handle Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg">
            <svg 
              width="10" 
              height="16" 
              viewBox="0 0 10 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="ml-0.5"
            >
              <path d="M1.5 1L8.5 8L1.5 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};