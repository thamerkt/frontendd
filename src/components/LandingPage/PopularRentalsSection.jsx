import { ChevronLeft, ChevronRight, Store, MapPin, Star, ChevronRightCircle, Heart, Zap, Shield, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import TrackingService from "../../services/TrackingService";
import { useCallback } from "react";

export default function PopularRentalsSection({
  products = [],
  getProductImage,
  isLoading = false,
  onProductView,
  onAddToWishlist
}) {
  const cardsPerPage = 4;
  const totalSets = Math.ceil(products.length / cardsPerPage);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= totalSets ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? totalSets - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
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

  const handleProductView = useCallback(async (productId) => {
    await TrackingService.trackPageView(productId);
    navigate(`/equipment/${productId}`);
  }, [navigate]);

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

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 space-y-4 py-1">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center p-12 bg-gray-50 rounded-xl">
          <div className="text-gray-400 mb-4">
            <Store className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No popular rentals available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Check back later or browse our full catalog for amazing rental options.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="text-left">
          <span className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            COMMUNITY FAVORITES
          </span>
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900 relative inline-block">
              Trending Rentals
              <span className="absolute bottom-[-8px] left-0 w-20 h-1.5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"></span>
            </h2>
          </div>
          <p className="text-gray-500 mt-2 max-w-lg text-lg">
            Discover our most popular items loved by thousands of customers worldwide
          </p>
        </div>
        
        {/* Navigation Controls - Apple Style */}
        {products.length > cardsPerPage && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalSets }).map((_, index) => (
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
        )}
      </div>

      {/* Rental Cards */}
      <div className="relative mb-6 min-h-[520px]">
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
            {products.slice(currentIndex * cardsPerPage, currentIndex * cardsPerPage + cardsPerPage).map((product, index) => (
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
                    onAddToWishlist(product.id);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                </button>

                {/* Image with category badge */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getProductImage(product.id)}
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
                        <Zap className="w-4 h-4" />
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Availability badge */}
                {product.availability === "low" && (
                  <div className="absolute top-4 left-4 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                    Almost gone!
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Navigation Dots */}
      {products.length > cardsPerPage && (
        <div className="sm:hidden flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSets }).map((_, index) => (
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
        <button 
          className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          onClick={() => navigate('/equipment')}
        >
          Explore All Rentals
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
                    src={getProductImage(quickViewProduct.id)}
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
    </section>
  );
}