import { ChevronLeft, ChevronRight, Zap, Truck, CreditCard, Clock, CheckCircle, ChevronRightCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CurrentDealsSection() {
  const deals = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "5kVA Generator – 15% Off",
      originalPrice: 200,
      promoPrice: 170,
      features: [
        "Stable power for professional or personal use",
        "3x payment plan available",
        "Free maintenance included"
      ],
      category: "Generators",
      tag: "Popular",
      delivery: "Free delivery"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "160L Concrete Mixer – 20% Off",
      originalPrice: 120,
      promoPrice: 96,
      features: [
        "Perfect for small construction sites",
        "Free delivery included",
        "Easy to operate"
      ],
      category: "Construction",
      tag: "Limited",
      delivery: "Hammamet & Nabeul"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      title: "Event Sound System Pack – 25% Off",
      originalPrice: 320,
      promoPrice: 240,
      features: [
        "Ideal for weddings, parties, conferences",
        "Free installation in Greater Tunis",
        "Professional setup"
      ],
      category: "Audio",
      tag: "Exclusive",
      delivery: "Free setup"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "Scaffolding Set – 10% Off",
      originalPrice: 150,
      promoPrice: 135,
      features: [
        "Up to 5m height capacity",
        "Safety certified",
        "Weekly rental discounts"
      ],
      category: "Construction",
      tag: "New",
      delivery: "Free assembly"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const cardsPerPage = 4;
  const totalSets = Math.ceil(deals.length / cardsPerPage);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSets);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSets) % totalSets);
  };

  // Auto-rotate every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [currentIndex]);

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

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-gray-50 rounded-2xl my-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
        <div className="text-left mb-6 md:mb-0">
          <span className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            CURRENT DEALS
          </span>
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900 relative inline-block">
              Exclusive Discounts
              <span className="absolute bottom-[-8px] left-0 w-20 h-1.5 bg-teal-500 rounded-full"></span>
            </h2>
          </div>
          <p className="text-gray-500 mt-2 max-w-lg text-lg">
            Take advantage of limited-time offers on popular equipment
          </p>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-2">
            {Array.from({ length: totalSets }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-teal-600 w-6" : "bg-gray-300 hover:bg-teal-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-300 transition-colors shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-300 transition-colors shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Deal Cards */}
      <div className="relative mb-8 min-h-[580px]">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
          >
            {deals.slice(currentIndex * cardsPerPage, currentIndex * cardsPerPage + cardsPerPage).map((deal) => (
              <motion.div
                key={deal.id}
                whileHover={{ y: -8 }}
                className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Image with tag badge */}
                <div className="relative h-56">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {deal.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
  <div className="flex justify-between items-start mb-3 gap-2">
    <h3 className="text-lg font-bold text-gray-900 flex-1">{deal.title}</h3>
    <div className="flex items-center bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">
      <span className="line-through mr-2 text-gray-500">${deal.originalPrice}</span>
      <span>${deal.promoPrice}</span>
    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Truck className="w-4 h-4 mr-2 text-teal-600" />
                    <span className="line-clamp-1">{deal.delivery}</span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {deal.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto px-5 pb-5 pt-2 border-t border-gray-100">
                    <button 
                      className="w-full flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                      aria-label={`Rent ${deal.title}`}
                    >
                      Get This Deal
                      <ChevronRightCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Promo Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500 flex items-start">
          <Zap className="w-5 h-5 text-teal-500 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900">20% off generators</h3>
            <p className="text-sm text-gray-600">Until April 30</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500 flex items-start">
          <Truck className="w-5 h-5 text-teal-500 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900">Free delivery</h3>
            <p className="text-sm text-gray-600">First rental in Hammamet & Nabeul</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500 flex items-start">
          <CreditCard className="w-5 h-5 text-teal-500 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900">Pay in 3 installments</h3>
            <p className="text-sm text-gray-600">Interest-free for equipment over 1000 DT</p>
          </div>
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <button className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200 shadow-lg hover:shadow-teal-200/50">
          View All Deals
          <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </section>
  );
}