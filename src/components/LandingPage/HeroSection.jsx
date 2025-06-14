import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowRight, Star, MapPin, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import EquipmentService from "../../services/EquipmentService";

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Tunis');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  const tunisianCities = {
    'Tunis': { lat: 36.8065, lng: 10.1815 },
    'Ariana': { lat: 36.8665, lng: 10.1647 },
    'Ben Arous': { lat: 36.7531, lng: 10.2189 },
    'La Manouba': { lat: 36.8101, lng: 10.0956 },
    'Nabeul': { lat: 36.4561, lng: 10.7376 },
    'Zaghouan': { lat: 36.4029, lng: 10.1429 },
    'Bizerte': { lat: 37.2744, lng: 9.8739 },
    'Beja': { lat: 36.7256, lng: 9.1817 },
    'Jendouba': { lat: 36.5012, lng: 8.7802 },
    'Kef': { lat: 36.1822, lng: 8.7148 },
    'Kairouan': { lat: 35.6712, lng: 10.1006 },
    'Sidi Bouzid': { lat: 35.0382, lng: 9.4849 },
    'Kasserine': { lat: 35.1676, lng: 8.8365 },
    'Monastir': { lat: 35.7643, lng: 10.8113 },
    'Mahdia': { lat: 35.5047, lng: 11.0622 },
    'Sousse': { lat: 35.8254, lng: 10.6360 },
    'Gabes': { lat: 33.8886, lng: 10.0972 },
    'Medenine': { lat: 33.3549, lng: 10.5055 },
    'Tataouine': { lat: 32.9297, lng: 10.4510 },
    'Tozeur': { lat: 33.9197, lng: 8.1338 },
    'Gafsa': { lat: 34.4250, lng: 8.7842 },
    'Siliana': { lat: 36.0849, lng: 9.3708 },
    'Sfax': { lat: 34.7406, lng: 10.7603 }
  };

  const popularSearches = [
    'Tents',
    'Dumbbells',
    'Sound Systems',
    'Drills',
    'Tables & Chairs',
    'Blenders',
    'Decorations',
    'Projectors'
  ];

  const slides = [
    {
      image: "/assets/bannnerr.png",
      title: "Rent Premium Equipment & Save Up To 70%",
      highlight: "Save Up To 70%",
      ctaPrimary: "Shop Now",
      ctaSecondary: "Earn as Host",
      spacing: "mb-4"
    },
    {
      image: "/assets/del.png",
      title: "Fast & Easy Rentals - Delivered to Your Doorstep",
      highlight: "Delivered to Your Doorstep",
      ctaPrimary: "Browse Items",
      ctaSecondary: "Learn More",
      spacing: "mb-4"
    },
    {
      image: "/assets/exclusive.png",
      title: "Exclusive Deals on Top-Rated Equipment",
      highlight: "Exclusive Deals",
      ctaPrimary: "Discover More",
      ctaSecondary: "Special Discount",
      spacing: "mb-4"
    }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      try {
        const response = await EquipmentService.fetchCategories();
        const fetchedCategories = Array.isArray(response)
          ? response.map(cat => cat.name || cat)
          : [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoriesError("Failed to load categories. Using default options.");
        setCategories([
          'All Categories',
          'Fitness Gear',
          'Party Supplies',
          'Power Tools',
          'Camping Equipment',
          'Home Appliances',
          'Wedding Decor',
          'Electronics'
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const renderHighlightedTitle = (title, highlight) => {
    if (!highlight) return title;
    const parts = title.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => {
          if (part.toLowerCase() === highlight.toLowerCase()) {
            return (
              <motion.span
                key={index}
                className="text-teal-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  textShadow: ["0 0 8px rgba(45, 212, 191, 0.3)", "0 0 16px rgba(45, 212, 191, 0.5)", "0 0 8px rgba(45, 212, 191, 0.3)"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {part}
              </motion.span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    resetTimer();
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    resetTimer();
  }, [slides.length]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    intervalRef.current = setInterval(() => {
      if (!isPaused) goToNext();
    }, 5000);

    progressRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }
    }, 100);
  }, [goToNext, isPaused]);

  const resetTimer = useCallback(() => {
    setProgress(0);
    startTimer();
  }, [startTimer]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [startTimer]);

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
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction < 0 ? "100%" : "-100%",
      zIndex: 0,
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
    })
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert("Please enter a search term");
      return;
    }
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      params.append("search", searchQuery.trim());
      params.append("category", selectedCategory);
      if (userLocation) {
        params.append("lat", userLocation.lat);
        params.append("lng", userLocation.lng);
      } else if (selectedCity !== 'Tunis') {
        const cityCoords = tunisianCities[selectedCity];
        params.append("lat", cityCoords.lat);
        params.append("lng", cityCoords.lng);
      }
      navigate(`/shopgrid?${params.toString()}`);
    } catch (error) {
      console.error("Search error:", error);
      alert("There was an error processing your search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation not supported");
      }
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      const city = findNearestCity(position.coords);
      setSelectedCity(city);
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      console.error("Location error:", error);
      alert("Could not get your location. Please check permissions.");
    }
  };

  const findNearestCity = (coords) => {
    let nearestCity = 'Tunis';
    let minDistance = Infinity;
    
    for (const [city, cityCoords] of Object.entries(tunisianCities)) {
      const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        cityCoords.lat,
        cityCoords.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }
    return nearestCity;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCityChange = (e) => {
    if (e.target.value === "detect") {
      handleLocationClick(e);
    } else {
      setSelectedCity(e.target.value);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handlePopularSearch = (item) => {
    setSearchQuery(item);
    navigate(`/shopgrid?search=${encodeURIComponent(item)}`);
  };

  return (
    <div className="relative w-full h-[85vh] max-h-[700px] overflow-hidden">
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
            alt="Banner"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/30 z-0"></div>

      <div className="absolute inset-0 flex flex-col items-center justify-between px-4 z-10 text-white pt-32 pb-12">
        <div className="w-full max-w-4xl text-center mt-4">
          {slides[currentIndex].badge && (
            <div className="inline-block bg-teal-600 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
              {slides[currentIndex].badge}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            {renderHighlightedTitle(slides[currentIndex].title, slides[currentIndex].highlight)}
          </h1>

          <form 
            onSubmit={handleSearch} 
            className="mb-4 w-full bg-white rounded-xl shadow-2xl overflow-hidden"
            onMouseEnter={pauseTimer}
            onMouseLeave={resumeTimer}
          >
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="relative w-full md:w-1/5 border-r border-gray-200">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-4 text-gray-700 bg-white outline-none appearance-none text-sm font-medium"
                  value={selectedCity}
                  onChange={handleCityChange}
                  onFocus={pauseTimer}
                  onBlur={resumeTimer}
                >
                  {Object.keys(tunisianCities).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="detect">Detect My Location</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              <div className="relative w-full md:w-1/5 border-r border-gray-200">
                {isLoadingCategories ? (
                  <div className="w-full pl-4 pr-8 py-4 text-gray-700 bg-white text-sm">
                    Loading categories...
                  </div>
                ) : (
                  <>
                    <select
                      className="w-full pl-4 pr-8 py-4 text-gray-700 bg-white outline-none appearance-none text-sm font-medium"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      onFocus={pauseTimer}
                      onBlur={resumeTimer}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </>
                )}
                {categoriesError && (
                  <p className="absolute -bottom-6 left-0 text-xs text-red-300">{categoriesError}</p>
                )}
              </div>

              <div className="w-full md:w-3/5 min-w-[200px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you need today?"
                  className="w-full px-6 py-4 outline-none text-gray-700 placeholder-gray-400 text-base font-medium"
                  required
                  onFocus={pauseTimer}
                  onBlur={resumeTimer}
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="hidden md:flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 font-semibold transition-colors duration-200 min-w-[120px]"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="md:hidden w-full bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Rentals
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3 text-sm mb-2">
            <span className="text-white/80">Trending:</span>
            {popularSearches.map((item) => (
              <button
                key={item}
                onClick={() => handlePopularSearch(item)}
                className="text-white hover:text-teal-300 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-4xl text-center mb-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors duration-200 shadow-lg"
              onClick={() => navigate('/shopgrid')}
            >
              {slides[currentIndex].ctaPrimary}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors duration-200 border border-white/20 shadow-lg"
              onClick={() => navigate('/host')}
            >
              {slides[currentIndex].ctaSecondary}
              <Star className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-colors duration-200"
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        <ChevronLeft className="text-white w-6 h-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-colors duration-200"
        onClick={goToNext}
        aria-label="Next slide"
      >
        <ChevronRight className="text-white w-6 h-6" />
      </button>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
        <div
          className="h-full bg-teal-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setCurrentIndex(idx); resetTimer(); }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${idx === currentIndex ? 'bg-teal-400 scale-125' : 'bg-white/30'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}