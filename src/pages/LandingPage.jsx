import {
  HeroSection,
  PopularRentalsSection,
  WhyChooseUsSection,
  CategoriesSection,
  FAQSection,
  BlogSection,
} from "../components/LandingPage";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowUp } from "lucide-react";
import EquipmentService from "../services/EquipmentService";
import { motion, AnimatePresence } from "framer-motion";
import TrackingService from '../services/TrackingService';
import Footer from "../components/LandingPage/footer";
import CurrentDealsSection from "../components/LandingPage/deal";
import axios from 'axios';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } }
};

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ip, setIP] = useState('');

  // Fetch data from database
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [products, imagesData] = await Promise.all([
        EquipmentService.fetchRentals(),
        EquipmentService.fetchImages()
      ]);
      setProducts(products);
      setImages(imagesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchip = useCallback(async () => {
    try {
      const response = await axios.get("https://f7d3-197-27-48-225.ngrok-free.app/ocr/getipp/");
      setIP(response.data.ip); // Changed to response.data.ip
      console.log("IP fetched:", response.data.ip);
    } catch (error) {
      console.error("Failed to fetch IP:", error);
      setIP('localhost');
    }
  }, []);

  useEffect(() => {
    fetchip();
  }, [fetchip]);

  // Get product image URL
  const getProductImage = useCallback((productId) => {
    if (!Array.isArray(images) || images.length === 0) return null;

    const productImages = images.filter(img => img?.stuff == productId);
    if (productImages.length === 0) return null;

    const mainImage = productImages.find(img => img?.position === 1);
    let url = mainImage?.url || productImages[0]?.url || null;

    if (url && ip) {
      url = url.replace('host.docker.internal', ip);
    }

    return url;
  }, [images, ip]);

  const handleProductView = useCallback(async (productId) => {
    await TrackingService.trackPageView(productId);
  }, []);

  const popularProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    return [...products]
      .filter(product => product.stuff_management?.rating >= 4)
      .sort((a, b) => (b.stuff_management?.rating || 0) - (a.stuff_management?.rating || 0))
      .slice(0, 6);
  }, [products]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(popularProducts.length / 3));
  }, [popularProducts.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(popularProducts.length / 3)) % Math.ceil(popularProducts.length / 3));
  }, [popularProducts.length]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (products.length > 3) {
      const interval = setInterval(() => {
        handleNext();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [products.length, handleNext]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      } 
    }
  };

  return (
    <div className="relative w-full h-auto overflow-x-hidden">
      <HeroSection />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-12 md:mt-16"
      >
        <PopularRentalsSection
          products={products}
          getProductImage={getProductImage}
          currentIndex={currentIndex}
          handleNext={handleNext}
          handlePrev={handlePrev}
          isLoading={isLoading}
          direction={direction}
          onProductView={handleProductView}
        />
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-12 md:mt-16"
      >
        <WhyChooseUsSection />
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-12 md:mt-16"
      >
        <CategoriesSection />
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-12 md:mt-16"
      >
        <CurrentDealsSection />
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-12 md:mt-16"
      >
        <FAQSection />
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-12 md:mt-16 mb-12"
      >
        <BlogSection />
      </motion.div>
      
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed right-6 bottom-6 z-50 bg-teal-600 p-3 rounded-full shadow-xl hover:bg-teal-700 transition-all duration-300 flex items-center justify-center"
            aria-label="Back to top"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <section className="bg-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial="hidden"
            whileInView="show"
            variants={fadeIn}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Subscribe to our newsletter for exclusive deals and new equipment arrivals
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-500"
              />
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition shadow-md"
              >
                Subscribe
              </motion.button>
            </motion.div>
            <p className="text-white/80 text-xs mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;