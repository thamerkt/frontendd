const ProductCard = ({ product }) => {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-teal-50">
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.featured && (
            <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-lg text-teal-900">{product.name}</h3>
            <div className="flex items-center bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {product.rating}
            </div>
          </div>
          <p className="text-teal-600 text-sm mb-3">{product.specs}</p>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-teal-900">${product.dailyRate}</span>
              <span className="text-teal-600 text-sm">/day</span>
            </div>
            <button className="bg-teal-600 text-white py-1 px-3 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
              Rent Now
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const ProductGrid = ({ products }) => {
    if (products.length === 0) {
      return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-teal-100 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-teal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-teal-800 mb-2">No products found</h3>
          <p className="text-teal-600">Try adjusting your filters or search query</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };
  
  export default ProductGrid;