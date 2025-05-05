import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Star, MapPin } from "lucide-react";
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
  const [selectedCity, setSelectedCity] = useState('Tunis');
  const [locationStatus, setLocationStatus] = useState('detecting');
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // Tunisian cities with coordinates
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

  // Slides data with professional images from Unsplash
  const slides = [
    {
      image: "assets/banner1.jpg",
      title: "RENT TOP-QUALITY EQUIPMENT. STRESS-FREE.",
      description: "Skip the hefty price tag! Camping, fitness, weddings, DIY—get it all for a fraction of retail cost.",
      ctaPrimary: "Browse Rentals ",
      ctaSecondary: "Earn Cash as a Host",
      badge: " Trending Now",
      price: "From $9.99/day | Free Delivery"
    },
    {
      image: "assets/banner2.jpeg",
      title: "CAMPING GEAR SALE: UP TO 40% OFF!",
      description: "Your adventure starts here—save big on tents, grills, and outdoor essentials. Limited stock!",
      ctaPrimary: "Claim Discount ",
      ctaSecondary: "Why Rent vs Buy?",
      badge: " Ends Soon",
      price: "Save $120+ | Member-Only Deals"
    },
    {
      image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "JUST ADDED: PREMIUM EQUIPMENT",
      description: "Be the first to rent high-end tools, party supplies, and tech—exclusive for members.",
      ctaPrimary: "Explore New Arrivals ",
      ctaSecondary: "Unlock 15% Off",
      badge: " Exclusive",
      price: "Members Save 15% + Free Cancellation"
    }
  ];

  // Memoized navigation functions
  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    resetTimer();
  }, [slides.length]);
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await EquipmentService.fetchCategories();
      setCategories(data); // Assuming `data` is an array like [{ id: 1, name: 'Furniture' }, ...]
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    resetTimer();
  }, [slides.length]);

  // Timer control functions
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        goToNext();
      }
    }, 5000);
  }, [goToNext, isPaused]);

  const resetTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    resetTimer();
  }, [resetTimer]);

  // Auto-rotation effect
  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    fetchCategories()
  }, [startTimer]);

  // Detect user location
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLocationStatus('detecting');

    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const city = findNearestCity(position.coords);
        setSelectedCity(city);
        setLocationStatus('granted');
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCityChange = (e) => {
    if (e.target.value === "detect") {
      detectLocation();
    } else {
      setSelectedCity(e.target.value);
      setUserLocation({
        lat: tunisianCities[e.target.value].lat,
        lng: tunisianCities[e.target.value].lng
      });
    }
  };

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

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4,
        duration: 0.8,
        ease: [0.32, 0.72, 0, 1]
      }
    }
  };

  const badgeVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Handle search submission
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

      if (userLocation) {
        params.append("lat", userLocation.lat);
        params.append("lng", userLocation.lng);
      }

      navigate(`/shopgrid?${params.toString()}`);
    } catch (error) {
      console.error("Search error:", error);
      alert("There was an error processing your search");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle popular search click
  const handlePopularSearch = (item) => {
    setSearchQuery(item);
    navigate(`/shopgrid?search=${encodeURIComponent(item)}`);
  };

  return (
    <div className="relative w-full h-[90vh] max-h-[800px] overflow-hidden m-0 p-0">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-20 bg-gray-200/30">
        <motion.div
          className="h-full bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: isPaused ? "100%" : "100%" }}
          transition={{ duration: isPaused ? 0 : 5, ease: "linear" }}
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
            alt="Banner"
            className="w-full h-full object-cover"
            loading="eager"
            fetchpriority="high"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex flex-col items-center justify-center text-white">
            <motion.div
              className="text-center px-4 w-full max-w-6xl"
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              {slides[currentIndex].badge && (
                <motion.span
                  className="inline-block bg-teal-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider"
                  variants={badgeVariants}
                >
                  {slides[currentIndex].badge}
                </motion.span>
              )}

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                {slides[currentIndex].title}
              </h1>
              <form onSubmit={handleSearch} className="mt-4 w-full max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-stretch rounded-lg overflow-hidden shadow-xl bg-white">
                  {/* Area Selector */}
                  <div className="flex-1 min-w-[200px] border-r border-gray-200 relative">
                    <select
                      className="w-full px-4 py-3 bg-white text-gray-700 outline-none appearance-none pr-10 text-sm"
                      value={selectedCity}
                      onChange={handleCityChange}
                      style={{
                        backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center"
                      }}
                      onFocus={pauseTimer}
                      onBlur={resumeTimer}
                    >
                      {Object.keys(tunisianCities).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                      <option value="detect">Detect My Location</option>
                    </select>
                  </div>

                  {/* Category Selector */}
                  <div className="flex-1 min-w-[200px] border-r border-gray-200">
                    <select
                      className="w-full px-4 py-3 bg-white text-gray-700 outline-none appearance-none pr-10 text-sm"
                      style={{
                        backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                      }}
                      onFocus={pauseTimer}
                      onBlur={resumeTimer}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* Search Input */}
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="What are you looking for?"
                        className="w-full pl-4 pr-4 py-3 outline-none text-gray-700 placeholder-gray-400 text-sm"
                        required
                        onFocus={pauseTimer}
                        onBlur={resumeTimer}
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    disabled={isSearching}
                    className={`flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 font-medium transition ${isSearching ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    onMouseDown={pauseTimer}
                    onMouseUp={resumeTimer}
                  >
                    Search
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
                  <span className="text-white/80">Popular:</span>
                  {['Tents', 'Fitness Gear', 'Wedding Decor', 'Power Tools'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePopularSearch(item)}
                      className="text-white hover:text-teal-300 transition-colors"
                      onMouseDown={pauseTimer}
                      onMouseUp={resumeTimer}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </form>



              {slides[currentIndex].price && (
                <div className="text-xl font-semibold mb-8 text-teal-300">
                  {slides[currentIndex].price}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 w-full sm:w-auto px-8 py-4 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-teal-500/20"
                >
                  {slides[currentIndex].ctaPrimary}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 w-full sm:w-auto px-8 py-4 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-white/20"
                >
                  {slides[currentIndex].ctaSecondary}
                  <Star className="w-5 h-5 fill-white/20 stroke-white" />
                </button>
              </div>

              {/* Search bar with location and category selectors */}

            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all duration-300 shadow-lg border border-white/20"
        aria-label="Previous"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6 text-white hover:text-teal-300" />
      </button>
      <button
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all duration-300 shadow-lg border border-white/20"
        aria-label="Next"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6 text-white hover:text-teal-300" />
      </button>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-teal-500 w-8" : "bg-white/50 hover:bg-white/80"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}