import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import EquipmentService from "../services/EquipmentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiChevronRight, FiPlus, FiX } from 'react-icons/fi';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction'; 
import { useParams } from 'react-router-dom';
import TrackingService from "../services/TrackingService";
import axios from "axios";
import { differenceInDays, parseISO, addDays, format } from 'date-fns';
import useWebSocket from "react-use-websocket";
import { 
  FiMessageSquare, 
  FiSend, 
  FiPaperclip, 
  FiSmile,
  FiChevronLeft
} from "react-icons/fi";
import { IoCheckmarkDone } from "react-icons/io5";

import { 
  FaCreditCard, 
  FaMapMarkerAlt, 
  FaChevronDown,
  FaChevronUp, 
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
  FaTimes,
  FaShieldAlt,
  FaTruck,
  FaExchangeAlt
} from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

const DEFAULT_PRODUCT_IMAGE = "/assets/default-product.jpg";

export default function ProductDetail() {
  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSpecs, setExpandedSpecs] = useState(false);
  
  const carouselRef = useRef(null);
  const galleryRef = useRef(null);
  const contentRef = useRef(null);
  
  const { productId } = useParams();
  const contractLink = "/terms-and-conditions";

  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [quantityy, setQuantityy] = useState(1);
  const [isSticky, setIsSticky] = useState(false);

  const handleShowForm = () => setShowForm(!showForm);

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
  
    if (url) {
      url = url.replace('host.docker.internal', '192.168.1.120');
    }
  
    return url;
  }, [images]);

  const handleDateSelect = (info) => {
    setStartDate(info.startStr);
    setEndDate(info.endStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { startDate, endDate, quantityy });
    setStartDate(null);
    setEndDate(null);
    setQuantityy(1);
    setShowForm(false);
  };

  const RELATED_PRODUCTS = [
    {
      id: 1,
      stuffname: "Product 1",
      price_per_day: 50,
      rating: 4,
      image: DEFAULT_PRODUCT_IMAGE
    },
    {
      id: 2,
      stuffname: "Product 2",
      price_per_day: 75,
      rating: 5,
      image: DEFAULT_PRODUCT_IMAGE
    },
  ];

  const specifications = [
    { name: "Brand", value: product.brand || "N/A" },
    { name: "Model", value: product.model || "N/A" },
    { name: "Condition", value: product.stuff_management?.condition || "Excellent" },
    { name: "Availability", value: product.availability || "In Stock" },
    { name: "Category", value: product.category?.name || "N/A" },
    { name: "Location", value: product.rental_location || "Main Warehouse" },
    { name: "Warranty", value: product.warranty || "1 Year" },
    { name: "Weight", value: product.weight || "N/A" },
    { name: "Dimensions", value: product.dimensions || "N/A" },
    { name: "Included Accessories", value: product.accessories || "None" }
  ];

  const PRODUCT_REVIEWS = [
    {
      id: 1,
      name: "Alex Johnson",
      rating: 5,
      date: "2023-10-15",
      comment: "Absolutely love this equipment! The quality is perfect and it's so easy to use.",
      avatar: "/assets/avatar1.jpg"
    },
    {
      id: 2,
      name: "Sam Wilson",
      rating: 4,
      date: "2023-09-28",
      comment: "Great quality, though the delivery was slightly delayed. Would still recommend!",
      avatar: "/assets/avatar2.jpg"
    },
    {
      id: 3,
      name: "Taylor Smith",
      rating: 5,
      date: "2023-08-10",
      comment: "My go-to equipment for professional projects. Get compliments every time I use it!",
      avatar: "/assets/avatar3.jpg"
    }
  ];
  
  const [relatedProducts, setRelatedProducts] = useState([]);

  const productImages = useMemo(() => {
    return images.length > 0 ? images : [{ url: DEFAULT_PRODUCT_IMAGE }];
  }, [images]);

  const visibleProducts = useMemo(() => {
    return relatedProducts.slice(currentIndex * 5, (currentIndex * 5) + 5);
  }, [currentIndex, relatedProducts]);

  const handleImageSelect = (index) => setSelectedImage(index);
  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.ceil(relatedProducts.length / 5) - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === Math.ceil(relatedProducts.length / 5) - 1 ? 0 : prev + 1));
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const toggleSpecs = () => {
    setExpandedSpecs(!expandedSpecs);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
      
        const [productData, productImages] = await Promise.all([
          EquipmentService.fetchRentalById(productId),
          axios.get(`https://kong-7e283b39dauspilq0.kongcloud.dev/api/images/?stuff=${productId}`, {
            withCredentials: true,
          }),
        ]);

        const processedImages = productImages.data.map(image => {
          if (image.url) {
            const newUrl = image.url.replace('localhost', 'localhost:8000');
            return {
              ...image,
              url: newUrl
            };
          }
          return image;
        });
        
        
      
        const processedProductData = {
          ...productData,
          detailed_description: productData.detailed_description 
            ? productData.detailed_description.replace(
                /host\.docker\.internal/g, 
                '192.168.1.15'
              )
            : productData.detailed_description
        };
      
        const allProducts = await axios.get(
          `https://kong-7e283b39dauspilq0.kongcloud.dev/api/stuffs/?category=${productData.category}`,
          {
            withCredentials: true,
          }
        );
      
        const processedRelatedProducts = allProducts.data.map(product => {
          let updatedImage = product.image;
          if (updatedImage) {
            if (updatedImage.includes('host.docker.internal')) {
              updatedImage = updatedImage.replace('host.docker.internal', 'localhost:8000');
            } else if (/^https:\/\/[^/]+\.ngrok-free\.app/.test(updatedImage)) {
              updatedImage = updatedImage.replace(/^https:\/\/[^/]+\.ngrok-free\.app/, 'https://kong-7e283b39dauspilq0.kongcloud.dev');
            }
          }
        
          let updatedDescription = product.detailed_description;
          if (updatedDescription) {
            updatedDescription = updatedDescription
              .replace(/host\.docker\.internal/g, 'localhost:8000')
              .replace(/https:\/\/[^/]+\.ngrok-free\.app/g, 'https://kong-7e283b39dauspilq0.kongcloud.dev');
          }
        
          return {
            ...product,
            ...(updatedImage && { image: updatedImage }),
            ...(updatedDescription && { detailed_description: updatedDescription })
          };
        });
        
      
        setProduct(processedProductData);
        setImages(processedImages);
        setRelatedProducts(processedRelatedProducts);
      } catch (err) {
        console.error("Failed to fetch product data:", err);
        setError("Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    const handleProductView = async (productId) => {
      await TrackingService.trackPageView(productId);
    };

    fetchData();
    handleProductView(productId);
  }, [productId]);

  useEffect(() => {
    if (product) {
      console.log(product.detailed_description);
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      if (galleryRef.current && contentRef.current) {
        const galleryRect = galleryRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        // Check if we've scrolled past the gallery
        setIsSticky(window.scrollY > galleryRect.bottom - galleryRect.height);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const tabContent = {
    description: (
      <div className="prose max-w-none text-gray-700">
        {product.detailed_description ? (
          <div
            dangerouslySetInnerHTML={{
              __html: product.detailed_description,
            }}
          />
        ) : (
          <p>No description available for this product.</p>
        )}
      </div>
    ),
    specs: (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(expandedSpecs ? specifications : specifications.slice(0, 6)).map((spec, index) => (
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
        <button 
          onClick={toggleSpecs}
          className="mt-4 flex items-center text-teal-600 font-medium text-sm"
        >
          {expandedSpecs ? (
            <>
              <span>Show Less</span>
              <FaChevronUp className="ml-1 text-xs" />
            </>
          ) : (
            <>
              <span>Show Full Specifications</span>
              <FaChevronDown className="ml-1 text-xs" />
            </>
          )}
        </button>
      </div>
    ),
    reviews: (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
            <div className="flex items-center mt-1">
              <div className="flex text-teal-500 mr-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-lg" />
                ))}
              </div>
              <span className="text-gray-700 font-medium">4.9 out of 5</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-500">142 reviews</span>
            </div>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Write a Review
          </button>
        </div>
        
        {PRODUCT_REVIEWS.map((review, index) => (
          <motion.div 
            key={review.id} 
            className="border-b border-gray-100 pb-6 last:border-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start mb-3">
              <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full mr-3" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-900">{review.name}</span>
                  <span className="text-gray-500 text-sm">{review.date}</span>
                </div>
                <div className="flex text-teal-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    i < review.rating ? <FaStar key={i} className="text-sm" /> : <FaRegStar key={i} className="text-sm" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 pl-13">{review.comment}</p>
          </motion.div>
        ))}
        
        <button className="mt-6 w-full py-3 border border-gray-200 rounded-md text-teal-600 font-medium hover:border-teal-500 transition-colors">
          Load More Reviews
        </button>
      </div>
    ),
    shipping: (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping & Returns</h3>
        <div className="prose max-w-none text-gray-700 space-y-4">
          <div>
            <h4 className="font-bold text-gray-900">Delivery Options</h4>
            <p>
              We offer several delivery options to suit your needs. Standard delivery is free 
              for all rentals over $50. Express delivery options are available at checkout.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Returns Policy</h4>
            <p>
              If you're not completely satisfied with your rental, you may return it within 
              7 days of receipt for a full refund. Items must be in original condition with 
              all packaging and accessories included.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Damage Protection</h4>
            <p>
              All rentals include basic damage protection. For complete peace of mind, 
              consider adding our Premium Protection Plan at checkout which covers accidental 
              damage and theft.
            </p>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center text-sm text-gray-600 mb-6"
      >
        <a href="#" className="hover:text-teal-600">Home</a>
        <span className="mx-2">/</span>
        <a href="#" className="hover:text-teal-600">Rentals</a>
        <span className="mx-2">/</span>
        <a href="#" className="hover:text-teal-600">{product.category?.name || 'Category'}</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.stuffname}</span>
      </motion.div>

      {/* Product Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-2 gap-8 md:gap-12"
      >
        {/* Image Gallery - Sticky Container */}
        <div 
          ref={galleryRef}
          className={`flex ${isSticky ? 'sticky top-4 h-fit' : ''}`}
        >
          {/* Thumbnails - Vertical on Left */}
          <div className="flex flex-col mr-4 gap-3 overflow-y-auto max-h-[600px]">
            {productImages.map((img, index) => (
              <motion.div
                key={img.id || index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  selectedImage === index ? "border-teal-500 shadow-md" : "border-transparent hover:border-gray-200"
                }`}
                onClick={() => handleImageSelect(index)}
              >
                <img
                  src={img.url || DEFAULT_PRODUCT_IMAGE}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1">
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
                  src={productImages[selectedImage]?.url || DEFAULT_PRODUCT_IMAGE}
                  alt={product.stuffname}
                  className="w-full h-full object-contain cursor-pointer"
                  style={{
                    transform: isHovering ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 300ms ease-in-out'
                  }}
                  loading="lazy"
                />
              </AnimatePresence>

              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-md">NEW</span>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovering ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer"
                onClick={() => setShowZoomModal(true)}
              >
                <div className="p-3 bg-white bg-opacity-80 rounded-full">
                  <FaSearchPlus className="text-gray-700 text-2xl" />
                </div>
              </motion.div>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setWishlist(!wishlist)}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-md ${
                  wishlist ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'
                } transition-colors duration-300 z-10`}
                aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <FaHeart className={wishlist ? 'fill-current' : ''} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div ref={contentRef} className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{product.stuffname}</h1>
          
          <div className="flex items-center">
            <div className="flex text-teal-500 mr-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-sm" />
              ))}
            </div>
            <span className="text-gray-500 text-sm">4.9 (142 reviews)</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-teal-600 text-sm font-medium">In Stock</span>
          </div>
          
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-bold text-teal-700">${product.price_per_day}/day</span>
            {product.original_price && (
              <span className="text-gray-400 text-lg line-through">${product.original_price}</span>
            )}
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded">20% OFF</span>
          </div>
          
          {/* Price Breakdown */}
          <div className="bg-teal-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Base Price:</span>
              <span>${product.original_price || product.price_per_day}</span>
            </div>
            {product.original_price && (
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Discount:</span>
                <span className="text-red-500">-${(product.original_price - product.price_per_day).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium mt-2">
              <span>Total:</span>
              <span className="text-teal-700">${product.price_per_day}/day</span>
            </div>
          </div>
          
          <p className="text-gray-700 mt-4">{product.short_description}</p>
          
          {/* Key Features */}
          {product.key_features && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {product.key_features.split(',').map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <FiCheckCircle className="mr-2 text-teal-500" />
                  <span>{feature.trim()}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center text-gray-600">
              <FaBox className="mr-2 text-gray-400" />
              <span>SKU: <span className="font-medium">PRD-{product.id}</span></span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaTag className="mr-2 text-gray-400" />
              <span>Category: <span className="font-medium">{product.category?.name || 'Uncategorized'}</span></span>
            </div>
          </div>
          
          {/* Quantity Selector */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
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
              onClick={() => setShowCalendar(true)}
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
              Add to Inquiry
            </motion.button>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
              <FaTruck className="text-teal-500 mb-1" />
              <span className="text-xs font-medium text-gray-700">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
              <FaShieldAlt className="text-teal-500 mb-1" />
              <span className="text-xs font-medium text-gray-700">1-Year Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
              <FaExchangeAlt className="text-teal-500 mb-1" />
              <span className="text-xs font-medium text-gray-700">Easy Returns</span>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FiCheckCircle className="text-teal-500 flex-shrink-0" />
              <span className="text-gray-700">Condition: <span className="font-medium">{product.stuff_management?.condition || 'Excellent'}</span></span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">Available at: <span className="font-medium">{product.rental_location || 'Main Warehouse'}</span></span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <FaFileContract className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">Contract: </span>
              <a href={contractLink} className="text-teal-600 hover:underline font-medium">View Rental Agreement</a>
            </div>
          </div>
        </div>
      </motion.div>

      <CalendarSidebar
        product={product}
        showForm={showCalendar}
        setShowForm={setShowCalendar}
        onEventCreated={(newEvent) => {
          setEvents([...events, newEvent]);
        }}
        existingEvents={events}
      />

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
                src={productImages[selectedImage]?.url || DEFAULT_PRODUCT_IMAGE}
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

      {/* Product Tabs Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 bg-white rounded-xl shadow-sm overflow-hidden"
      >
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-4 font-medium text-sm tracking-wide whitespace-nowrap ${
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

        {/* Tab Content */}
        <div className="p-6">
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
            <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
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
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-all group"
                >
                  <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                    <img
                      src={getProductImage(productId)}
                      alt={product.stuffname}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

      {/* Recently Viewed */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {RELATED_PRODUCTS.slice(2, 7).map(product => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-all group"
            >
              <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                <img
                  src={getProductImage(productId)}
                  alt={product.stuffname}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              </div>
              <div className="mt-3">
                <span className="text-teal-600 font-bold">{product.price_per_day}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};







import ChatComponent from './Messanger'

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from 'react-toastify';
import axios from "axios";
import { differenceInDays, parseISO, addDays, format } from 'date-fns';
import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiX, FiMessageSquare } from 'react-icons/fi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ChatComponent from './Messanger';

const CalendarSidebar = ({ product, showForm, setShowForm, onEventCreated }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState("dayGridMonth");
  const [sidebarWidth, setSidebarWidth] = useState("400px");
  const [isResizing, setIsResizing] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState("calendar");
  
  const sidebarRef = useRef(null);
  const calendarRef = useRef(null);

  // Fetch rental requests
  useEffect(() => {
    const fetchRentalRequests = async () => {
      try {
        const response = await axios.get(
          `https://kong-7e283b39dauspilq0.kongcloud.dev/rental/rental_requests/?equipment_id=${product.id}`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const mappedEvents = response.data.map((request) => {
          let color, title;
          switch (request.status) {
            case "confirmed":
              color = "#ef4444";
              title = `Booked (${request.quantity}x)`;
              break;
            case "pending":
              color = "#f59e0b";
              title = `Pending (${request.quantity}x)`;
              break;
            default:
              color = "#d1d5db";
              title = `Request (${request.quantity}x)`;
          }

          return {
            id: request.id.toString(),
            title: title,
            start: request.start_date,
            end: request.end_date,
            color: color,
            textColor: "#ffffff",
            extendedProps: {
              status: request.status,
              quantity: request.quantity,
            },
            overlap: request.status !== "confirmed",
          };
        });

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching rental requests:", error);
        toast.error("Failed to load rental schedule");
      }
    };

    if (product?.id && showForm) {
      fetchRentalRequests();
    }
  }, [product.id, showForm]);

  const calculateDuration = () => {
    if (selectedDates.length === 2) {
      return differenceInDays(
        parseISO(selectedDates[1]),
        parseISO(selectedDates[0])
      ) + 1;
    }
    return 0;
  };

  const calculateTotalPrice = useMemo(() => {
    const duration = calculateDuration();
    return (duration * product.price_per_day * quantity).toFixed(2);
  }, [selectedDates, quantity, product.price_per_day]);

  const handleDateSelect = (selectInfo) => {
    const { startStr, endStr } = selectInfo;
    const endDate = endStr
      ? format(addDays(parseISO(endStr), -1), "yyyy-MM-dd")
      : startStr;

    const hasConflict = events.some((event) => {
      if (event.extendedProps?.status === "confirmed") {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const selectedStart = new Date(startStr);
        const selectedEnd = new Date(endDate);

        return (
          (selectedStart >= eventStart && selectedStart <= eventEnd) ||
          (selectedEnd >= eventStart && selectedEnd <= eventEnd) ||
          (selectedStart <= eventStart && selectedEnd >= eventEnd)
        );
      }
      return false;
    });

    if (hasConflict) {
      toast.error("This period conflicts with a confirmed booking");
      return;
    }

    setSelectedDates([startStr, endDate]);

    if (view === "timeGridDay") {
      calendarRef.current.getApi().changeView("timeGridDay", startStr);
    }
    
    calendarRef.current.getApi().unselect();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedDates.length !== 2) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const rentalRequestData = {
        equipment: product.id,
        start_date: selectedDates[0],
        end_date: selectedDates[1],
        client: user?.user_id,
        status: "pending",
        quantity: quantity,
        total_price: calculateTotalPrice,
      };

      const response = await axios.post(
        "https://kong-7e283b39dauspilq0.kongcloud.dev/rental/rental_requests/",
        rentalRequestData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newEvent = {
        id: response.data.id.toString(),
        title: `Pending (${quantity}x)`,
        start: selectedDates[0],
        end: selectedDates[1],
        color: "#f59e0b",
        textColor: "#ffffff",
        extendedProps: {
          status: "pending",
          quantity: quantity,
        },
      };

      setEvents([...events, newEvent]);
      onEventCreated(newEvent);

      toast.success("Rental request submitted!");
      setShowForm(false);
    } catch (error) {
      console.error("Error creating rental request:", error);
      toast.error("Failed to submit rental request");
    }
  };

  const changeView = (newView) => {
    setView(newView);
    calendarRef.current.getApi().changeView(newView);
  };

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth * 0.7) {
        setSidebarWidth(`${newWidth}px`);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <AnimatePresence>
      {showForm && (
        <motion.div 
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowForm(false)}
          />

          <motion.div
            ref={sidebarRef}
            className="absolute right-0 top-0 h-full bg-white shadow-xl flex flex-col"
            style={{ width: sidebarWidth }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Resize handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-gray-200 hover:bg-teal-500"
              onMouseDown={startResizing}
            />

            {/* Header with tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveSidebarTab("calendar")}
                className={`flex-1 py-2 text-xs font-medium ${
                  activeSidebarTab === "calendar"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveSidebarTab("messages")}
                className={`flex-1 py-2 text-xs font-medium ${
                  activeSidebarTab === "messages"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Messages
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 bg-teal-600 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {activeSidebarTab === "calendar" ? (
                    <FiCalendar className="text-teal-200" />
                  ) : (
                    <FiMessageSquare className="text-teal-200" />
                  )}
                  <h2 className="text-lg font-semibold">
                    {activeSidebarTab === "calendar"
                      ? "Rental Schedule"
                      : "Chat with Owner"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-full hover:bg-teal-500/30 transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              <div className="mt-1 text-teal-100 text-sm">
                {product.stuffname}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeSidebarTab === "calendar" ? (
                <>
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => changeView("dayGridMonth")}
                      className={`flex-1 py-2 text-xs font-medium ${
                        view === "dayGridMonth"
                          ? "text-teal-600 border-b-2 border-teal-600"
                          : "text-gray-500"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => changeView("timeGridWeek")}
                      className={`flex-1 py-2 text-xs font-medium ${
                        view === "timeGridWeek"
                          ? "text-teal-600 border-b-2 border-teal-600"
                          : "text-gray-500"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => changeView("timeGridDay")}
                      className={`flex-1 py-2 text-xs font-medium ${
                        view === "timeGridDay"
                          ? "text-teal-600 border-b-2 border-teal-600"
                          : "text-gray-500"
                      }`}
                    >
                      Day
                    </button>
                  </div>

                  <div className="p-3 border-b border-gray-200">
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                      initialView={view}
                      selectable={true}
                      select={handleDateSelect}
                      events={events}
                      headerToolbar={false}
                      height={300}
                      selectMirror={true}
                      dayMaxEvents={true}
                      weekends={true}
                      nowIndicator={true}
                      editable={true}
                      selectOverlap={(event) => {
                        return (
                          !event.extendedProps ||
                          event.extendedProps.status !== "confirmed"
                        );
                      }}
                      selectConstraint={{
                        start: new Date().toISOString().split("T")[0],
                        end: new Date(
                          new Date().setFullYear(new Date().getFullYear() + 1)
                        )
                          .toISOString()
                          .split("T")[0],
                      }}
                      eventDidMount={(info) => {
                        if (info.event.extendedProps.status === "confirmed") {
                          info.el.style.borderLeft = "4px solid #ef4444";
                        }
                      }}
                    />
                  </div>

                  <form onSubmit={handleSubmit} className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={selectedDates[0] || ""}
                          onChange={(e) =>
                            setSelectedDates([e.target.value, selectedDates[1] || ""])
                          }
                          className="w-full p-2 text-xs border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={selectedDates[1] || ""}
                          onChange={(e) =>
                            setSelectedDates([selectedDates[0] || "", e.target.value])
                          }
                          min={selectedDates[0] || ""}
                          className="w-full p-2 text-xs border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    {selectedDates.length === 2 && (
                      <div className="bg-teal-50 p-3 rounded-md border border-teal-100 text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">
                            {calculateDuration()} days
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Daily Rate:</span>
                          <span className="font-medium">
                            ${product.price_per_day}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-teal-700 pt-1 border-t border-teal-200">
                          <span>Total:</span>
                          <span>${calculateTotalPrice}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">
                        Quantity
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50"
                        >
                          -
                        </button>
                        <div className="px-3 py-1 border-t border-b border-gray-300 bg-white text-center w-10">
                          {quantity}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <ChatComponent 
                  isEquipmentChat={true}
                  product={product}
                  onClose={() => setShowForm(false)}
                />
              )}
            </div>

            {activeSidebarTab === "calendar" && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={selectedDates.length !== 2}
                    className={`flex-1 py-2 px-3 text-xs font-medium text-white rounded-md ${
                      selectedDates.length === 2
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalendarSidebar;
