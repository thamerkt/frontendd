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
    { name: "Contracts", icon: History, path: "/admin/contracts" },
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
      {/* Logo Section - Updated to match client sidebar */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 pb-4 border-b border-gray-100"
      >
        <div className="items-center space-x-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className=""
          >
            <img width={120} src="../assets/logo-ekrini.png" alt="logo-ekrini.png"/>
          </motion.div>
          <br />
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Welcome to</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-6 right-4 p-1 rounded-md hover:bg-gray-100 text-gray-500"
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