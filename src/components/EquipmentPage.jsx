import { useState, useRef, useEffect, useMemo,useCallback  } from "react";
import EquipmentService from "../services/EquipmentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiChevronRight, FiPlus,FiX  } from 'react-icons/fi'; // For the icons
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react'; // FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // For month view in the calendar
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction'; 
import { useParams } from 'react-router-dom';
import TrackingService from "../services/TrackingService";



import axios from "axios";
import { 
  FaCreditCard, 
  FaMapMarkerAlt, 
  FaChevronDown ,
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
  // State declarations
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [id, setId] = useState(1);
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [categorie, setCategorie] = useState("Electronics");
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSpecs, setExpandedSpecs] = useState(false);
  
  const carouselRef = useRef(null);
  
  const {productId }=useParams();; // Fixed ID as per requirement
  const contractLink = "/terms-and-conditions";

  // Define images array
  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [quantityy, setQuantityy] = useState(1);

  // Toggle the visibility of the form when the button is clicked
  const handleShowForm = () => setShowForm(!showForm);
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

  // Handle event date selection from the calendar
  const handleDateSelect = (info) => {
    setStartDate(info.startStr);
    setEndDate(info.endStr);
  };

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic (e.g., sending the data to the server)
    console.log('Form submitted:', { startDate, endDate, quantityy });
    // Reset form fields
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
    // Add more products as needed
  ];

  // Product specifications
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

  // Memoized product images
  const productImages = useMemo(() => {
    return images.length > 0 ? images : [{ url: DEFAULT_PRODUCT_IMAGE }];
  }, [images]);

  // Memoized visible products for carousel
  const visibleProducts = useMemo(() => {
    return relatedProducts.slice(currentIndex * 5, (currentIndex * 5) + 5);
  }, [currentIndex, relatedProducts]);

  // Handlers
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

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      console.log(productId); // Logging the productId

      try {
        setLoading(true);
      
        // Fetch product and images in parallel
        const [productData, productImages] = await Promise.all([
          EquipmentService.fetchRentalById(productId),
          axios.get(`https://5b22-197-29-209-95.ngrok-free.app/api/images/?stuff=${productId}`, {
            withCredentials: true,
          }),
        ]);
        console.log(productImages)
        // Process images to replace host.docker.internal with IP
        const processedImages = productImages.data.map(image => {
          if (image.url && image.url.includes('host.docker.internal')) {
            return {
              ...image,
              url: image.url.replace('host.docker.internal', '192.168.1.15')
            };
          }
          return image;
        });
      
        // Process detailed_description to replace host.docker.internal with IP
        const processedProductData = {
          ...productData,
          detailed_description: productData.detailed_description 
            ? productData.detailed_description.replace(
                /host\.docker\.internal/g, 
                '192.168.1.15'
              )
            : productData.detailed_description
        };
      
        // Fetch related products based on category ID
        const allProducts = await axios.get(
          `https://5b22-197-29-209-95.ngrok-free.app/api/stuffs/?category=${productData.category}`
        );
      
        // Process related products' images and descriptions
        const processedRelatedProducts = allProducts.data.map(product => {
          return {
            ...product,
            // Process image URLs if they exist
            ...(product.image && { 
              image: product.image.includes('host.docker.internal') 
                ? product.image.replace('host.docker.internal', '192.168.1.15')
                : product.image
            }),
            // Process descriptions if they exist
            ...(product.detailed_description && {
              detailed_description: product.detailed_description.replace(
                /host\.docker\.internal/g,
                '192.168.1.15'
              )
            })
          };
        });
      
        setProduct(processedProductData); // Set the processed product data
        setImages(processedImages);
        setRelatedProducts(processedRelatedProducts);
        console.log('Processed product data:', processedProductData);
      } catch (err) {
        console.error("Failed to fetch product data:", err);
        setError("Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    // Track page view after product data is fetched
    const handleProductView = async (productId) => {
      await TrackingService.trackPageView(productId);
      // Other tracking or actions can go here
    };

    fetchData(); // Call to fetch product and related data
    handleProductView(productId); // Track page view

  }, [productId]); // Dependency array ensures it re-runs when productId changes

  // Log product details when available
  useEffect(() => {
    if (product) {
      console.log(product.detailed_description); // Log product details after data is fetched
    }
  }, [product]);

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
          <div
            dangerouslySetInnerHTML={{
              __html: product.detailed_description,
            }}
          />
        ) : (
          <p>No description available for this product.</p>
        )}
      </div>
    )
    ,
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

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-md">NEW</span>
            </div>
            
            {/* Zoom Icon that appears on hover */}
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
          
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {productImages.map((img, index) => (
              <motion.div
                key={img.id || index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
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
        </div>

        {/* Product Info */}
        <div className="space-y-6">
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
          
          {/* Rental Options */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Rental Options</h3>
            
            {/* Duration Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['1 Day', '3 Days', '1 Week'].map((option) => (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={option}
                  className={`py-2 px-3 rounded-md text-sm font-medium ${
                    option === '3 Days' 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-300'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            
            {/* Quantity Selector */}
            <div>
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
    // You might want to save this to your backend here
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



import { format, parseISO, addDays, differenceInDays } from 'date-fns';

const CalendarSidebar = ({ 
  product, 
  showForm, 
  setShowForm, 
  onEventCreated,
  existingEvents = []
}) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [view, setView] = useState('dayGridMonth');
  const calendarRef = useRef(null);
  const [events, setEvents] = useState(existingEvents);

  // Calculate duration between two dates
  const calculateDuration = () => {
    if (selectedDates.length === 2) {
      return differenceInDays(
        parseISO(selectedDates[1]), 
        parseISO(selectedDates[0])
      ) + 1;
    }
    return 0;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const duration = calculateDuration();
    return (duration * product.price_per_day * quantity).toFixed(2);
  };

  // Handle date selection from calendar
  const handleDateSelect = (selectInfo) => {
    const { startStr, endStr } = selectInfo;
    const endDate = endStr ? format(addDays(parseISO(endStr), -1), 'yyyy-MM-dd') : startStr;
    
    setSelectedDates([startStr, endDate]);
    console.log(selectedDates)
    
    // Auto-switch to day view when selecting time slots
    if (view === 'timeGridDay') {
      calendarRef.current.getApi().changeView('timeGridDay', startStr);
    }
  };

  // Handle event creation
  // Handle event creation
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (selectedDates.length !== 2) {
    toast.error('Please select start and end dates');
    return;
  }

  try {
    // Prepare the rental request data
    const rentalRequestData = {
      equipment: product.id,
      rental: 2, // Assuming this is a fixed rental ID as per your example
      client: 10, // Assuming this is a fixed client ID as per your example
      start_date: selectedDates[0],
      end_date: selectedDates[1],
      status: "pending",
      quantity: quantity,
      special_requests: specialRequests
    };

    // Make the API call
    const response = await axios.post(
      "http://127.0.0.1:8001/rental/rental_requests/",
      rentalRequestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // If successful, create the calendar event
    const newEvent = {
      title: `Rental: ${product.stuffname}`,
      start: selectedDates[0],
      end: selectedDates[1],
      extendedProps: {
        productId: product.id,
        quantity,
        specialRequests,
        totalPrice: calculateTotalPrice(),
        rentalRequestId: response.data.id // Store the ID from the response
      },
      color: '#0d9488', // Teal color
      textColor: '#ffffff'
    };

    setEvents([...events, newEvent]);
    onEventCreated(newEvent);
    
    toast.success('Rental request created successfully!');
    setShowForm(false);
  } catch (error) {
    console.error('Error creating rental request:', error);
    toast.error('Failed to create rental request. Please try again.');
  }
};

  // Change calendar view
  const changeView = (newView) => {
    setView(newView);
    calendarRef.current.getApi().changeView(newView);
  };

  return (
    <AnimatePresence>
      {showForm && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowForm(false)}
          />

          {/* Sidebar */}
          <motion.div
            className="absolute right-0 top-0 h-full w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 bg-white shadow-xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-teal-200 text-xl" />
                  <h2 className="text-xl font-semibold">Rental Schedule</h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-full hover:bg-teal-500/30 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="mt-2 flex items-center text-teal-100 text-sm">
                <span>{product.stuffname}</span>
                <span className="mx-2">•</span>
                <span>${product.price_per_day}/day</span>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => changeView('dayGridMonth')}
                className={`flex-1 py-3 text-sm font-medium ${view === 'dayGridMonth' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('timeGridWeek')}
                className={`flex-1 py-3 text-sm font-medium ${view === 'timeGridWeek' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('timeGridDay')}
                className={`flex-1 py-3 text-sm font-medium ${view === 'timeGridDay' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              >
                Day
              </button>
              <button
                onClick={() => changeView('listWeek')}
                className={`flex-1 py-3 text-sm font-medium ${view === 'listWeek' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              >
                List
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Calendar Section */}
              <div className="p-4 border-b border-gray-200">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
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
                  eventResizableFromStart={true}
                  selectOverlap={false}
                  selectConstraint={{
                    start: new Date().toISOString().split('T')[0],
                    end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                  }}
                />
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1">
                {/* Selected Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={selectedDates[0] ? format(parseISO(selectedDates[0]), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => {
                          const newDates = [...selectedDates];
                          newDates[0] = e.target.value;
                          setSelectedDates(newDates);
                        }}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        required
                      />
                      <FiCalendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={selectedDates[1] ? format(parseISO(selectedDates[0]), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => {
                          const newDates = [...selectedDates];
                          newDates[1] = e.target.value;
                          setSelectedDates(newDates);
                        }}
                        min={selectedDates[0] || ''}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        required
                      />
                      <FiCalendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Rental Summary */}
                {selectedDates.length === 2 && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                    <h3 className="font-medium text-teal-800 mb-2">Rental Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{calculateDuration()} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium">${product.price_per_day}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      <div className="border-t border-teal-200 my-2 pt-2 flex justify-between font-semibold text-teal-700">
                        <span>Total:</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <div className="flex items-center">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none"
                      type="button"
                    >
                      -
                    </motion.button>
                    <div className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-900 text-center w-16">
                      {quantity}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none"
                      type="button"
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="Any additional requirements or notes..."
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={selectedDates.length !== 2}
                  className={`flex-1 py-3 px-4 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedDates.length === 2 
                      ? 'bg-teal-600 hover:bg-teal-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={{ y: selectedDates.length === 2 ? -1 : 0 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  <FiPlus />
                  Schedule Rental
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
