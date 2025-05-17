import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiHeart, FiShoppingBag, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { BsStarFill, BsStarHalf, BsStar, BsCheck, BsFilter } from "react-icons/bs";
import EquipmentCategories from "./categorie";
import EquipmentService from "../services/EquipmentService";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useLocation } from 'react-router-dom';
import TrackingService from '../services/TrackingService';
import { useDebounce } from 'use-debounce';
import Fuse from 'fuse.js';

const ShopGrid = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState("popular");
  const [wishlist, setWishlist] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [tempSelectedConditions, setTempSelectedConditions] = useState([]);
  const [tempSelectedBrands, setTempSelectedBrands] = useState([]);
  const [tempSelectedLocations, setTempSelectedLocations] = useState([]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1000]);
  const navigate = useNavigate();

  // Initialize from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    
    if (category) {
      // Handle category selection from URL
      const mainCategory = decodeURIComponent(category);
      setSelectedEquipment(prev => ({
        ...prev,
        [mainCategory]: {} // Select main category without subcategories
      }));
    }
  }, [location.search]);

  // Debounce search query (300ms delay)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Fuse.js search configuration
  const fuseOptions = useMemo(() => ({
    keys: [
      { name: 'stuffname', weight: 0.6 },
      { name: 'short_description', weight: 0.3 },
      { name: 'detailed_description', weight: 0.1 },
      'brand',
      'category.name',
      'category.subcategory'
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    findAllMatches: true
  }), []);

  const performSearch = useCallback((query, items) => {
    if (!query) return items;
    
    const fuse = new Fuse(items, fuseOptions);
    const results = fuse.search(query);
    
    return results
      .sort((a, b) => a.score - b.score)
      .map(result => result.item);
  }, [fuseOptions]);

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

  const handleProductView = useCallback(async (productId) => {
    await TrackingService.trackPageView(productId);
  }, []);

  const handleCartAction = useCallback(async (productId, action) => {
    await TrackingService.trackCartActivity(productId, action);
  }, []);

  useEffect(() => {
    fetchData();
    getProductImage(1);
  }, [fetchData]);

  const getProductImage = useCallback((productId) => {
    if (!Array.isArray(images) || images.length === 0) return null;
    
    const productImages = images.filter(img => img?.stuff == productId);
    if (productImages.length === 0) return null;
    
    const mainImage = productImages.find(img => img?.position === 1);
    let url = mainImage?.url || productImages[0]?.url || null;
    
    if (url) {
      url = url.replace('host.docker.internal', '192.168.1.15');
    }
    
    return url;
  }, [images]);

  // Extract unique filters
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

  // Helper functions
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
      
      if (!subCat && !item) {
        // Toggle main category selection
        if (newSelection[mainCat]) {
          delete newSelection[mainCat];
        } else {
          newSelection[mainCat] = {};
        }
        return newSelection;
      }
      
      if (!newSelection[mainCat]) newSelection[mainCat] = {};
      if (!subCat) return newSelection; // Just select main category
      
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
    if (!subCat && !item) {
      return !!selectedEquipment[mainCat];
    }
    return selectedEquipment[mainCat]?.[subCat]?.includes(item) || false;
  }, [selectedEquipment]);

  const toggleTempFilter = useCallback((filterType, value) => {
    const setters = {
      brand: setTempSelectedBrands,
      condition: setTempSelectedConditions,
      location: setTempSelectedLocations
    };
    
    setters[filterType](prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  }, []);

  const applyFilters = useCallback(() => {
    setSelectedBrands(tempSelectedBrands);
    setSelectedConditions(tempSelectedConditions);
    setSelectedLocations(tempSelectedLocations);
    setPriceRange(tempPriceRange);
    setActiveFilter(null);
    setCurrentPage(1);
  }, [tempSelectedBrands, tempSelectedConditions, tempSelectedLocations, tempPriceRange]);

  const resetFilters = useCallback(() => {
    setPriceRange([0, 1000]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedLocations([]);
    setSelectedEquipment({});
    setTempPriceRange([0, 1000]);
    setTempSelectedBrands([]);
    setTempSelectedConditions([]);
    setTempSelectedLocations([]);
    setSearchQuery("");
    setCurrentPage(1);
    setActiveFilter(null);
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let results = products.filter(product => {
      const price = product.price_per_day || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      
      if (selectedBrands.length > 0 && (!product.brand || !selectedBrands.includes(product.brand))) {
        return false;
      }
      
      if (selectedConditions.length > 0 && (!product.state || !selectedConditions.includes(product.state))) {
        return false;
      }
      
      if (selectedLocations.length > 0 && (!product.rental_location || !selectedLocations.includes(product.rental_location))) {
        return false;
      }
      
      if (Object.keys(selectedEquipment).length > 0) {
        const categoryMatch = Object.entries(selectedEquipment).some(([mainCat, subCats]) => {
          // If main category is selected without subcategories, match any product in this category
          if (Object.keys(subCats).length === 0) {
            return product.category?.name === mainCat;
          }
          
          // Otherwise match specific subcategories and items
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

    if (debouncedSearchQuery) {
      results = performSearch(debouncedSearchQuery, results);
    }

    return results;
  }, [products, priceRange, selectedBrands, selectedConditions, 
    selectedLocations, selectedEquipment, debouncedSearchQuery, performSearch]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.price_per_day || 0;
      const priceB = b.price_per_day || 0;
      
      if (sortOption === "price-low") return priceA - priceB;
      if (sortOption === "price-high") return priceB - priceA;
      if (sortOption === "rating") return (b.rating || 0) - (a.rating || 0);
      return (b.id || 0) - (a.id || 0);
    });
  }, [filteredProducts, sortOption]);

  // Pagination
  const productsPerPage = 12;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    );
  }, [sortedProducts, currentPage, productsPerPage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } }
  };

  const scaleUp = {
    hidden: { scale: 0.95, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
  };

  // Set temp filters when opening a filter dropdown
  useEffect(() => {
    if (activeFilter) {
      setTempSelectedBrands(selectedBrands);
      setTempSelectedConditions(selectedConditions);
      setTempSelectedLocations(selectedLocations);
      setTempPriceRange(priceRange);
    }
  }, [activeFilter, selectedBrands, selectedConditions, selectedLocations, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar Section */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                placeholder="What equipment are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full h-14 pl-6 pr-14 text-gray-900 focus:outline-none text-lg border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
                <button className="p-2 text-teal-600 hover:text-teal-700 transition">
                  {searchQuery ? (
                    <FiX 
                      size={24} 
                      onClick={() => setSearchQuery('')} 
                      className="text-gray-400 hover:text-gray-600"
                    />
                  ) : (
                    <FiSearch size={24} className="text-teal-600" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Gray overlay when search is focused */}
            {searchFocused && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-20"
                onClick={() => setSearchFocused(false)}
              />
            )}
          </div>

          {/* Horizontal Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4 relative z-10">
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveFilter(activeFilter === 'category' ? null : 'category')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${Object.keys(selectedEquipment).length > 0 ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Category
                {activeFilter === 'category' ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              <AnimatePresence>
                {activeFilter === 'category' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-4"
                  >
                    <EquipmentCategories 
                      selectedEquipment={selectedEquipment}
                      onSelectEquipment={handleEquipmentSelect}
                      hoverSubcategories={true}
                      allowMainCategorySelection={true}
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setActiveFilter(null)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Range Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${priceRange[1] < 1000 ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Price Range
                {activeFilter === 'price' ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              <AnimatePresence>
                {activeFilter === 'price' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-4"
                  >
                    <div className="mb-3 flex justify-between text-sm text-gray-600">
                      <span>${tempPriceRange[0]}</span>
                      <span>${tempPriceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={tempPriceRange[1]}
                      onChange={(e) => setTempPriceRange([tempPriceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between mt-4 gap-2">
                      {[50, 100, 200].map((price) => (
                        <motion.button
                          key={price}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTempPriceRange([0, price])}
                          className={`flex-1 text-xs border px-2 py-1.5 rounded-md ${tempPriceRange[1] <= price ? 'bg-teal-600 text-white border-teal-600' : 'hover:bg-gray-50'}`}
                        >
                          Under ${price}
                        </motion.button>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setActiveFilter(null)}
                        className="px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setPriceRange(tempPriceRange);
                          setActiveFilter(null);
                          setCurrentPage(1);
                        }}
                        className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'brand' ? null : 'brand')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${selectedBrands.length > 0 ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Brand
                  {selectedBrands.length > 0 && <span className="text-xs">({selectedBrands.length})</span>}
                  {activeFilter === 'brand' ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                <AnimatePresence>
                  {activeFilter === 'brand' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-4 max-h-96 overflow-y-auto"
                    >
                      <div className="space-y-3">
                        {brands.map(brand => (
                          <div key={brand} className="flex items-center">
                            <button
                              onClick={() => toggleTempFilter('brand', brand)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${tempSelectedBrands.includes(brand) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                            >
                              {tempSelectedBrands.includes(brand) && <BsCheck className="text-white" />}
                            </button>
                            <label className="text-sm text-gray-700 cursor-pointer">
                              {brand}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setActiveFilter(null)}
                          className="px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBrands(tempSelectedBrands);
                            setActiveFilter(null);
                            setCurrentPage(1);
                          }}
                          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Condition Filter */}
            {conditions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'condition' ? null : 'condition')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${selectedConditions.length > 0 ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Condition
                  {selectedConditions.length > 0 && <span className="text-xs">({selectedConditions.length})</span>}
                  {activeFilter === 'condition' ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                <AnimatePresence>
                  {activeFilter === 'condition' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-4"
                    >
                      <div className="space-y-3">
                        {conditions.map(condition => (
                          <div key={condition} className="flex items-center">
                            <button
                              onClick={() => toggleTempFilter('condition', condition)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${tempSelectedConditions.includes(condition) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                            >
                              {tempSelectedConditions.includes(condition) && <BsCheck className="text-white" />}
                            </button>
                            <label className="text-sm text-gray-700 cursor-pointer">
                              {condition}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setActiveFilter(null)}
                          className="px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setSelectedConditions(tempSelectedConditions);
                            setActiveFilter(null);
                            setCurrentPage(1);
                          }}
                          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Location Filter */}
            {locations.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'location' ? null : 'location')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${selectedLocations.length > 0 ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Location
                  {selectedLocations.length > 0 && <span className="text-xs">({selectedLocations.length})</span>}
                  {activeFilter === 'location' ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                <AnimatePresence>
                  {activeFilter === 'location' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-4 max-h-96 overflow-y-auto"
                    >
                      <div className="space-y-3">
                        {locations.map(location => (
                          <div key={location} className="flex items-center">
                            <button
                              onClick={() => toggleTempFilter('location', location)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${tempSelectedLocations.includes(location) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                            >
                              {tempSelectedLocations.includes(location) && <BsCheck className="text-white" />}
                            </button>
                            <label className="text-sm text-gray-700 cursor-pointer">
                              {location}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setActiveFilter(null)}
                          className="px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLocations(tempSelectedLocations);
                            setActiveFilter(null);
                            setCurrentPage(1);
                          }}
                          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Clear all button */}
            {(selectedBrands.length > 0 || selectedConditions.length > 0 || selectedLocations.length > 0 || priceRange[1] < 1000 || Object.keys(selectedEquipment).length > 0) && (
              <button
                onClick={resetFilters}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gray overlay when filter dropdown is open */}
      {activeFilter && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 z-20"
          onClick={() => setActiveFilter(null)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with sorting */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="flex justify-between items-center mb-6"
        >
          <p className="text-sm text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
          </p>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none border rounded pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="popular">Sort: Most Popular</option>
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
        </motion.div>

        {loading ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="animate-pulse bg-gray-100 rounded-xl overflow-hidden"
              >
                <div className="bg-gray-200 h-64 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mt-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg mt-6"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : paginatedProducts.length === 0 ? (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={fadeIn}
            className="text-center py-16 bg-white rounded-xl shadow-sm"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-3">No items match your search</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search for something different
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={resetFilters}
              className="px-6 py-3 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition shadow-sm"
            >
              Reset All Filters
            </motion.button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {paginatedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  id={`product-${product.id}`}
                  whileHover={{ y: -5 }}
                  onClick={() => handleProductView(product.id)}
                  className="group relative bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  {/* Product Labels */}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    {product.state === 'new' && (
                      <motion.span 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="bg-white text-black text-xs px-2 py-1 rounded-full font-medium shadow-sm"
                      >
                        NEW
                      </motion.span>
                    )}
                    {product.isBestSeller && (
                      <motion.span 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm"
                      >
                        BESTSELLER
                      </motion.span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition shadow-sm"
                  >
                    <FiHeart
                      className={`${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                      size={18}
                    />
                  </motion.button>

                  {/* Product Image */}
                  <div 
                    className="bg-gray-100 h-64 relative overflow-hidden cursor-pointer"
                    onClick={() => setQuickViewProduct(product)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 group-hover:opacity-30 transition"></div>
                    {getProductImage(product.id) ? (
                      <img 
                        src={getProductImage(product.id)} 
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
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.stuffname}</h3>
                        {product.brand && (
                          <p className="text-sm text-gray-500 mb-1 line-clamp-1">{product.brand}</p>
                        )}
                      </div>
                      <span className="text-lg font-semibold text-gray-900 whitespace-nowrap ml-2">
                        {formatPrice(product.price_per_day)}
                      </span>
                    </div>
                    
                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center mb-3 mt-2">
                        <div className="flex mr-1">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                    )}
                    
                    {/* Location */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {product.rental_location}
                    </p>

                    {/* Condition */}
                    <div className="mb-4">
                      <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                        product.state === 'new' ? 'bg-green-100 text-green-800' : 
                        product.state === 'used' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.state || 'N/A'} condition
                      </span>
                    </div>

                    {/* Add to Cart */}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/equipment/${product.id}`);
                        handleCartAction(product.id, 'add');
                      }}
                    >
                      <FiShoppingBag size={16} />
                      <span>Rent Now</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial="hidden"
                animate="show"
                variants={fadeIn}
                className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4"
              >
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * productsPerPage + 1}-{Math.min(currentPage * productsPerPage, sortedProducts.length)} of {sortedProducts.length} items
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                  >
                    <FiChevronLeft />
                  </motion.button>
                  
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
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg ${currentPage === pageNum ? "bg-teal-600 text-white" : "border hover:bg-gray-100"}`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-1">...</span>
                  )}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(totalPages)}
                      className="w-10 h-10 rounded-lg border hover:bg-gray-100"
                    >
                      {totalPages}
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                  >
                    <FiChevronRight />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md z-10 hover:bg-gray-100"
              >
                <FiX className="text-xl" />
              </button>
              
              <div className="grid md:grid-cols-2">
                {/* Product Images */}
                <div className="bg-gray-100 h-96 md:h-full">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <img src={getProductImage(quickViewProduct.id)} alt="" />
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{quickViewProduct.stuffname}</h2>
                      {quickViewProduct.brand && (
                        <p className="text-lg text-gray-600">{quickViewProduct.brand}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <FiHeart
                        className={`text-xl ${wishlist.includes(quickViewProduct.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                      />
                    </button>
                  </div>
                  
                  {/* Rating */}
                  {quickViewProduct.rating && (
                    <div className="flex items-center mb-4">
                      <div className="flex mr-2">
                        {renderStars(quickViewProduct.rating)}
                      </div>
                      <span className="text-sm text-gray-500">({quickViewProduct.reviewCount || 0} reviews)</span>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(quickViewProduct.price_per_day)}
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{quickViewProduct.rental_location}</span>
                  </div>
                  
                  {/* Condition */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Condition</h3>
                    <span className={`px-3 py-1.5 rounded-full text-sm ${
                      quickViewProduct.state === 'new' ? 'bg-green-100 text-green-800' : 
                      quickViewProduct.state === 'used' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quickViewProduct.state || 'N/A'} condition
                    </span>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">
                      {quickViewProduct.short_description || 'No description available for this equipment.'}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-900 mb-3">Key Features</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {['Powerful motor', 'Easy to transport', 'Low maintenance', 'Quiet operation', 'Energy efficient', 'Safety certified'].map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <BsCheck className="text-teal-600 mr-2 text-lg" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="py-3 px-6 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition"
                    >
                      Add to Inquiry
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="py-3 px-6 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
                      onClick={() => {
                        navigate(`/equipment/${quickViewProduct.id}`);
                        handleCartAction(quickViewProduct.id, 'add');
                      }}
                    >
                      <FiShoppingBag size={18} />
                      <span>Rent Now</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopGrid;