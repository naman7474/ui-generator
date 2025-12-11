const Section1 = () => {
  return (
    <div 
      data-section="section-1" 
      className="w-full flex items-center justify-center p-8"
      style={{ minHeight: '41px', backgroundColor: 'rgba(0, 0, 0, 0)' }}
    >
      <div className="text-center max-w-2xl">
        
        <p className="text-gray-600">Section 1 - 9 elements</p>
        <p className="text-gray-500 mt-4">Buy Any 3 Products at ₹999 | Use code : GET999...</p>
      </div>
    </div>
  );
};