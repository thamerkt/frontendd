import { useState, useRef, useEffect } from "react";
import EquipmentService from "../services/EquipmentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
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
  FaChevronRight
} from "react-icons/fa";

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState("data:image/jpeg;base64,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");

  const contractLink = "/terms-and-conditions";
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const [id,setId]=useState(1)
  const [product,setProduct]=useState({})
  const [products,setProducts]=useState([])
  const [categorie,setCategorie]=useState("Electronics")

  // Related products data
  

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

  // Product specifications
  const specifications = [
    { name: "Material", value: "100% Cotton" },
    { name: "Fit", value: "Relaxed" },
    { name: "Length", value: "Ankle" },
    { name: "Closure", value: "Elastic Waist" },
    { name: "Care Instructions", value: "Machine Wash Cold" },
    { name: "Origin", value: "Made in USA" }
  ];

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.ceil(products.length / 3) - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === Math.ceil(products.length / 3) - 1 ? 0 : prev + 1));
  };

  const getTransformValue = () => {
    return `translateX(-${currentIndex * 100}%)`;
  };
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await EquipmentService.fetchRentalById(id);
          setProduct(response)
          console.log("Equipment:", response);
        } catch (error) {
          console.log("Failed to get product", error);
        }
      }
      if(categorie){
        try {
          const response1 = await EquipmentService.fetchRentalsBy(categorie);
          setProducts(response1)
          console.log("Equipments:", response1);
        } catch (error) {
          console.log("Failed to get product", error);
        }

      }
    };
  
    fetchData();
  }, [id]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
        <div className="w-full aspect-square rounded-lg shadow-md mb-4 overflow-hidden">
            <Zoom
              zoomMargin={40}
              overlayBgColorEnd="rgba(255, 255, 255, 0.95)"
              zoomImage={{
                src: selectedImage.replace('-thumb', '-full') || selectedImage,
                alt: 'Grey Acid Wash Wide Leg Jogger - Zoomed View'
              }}
            >
              <img
                alt="Grey Acid Wash Wide Leg Jogger"
                src={selectedImage}
                className="w-full h-full object-cover cursor-zoom-in"
                style={{ display: 'block' }}
              />
            </Zoom>
          </div>
          <div className="flex gap-2">
            {["/img1.jpg", "/img2.jpg", "/img3.jpg"].map((img, index) => (
              <div key={index} className="w-20 h-20 rounded-md overflow-hidden">
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-full h-full object-cover cursor-pointer border-2 ${
                    selectedImage === img ? "border-black" : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.stuffname}</h1>
          <div className="flex items-center gap-2">
            <p className="text-green-600 font-medium">{product.stuff_management?.availability}</p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 text-yellow-500">
            {[...Array(4)].map((_, i) => (
              <FaStar key={i} />
            ))}
            <FaRegStar />
            <span className="text-gray-600 text-sm ml-2">{product.stuff_management?.rating} (212 reviews)</span>
          </div>
          
          {/* Price */}
          <div>
            <span className="text-2xl font-semibold">{product.price_per_day}</span>
            <span className="text-gray-400 line-through ml-2">$290.00</span>
            <span className="text-gray-600 text-sm ml-1">per day</span>
          </div>
          
          <p className="text-gray-700">
            {product.short_description}
          </p>
          
          {/* Product State */}
          <div>
            <span className="text-gray-600">Condition:</span>
            <span className="text-green-600 font-medium ml-2">{product.state}</span>
          </div>
          
          {/* Rental Location */}
          <div className="flex items-center gap-2 text-gray-700">
            <FaMapMarkerAlt className="text-gray-500" />
            <span className="font-medium">Rental Location:</span>
            <span>{product.rental_location}</span>
          </div>
          
          {/* Contract Requirement */}
          <div className="flex items-center justify-between text-gray-700">
            <div className="flex items-center gap-2">
              <FaFileContract className="text-gray-500" />
              <span className="font-medium">Contract Required:</span>
            </div>
            <a 
              href={contractLink} 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Rental Agreement
            </a>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-2/3">
              <FaShoppingBag />
              Rent Now
            </button>
            <a href="/store" className="flex items-center gap-2 text-gray-700 hover:text-black">
              <FaStore />
              View in Store
            </a>
          </div>
          
          <p className="text-gray-500 text-sm">
            Enjoy <span className="font-semibold">FREE express shipping & Free Returns</span> on orders over $35!
          </p>
          
          {/* Payment Methods */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FaCreditCard className="text-gray-500" />
              <span className="font-medium">Payment Methods:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <img width={60} src="/assets/visa.png" alt="Visa" className="h-8 object-contain" />
              <img width={60} src="/assets/master-card.png" alt="Mastercard" className="h-8 object-contain" />
              <img width={60} src="/assets/flousi.png" alt="Flousi" className="h-8 object-contain" />
              <img width={60} src="/assets/D17.png" alt="D17" className="h-8 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-8 border-t pt-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'description' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'specs' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('specs')}
          >
            Specifications
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="py-4">
            <div 
              className={`prose max-w-none ${showFullDescription ? '' : 'max-h-32 overflow-hidden'}`}
              dangerouslySetInnerHTML={{ __html: product.detailed_description }}
            />
            <button 
              className="text-blue-600 flex items-center mt-2"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? (
                <>
                  <FaChevronUp className="mr-1" /> Show Less
                </>
              ) : (
                <>
                  <FaChevronDown className="mr-1" /> Read More
                </>
              )}
            </button>
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specs' && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-600 w-40">{spec.name}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="py-4">
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  i < 4 ? <FaStar key={i} className="text-yellow-500" /> : <FaRegStar key={i} className="text-yellow-500" />
                ))}
                <span className="ml-2 font-medium">4.5 out of 5</span>
              </div>
              <span className="text-gray-600">{reviews.length} customer reviews</span>
            </div>

            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{review.name}</span>
                    <span className="text-gray-500 text-sm">{review.date}</span>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      i < review.rating ? 
                        <FaStar key={i} className="text-yellow-500 text-sm" /> : 
                        <FaRegStar key={i} className="text-yellow-500 text-sm" />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>

            <button className="mt-6 px-4 py-2 border border-black rounded hover:bg-gray-100 transition">
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
        <div className="relative overflow-hidden">
          <button 
            onClick={prevSlide} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            disabled={currentIndex === 0}
          >
            <FaChevronLeft className="text-gray-700" />
          </button>
          
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: getTransformValue() }}
          >
            {Array.from({ length: Math.ceil(products.length / 3) }).map((_, groupIndex) => (
              <div key={groupIndex} className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                {products.slice(groupIndex * 3, groupIndex * 3 + 3).map(product => (
                  <div
                    key={product.id}
                    className="border rounded-lg shadow p-5 flex flex-col items-center hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-full h-40 mb-4 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.stuffname}
                        className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-xs text-gray-500 uppercase"></div>
                    <h3 className="text-lg font-semibold text-center">{product.stuffname}</h3>
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-xl font-bold">${product.price_per_day}</span>
                      <span className="text-gray-400 line-through">$</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {product.hot && <span className="bg-green-500 text-white px-2 py-1 text-xs rounded">HOT</span>}
                      <span className="bg-red-500 text-white px-2 py-1 text-xs rounded"></span>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors w-full">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <button 
            onClick={nextSlide} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            disabled={currentIndex === Math.ceil(products.length / 3) - 1}
          >
            <FaChevronRight className="text-gray-700" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(products.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-black' : 'bg-gray-300'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}