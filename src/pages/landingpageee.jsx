import { motion } from "framer-motion";

import AssuranceSection from "../components/landing-page/Assurance";
import FinanceBenefits from '../components/landing-page/FinanceBenefits';
import DeliveryNetwork from '../components/landing-page/DeliveryNetwork';
import PartnerTestimonials from '../components/landing-page/PartnerTestimonials';

import PartnerHeroSection from "../components/landing-page/HeroSection";
const LandingPagePartner = () => {
  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        when: "beforeChildren"
      }
    }
  };

  const childVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <PartnerHeroSection />
      </motion.section>

      {/* Assurance Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative z-10"
      >
        <AssuranceSection />
      </motion.section>

      {/* Finance Benefits */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <FinanceBenefits />
      </motion.section>

      {/* Delivery Network */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <DeliveryNetwork />
      </motion.section>

      {/* New Partner Content Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-gray-50 py-16"
      >
        
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <PartnerTestimonials />
      </motion.section>

      {/* Global Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gray-900 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold">
                Ready to <span className="text-teal-400">Partner With Us?</span>
              </h3>
              <p className="text-gray-400 mt-2">
                Join 5,000+ delivery professionals growing their business with us
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-teal-500/20"
            >
              Start Application
            </motion.button>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Equipment Delivery Partners Network. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {['Privacy Policy', 'Terms of Service', 'Support Center'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className="text-gray-400 hover:text-white text-sm transition hover:underline"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPagePartner;