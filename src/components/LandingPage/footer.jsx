import { FaTwitter, FaLinkedinIn, FaFacebookF, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Company Section */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
                <motion.li key={item} whileHover={{ x: 3 }}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Solutions Section */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Solutions</h4>
            <ul className="space-y-3">
              {['Talent Acquisition', 'Skill Development', 'Leadership Programs'].map((item) => (
                <motion.li key={item} whileHover={{ x: 3 }}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <motion.li key={item} whileHover={{ x: 3 }}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              {[
                { icon: <FaFacebookF className="w-4 h-4" />, label: "Facebook" },
                { icon: <FaTwitter className="w-4 h-4" />, label: "Twitter" },
                { icon: <FaLinkedinIn className="w-4 h-4" />, label: "LinkedIn" }
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -3 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            
            {/* Professional Partner Section */}
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-400 mb-2">
                Explore partnership opportunities
              </p>
              <div className="flex items-center gap-3">
                <motion.a
                  href="#"
                  className="text-white hover:text-teal-300 transition-colors flex items-center gap-1 text-sm font-medium"
                  whileHover={{ x: 3 }}
                >
                  <span>Partner Program</span>
                  <FaArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-md transition-colors"
                >
                  Apply Now
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <a href="#" className="text-2xl font-bold">
              <span className="text-white">L</span>
              <span className="text-teal-400">FT</span>
            </a>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} LFT, Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;