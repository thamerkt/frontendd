import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart2, Users, CalendarDays, Box, Settings, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const SidebarAdmin = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const isAdminPage = location.pathname.startsWith('/admin');

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { name: "Analytics", icon: BarChart2, path: "/admin/analytics" },
    { name: "Clients", icon: Users, path: "/admin/clients" },
    { name: "Bookings", icon: CalendarDays, path: "/admin/bookings" },
    { name: "Products", icon: Box, path: "/admin/products" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  if (!isAdminPage) return null;

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col"
    >
      {/* Logo Section with Animation */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="p-6 pb-4 border-b border-gray-100"
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg p-2"
          >
            
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold text-gray-800"
          >
            Everything Rentals
          </motion.h1>
        </div>
        <motion.p 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-gray-400 mt-1 uppercase tracking-wider"
        >
          Admin Console
        </motion.p>
      </motion.div>

      {/* Navigation with Advanced Animations */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative block px-3 py-2"
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {({ isActive }) => (
                <>
                  <AnimatePresence>
                    {hoveredItem === item.path && (
                      <motion.span
                        layoutId="navHover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-50 rounded-lg"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div 
                    className={`relative z-10 flex items-center transition-colors ${
                      isActive ? 'text-teal-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    whileHover={{ x: 3 }}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        color: isActive ? '#0d9488' : '#4b5563'
                      }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Icon size={18} className="mr-3" />
                    </motion.div>
                    <motion.span className="text-sm font-medium">
                      {item.name}
                    </motion.span>
                    <motion.div 
                      animate={{ 
                        opacity: isActive ? 1 : 0,
                        x: isActive ? 0 : -5
                      }}
                      className="ml-auto"
                    >
                      <ChevronRight size={16} />
                    </motion.div>
                  </motion.div>

                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-teal-500 rounded-l-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile with Animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 border-t border-gray-100"
      >
        <div className="flex items-center">
          <motion.div 
            whileHover={{ rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-inner"
          >
            <span className="text-teal-600 font-medium text-sm">AD</span>
          </motion.div>
          <div className="ml-3 overflow-hidden">
            <motion.p 
              initial={{ x: 10 }}
              animate={{ x: 0 }}
              className="text-sm font-medium text-gray-700 truncate"
            >
              Admin User
            </motion.p>
            <motion.p 
              initial={{ x: 15 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-gray-500 truncate"
            >
              administrator@everythingrentals.com
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SidebarAdmin;