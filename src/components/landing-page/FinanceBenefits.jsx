import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, Clock, Smartphone, Zap, 
  Shield, Users, Globe, BarChart2,
  Truck, Warehouse, Cpu, CreditCard, ArrowRight, Check
} from "lucide-react";

const PartnerBenefits = () => {
  const partnerTypes = [
    {
      name: "Delivery Partners",
      icon: <Truck className="w-5 h-5" />,
      color: "bg-teal-500",
      bgImage: "/assets/dili.jpg"
    },
    {
      name: "Fleet Owners",
      icon: <Warehouse className="w-5 h-5" />,
      color: "bg-teal-600",
      bgImage: "/assets/fleet.jpg"
    },
    {
      name: "Tech Providers",
      icon: <Cpu className="w-5 h-5" />,
      color: "bg-teal-400",
      bgImage: "/assets/tech.jpeg"
    },
    {
      name: "Financial Partners",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-teal-300",
      bgImage: "/assets/tp2.jpg"
    }
  ];

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Premium Earnings",
      description: "Top-tier compensation with performance bonuses across all partner types",
      stat: "20-35% above market",
      categories: ["Delivery", "Fleet"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Comprehensive Protection",
      description: "$5M liability coverage and equipment insurance for all partners",
      stat: "Zero deductible",
      categories: ["Delivery", "Fleet"]
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Flexible Engagement",
      description: "Choose your level of involvement from full-time to project-based",
      stat: "100% schedule control",
      categories: ["All"]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Partner Network",
      description: "Access to our exclusive community of logistics professionals",
      stat: "5,000+ partners",
      categories: ["All"]
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Standards",
      description: "Certified compliance with international logistics regulations",
      stat: "50+ countries",
      categories: ["Tech", "Financial"]
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: "Growth Analytics",
      description: "Real-time business insights and performance dashboards",
      stat: "95% adoption rate",
      categories: ["Fleet", "Tech"]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Tech Integration",
      description: "Seamless API connectivity with our logistics platform",
      stat: "4.9/5 satisfaction",
      categories: ["Tech"]
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Partner Portal",
      description: "Mobile-optimized management tools for all partner types",
      stat: "24/7 access",
      categories: ["All"]
    }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Hero Section with Premium Background */}
      <div className="relative h-[700px]">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4488641/pexels-photo-4488641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-800/60 to-teal-700/30" />
        
        <div className="relative z-10 h-full flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <motion.div 
              className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium mb-8 border border-white/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Check className="w-5 h-5 mr-2" />
              Trusted Partner Network
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-[4rem] font-bold text-white mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-teal-300 to-white bg-clip-text text-transparent">
                Partner Benefits
              </span> <br/>Designed to Scale
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-teal-100 max-w-4xl mx-auto mb-12"
            >
              Comprehensive solutions for all types of logistics partners, from independent operators to enterprise providers
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(255,255,255,0.2)"
                }}
                whileTap={{ 
                  scale: 0.98,
                  boxShadow: "0 10px 20px -5px rgba(255,255,255,0.1)"
                }}
                className="px-10 py-5 bg-white text-teal-700 font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3"
              >
                Join Our Network
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.15)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 transition-all"
              >
                Explore Benefits
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-white">
        {/* Partner Type Showcase */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1]
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                Partnership Options
              </span> <br/>for Every Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the partnership model that aligns with your expertise and goals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerTypes.map((type, index) => (
              <div
                key={index}
                className="relative h-80 rounded-3xl overflow-hidden group"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000 group-hover:scale-110"
                  style={{ backgroundImage: `url(${type.bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-800/50 to-teal-700/30" />
                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                  <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    {type.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{type.name}</h3>
                  <button className="text-left text-teal-200 font-semibold flex items-center gap-2 group">
                    Learn more
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-b from-white to-gray-50 py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {partnerTypes.map((type) => (
                <button
                  key={type.name}
                  className={`px-6 py-3 rounded-full ${type.color}/10 text-gray-800 font-medium flex items-center gap-2 transition-all border border-gray-200 hover:border-transparent`}
                >
                  <span className={`w-3 h-3 rounded-full ${type.color}`}></span>
                  {type.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  <div className="h-full bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
                    <div className="p-8">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6 shadow-sm">
                        <div className="text-white">
                          {benefit.icon}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm mb-6">{benefit.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {benefit.categories.map(cat => (
                          <span key={cat} className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-600">
                            {cat}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-base font-bold text-teal-600">
                        {benefit.stat}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="relative py-32 overflow-hidden">
         <div className="absolute inset-0 bg-[url('/assets/comm1.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-teal-800/80" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8"
            >
              Ready to transform your logistics business?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-teal-100 max-w-3xl mx-auto mb-12"
            >
              Join thousands of partners growing with our platform
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-6"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(255,255,255,0.3)"
                }}
                whileTap={{ 
                  scale: 0.98,
                  boxShadow: "0 10px 20px -5px rgba(255,255,255,0.1)"
                }}
                className="px-12 py-5 bg-white text-teal-700 font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3"
              >
                Get Started
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.15)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-5 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 transition-all"
              >
                Contact Sales
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerBenefits;