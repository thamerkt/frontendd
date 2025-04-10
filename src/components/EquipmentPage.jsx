import { useState, useRef, useEffect } from "react";
import EquipmentService from "../services/EquipmentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCreditCard, 
  FaMapMarkerAlt, 
  FaFileContract, 
  FaShoppingBag, 
  FaStore,
  FaStar, 
  FaRegStar, 
  FaChevronDown, 
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaTag,
  FaBox,
  FaSearchPlus,
  FaTimes
} from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

export default function ProductDetail() {
  // Define images array at the top of the component
  const images = [
    "/assets/cameraa.jpg",
    "/assets/camera.jpg",
    "/assets/lightting.png",
    "/assets/cameraa.jpg"
  ];

  // Existing state and data
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [id, setId] = useState(1);
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [categorie, setCategorie] = useState("Electronics");
  const [wishlist, setWishlist] = useState(false);
  const contractLink = "/terms-and-conditions";
  const [quantity, setQuantity] = useState(1);
  const carouselRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Product specifications
  const specifications = [
    { name: "Material", value: "100% Cotton" },
    { name: "Fit", value: "Relaxed" },
    { name: "Length", value: "Ankle" },
    { name: "Closure", value: "Elastic Waist" },
    { name: "Care Instructions", value: "Machine Wash Cold" },
    { name: "Origin", value: "Made in USA" }
  ];

  const PRODUCT_REVIEWS = [
    {
      id: 1,
      name: "Alex Johnson",
      rating: 5,
      date: "2023-10-15",
      comment: "Absolutely love these joggers! The fit is perfect and they're so comfortable."
    },
    {
      id: 2,
      name: "Sam Wilson",
      rating: 4,
      date: "2023-09-28",
      comment: "Great quality fabric, though they run slightly large. Would recommend sizing down."
    },
    {
      id: 3,
      name: "Taylor Smith",
      rating: 5,
      date: "2023-08-10",
      comment: "My go-to pants for casual Fridays. Get compliments every time I wear them!"
    }
  ];
  
  const RELATED_PRODUCTS = [
    {
      id: 1,
      stuffname: "Premium DSLR Camera",
      price_per_day: "$45.99/day",
      image: "/assets/cameraa.jpg",
      rating: 4.5,
      category: "Photography"
    },
    {
      id: 2,
      stuffname: "Professional Drone",
      price_per_day: "$89.99/day",
      image: "/assets/pdrone.jpg",
      rating: 4.8,
      category: "Photography"
    },
    {
      id: 3,
      stuffname: "4K Video Camera",
      price_per_day: "$65.50/day",
      image: "/assets/camera.jpg",
      rating: 4.3,
      category: "Photography"
    },
    {
      id: 4,
      stuffname: "Studio Lighting Kit",
      price_per_day: "$32.99/day",
      image: "/assets/lightting.png",
      rating: 4.2,
      category: "Photography"
    },
    {
      id: 5,
      stuffname: "Wireless Microphone",
      price_per_day: "$22.50/day",
      image: "/microphone.jpg",
      rating: 4.7,
      category: "Audio"
    },
    {
      id: 6,
      stuffname: "Tripod Stand",
      price_per_day: "$15.99/day",
      image: "/tripod.jpg",
      rating: 4.1,
      category: "Accessories"
    },
    {
      id: 7,
      stuffname: "Gimbal Stabilizer",
      price_per_day: "$28.75/day",
      image: "/gimbal.jpg",
      rating: 4.6,
      category: "Accessories"
    }
  ];

  // Reviews data
  const reviews = [
    {
      id: 1,
      name: "Alex Johnson",
      rating: 5,
      date: "2023-10-15",
      comment: "Absolutely love these joggers! The fit is perfect and they're so comfortable."
    },
    {
      id: 2,
      name: "Sam Wilson",
      rating: 4,
      date: "2023-09-28",
      comment: "Great quality fabric, though they run slightly large. Would recommend sizing down."
    },
    {
      id: 3,
      name: "Taylor Smith",
      rating: 5,
      date: "2023-08-10",
      comment: "My go-to pants for casual Fridays. Get compliments every time I wear them!"
    }
  ];

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.ceil(RELATED_PRODUCTS.length / 5) - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === Math.ceil(RELATED_PRODUCTS.length / 5) - 1 ? 0 : prev + 1));
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await EquipmentService.fetchRentalById(id);
          setProduct(response);
        } catch (error) {
          console.log("Failed to get product", error);
        }
      }
      if(categorie){
        try {
          const response1 = await EquipmentService.fetchRentalsBy(categorie);
          setProducts(response1);
        } catch (error) {
          console.log("Failed to get product", error);
        }
      }
    };
    fetchData();
  }, [id, categorie]);

  // Calculate visible products for carousel
  const visibleProducts = RELATED_PRODUCTS.slice(currentIndex * 5, (currentIndex * 5) + 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Product Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-2 gap-8 md:gap-12"
      >
        {/* Image Gallery - Updated with smaller main image */}
        <div className="space-y-4">
        <div 
  className="relative w-full h-96 bg-gray-50 rounded-xl overflow-hidden shadow-sm"
  // Changed from aspect-square to fixed height
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
                src={images[selectedImage]}
                alt={product.stuffname}
                className={`w-full h-full object-contain cursor-pointer ${isHovering ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
              />
            </AnimatePresence>
            
            {/* Zoom Icon that appears on hover */}
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
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Product Info - Completely redesigned layout */}
        <div className="space-y-6">
          {/* Product Title */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Camera Canon 4K Ultimate</h1>
          
          {/* Reviews */}
          <div className="flex items-center">
            <div className="flex text-teal-500 mr-2">
              {[...Array(4)].map((_, i) => (
                <FaStar key={i} className="text-sm" />
              ))}
              <FaRegStar className="text-sm" />
            </div>
            <span className="text-gray-500 text-sm">4.0 (212 reviews)</span>
          </div>
          
          {/* Price */}
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl font-bold text-teal-700">{product.price_per_day}</span>
            
            <span className="text-gray-400 text-sm line-through">$290.00</span>
            <span className="text-black-400 text-sm ">$199.00</span>
            <span className="text-teal-700 text-sm font-medium">per day</span>
          </div>
          
          {/* Description */}
          <p className="text-gray-700 mt-4">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>
          
          {/* SKU and Categories */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <FaBox className="mr-2 text-gray-400" />
              <span>SKU: <span className="font-medium">PRD-{product.id || '001'}</span></span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaTag className="mr-2 text-gray-400" />
              <span>Category: <span className="font-medium">{product.category || 'Electronics'}</span></span>
            </div>
          </div>
          
          {/* Quantity Selector */}
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
          
          {/* Action Buttons */}
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
          
          {/* Product Details */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FiCheckCircle className="text-teal-500 flex-shrink-0" />
              <span className="text-gray-700">Condition: <span className="font-medium">{product.state || 'Excellent'}</span></span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">Location: <span className="font-medium">{product.rental_location || 'Main Warehouse'}</span></span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FaFileContract className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">Contract: </span>
              <a href={contractLink} className="text-teal-600 hover:underline font-medium">View Agreement</a>
            </div>
          </div>
          
          {/* Payment Methods */}
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
                src={images[selectedImage]}
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
              {activeTab === 'description' && (
                <div className="prose max-w-none text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specifications.map((spec, index) => (
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
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
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
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Related Products */}
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
              disabled={currentIndex === Math.ceil(RELATED_PRODUCTS.length / 5) - 1}
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
                    src={product.image}
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
                    i < Math.floor(product.rating) ? 
                    <FaStar key={i} className="text-teal-500 text-xs" /> : 
                    <FaRegStar key={i} className="text-teal-500 text-xs" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-teal-600 font-bold">{product.price_per_day}</span>
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

      <ToastContainer position="bottom-right" />
    </div>
  );
}