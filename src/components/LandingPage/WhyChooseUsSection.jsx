import { motion } from "framer-motion";
import { 
  Users, Shield, DollarSign, 
  CheckCircle, Clock, Globe,
  ArrowRight
} from "lucide-react";

export default function WhyChooseUsSection() {
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

  const features = [
    {
      icon: <Users className="w-6 h-6 text-teal-500" />,
      title: "Peer-to-Peer Community",
      description: "Connect with a network of verified renters and lenders in your area",
      highlights: [
        "Local inventory tracking",
        "User verification system",
        "Community ratings"
      ]
    },
    {
      icon: <Shield className="w-6 h-6 text-teal-500" />,
      title: "Secure Transactions",
      description: "End-to-end protected rentals with our safety guarantee",
      highlights: [
        "Encrypted payments",
        "Damage protection",
        "24/7 support"
      ]
    },
    {
      icon: <DollarSign className="w-6 h-6 text-teal-500" />,
      title: "Cost Efficient",
      description: "Save up to 80% compared to buying new equipment",
      highlights: [
        "No maintenance costs",
        "Flexible pricing",
        "Membership discounts"
      ]
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Renters", icon: <Users className="w-4 h-4" /> },
    { value: "24/7", label: "Support", icon: <Clock className="w-4 h-4" /> },
    { value: "50+", label: "Categories", icon: <Globe className="w-4 h-4" /> },
    { value: "100%", label: "Verified", icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background image with dark overlay - now showing sharing economy concept */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="/assets/why.png" 
          alt="Community sharing background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-48 h-48 bg-teal-400 rounded-full filter blur-3xl"></div>
      </div>

      <motion.div 
        className="container mx-auto px-4 py-16 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
      >
        {/* Section header */}
        <motion.div className="text-center mb-12" variants={item}>
          <span className="inline-block bg-teal-900/30 text-teal-400 text-xs font-medium px-3 py-1 rounded-full mb-3 border border-teal-400/20">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            The Rental Platform <span className="text-teal-400">You Can Trust</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base">
            Discover why thousands choose our platform for their rental needs every day
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-12"
          variants={container}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-teal-400/30 transition-all duration-300"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-teal-900/30 rounded-lg flex items-center justify-center mb-4 border border-teal-400/20">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 mb-3 text-sm">{feature.description}</p>
              <ul className="space-y-1.5">
                {feature.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-400 mr-1.5 flex-shrink-0" />
                    <span className="text-xs">{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 max-w-3xl mx-auto"
          variants={item}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={item}
                custom={index}
              >
                <div className="text-xl font-bold text-teal-400 mb-1 flex items-center justify-center">
                  {stat.icon}
                  <span className="ml-1.5">{stat.value}</span>
                </div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-12"
          variants={item}
        >
          <motion.button
            className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-teal-600 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 hover:text-white focus:ring-4 focus:ring-teal-800"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10 flex items-center text-base font-semibold">
              Explore All Features
              <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-transparent transition-all duration-300"></span>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}