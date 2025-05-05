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
      icon: <Users className="w-8 h-8 text-teal-500" />,
      title: "Peer-to-Peer Community",
      description: "Connect with a network of verified renters and lenders in your area",
      highlights: [
        "Local inventory tracking",
        "User verification system",
        "Community ratings"
      ]
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-500" />,
      title: "Secure Transactions",
      description: "End-to-end protected rentals with our safety guarantee",
      highlights: [
        "Encrypted payments",
        "Damage protection",
        "24/7 support"
      ]
    },
    {
      icon: <DollarSign className="w-8 h-8 text-teal-500" />,
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
    { value: "10,000+", label: "Active Renters", icon: <Users className="w-5 h-5" /> },
    { value: "24/7", label: "Support", icon: <Clock className="w-5 h-5" /> },
    { value: "50+", label: "Categories", icon: <Globe className="w-5 h-5" /> },
    { value: "100%", label: "Verified", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background image with dark overlay - now showing sharing economy concept */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Community sharing background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
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
          <span className="inline-block bg-teal-900/30 text-teal-400 text-sm font-medium px-4 py-1 rounded-full mb-4 border border-teal-400/20">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Rental Platform <span className="text-teal-400">You Can Trust</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Discover why thousands choose our platform for their rental needs every day
          </p>
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
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 text-teal-400 mr-2 flex-shrink-0" />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 max-w-4xl mx-auto"
          variants={item}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={item}
                custom={index}
              >
                <div className="text-3xl font-bold text-teal-400 mb-2 flex items-center justify-center">
                  {stat.icon}
                  <span className="ml-2">{stat.value}</span>
                </div>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-16"
          variants={item}
        >
          <motion.button
            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-teal-600 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 hover:text-white focus:ring-4 focus:ring-teal-800"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10 flex items-center text-lg font-semibold">
              Explore All Features
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-transparent transition-all duration-300"></span>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}