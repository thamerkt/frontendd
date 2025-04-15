import { useState, useRef, useEffect, useMemo } from "react";
import EquipmentService from "../services/EquipmentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  FaCreditCard, 
  FaMapMarkerAlt, 
  FaFileContract, 
  FaShoppingBag, 
  FaStore,
  FaStar, 
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaTag,
  FaBox,
  FaSearchPlus,
  FaTimes
} from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

const DEFAULT_PRODUCT_IMAGE = "/assets/default-product.jpg";

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  const productId = 2; // Fixed ID as per requirement

  // Memoized product images
  const productImages = useMemo(() => {
    return images.length > 0 ? images.map(img => img.url) : [DEFAULT_PRODUCT_IMAGE];
  }, [images]);

  // Memoized visible products for carousel
  const visibleProducts = useMemo(() => {
    return relatedProducts.slice(currentIndex * 5, (currentIndex * 5) + 5);
  }, [relatedProducts, currentIndex]);

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [productData, allProducts, productImages] = await Promise.all([
          EquipmentService.fetchRentalById(productId),
          EquipmentService.fetchRentals(),
          axios.get(`http://0.0.0.0:8000/api/images/?stuff=${productId}`)
        ]);

        setProduct(productData);
        setImages(productImages.data || []);
        
        // Filter related products by category and exclude current product
        const relatedByCategory = productData?.category?.name 
          ? await EquipmentService.fetchRentalsBy(productData.category.name)
          : [];
        
        setRelatedProducts([
          ...allProducts.filter(p => p.id !== productId),
          ...relatedByCategory.filter(p => p.id !== productId)
        ].slice(0, 10)); // Limit to 10 related products

      } catch (err) {
        console.error("Failed to fetch product data:", err);
        setError("Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Handlers
  const handleImageSelect = (index) => setSelectedImage(index);
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.ceil(relatedProducts.length / 5) - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === Math.ceil(relatedProducts.length / 5) - 1 ? 0 : prev + 1));
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  // Tab content components
  const tabContent = {
    description: (
      <div className="prose max-w-none text-gray-700">
        {product.detailed_description ? (
          <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
        ) : (
          <p>No description available for this product.</p>
        )}
      </div>
    ),
    specs: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {product.specifications?.length > 0 ? (
          product.specifications.map((spec, index) => (
            <motion.div 
              key={index} 
              className="flex p-3 hover:bg-gray-50 rounded-lg transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-gray-600 w-40 font-medium">{spec.name}</span>
              <span className="text-gray-800">{spec.value}</span>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">No specifications available.</p>
        )}
      </div>
    ),
    reviews: (
      <div className="space-y-6">
        {product.reviews?.length > 0 ? (
          product.reviews.map((review, index) => (
            <motion.div 
              key={review.id} 
              className="border-b border-gray-100 pb-6 last:border-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900">{review.name}</span>
                <span className="text-gray-500 text-sm">{review.date}</span>
              </div>
              <div className="flex text-teal-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                ))}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>
    )
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Product Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-2 gap-8 md:gap-12"
      >
        {/* Image Gallery */}
        <div className="space-y-4">
          <div 
            className="relative w-full h-96 bg-gray-50 rounded-xl overflow-hidden shadow-sm"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                src={productImages[selectedImage]}
                alt={product.stuffname}
                className={`w-full h-full object-contain cursor-pointer ${isHovering ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
              />
            </AnimatePresence>
            
            {isHovering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer"
                onClick={() => setShowZoomModal(true)}
              >
                <div className="p-3 bg-white bg-opacity-80 rounded-full">
                  <FaSearchPlus className="text-gray-700 text-2xl" />
                </div>
              </motion.div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setWishlist(!wishlist)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md ${wishlist ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'} transition-colors duration-300 z-10`}
            >
              <FaHeart className={`${wishlist ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  selectedImage === index ? "border-teal-500 shadow-md" : "border-transparent hover:border-gray-200"
                }`}
                onClick={() => handleImageSelect(index)}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{product.stuffname}</h1>
          
          <div className="flex items-center">
            <div className="flex text-teal-500 mr-2">
              {[...Array(4)].map((_, i) => (
                <FaStar key={i} className="text-sm" />
              ))}
              <FaRegStar className="text-sm" />
            </div>
            <span className="text-gray-500 text-sm">4.0 (212 reviews)</span>
          </div>
          
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl font-bold text-teal-700">${product.price_per_day}/day</span>
            {product.original_price && (
              <span className="text-gray-400 text-sm line-through">${product.original_price}</span>
            )}
          </div>
          
          <p className="text-gray-700 mt-4">{product.short_description}</p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <FaBox className="mr-2 text-gray-400" />
              <span>SKU: <span className="font-medium">PRD-{product.id}</span></span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaTag className="mr-2 text-gray-400" />
              <span>Category: <span className="font-medium">{product.category?.name || 'Uncategorized'}</span></span>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rental Quantity</label>
            <div className="flex items-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={decreaseQuantity}
                className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                -
              </motion.button>
              <div className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-900 text-center w-16">
                {quantity}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={increaseQuantity}
                className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                +
              </motion.button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
            >
              <FaShoppingBag />
              Rent Now
            </motion.button>
            
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 border border-gray-200 hover:border-teal-500 bg-white hover:bg-gray-50 py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
            >
              <FaStore />
              View in Store
            </motion.button>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FiCheckCircle className="text-teal-500 flex-shrink-0" />
              <span className="text-gray-700">Condition: <span className="font-medium">{product.stuff_management?.condition || 'Excellent'}</span></span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">Location: <span className="font-medium">{product.rental_location || 'Main Warehouse'}</span></span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FaFileContract className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">Contract: </span>
              <a href={product.stuff_management?.required_file || "#"} className="text-teal-600 hover:underline font-medium">View Agreement</a>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FaCreditCard className="text-gray-400" />
              <span className="font-medium">Payment Methods:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <img src="/assets/visa.png" alt="Visa" className="h-8 object-contain filter grayscale hover:grayscale-0 transition-all" />
              <img src="/assets/master-card.png" alt="Mastercard" className="h-8 object-contain filter grayscale hover:grayscale-0 transition-all" />
              <img src="/assets/flousi.png" alt="Flousi" className="h-8 object-contain filter grayscale hover:grayscale-0 transition-all" />
              <img src="/assets/D17.png" alt="D17" className="h-8 object-contain filter grayscale hover:grayscale-0 transition-all" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {showZoomModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowZoomModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-6xl w-full max-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={productImages[selectedImage]}
                alt="Zoomed product"
                className="w-full h-full max-h-[90vh] object-contain"
              />
              <button 
                onClick={() => setShowZoomModal(false)}
                className="absolute top-4 right-4 p-3 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
              >
                <FaTimes className="text-gray-800 text-xl" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16"
      >
        <div className="border-b border-gray-200">
          <div className="flex">
            {['description', 'specs', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-4 font-medium text-sm tracking-wide ${
                  activeTab === tab ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                onClick={prevSlide}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                disabled={currentIndex === 0}
              >
                <FaChevronLeft className="text-gray-700" />
              </motion.button>
              <motion.button 
                whileHover={{ backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                onClick={nextSlide}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                disabled={currentIndex === Math.ceil(relatedProducts.length / 5) - 1}
              >
                <FaChevronRight className="text-gray-700" />
              </motion.button>
            </div>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {visibleProducts.map(product => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-all"
                >
                  <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                    <img
                      src={product.equipment_images?.[0]?.url || DEFAULT_PRODUCT_IMAGE}
                      alt={product.stuffname}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-teal-50 transition-colors">
                      <FaHeart className="text-gray-400 hover:text-teal-500" />
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-1">{product.stuffname}</h3>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      i < Math.floor(product.rating || 4) ? 
                      <FaStar key={i} className="text-teal-500 text-xs" /> : 
                      <FaRegStar key={i} className="text-teal-500 text-xs" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.rating || 4}.0)</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-teal-600 font-bold">${product.price_per_day}/day</span>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors"
                    >
                      View
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}