import { motion } from "framer-motion";
const Footer=()=>{

    return(
        <footer className="bg-gray-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
                      <ul className="space-y-3">
                        {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
                          <li key={item}>
                            <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
                      <ul className="space-y-3">
                        {['Help Center', 'Safety Center', 'Community Guidelines', 'Contact Us'].map((item) => (
                          <li key={item}>
                            <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
                      <ul className="space-y-3">
                        {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'GDPR'].map((item) => (
                          <li key={item}>
                            <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect</h4>
                      <div className="flex gap-4 mb-6">
                        {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                          <a 
                            key={social} 
                            href="#" 
                            className="text-gray-400 hover:text-white transition"
                          >
                            {social}
                          </a>
                        ))}
                      </div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Download Our App</h4>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ y: -2 }}
                          className="bg-black/30 border border-gray-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                          </svg>
                          App Store
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2 }}
                          className="bg-black/30 border border-gray-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z" />
                          </svg>
                          Google Play
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <a href="#" className="text-2xl font-bold">Equipment<span className="text-teal-400">Rental</span></a>
                    </div>
                    <div className="text-sm text-gray-400">
                      © {new Date().getFullYear()} Equipment Rental, Inc. All rights reserved.
                    </div>
                  </div>
                </div>
              </footer>



    )
}
export default Footer();