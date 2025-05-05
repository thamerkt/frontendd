import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowRight, Star, ChevronDown, CheckCircle, ArrowDown,  MapPin, ChevronRightCircle, MessageCircle, Mail, Phone    } from "lucide-react";
import { Store } from "lucide-react"

const Banner = ({ 
  title, 
  description, 
  buttons, 
  searchPlaceholder, 
  onSearch,
  autoRotate = true,
  rotationInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  // Memoized navigation functions
  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? 0 : prev - 1)); // Only allow previous if not first slide
  }, []);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev === 0 ? 0 : 0)); // Single slide for Banner
  }, []);

  // Auto-rotation (optional)
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(goToNext, rotationInterval);
    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval, goToNext]);

  // Animation variants (same as HeroSection)
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

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div 
      className="relative w-full h-[90vh] max-h-[800px] overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Progress bar (optional) */}
      {autoRotate && (
        <div className="absolute top-0 left-0 right-0 h-1 z-20 bg-gray-200/30">
          <motion.div
            className="h-full bg-teal-500"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: rotationInterval/1000, ease: "linear" }}
            key={currentIndex}
          />
        </div>
      )}

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
          {/* Background image with parallax effect */}
          <motion.img
            src="/assets/bg1.jpg"
            alt="Banner"
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: isHovering ? 1.05 : 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex flex-col items-center justify-center text-white">
            <motion.div 
              className="text-center px-4 w-full max-w-6xl"
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                {title}
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl mb-6 max-w-3xl mx-auto">
                {description}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {buttons.map((button, index) => (
                  <motion.button
                    key={index}
                    className={`
                      flex items-center justify-center gap-2 
                      ${index === 0 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20'}
                      w-full sm:w-auto px-8 py-4 text-white font-semibold text-lg 
                      rounded-lg transition-all duration-300 transform hover:scale-[1.02] 
                      shadow-lg ${index === 0 ? 'hover:shadow-teal-500/20' : ''}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={button.onClick}
                  >
                    {button.label}
                    {index === 0 && <ArrowRight className="w-5 h-5" />}
                    {index !== 0 && <Star className="w-5 h-5 fill-white/20 stroke-white" />}
                  </motion.button>
                ))}
              </div>

              {/* Search bar */}
              <motion.form 
                onSubmit={handleSearch}
                className="mt-4 w-full max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div className="relative flex items-center bg-white rounded-full overflow-hidden shadow-xl">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 px-6 py-4 outline-none text-gray-800 text-lg placeholder-gray-400"
                  />
                  <motion.button 
                    type="submit"
                    className="absolute right-2 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Search"
                  >
                    <Search className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <motion.button
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/20"
        aria-label="Previous"
        onClick={goToPrevious}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="w-6 h-6 text-white hover:text-teal-300" />
      </motion.button>
      <motion.button
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/20"
        aria-label="Next"
        onClick={goToNext}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="w-6 h-6 text-white hover:text-teal-300" />
      </motion.button>
    </div>
  );
};




import {  AnimatePresence } from "framer-motion";


const ProcessSection = ({ sections }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  };

  const arrowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      y: [0, -5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 transform-gpu blur-3xl">
        <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-r from-teal-300 to-blue-400 opacity-20" 
          style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }} 
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Streamlined Rental <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Process</span>
          </h2>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            Get your equipment rented in just a few simple steps
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-600" />
          </div>
        </motion.div>

        {/* Process steps */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-16 max-w-4xl"
        >
          {sections.map((step, index) => (
            <div key={index} className="relative">
              {/* Animated arrow between steps */}
              {index > 0 && (
                <motion.div
                  variants={arrowVariants}
                  className="flex justify-center my-6"
                >
                  <ArrowDown className="text-teal-600 w-8 h-8" />
                </motion.div>
              )}

              {/* Step card */}
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className={`flex flex-col md:flex-row gap-8 p-8 rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 ${
                  index % 2 === 0 ? '' : 'md:flex-row-reverse'
                }`}
              >
                {/* Image */}
                <div className="relative w-full md:w-1/2 aspect-video overflow-hidden rounded-xl">
                  <motion.img
                    src={step.image}
                    alt={step.title}
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent" />
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    viewport={{ once: true }}
                  >
                    {step.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-gray-600 mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    viewport={{ once: true }}
                  >
                    {step.description}
                  </motion.p>

                  <motion.ul 
                    className="space-y-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {step.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start"
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: (i) => ({
                            opacity: 1,
                            x: 0,
                            transition: {
                              delay: 0.4 + (index * 0.1) + (i * 0.05)
                            }
                          })
                        }}
                      >
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-teal-500 mt-0.5 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden text-lg font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-lg hover:shadow-teal-500/30 transition-all duration-300">
            Get Started Today
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
const PopularRentals = ({ title, subtitle, rentals, currentIndex, handlePrev, handleNext }) => {
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.5
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    })
  };

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
        <div className="text-left mb-6 md:mb-0">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-4"
          >
            {subtitle}
          </motion.span>
          <div className="mb-6">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 relative inline-block"
            >
              {title}
              <span className="absolute bottom-[-8px] left-0 w-20 h-1.5 bg-teal-500 rounded-full"></span>
            </motion.h2>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex items-center gap-4"
        >
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
        </motion.div>
      </div>

      {/* Rental Cards */}
      <div className="relative overflow-hidden h-[580px] mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex justify-center gap-8 px-4"
          >
            {rentals.slice(currentIndex, currentIndex + 3).map((rental) => (
              <motion.div
                key={rental.id}
                whileHover={{ y: -8 }}
                className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Image with category badge */}
                <div className="relative h-64">
                  <motion.img
                    src={rental.image}
                    alt={rental.stuffname}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  />
                  {rental.category && (
                    <span className="absolute top-4 left-4 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {rental.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{rental.stuffname}</h3>
                    {rental?.stuff_management?.rating !== undefined && (
                      <div className="flex items-center bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-semibold">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        {rental.stuff_management.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{rental.short_description}</p>

                  <div className="mt-auto space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Store className="w-4 h-4 mr-2 text-teal-600" />
                      <span>{rental.store}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2 text-teal-600" />
                      <span>{rental.location}</span>
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-500 text-sm block">Starting from</span>
                      <div className="flex items-end gap-1">
                        <p className="text-2xl font-bold text-teal-600">${rental.price_per_day}</p>
                        <span className="text-gray-400 text-sm mb-1">/day</span>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                      aria-label={`Rent ${rental.stuffname}`}
                    >
                      Rent Now
                      <ChevronRightCircle className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <button className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200 shadow-lg hover:shadow-teal-200/50">
          View All Rentals
          <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
};


const Features = ({ title, subtitle, description, features, onExploreMore }) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 bg-teal-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-teal-400 rounded-full filter blur-3xl"></div>
      </div>

      <motion.div 
        className="container mx-auto px-6 py-24 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
      >
        {/* Section header */}
        <motion.div className="text-center mb-16" variants={item}>
          <motion.span 
            className="inline-block bg-teal-900/30 text-teal-400 text-sm font-medium px-4 py-1 rounded-full mb-4 border border-teal-400/20"
            variants={item}
          >
            {subtitle}
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            variants={item}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto text-lg"
            variants={item}
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Features grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-20"
          variants={container}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-teal-400/30 transition-all duration-300"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <div className="w-14 h-14 bg-teal-900/30 rounded-lg flex items-center justify-center mb-6 border border-teal-400/20">
                <img 
                  src={feature.icon} 
                  alt={feature.title} 
                  className="w-8 h-8 text-teal-400" 
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              {feature.highlights && (
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 text-teal-400 mr-2 flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-8"
          variants={item}
        >
          <motion.button
            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-teal-600 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 hover:text-white focus:ring-4 focus:ring-teal-800"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onExploreMore}
          >
            <span className="relative z-10 flex items-center text-lg font-semibold">
              Explore More
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-transparent transition-all duration-300"></span>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

 // Using Lucide icons for consistency

import { motion } from "framer-motion";
import { User, Building2,  BadgeCheck } from "lucide-react";

const RentEquipmentChoice = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)"
    },
    tap: {
      scale: 0.98
    }
  };

  const featureItem = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Power Your Projects With <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Flexible Rental</span>
        </h2>
        <p className="mt-6 text-xl leading-8 text-gray-600">
          Choose the perfect rental solution tailored to your needs
        </p>
      </motion.div>

      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        {/* Personal Plan */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          variants={cardVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col justify-between rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10"
        >
          <div>
            <div className="flex items-center gap-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                <User className="h-7 w-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold leading-8 tracking-tight text-gray-900">
                Individual & Creator
              </h3>
            </div>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Perfect for personal projects, creative work, and home improvements with no business requirements.
            </p>
            
            <ul role="list" className="mt-8 space-y-4">
              {[
                "No monthly commitments",
                "1,000+ tools available",
                "Weekend special pricing",
                "24/7 customer support"
              ].map((feature, i) => (
                <motion.li 
                  key={feature}
                  custom={i}
                  variants={featureItem}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-center gap-x-3"
                >
                  <BadgeCheck className="h-5 w-5 flex-none text-teal-600" />
                  <span className="text-gray-700">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="mt-10 flex items-center justify-center gap-x-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:from-teal-600 hover:to-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            Start Personal Rental <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>

        {/* Business Plan */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          variants={cardVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col justify-between rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10"
        >
          <div>
            <div className="flex items-center gap-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold leading-8 tracking-tight text-gray-900">
                Business & Team
              </h3>
            </div>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Scale operations flexibly with corporate accounts, volume discounts, and dedicated support.
            </p>
            
            <ul role="list" className="mt-8 space-y-4">
              {[
                "Volume discounts",
                "Dedicated account manager",
                "Equipment fleet management",
                "Priority 24/7 support"
              ].map((feature, i) => (
                <motion.li 
                  key={feature}
                  custom={i}
                  variants={featureItem}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-center gap-x-3"
                >
                  <BadgeCheck className="h-5 w-5 flex-none text-blue-600" />
                  <span className="text-gray-700">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="mt-10 flex items-center justify-center gap-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:from-blue-600 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Explore Business Plans <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-16 text-center text-lg font-medium text-gray-500"
      >
        Trusted by <span className="font-bold text-gray-700">25,000+ individuals</span> and{" "}
        <span className="font-bold text-gray-700">3,500+ businesses</span> worldwide
      </motion.p>
    </div>
  );
};




const FAQSection = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = activeCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const categories = ["All", ...new Set(faqs.map(faq => faq.category))];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const answerVariants = {
    open: { 
      opacity: 1,
      height: "auto",
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    closed: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="relative bg-gray-900 py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-teal-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-teal-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.span 
            className="inline-block bg-teal-900/30 text-teal-400 text-sm font-medium px-4 py-1 rounded-full mb-4 border border-teal-400/20"
            variants={itemVariants}
          >
            Need Help?
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            variants={itemVariants}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto text-lg"
            variants={itemVariants}
          >
            Everything you need to know about our rental platform
          </motion.p>
        </motion.div>

        {/* Category filter */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category, i) => (
            <motion.button
              key={`category-${category}`}  // Unique key for categories
              variants={itemVariants}
              onClick={() => {
                setActiveCategory(category);
                setOpenIndex(null);
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-teal-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={`faq-${faq.category}-${index}`}  // Unique composite key
              variants={itemVariants}
              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-teal-400 transition-colors"
              whileHover={{ y: -5 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full p-6 text-left"
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-semibold text-white">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-teal-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    key={`answer-${index}`}  // Unique key for answer
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={answerVariants}
                    className="px-6 pb-6 text-gray-300"
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.div 
          className="mt-20 bg-gray-800 rounded-2xl p-8 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
          <p className="text-gray-400 mb-6">
            Our support team is available 24/7 to help you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-5 h-5" />
              Email Support
            </motion.button>
            <motion.button
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-5 h-5" />
              Call Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export  {PopularRentals,Banner,Features,ProcessSection,RentEquipmentChoice,FAQSection};


