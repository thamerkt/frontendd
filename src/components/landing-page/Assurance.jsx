import { ShieldCheck, Users, Globe, FileSearch, Clock, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex flex-col h-full">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white mb-6 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

const AssuranceSection = () => {
  const partnerFeatures = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Enterprise-Grade Protection",
      description: "$5M blanket coverage with AI-driven instant claim processing and fraud detection"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Elite Partner Network",
      description: "Exclusive access to our vetted global logistics community and business opportunities"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Compliance",
      description: "Automated compliance with international trade regulations and customs protocols"
    },
    {
      icon: <FileSearch className="w-6 h-6" />,
      title: "Smart Risk Management",
      description: "Real-time predictive analytics for high-value shipments with automated rerouting"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Priority Concierge",
      description: "24/7 dedicated account managers with 10-minute response SLA and escalation paths"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Advanced Tech Stack",
      description: "Seamless API integration with TMS, WMS, and ERP systems including SAP/Oracle"
    }
  ];

  return (
    <section className="relative py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-teal-500/10 text-teal-600 text-sm font-medium mb-6"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Partner Assurance Program
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-gray-900 mb-6 leading-tight">
            Beyond Delivery:<br />
            <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
              Strategic Logistics Partnerships
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            End-to-end business infrastructure combining protection, technology, and growth opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partnerFeatures.map((feature, index) => (
            <FeatureCard key={index} index={index} {...feature} />
          ))}
        </div>

        <div className="mt-24 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to transform your logistics operations?
              </h3>
              <p className="text-teal-100/90 max-w-2xl">
                Join the industry's most comprehensive partner network with exclusive benefits
              </p>
            </div>
            
            <motion.button
              animate={{
                scale: [1, 1.03, 1],
                boxShadow: [
                  "0 4px 15px rgba(255, 255, 255, 0.2)",
                  "0 6px 20px rgba(255, 255, 255, 0.3)", 
                  "0 4px 15px rgba(255, 255, 255, 0.2)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white text-teal-700 font-bold rounded-lg flex items-center gap-3"
            >
              Apply Now
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssuranceSection;