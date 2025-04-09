import { useState, useRef, useEffect } from "react";
import EquipmentService from "../services/EquipmentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";
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
  FaHeart
} from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

export default function ProductDetail() {
  // Define images array at the top of the component
  const images = [
    "/img1.jpg",
    "/img2.jpg",
    "/img3.jpg",
    "/img4.jpg"
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

  // Product specifications
  const specifications = [
    { name: "Material", value: "100% Cotton" },
    { name: "Fit", value: "Relaxed" },
    { name: "Length", value: "Ankle" },
    { name: "Closure", value: "Elastic Waist" },
    { name: "Care Instructions", value: "Machine Wash Cold" },
    { name: "Origin", value: "Made in USA" }
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
    setCurrentIndex(prev => (prev === 0 ? Math.ceil(products.length / 3) - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === Math.ceil(products.length / 3) - 1 ? 0 : prev + 1));
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
  
  // Your existing useEffect and functions remain unchanged

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Section */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Gallery - Enhanced with subtle animations */}
        <div>
          <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={images[selectedImage]}
              alt={product.stuffname}
              className="w-full h-full object-contain cursor-pointer"
            />
            <button 
              onClick={() => setWishlist(!wishlist)}
              className={`absolute top-4 right-4 p-2 rounded-full shadow-sm ${wishlist ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}
            >
              <FaHeart />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage === index ? "border-teal-500" : "border-transparent hover:border-gray-200"
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

        {/* Product Info - Enhanced layout */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.stuffname}</h1>
            <div className="flex items-center mt-2">
              <div className="flex text-teal-500">
                {[...Array(4)].map((_, i) => (
                  <FaStar key={i} />
                ))}
                <FaRegStar />
              </div>
              <span className="text-gray-500 ml-2">{product.stuff_management?.rating} (212 reviews)</span>
            </div>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-teal-700">{product.price_per_day}</span>
              <span className="text-gray-400 line-through">$290.00</span>
              <span className="text-sm text-teal-700 ml-2">per day</span>
            </div>
            <p className="text-gray-700 mt-1">{product.short_description}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                <FiCheckCircle className="text-teal-500 text-sm" />
              </div>
              <span className="text-gray-700">Condition: <span className="font-medium">{product.state}</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <span className="text-gray-700">Rental Location: <span className="font-medium">{product.rental_location}</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <FaFileContract className="text-gray-400" />
              <span className="text-gray-700">Contract Required: </span>
              <a href={contractLink} className="text-teal-600 hover:underline">View Rental Agreement</a>
            </div>
          </div>

          {/* Action Buttons with subtle animations */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FaShoppingBag />
              Rent Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 border border-gray-300 hover:border-teal-500 py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FaStore />
              View in Store
            </motion.button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <FaCreditCard className="text-gray-400" />
              <span className="font-medium">Payment Methods:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <img src="/assets/visa.png" alt="Visa" className="h-8 object-contain" />
              <img src="/assets/master-card.png" alt="Mastercard" className="h-8 object-contain" />
              <img src="/assets/flousi.png" alt="Flousi" className="h-8 object-contain" />
              <img src="/assets/D17.png" alt="D17" className="h-8 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs - Enhanced with subtle indicators */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['description', 'specs', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-3 font-medium text-sm ${
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

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specifications.map((spec, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-600 w-40">{spec.name}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{review.name}</span>
                    <span className="text-gray-500 text-sm">{review.date}</span>
                  </div>
                  <div className="flex text-teal-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products - Enhanced carousel */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="relative">
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-teal-50 transition-colors"
          >
            <FaChevronLeft className="text-gray-700" />
          </button>
          
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {products.map(product => (
                <div key={product.id} className="w-full flex-shrink-0 px-3">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                      <img
                        src={product.image}
                        alt={product.stuffname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium">{product.stuffname}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-teal-600 font-bold">{product.price_per_day}</span>
                      <button className="text-sm text-teal-600 hover:underline">View</button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-teal-50 transition-colors"
          >
            <FaChevronRight className="text-gray-700" />
          </button>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}