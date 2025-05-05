import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiHeart, FiShoppingBag, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { RiFilter2Line } from "react-icons/ri";
import EquipmentCategories from "./categorie";
import EquipmentService from "../services/EquipmentService";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { BsCheck, BsFilter } from "react-icons/bs";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import TrackingService from '../services/TrackingService';
import { useDebounce } from 'use-debounce';
import Fuse from 'fuse.js';

// Inside the ShopGrid component, replace the search state and add new states:


// Add after the products state is set up


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
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const navigate = useNavigate();

  // Debounce search query (300ms delay)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Fuse.js search configuration
  const fuseOptions = useMemo(() => ({
    keys: [
      {
        name: 'stuffname',
        weight: 0.6  // Highest priority
      },
      {
        name: 'short_description',
        weight: 0.3  // Medium priority
      },
      {
        name: 'detailed_description',
        weight: 0.1  // Lower priority
      },
      'brand',
      'category.name',
      'category.subcategory'
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,  // Search across entire strings
    findAllMatches: true   // Return all good matches
  }), []);
  const performSearch = useCallback((query, items) => {
    if (!query) return items;
    
    const fuse = new Fuse(items, fuseOptions);
    const results = fuse.search(query);
    
    // Sort by match score (best matches first)
    return results
      .sort((a, b) => a.score - b.score)
      .map(result => result.item);
  }, [fuseOptions]);
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, imagesData,categorydata] = await Promise.all([
        EquipmentService.fetchRentals(),
        EquipmentService.fetchImages(),
        EquipmentService.fetchCategories()

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
    // Rest of your quick view logic
  }, []);

  // Track cart activities
  const handleCartAction = useCallback(async (productId, action) => {
    await TrackingService.trackCartActivity(productId, action);
    // Rest of your cart logic
  }, []);
  

  useEffect(() => {
    fetchData();
    
    getProductImage(1)
    

  }, [fetchData]);

  // Get product image URL
  const getProductImage = useCallback((productId) => {
    console.log('getProductImage called with productId:', productId);
    console.log('Current images array:', images);
  
    if (!Array.isArray(images) || images.length === 0) {
      console.log('No images available');
      return null;
    }
  
    const productImages = images.filter(img => img?.stuff == productId);
    console.log('Filtered product images:', productImages);
  
    if (productImages.length === 0) {
      console.log('No images found for this product');
      return null;
    }
  
    const mainImage = productImages.find(img => img?.position === 1);
    console.log('Main image:', mainImage);
  
    let url = mainImage?.url || productImages[0]?.url || null;
    console.log('Initial URL:', url);
  
    if (url) {
     
        url = url.replace('host.docker.internal', '192.168.1.15');
        console.log('Processed Docker URL:', url);
      
    }
  
    console.log('Final URL to be returned:', url);
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // First apply all filters except search
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
      return (b.id || 0) - (a.id || 0); // Default: popularity
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

  const resetFilters = useCallback(() => {
    setPriceRange([0, 1000]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedLocations([]);
    setSelectedEquipment({});
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
  className="relative bg-gradient-to-r from-teal-600 to-teal-500 text-white md:py-24 overflow-hidden"
>
  <div className="absolute inset-0 bg-black/20 z-0"></div>
  
  <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="text-center mb-10">
      <motion.h1 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold "
      >
        Rent Top-Quality Equipment
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl md:text-2xl max-w-2xl mx-auto"
      >
        Find the perfect tools for your next project
      </motion.p>
    </div>
    
    {/* Professional Search Bar */}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="What equipment are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-6 pr-14 text-gray-900 focus:outline-none text-lg"
          />
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
            <button className="p-2 text-gray-500 hover:text-teal-600 transition">
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
        <button 
          className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 font-medium text-lg transition duration-200"
          onClick={() => performSearch(searchQuery, products)}
        >
          Search
        </button>
      </div>
      
      {/* Quick Search Suggestions (appears when typing) */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-t border-gray-100"
        >
          <div className="py-2 px-4">
            <p className="text-sm text-gray-500 mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {['Excavator', 'Generator', 'Scaffolding', 'Power Tools']
                .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition"
                    onClick={() => setSearchQuery(item)}
                  >
                    {item}
                  </motion.button>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
    
    {/* Category Quick Links */}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex justify-center mt-8 gap-3 flex-wrap"
    >
      {['Construction', 'Landscaping', 'Power Tools', 'Generators'].map((category) => (
        <motion.button
          key={category}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition border border-white/20"
        >
          {category}
        </motion.button>
      ))}
    </motion.div>
  </div>
</motion.section>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Navigation */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {['All Equipment', 'Construction', 'Landscaping', 'Power Tools', 'Generators', 'Scaffolding'].map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === 'All Equipment' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <motion.aside 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-80"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">Filters</h2>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-teal-600 hover:text-teal-700 transition font-medium"
                >
                  Reset All
                </button>
              </div>

              {/* Equipment Categories */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-900">Equipment Categories</h3>
                <EquipmentCategories 
                  selectedEquipment={selectedEquipment}
                  onSelectEquipment={handleEquipmentSelect}
                />
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-900">Price Range (per day)</h3>
                <div className="mb-3 flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between mt-4 gap-2">
                  {[50, 100, 200].map((price) => (
                    <motion.button
                      key={price}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPriceRange([0, price])}
                      className={`flex-1 text-xs border px-2 py-1.5 rounded-md ${priceRange[1] <= price ? 'bg-teal-600 text-white border-teal-600' : 'hover:bg-gray-50'}`}
                    >
                      Under ${price}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-3 text-gray-900">Brands</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {brands.map(brand => (
                      <motion.div 
                        key={brand}
                        whileHover={{ x: 2 }}
                        className="flex items-center"
                      >
                        <button
                          onClick={() => toggleFilter('brand', brand)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${selectedBrands.includes(brand) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                        >
                          {selectedBrands.includes(brand) && <BsCheck className="text-white" />}
                        </button>
                        <label className="text-sm text-gray-700 cursor-pointer">
                          {brand}
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {conditions.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-3 text-gray-900">Condition</h3>
                  <div className="space-y-3">
                    {conditions.map(condition => (
                      <motion.div 
                        key={condition}
                        whileHover={{ x: 2 }}
                        className="flex items-center"
                      >
                        <button
                          onClick={() => toggleFilter('condition', condition)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${selectedConditions.includes(condition) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                        >
                          {selectedConditions.includes(condition) && <BsCheck className="text-white" />}
                        </button>
                        <label className="text-sm text-gray-700 cursor-pointer">
                          {condition}
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations */}
              {locations.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-3 text-gray-900">Location</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {locations.map(location => (
                      <motion.div 
                        key={location}
                        whileHover={{ x: 2 }}
                        className="flex items-center"
                      >
                        <button
                          onClick={() => toggleFilter('location', location)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${selectedLocations.includes(location) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                        >
                          {selectedLocations.includes(location) && <BsCheck className="text-white" />}
                        </button>
                        <label className="text-sm text-gray-700 cursor-pointer">
                          {location}
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Mobile Filters */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 overflow-y-auto bg-black/30"
              >
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30 }}
                  className="bg-white rounded-t-3xl shadow-xl absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-bold text-xl">Filters</h2>
                      <button 
                        onClick={() => setMobileFiltersOpen(false)} 
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <FiX className="text-xl" />
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* Price Range */}
                      <div>
                        <h3 className="font-semibold mb-4 text-gray-900">Price Range</h3>
                        <div className="mb-3 flex justify-between text-sm text-gray-600">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {[50, 100, 200].map((price) => (
                            <motion.button
                              key={price}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setPriceRange([0, price])}
                              className={`text-xs border px-2 py-1.5 rounded-md ${priceRange[1] <= price ? 'bg-teal-600 text-white border-teal-600' : 'hover:bg-gray-50'}`}
                            >
                              Under ${price}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Equipment Categories */}
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-900">Categories</h3>
                        <EquipmentCategories 
                          selectedEquipment={selectedEquipment}
                          onSelectEquipment={handleEquipmentSelect}
                          mobileView
                        />
                      </div>

                      {/* Brands */}
                      {brands.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 text-gray-900">Brands</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {brands.map(brand => (
                              <motion.div 
                                key={brand}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center"
                              >
                                <button
                                  onClick={() => toggleFilter('brand', brand)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center mr-2 ${selectedBrands.includes(brand) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                                >
                                  {selectedBrands.includes(brand) && <BsCheck className="text-white" />}
                                </button>
                                <label className="text-sm text-gray-700">
                                  {brand}
                                </label>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conditions */}
                      {conditions.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 text-gray-900">Condition</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {conditions.map(condition => (
                              <motion.div 
                                key={condition}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center"
                              >
                                <button
                                  onClick={() => toggleFilter('condition', condition)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center mr-2 ${selectedConditions.includes(condition) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                                >
                                  {selectedConditions.includes(condition) && <BsCheck className="text-white" />}
                                </button>
                                <label className="text-sm text-gray-700">
                                  {condition}
                                </label>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {locations.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 text-gray-900">Location</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {locations.map(location => (
                              <motion.div 
                                key={location}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center"
                              >
                                <button
                                  onClick={() => toggleFilter('location', location)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center mr-2 ${selectedLocations.includes(location) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}
                                >
                                  {selectedLocations.includes(location) && <BsCheck className="text-white" />}
                                </button>
                                <label className="text-sm text-gray-700">
                                  {location}
                                </label>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white border-t p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={resetFilters}
                        className="py-3 px-4 border rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Reset
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMobileFiltersOpen(false)}
                        className="py-3 px-4 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                      >
                        Show {filteredProducts.length} Items
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Header with sorting and filter button */}
            <motion.div 
              initial="hidden"
              animate="show"
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
            >
              <p className="text-sm text-gray-500">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
              </p>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50 transition flex-1 sm:flex-none justify-center"
                >
                  <BsFilter />
                  <span>Filters</span>
                </motion.button>
                
                {/* Sort Dropdown */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none border rounded pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-1"
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
              </div>
            </motion.div>

            {loading ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[...Array(6)].map((_, index) => (
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                        onClick={() => toggleWishlist(product.id)}
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
                          onClick={() => {navigate(`/equipment/${product.id}`)
                          handleCartAction(product.id, 'add')}}
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
          </div>
        </div>
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

      {/* Features Section */}
      

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="show"
            variants={fadeIn}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The equipment was in perfect condition and delivered right on time. Saved our project!",
                author: "Michael Johnson",
                role: "Construction Manager",
                rating: 5
              },
              {
                quote: "Great prices and even better service. Will definitely rent from them again.",
                author: "Sarah Williams",
                role: "Landscaper",
                rating: 4.5
              },
              {
                quote: "Easy online booking and the staff was super helpful when I had questions.",
                author: "David Chen",
                role: "Homeowner",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="show"
                variants={itemVariants}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <blockquote className="text-gray-700 italic mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-gray-500 font-medium">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial="hidden"
            whileInView="show"
            variants={fadeIn}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Subscribe to our newsletter for exclusive deals and new equipment arrivals
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-500"
              />
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition shadow-md"
              >
                Subscribe
              </motion.button>
            </motion.div>
            <p className="text-white/80 text-xs mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Safety Center', 'Community Guidelines', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect</h4>
              <div className="flex gap-4 mb-6">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="text-gray-400 hover:text-white transition"
                  >
                    {social}
                  </a>
                ))}
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Download Our App</h4>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="bg-black/30 border border-gray-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                  </svg>
                  App Store
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  className="bg-black/30 border border-gray-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z" />
                  </svg>
                  Google Play
                </motion.button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <a href="#" className="text-2xl font-bold">Equipment<span className="text-teal-400">Rental</span></a>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Equipment Rental, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopGrid;