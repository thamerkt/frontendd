import { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, ChevronRight, Heart, Zap, 
  Shield, Star, MapPin, Store, Check, ShoppingCart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EquipmentService from "../../services/EquipmentService";
import TrackingService from '../../services/TrackingService';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// Mock category images
const categoryImages = {
  "1": "https://images.unsplash.com/photo-1581093450023-8a2d4948f1a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Tools
  "2": "https://images.unsplash.com/photo-1581093450023-8a2d4948f1a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Tools (duplicate)
  "3": "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Electronics
  "4": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Construction Equipment
  "5": "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Event & Party Supplies
  "6": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Photography & Media
  "7": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Vehicles & Transport
  "8": "https://images.unsplash.com/photo-1581093450023-8a2d4948f1a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Tools & DIY
  "9": "https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Home & Kitchen
  "10": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // IT & Electronics
  "11": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Camping & Outdoor
  "12": "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80", // Business & Office
  "13": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80" // Medical Equipment
};

export default function CategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  const [ip, setIP] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [categoryPage, setCategoryPage] = useState(0);
  const navigate = useNavigate();

  const cardsPerPage = 4;
  const categoriesPerPage = 6;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };
  
  const fetchip = useCallback(async () => {
    try {
      const response = await axios.get("https://b27a-165-51-206-202.ngrok-free.app/ocr/getipp/", {
        withCredentials: true,
      });
      setIP(response.data.ip);
    } catch (error) {
      console.error("Failed to fetch IP:", error);
      setIP('localhost');
    }
  }, []);

  useEffect(() => {
    fetchip();
  }, [fetchip]);

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.5
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (!selectedCategory || !items[selectedCategory]?.length) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => 
        prev + 1 >= Math.ceil(items[selectedCategory].length / cardsPerPage) ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedCategory, items]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesData, imagesData] = await Promise.all([
        EquipmentService.fetchCategories(),
        EquipmentService.fetchImages()
      ]);
      setCategories(categoriesData);
      setImages(imagesData);
      
      if (categoriesData.length > 0 && !selectedCategory) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch items when category changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const filter = `category=${selectedCategory}`;
        const itemsData = await EquipmentService.fetchRentalsBy(filter);
        setItems((prevItems) => ({
          ...prevItems,
          [selectedCategory]: itemsData,
        }));
      } catch (e) {
        console.error("Error fetching items data:", e.message);
      }
    };

    if (selectedCategory) {
      fetchItems();
    }
  }, [selectedCategory]);

  // Get product image URL
  const getProductImage = useCallback((productId) => {
    if (!Array.isArray(images) || images.length === 0) return null;

    const productImages = images.filter(img => img?.stuff == productId);
    if (productImages.length === 0) return null;

    const mainImage = productImages.find(img => img?.position === 1);
    let url = mainImage?.url || productImages[0]?.url || null;

    if (url && ip) {
      url = url.replace('host.docker.internal', ip);
    }

    return url;
  }, [images, ip]);

  // Track product views
  const handleProductView = useCallback(async (productId) => {
    await TrackingService.trackPageView(productId);
    navigate(`/equipment/${productId}`);
  }, [navigate]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= Math.ceil((items[selectedCategory]?.length || 0) / cardsPerPage) ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? Math.ceil((items[selectedCategory]?.length || 0) / cardsPerPage) - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleCategoryNext = () => {
    setCategoryPage(prev => 
      (prev + 1) * categoriesPerPage >= categories.length ? 0 : prev + 1
    );
  };

  const handleCategoryPrev = () => {
    setCategoryPage(prev => 
      prev === 0 ? Math.floor((categories.length - 1) / categoriesPerPage) : prev - 1
    );
  };

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-8 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-500">Loading categories...</div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-8 bg-gray-50">
        <div className="text-center text-gray-500">
          No categories available at the moment.
        </div>
      </section>
    );
  }

  return (
    <motion.div 
      className="py-16 px-4 sm:px-8 bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={container}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="text-left">
            <span className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              FEATURED CATEGORIES
            </span>
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-gray-900 relative inline-block">
                Shop by Category
                <span className="absolute bottom-[-8px] left-0 w-20 h-1.5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"></span>
              </h2>
            </div>
            <p className="text-gray-500 mt-2 max-w-lg text-lg">
              Discover our premium selection of tech rentals. High-quality equipment for every need.
            </p>
          </div>
        </div>

        {/* Category Tabs - Circular Images with Chevron Navigation */}
        <div className="relative mb-10">
          <div className="flex items-center justify-center">
            <button
              onClick={handleCategoryPrev}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md mr-2"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <motion.div 
              className="flex flex-wrap justify-center gap-6 px-2 mx-auto"
              variants={container}
            >
              {categories
                .slice(
                  categoryPage * categoriesPerPage,
                  (categoryPage + 1) * categoriesPerPage
                )
                .map((cat) => (
                  <motion.div
                    key={cat.id}
                    variants={item}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentIndex(0);
                    }}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                      cat.id === selectedCategory 
                        ? "border-teal-500 shadow-lg" 
                        : "border-white hover:border-teal-200"
                    }`}>
                      <img
                        src={categoryImages[cat.id] || "https://via.placeholder.com/200?text=Category"}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className={`mt-3 text-sm font-medium whitespace-nowrap ${
                      cat.id === selectedCategory 
                        ? "text-teal-600 font-bold" 
                        : "text-gray-700"
                    }`}>
                      {cat.name}
                    </span>
                  </motion.div>
                ))}
            </motion.div>

            <button
              onClick={handleCategoryNext}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md ml-2"
              aria-label="Next categories"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Products Section */}
        {selectedCategory && items[selectedCategory]?.length > 0 && (
          <div className="relative">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex gap-1">
                {Array.from({ length: Math.ceil(items[selectedCategory].length / cardsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "bg-gray-900 scale-125" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="relative min-h-[520px]">
              <AnimatePresence custom={direction} initial={false} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4"
                >
                  {items[selectedCategory]?.slice(
                    currentIndex * cardsPerPage, 
                    currentIndex * cardsPerPage + cardsPerPage
                  ).map((product, index) => (
                    <motion.div
                      key={product.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={index}
                      className="w-full bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-all duration-300 relative group cursor-pointer"
                      onClick={() => handleProductView(product.id)}
                    >
                      {/* Wishlist button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // onAddToWishlist(product.id);
                        }}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        aria-label="Add to wishlist"
                      >
                        <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                      </button>

                      {/* Image with category badge */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={getProductImage(product.id) || "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={product.stuffname}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {product.category?.name && (
                          <span className="absolute top-4 left-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {product.category.name}
                          </span>
                        )}
                        {/* Quick view overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewProduct(product);
                            }}
                            className="text-white font-medium px-6 py-2 border border-white rounded-full hover:bg-white hover:text-teal-600 transition-colors"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-teal-600 transition-colors">
                            {product.stuffname}
                          </h3>
                          {product.stuff_management?.rating && (
                            <div className="flex items-center bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-semibold">
                              <Star className="w-4 h-4 fill-current mr-1" />
                              {product.stuff_management.rating.toFixed(1)}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.short_description}</p>

                        {/* Features chips */}
                        {product.features?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {product.features.slice(0, 3).map((feature, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center">
                                <Check className="w-3 h-3 mr-1 text-teal-500" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto space-y-2 mb-4">
                          {product.store && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Store className="w-4 h-4 mr-2 text-teal-600" />
                              <span className="line-clamp-1 hover:text-teal-600 transition-colors">{product.store}</span>
                            </div>
                          )}
                          {product.rental_location && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 mr-2 text-teal-600" />
                              <span className="line-clamp-1 hover:text-teal-600 transition-colors">{product.rental_location}</span>
                            </div>
                          )}
                        </div>

                        {/* Price & CTA */}
                        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-gray-500 text-xs block">Starting from</span>
                              <div className="flex items-end gap-1">
                                <p className="text-xl font-bold text-teal-600">${product.price_per_day}</p>
                                <span className="text-gray-400 text-xs mb-1">/day</span>
                              </div>
                              {product.discount && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs line-through text-gray-400">${product.original_price}</span>
                                  <span className="text-xs bg-red-100 text-red-600 px-1 rounded">Save {product.discount}%</span>
                                </div>
                              )}
                            </div>
                            <button 
                              className="flex items-center justify-center gap-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium py-2 px-3 rounded-lg transition-all text-sm shadow-md hover:shadow-lg"
                              aria-label={`Rent ${product.stuffname}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductView(product.id);
                              }}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Rent Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 my-12 px-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="w-5 h-5 text-teal-500" />
            <span className="text-sm">Secure Payments</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Check className="w-5 h-5 text-teal-500" />
            <span className="text-sm">Verified Rentals</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Star className="w-5 h-5 text-teal-500 fill-current" />
            <span className="text-sm">5-Star Reviews</span>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Explore All Categories
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        {/* Quick View Modal */}
        <AnimatePresence>
          {quickViewProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setQuickViewProduct(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{quickViewProduct.stuffname}</h3>
                    <button 
                      onClick={() => setQuickViewProduct(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                  </div>
                  
                  {/* Large product image */}
                  <div className="mb-6">
                    <img
                      src={getProductImage(quickViewProduct.id) || "https://via.placeholder.com/800x600?text=No+Image"}
                      alt={quickViewProduct.stuffname}
                      className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Description</h4>
                      <p className="text-gray-600">{quickViewProduct.description || quickViewProduct.short_description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-gray-500 w-32">Price:</span>
                          <span className="font-medium text-teal-600">${quickViewProduct.price_per_day}/day</span>
                        </div>
                        {quickViewProduct.store && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-32">Store:</span>
                            <span className="font-medium">{quickViewProduct.store}</span>
                          </div>
                        )}
                        {quickViewProduct.rental_location && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-32">Location:</span>
                            <span className="font-medium">{quickViewProduct.rental_location}</span>
                          </div>
                        )}
                        {quickViewProduct.stuff_management?.rating && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-32">Rating:</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                              <span className="font-medium">{quickViewProduct.stuff_management.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium"
                    onClick={() => {
                      handleProductView(quickViewProduct.id);
                      setQuickViewProduct(null);
                    }}
                  >
                    Rent Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}