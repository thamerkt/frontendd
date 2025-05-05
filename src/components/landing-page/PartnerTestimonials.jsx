import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const PartnerTestimonials = () => {
  const testimonials = [
    {
      quote: "The comprehensive insurance coverage gave me complete peace of mind when transporting high-value equipment across state lines.",
      name: "Marcus D.",
      type: "Delivery Partner since 2021",
      role: "Heavy Equipment Specialist",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80&fit=crop&crop=faces"
    },
    {
      quote: "Their financing program helped me upgrade to a larger truck fleet, allowing me to double my monthly earnings while reducing maintenance costs.",
      name: "Lisa T.",
      type: "Owner-Operator",
      role: "Regional Logistics Provider",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80&fit=crop&crop=faces"
    },
    {
      quote: "In my 10 years in logistics, I've never experienced such reliable payments and transparent fee structures as with this partner network.",
      name: "Carlos M.",
      type: "Fleet Owner",
      role: "National Distribution",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80&fit=crop&crop=faces"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  // Animation variants
  const cardVariants = {
    enter: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 100 : -100,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction < 0 ? 100 : -100,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    })
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4"
          >
            Success Stories
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by <span className="text-teal-600">Industry Leaders</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from partners who've transformed their businesses with our platform
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative h-[400px] md:h-[450px]">
          {/* Navigation Arrows */}
          <motion.button
            onClick={prevTestimonial}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-xl hover:shadow-2xl transition-all border border-gray-200 hover:border-teal-300"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          
          <motion.button
            onClick={nextTestimonial}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-xl hover:shadow-2xl transition-all border border-gray-200 hover:border-teal-300"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </motion.button>

          {/* Testimonial Cards */}
          <div className="relative h-full w-full">
            <AnimatePresence custom={currentIndex} initial={false}>
              <motion.div
                key={currentIndex}
                custom={1}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-2xl mx-auto border border-gray-100">
                  <div className="p-10">
                    <Quote className="w-10 h-10 text-teal-500 opacity-20 mb-6" />
                    <p className="text-xl text-gray-700 mb-8 leading-relaxed">"{testimonials[currentIndex].quote}"</p>
                    
                    <div className="flex items-center">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-16 h-16 rounded-full overflow-hidden mr-6 border-2 border-teal-100"
                      >
                        <img 
                          src={testimonials[currentIndex].image} 
                          alt={testimonials[currentIndex].name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </motion.div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{testimonials[currentIndex].name}</div>
                        <div className="text-gray-500">{testimonials[currentIndex].role}</div>
                        <div className="flex mt-2">
                          {[...Array(5)].map((_, i) => (
                            <motion.svg 
                              key={i}
                              whileHover={{ scale: 1.2 }}
                              className="w-5 h-5 text-yellow-400" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </motion.svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-10 py-5 border-t border-gray-100">
                    <div className="text-sm font-semibold text-teal-600">{testimonials[currentIndex].type}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12 gap-2">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-teal-600" : "bg-gray-300"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerTestimonials;