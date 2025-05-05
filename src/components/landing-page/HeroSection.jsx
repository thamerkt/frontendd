import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Star, ShieldCheck, DollarSign, Truck, HandCoins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerHeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Slides data combining delivery, finance, and assurance
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "DELIVERY NETWORK WITH FINANCIAL SECURITY",
      description: "Earn competitive rates with guaranteed payments and full delivery protection",
      ctaPrimary: { text: "Join Now", href: "#apply" },
      ctaSecondary: { text: "Learn Benefits", href: "#benefits" },
      badge: "Trusted Partner",
      price: "Earn up to $35/hour + bonuses",
      circleColor: "bg-teal-500"
    },
    {
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
      title: "COMPLETE DELIVERY ASSURANCE",
      description: "Every delivery protected with insurance and 24/7 support team",
      ctaPrimary: { text: "Get Protected", href: "#apply" },
      ctaSecondary: { text: "See Coverage", href: "#coverage" },
      badge: "Fully Insured",
      price: "Zero liability protection",
      circleColor: "bg-teal-500"
    },
    {
      image: "https://images.unsplash.com/photo-1604514628550-37477afdf4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80",
      title: "FINANCIAL SOLUTIONS FOR PARTNERS",
      description: "Get advance payments and equipment financing for your delivery business",
      ctaPrimary: { text: "Explore Financing", href: "#finance" },
      ctaSecondary: { text: "View Options", href: "#rates" },
      badge: "Financial Support",
      price: "Low-interest loans available",
      circleColor: "bg-teal-500"
    },
  ];

  // Memoized navigation functions
  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Auto-rotation with pause on hover
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, goToNext]);

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      opacity: 0,
      x: direction > 0 ? "100%" : "-100%",
      zIndex: 0
    }),
    center: {
      opacity: 1,
      x: 0,
      zIndex: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.32, 0.72, 0, 1]
      }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction < 0 ? "100%" : "-100%",
      zIndex: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.32, 0.72, 0, 1]
      }
    })
  };

  return (
    <div className="relative w-full h-[100vh] min-h-[800px] max-h-[1000px] overflow-hidden group">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-20 bg-gray-200/30">
        <motion.div
          className="h-full bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={currentIndex}
        />
      </div>

      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[currentIndex].image}
            alt="Partner Solutions Banner"
            className="w-full h-full object-cover"
            loading="eager"
            fetchpriority="high"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex flex-col items-center justify-center text-white">
            <div className="text-center px-4 w-full max-w-6xl mt-[-100px]">
              {/* Badge */}
              {slides[currentIndex].badge && (
                <motion.span 
                  className="inline-block bg-teal-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                >
                  {slides[currentIndex].badge}
                </motion.span>
              )}

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.2,
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1]
                }}
              >
                {slides[currentIndex].title}
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.4,
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1]
                }}
              >
                {slides[currentIndex].description}
              </motion.p>

              {/* Price tag */}
              {slides[currentIndex].price && (
                <motion.div
                  className="text-xl font-semibold mb-8 text-teal-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {slides[currentIndex].price}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all duration-300 shadow-lg border border-white/20"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6 text-white hover:text-teal-300" />
      </button>
      <button
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all duration-300 shadow-lg border border-white/20"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6 text-white hover:text-teal-300" />
      </button>
      
      {/* Teal-themed circular indicators - Moved to top */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-teal-500 ring-2 ring-teal-300" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* CTA Buttons - Updated design */}
      <div className="absolute bottom-60 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xl px-4">
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a 
            href={slides[currentIndex].ctaPrimary.href}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 w-full sm:w-auto px-10 py-2.5 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-teal-500/20"
          >
            {slides[currentIndex].ctaPrimary.text}
            <ArrowRight className="w-4 h-4" />
          </a>
          <a 
            href={slides[currentIndex].ctaSecondary.href}
            className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 w-full sm:w-auto px-10 py-2.5 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-white/20"
          >
            {slides[currentIndex].ctaSecondary.text}
            <Star className="w-4 h-4 fill-white/20 stroke-white" />
          </a>
        </motion.div>
      </div>

      {/* Connected Benefits Bar - Cards with transparent background */}
      <div className="absolute bottom-0 left-0 right-0 z-10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Your Complete Partner Solution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Truck className="w-5 h-5" />,
                title: "Smart Delivery",
                description: "Optimized routes"
              },
              {
                icon: <DollarSign className="w-5 h-5" />,
                title: "Financial Security",
                description: "Guaranteed payments"
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: "Full Protection",
                description: "Insurance coverage"
              },
              {
                icon: <HandCoins className="w-5 h-5" />,
                title: "Growth Financing",
                description: "Equipment loans"
              }
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="flex flex-col items-center text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="bg-teal-500/20 p-2 rounded-full mb-2 text-teal-300">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-white text-sm md:text-base mb-1">{benefit.title}</h3>
                <p className="text-xs md:text-sm text-white/80">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}