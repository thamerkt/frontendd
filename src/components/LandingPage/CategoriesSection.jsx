import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ChevronLeft, ChevronRight, Heart, Zap, 
  Clock, Shield, Star, MapPin, ShoppingCart, ArrowRight,
  ChevronRightCircle, Store, TrendingUp, Percent, BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EquipmentService from "../../services/EquipmentService";
import TrackingService from '../../services/TrackingService';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// Mock category images - replace with your actual image imports or API calls
const categoryImages = {
  "1": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
  "2": "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
  "3": "https://images.unsplash.com/photo-1486401899868-0e435ed85128?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
  "4": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
  "5": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
};

export default function CategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [ip, setIP] = useState('');
  const navigate = useNavigate();

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
      const response = await axios.get("https://5b22-197-29-209-95.ngrok-free.app/ocr/getipp/", {
        withCredentials: true, // Include credentials like cookies
      });
      setIP(response.data.ip);
      console.log("IP fetched:", response);
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

  const cardHover = {
    scale: 1.03,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    zIndex: 10
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

  // Category animation variants
  const categoryVariants = {
    inactive: {
      scale: 0.9,
      opacity: 0.8,
      transition: { duration: 0.3 }
    },
    active: {
      scale: 1.1,
      opacity: 1,
      boxShadow: "0 0 0 3px rgba(13, 148, 136, 0.5)",
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

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
      console.log("cat",categoriesData)
      
      // Set the first category as selected by default
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

  // Get product image URL - simplified version
  const getProductImage = useCallback((productId) => {
    if (!Array.isArray(images) || images.length === 0) {
      return null;
    }

    const productImages = images.filter(img => img?.stuff == productId);
    if (productImages.length === 0) {
      return null;
    }

    const mainImage = productImages.find(img => img?.position === 1);
    let url = mainImage?.url || productImages[0]?.url || null;

    if (url && ip) {
      url = url.replace('host.docker.internal', ip);
    }

    return url;
  }, [images, ip]); // Added ip to dependencies

  // Track product views
  const handleProductView = useCallback(async (productId) => {
    await TrackingService.trackPageView(productId);
  }, []);

  const cardsToShow = 4;

  const handleNext = () => {
    setDirection(1);
    const categoryItems = items[selectedCategory] || [];
    setCurrentIndex((prev) => 
      categoryItems.length ? (prev + 1) % categoryItems.length : 0
    );
  };

  const handlePrev = () => {
    setDirection(-1);
    const categoryItems = items[selectedCategory] || [];
    setCurrentIndex((prev) => 
      categoryItems.length ? (prev === 0 ? categoryItems.length - 1 : prev - 1) : 0
    );
  };

  // Auto-rotate when not hovered
  useEffect(() => {
    let interval;
    const categoryItems = items[selectedCategory] || [];
    if (!isHovered && categoryItems.length > cardsToShow) {
      interval = setInterval(handleNext, 5000);
    }
    return () => clearInterval(interval);
  }, [currentIndex, isHovered, items, selectedCategory]);

  const getCurrentCards = () => {
    const categoryItems = items[selectedCategory] || [];
    const endIndex = currentIndex + cardsToShow;
    if (endIndex > categoryItems.length) {
      return [...categoryItems.slice(currentIndex), ...categoryItems.slice(0, endIndex - categoryItems.length)];
    }
    return categoryItems.slice(currentIndex, endIndex);
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
        <motion.div className="text-center mb-12" variants={item}>
          <span className="inline-block bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Featured Categories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Category</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our premium selection of tech rentals. High-quality equipment for every need.
          </p>
        </motion.div>

        {/* Category Tabs - Circular Images */}
        <motion.div 
          className="flex overflow-x-auto pb-8 mb-10 scrollbar-hide"
          variants={container}
        >
          <div className="flex space-x-8 px-2 mx-auto">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={item}
                initial="inactive"
                animate={cat.id === selectedCategory ? "active" : "inactive"}
                whileHover="hover"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentIndex(0);
                }}
                className="flex flex-col items-center cursor-pointer"
              >
                <motion.div
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                    cat.id === selectedCategory 
                      ? "border-teal-500 shadow-lg" 
                      : "border-white hover:border-teal-200"
                  }`}
                  variants={categoryVariants}
                >
                  <img
                    src={categoryImages[cat.id] || "https://via.placeholder.com/200?text=Category"}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.span 
                  className={`mt-3 text-sm font-medium whitespace-nowrap ${
                    cat.id === selectedCategory 
                      ? "text-teal-600 font-bold" 
                      : "text-gray-700"
                  }`}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {cat.name}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Products Section */}
        {selectedCategory && (
          <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-teal-50 border border-gray-200 hover:shadow-xl transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
              <AnimatePresence mode="wait" custom={direction}>
                {getCurrentCards().map((item) => (
                  <motion.div
                    key={`${selectedCategory}-${item.id}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    whileHover={cardHover}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-teal-100 transition-all relative"
                  >
                    {/* Discount Badge */}
                    {Math.random() > 0.7 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center z-10">
                        <Percent className="w-3 h-3 mr-1" />
                        {Math.floor(Math.random() * 30) + 10}% OFF
                      </div>
                    )}

                    {/* Image with quick view */}
                    <div className="relative h-48 overflow-hidden group">
                      <img
                        src={getProductImage(item.id) || "https://via.placeholder.com/400x300?text=No+Image"}
                        alt={item.stuffname}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <button className="w-full bg-white text-gray-800 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                          Quick View
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{item.stuffname}</h3>
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          <Zap className="w-3 h-3 mr-1 text-teal-500" />
                          Instant
                        </span>
                        <span className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          <Shield className="w-3 h-3 mr-1 text-teal-500" />
                          Insured
                        </span>
                        <span className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          <BadgeCheck className="w-3 h-3 mr-1 text-teal-500" />
                          Verified
                        </span>
                      </div>

                      {/* Store & Location */}
                      <div className="space-y-2 mb-4">
                        {item.store && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Store className="w-4 h-4 mr-2 text-teal-600" />
                            <span className="truncate">{item.store}</span>
                          </div>
                        )}
                        {item.rental_location && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2 text-teal-600" />
                            <span className="truncate">{item.rental_location}</span>
                          </div>
                        )}
                      </div>

                      {/* Price & Rating */}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-500">From</p>
                          <div className="flex items-center">
                            <p className="text-xl font-bold text-teal-600">${item.price_per_day || "50"}/day</p>
                            {Math.random() > 0.5 && (
                              <span className="ml-2 text-xs line-through text-gray-400">
                                ${Math.round(item.price_per_day * 1.3 || 65)}/day
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs">
                          <Star className="w-3 h-3 fill-current mr-1" />
                          {item.stuff_management?.rating?.toFixed(1) || "4.5"}
                          <span className="text-gray-500 ml-1">({Math.floor(Math.random() * 100) + 10})</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button 
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                        onClick={() =>{ handleProductView(item.id);navigate(`/equipment/${item.id}`)}}

                        
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Rent Now
                        <ChevronRightCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-teal-50 border border-gray-200 hover:shadow-xl transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        )}

        {/* Pagination Dots */}
        {selectedCategory && items[selectedCategory]?.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {(items[selectedCategory] || []).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex ? "bg-gradient-to-r from-teal-500 to-blue-500 w-4" : "bg-gray-300 hover:bg-teal-400"
                }`}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div 
          className="text-center mt-12"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl">
            Explore All Categories
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}