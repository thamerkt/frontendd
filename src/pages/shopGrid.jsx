import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiHeart, FiShoppingBag, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { RiFilter2Line } from "react-icons/ri";
import EquipmentCategories from "./categorie";
import EquipmentService from "../services/EquipmentService";

const ShopGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState("popular");
  const [wishlist, setWishlist] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [images, setImages] = useState([]);

  // Fetch products and images
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, imagesData] = await Promise.all([
        EquipmentService.fetchRentals(),
        EquipmentService.fetchImages()
      ]);
      setProducts(productsData);
      setImages(imagesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchData();
    console.log(products)
    console.log(images)

  }, [fetchData]);

  // Get product image URL
  const getProductImage = useCallback((productId) => {
    if (!Array.isArray(images) || images.length === 0) return null;
  
    const productImages = images.filter(img => img.stuff === productId);
    if (productImages.length === 0) return null;
  
    const mainImage = productImages.find(img => img.position === 1);
    console.log(mainImage?.url || productImages[0]?.url || null)
    return mainImage?.url || productImages[0]?.url || null;
  }, [images]);
  

  // Extract unique brands, conditions, and locations for filters
  const { brands, conditions, locations } = useMemo(() => {
    const brandSet = new Set();
    const conditionSet = new Set();
    const locationSet = new Set();

    products.forEach(product => {
      if (product.brand) brandSet.add(product.brand);
      if (product.state) conditionSet.add(product.state);
      if (product.rental_location) locationSet.add(product.rental_location);
    });

    return {
      brands: Array.from(brandSet).sort(),
      conditions: Array.from(conditionSet).sort(),
      locations: Array.from(locationSet).sort()
    };
  }, [products]);

  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEquipmentSelect = useCallback((mainCat, subCat, item) => {
    setSelectedEquipment(prev => {
      const newSelection = { ...prev };
      
      if (!newSelection[mainCat]) newSelection[mainCat] = {};
      if (!newSelection[mainCat][subCat]) newSelection[mainCat][subCat] = [];
      
      const index = newSelection[mainCat][subCat].indexOf(item);
      if (index > -1) {
        newSelection[mainCat][subCat].splice(index, 1);
        if (newSelection[mainCat][subCat].length === 0) {
          delete newSelection[mainCat][subCat];
          if (Object.keys(newSelection[mainCat]).length === 0) {
            delete newSelection[mainCat];
          }
        }
      } else {
        newSelection[mainCat][subCat].push(item);
      }
      
      return newSelection;
    });
  }, []);

  const isEquipmentSelected = useCallback((mainCat, subCat, item) => {
    return selectedEquipment[mainCat]?.[subCat]?.includes(item) || false;
  }, [selectedEquipment]);

  const toggleFilter = useCallback((filterType, value) => {
    const setters = {
      brand: setSelectedBrands,
      condition: setSelectedConditions,
      location: setSelectedLocations
    };
    
    setters[filterType](prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  }, []);

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<BsStarFill key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<BsStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<BsStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  }, []);

  const formatPrice = useCallback((price) => {
    return `$${price?.toFixed(2) || '0.00'}/day`;
  }, []);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Price filter
      const price = product.price_per_day || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      
      // Brand filter
      if (selectedBrands.length > 0 && (!product.brand || !selectedBrands.includes(product.brand))) {
        return false;
      }
      
      // Condition filter
      if (selectedConditions.length > 0 && (!product.state || !selectedConditions.includes(product.state))) {
        return false;
      }
      
      // Location filter
      if (selectedLocations.length > 0 && (!product.rental_location || !selectedLocations.includes(product.rental_location))) {
        return false;
      }
      
      // Equipment category filter
      if (Object.keys(selectedEquipment).length > 0) {
        const categoryMatch = Object.entries(selectedEquipment).some(([mainCat, subCats]) => {
          return Object.entries(subCats).some(([subCat, items]) => {
            return items.some(item => 
              product.category?.name === mainCat && 
              product.category?.subcategory === subCat && 
              product.stuffname === item
            );
          });
        });
        
        if (!categoryMatch) return false;
      }
      
      return true;
    });
  }, [products, priceRange, selectedBrands, selectedConditions, selectedLocations, selectedEquipment]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.price_per_day || 0;
      const priceB = b.price_per_day || 0;
      
      if (sortOption === "price-low") {
        return priceA - priceB;
      } else if (sortOption === "price-high") {
        return priceB - priceA;
      } else if (sortOption === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        // Default: popularity
        return (b.id || 0) - (a.id || 0);
      }
    });
  }, [filteredProducts, sortOption]);

  // Pagination
  const productsPerPage = 9;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    );
  }, [sortedProducts, currentPage, productsPerPage]);

  const resetFilters = useCallback(() => {
    setPriceRange([0, 1000]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedLocations([]);
    setSelectedEquipment({});
    setCurrentPage(1);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Announcement Bar */}
      <div className="bg-black text-white py-2 text-sm text-center">
        <div className="max-w-7xl mx-auto px-4">
          Sign up and get 20% off on your first rental.{" "}
          <button className="underline font-medium hover:opacity-80 transition">
            Sign Up Now
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="py-6 text-sm text-gray-500">
          <ol className="flex space-x-2">
            <li>
              <a href="#" className="hover:text-teal transition">
                Home
              </a>
            </li>
            <li>/</li>
            <li>
              <a href="#" className="hover:text-teal transition">
                Equipment Rental
              </a>
            </li>
            <li>/</li>
            <li className="text-teal font-medium">All Items</li>
          </ol>
        </nav>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 border px-4 py-2 rounded"
          >
            <RiFilter2Line />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 border-r border-gray-200 pr-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button 
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-teal-600"
              >
                Reset All
              </button>
            </div>

            {/* Equipment Categories */}
            <EquipmentCategories 
              selectedEquipment={selectedEquipment}
              onSelectEquipment={handleEquipmentSelect}
            />

            {/* Price Range */}
            <div className="mb-8 mt-6">
              <h3 className="font-medium mb-3 text-gray-900">Price Range (per day)</h3>
              <div className="mb-2 flex justify-between text-sm text-gray-500">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setPriceRange([0, 50])}
                  className={`text-xs border px-2 py-1 rounded ${priceRange[1] <= 50 ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  Under $50
                </button>
                <button
                  onClick={() => setPriceRange([50, 100])}
                  className={`text-xs border px-2 py-1 rounded ${priceRange[0] >= 50 && priceRange[1] <= 100 ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  $50-$100
                </button>
                <button
                  onClick={() => setPriceRange([100, 1000])}
                  className={`text-xs border px-2 py-1 rounded ${priceRange[0] >= 100 ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  Over $100
                </button>
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-3 text-gray-900">Brands</h3>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleFilter('brand', brand)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions */}
            {conditions.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-3 text-gray-900">Condition</h3>
                <div className="space-y-2">
                  {conditions.map(condition => (
                    <div key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`condition-${condition}`}
                        checked={selectedConditions.includes(condition)}
                        onChange={() => toggleFilter('condition', condition)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <label htmlFor={`condition-${condition}`} className="ml-2 text-sm text-gray-700">
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {locations.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-3 text-gray-900">Location</h3>
                <div className="space-y-2">
                  {locations.map(location => (
                    <div key={location} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`location-${location}`}
                        checked={selectedLocations.includes(location)}
                        onChange={() => toggleFilter('location', location)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <label htmlFor={`location-${location}`} className="ml-2 text-sm text-gray-700">
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Mobile Filters */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setMobileFiltersOpen(false)}></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Filters</h2>
                      <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500 hover:text-gray-700">
                        ✕
                      </button>
                    </div>

                    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                      {/* Price Range */}
                      <div>
                        <h3 className="font-medium mb-2 text-gray-900">Price Range (per day)</h3>
                        <div className="mb-1 flex justify-between text-xs text-gray-500">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Brands */}
                      {brands.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2 text-gray-900">Brands</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {brands.map(brand => (
                              <div key={brand} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`mobile-brand-${brand}`}
                                  checked={selectedBrands.includes(brand)}
                                  onChange={() => toggleFilter('brand', brand)}
                                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor={`mobile-brand-${brand}`} className="ml-2 text-sm text-gray-700">
                                  {brand}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conditions */}
                      {conditions.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2 text-gray-900">Condition</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {conditions.map(condition => (
                              <div key={condition} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`mobile-condition-${condition}`}
                                  checked={selectedConditions.includes(condition)}
                                  onChange={() => toggleFilter('condition', condition)}
                                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor={`mobile-condition-${condition}`} className="ml-2 text-sm text-gray-700">
                                  {condition}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {locations.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2 text-gray-900">Location</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {locations.map(location => (
                              <div key={location} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`mobile-location-${location}`}
                                  checked={selectedLocations.includes(location)}
                                  onChange={() => toggleFilter('location', location)}
                                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor={`mobile-location-${location}`} className="ml-2 text-sm text-gray-700">
                                  {location}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={resetFilters}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <main className="flex-1">
            {/* Header with sorting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * productsPerPage + 1}-{Math.min(currentPage * productsPerPage, sortedProducts.length)} of {sortedProducts.length} items
              </p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none border rounded pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-1"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded"></div>
                    <div className="mt-3 bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="mt-2 bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 border border-black text-black rounded hover:bg-gray-100 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative border rounded-lg overflow-hidden hover:shadow-md transition"
                    >
                      {/* Product Labels */}
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        {product.state === 'new' && (
                          <span className="bg-white text-black text-xs px-2 py-1 rounded font-medium">
                            NEW
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="bg-black text-white text-xs px-2 py-1 rounded font-medium">
                            POPULAR
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition"
                      >
                        <FiHeart
                          className={`${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                          size={18}
                        />
                      </button>

                      {/* Product Image */}
                      <div className="bg-gray-100 h-64 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 group-hover:opacity-30 transition"></div>
                        {getProductImage(product.id) ? (
                          <img 
                            src="http://host.docker.internal:8006/equipment_images/book.jpg" 
                            alt={product.stuffname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {product.category?.name || 'Equipment'} Image
                          </div>
                        )}
                        {/* Quick View */}
                        <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white px-4 py-2 rounded text-sm">
                          Quick View
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1">{product.stuffname}</h3>
                        {product.brand && (
                          <p className="text-sm text-gray-500 mb-1">Brand: {product.brand}</p>
                        )}
                        <p className="text-sm text-gray-500 mb-2">Location: {product.rental_location}</p>
                        
                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center mb-2">
                            <div className="flex mr-1">
                              {renderStars(product.rating)}
                            </div>
                            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                          </div>
                        )}
                        
                        {/* Price */}
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(product.price_per_day)}
                          </span>
                        </div>

                        {/* Condition */}
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 rounded bg-gray-100">
                            Condition: {product.state || 'N/A'}
                          </span>
                        </div>

                        {/* Add to Cart */}
                        <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded hover:bg-gray-800 transition flex items-center justify-center gap-2">
                          <FiShoppingBag size={16} />
                          <span>Rent Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * productsPerPage + 1}-{Math.min(currentPage * productsPerPage, sortedProducts.length)} of {sortedProducts.length} items
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded border ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                      >
                        <FiChevronLeft />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded ${currentPage === pageNum ? "bg-black text-white" : "border hover:bg-gray-100"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <span className="px-2">...</span>
                      )}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="w-10 h-10 rounded border hover:bg-gray-100"
                        >
                          {totalPages}
                        </button>
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded border ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-teal-600 text-white mt-16 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-medium mb-4">STAY UP TO DATE ABOUT OUR LATEST OFFERS</h3>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              />
              <button className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition">
                Subscribe to Newsletter
              </button>
            </div>
            <p className="text-white text-xs mt-2">
              We'll never share your email with anyone else.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-black transition">FAQs</a></li>
                <li><a href="#" className="hover:text-black transition">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-black transition">Shipping Information</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">About Us</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition">Our Story</a></li>
                <li><a href="#" className="hover:text-black transition">Careers</a></li>
                <li><a href="#" className="hover:text-black transition">Sustainability</a></li>
                <li><a href="#" className="hover:text-black transition">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-black transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-black transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-black transition">Accessibility</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Connect With Us</h4>
              <div className="flex gap-4 mb-4">
                {["Facebook", "Instagram", "Twitter", "Pinterest"].map((social) => (
                  <a key={social} href="#" className="text-gray-600 hover:text-black transition">
                    {social}
                  </a>
                ))}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 mt-6">Payment Methods</h4>
              <div className="flex gap-2">
                {["Visa", "Mastercard", "Amex", "PayPal"].map((method) => (
                  <div key={method} className="bg-white px-2 py-1 rounded text-xs border">
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Equipment Rental. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopGrid;