import { motion } from "framer-motion";
import { Truck, Route, Clock, Warehouse, Zap, CheckCircle, ArrowRight } from "lucide-react";

const DeliveryNetwork = () => {
  // Updated image URLs with reliable sources
  const images = {
    background: [
      "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    ],
    main: [
      "https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      "https://images.pexels.com/photos/6269868/pexels-photo-6269868.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    ]
  };

  // Fallback image handler
  const addFallback = (e, fallbacks) => {
    const target = e.target;
    const currentSrc = target.currentSrc || target.src;
    const currentIndex = fallbacks.indexOf(currentSrc);
    
    if (currentIndex < fallbacks.length - 1) {
      target.src = fallbacks[currentIndex + 1];
    }
  };

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-50 to-white opacity-90"></div>
        <img 
          src={images.background[0]}
          alt=""
          className="absolute top-1/2 left-1/2 w-[120%] h-[120%] object-cover transform -translate-x-1/2 -translate-y-1/2 opacity-10"
          loading="lazy"
          onError={(e) => addFallback(e, images.background)}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center mb-16 md:mb-24"
        >
          <motion.span
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            Optimized Logistics
          </motion.span>
          
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-gray-900 mb-6 leading-tight">
            Intelligent <span className="text-teal-600">Nationwide</span> Delivery Network
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Our AI-driven logistics platform delivers <span className="font-semibold text-teal-600">98.7% on-time performance</span> with real-time route optimization
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-10"
          >
            {[
              {
                icon: <Route className="w-6 h-6" />,
                title: "Dynamic Route Optimization",
                description: "Machine learning analyzes traffic, weather, and historical data to determine optimal routes in real-time, reducing delivery times by 35% on average."
              },
              {
                icon: <Warehouse className="w-6 h-6" />,
                title: "Strategic Warehouse Network",
                description: "150+ strategically located fulfillment centers ensure inventory is always within 100 miles of 95% of our customers."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "24/7 Monitoring & Support",
                description: "Our dedicated operations center provides real-time shipment tracking and proactive issue resolution at any hour."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-6"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 text-teal-600 shadow-sm">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            {/* CTA with hover animation */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
              >
                Request Network Analysis
                <ArrowRight className="w-5 h-5 ml-3" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Image showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50 h-full">
              <div className="aspect-w-16 aspect-h-9 w-full h-full">
                <img 
                  src={images.main[0]}
                  alt="Our nationwide delivery network in action"
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => addFallback(e, images.main)}
                />
              </div>
              
              {/* Fixed On-time delivery rate card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute bottom-4 right-4 bg-white p-4 sm:p-6 rounded-xl shadow-xl border border-gray-100 z-10"
                style={{ maxWidth: '200px' }}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-teal-100 p-2 sm:p-3 rounded-full flex-shrink-0"
                  >
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  </motion.div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">On-time delivery rate</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">98.7%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar with entrance animation */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-24 bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-8 shadow-lg"
        >
          <div className="grid md:grid-cols-4 gap-6 md:gap-8 text-white">
            {[
              { value: "2,450+", label: "Active Vehicles" },
              { value: "150+", label: "Warehouses" },
              { value: "99.5%", label: "Tracking Accuracy" },
              { value: "24/7", label: "Support Coverage" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-teal-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DeliveryNetwork;