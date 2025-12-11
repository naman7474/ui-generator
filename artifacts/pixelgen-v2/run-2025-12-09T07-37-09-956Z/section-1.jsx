const Section2 = () => {
  return (
    <header 
      data-section="item-added-to-your-cart" 
      className="w-full flex items-center justify-center p-8"
      style={{ minHeight: '65px', backgroundColor: 'rgba(0, 0, 0, 0)' }}
    >
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Item added to your cart</h2>
        <p className="text-gray-600">Section 2 - 498 elements</p>
        <p className="text-gray-500 mt-4">Your Profile...</p>
      </div>
    </header>
  );
};