import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BarChart2, Users, CalendarDays,
  Box, Settings, ChevronRight, LogOut, History
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const SidebarAdmin = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const isAdminPage = location.pathname.startsWith('/admin');

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/admin/dashbord" },
    { name: "Analytics", icon: BarChart2, path: "/admin/analytics" },
    { name: "Clients", icon: Users, path: "/admin/clients" },
    { name: "Bookings", icon: CalendarDays, path: "/admin/booking" },
    { name: "Products", icon: Box, path: "/admin/products" },
    { name: "History", icon: History, path: "/admin/history" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  if (!isAdminPage) return null;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col overflow-y-auto z-50 transition-all duration-300 
        ${isExpanded ? "w-64" : "w-20"}`}
    >
      {/* Logo Section */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 17L12 22L21 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12L12 17L21 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.h1 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
                  Everything Rentals
                </motion.h1>
                <motion.p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  Admin Console
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          <ChevronRight className={`transition-transform ${!isExpanded ? "rotate-180" : ""}`} size={18} />
        </motion.button>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative block px-3 py-2.5"
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {({ isActive }) => (
                <>
                  <AnimatePresence>
                    {hoveredItem === item.path && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-teal-50 rounded-lg"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    className={`relative z-10 flex items-center transition-colors ${isActive ? 'text-teal-600' : 'text-gray-600 hover:text-gray-900'}`}
                    whileHover={{ x: isExpanded ? 3 : 0 }}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.15 : 1,
                        color: isActive ? '#0d9488' : isExpanded ? '#4b5563' : '#0d9488'
                      }}
                      transition={{ type: "spring", stiffness: 500 }}
                      className="flex-shrink-0"
                    >
                      <Icon size={20} className={isExpanded ? "mr-3" : "mx-auto"} />
                    </motion.div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center justify-between w-full"
                        >
                          <motion.span className="text-sm font-medium whitespace-nowrap">
                            {item.name}
                          </motion.span>
                          <motion.div
                            animate={{
                              opacity: isActive ? 1 : 0,
                              x: isActive ? 0 : -5
                            }}
                          >
                            <ChevronRight size={16} />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <motion.div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <motion.div
            whileHover={{ rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-inner flex-shrink-0"
          >
            <span className="text-teal-600 font-medium text-sm">AD</span>
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 overflow-hidden"
              >
                <motion.p className="text-sm font-medium text-gray-700 truncate">
                  Admin User
                </motion.p>
                <motion.p className="text-xs text-gray-500 truncate">
                  administrator@everythingrentals.com
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isExpanded && (
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>Log out</span>
            <LogOut size={16} />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SidebarAdmin;
