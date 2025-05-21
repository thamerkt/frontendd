import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BarChart2, Users, CalendarDays,
  Box, Settings, ChevronRight, LogOut, History
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const SidebarAdministrateur = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  // Sidebar is always expanded (fixed)
  const isExpanded = true;
  const isAdminPage = location.pathname.startsWith('/owner');

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/owner/dashboard" },
    { name: "users", icon: Users, path: "/owner/users" },
    { name: "categories", icon: CalendarDays, path: "/owner/categorie" },
    { name: "Products", icon: Box, path: "/owner/products" },
    { name: "history", icon: History, path: "/owner/history" },
    { name: "contracts", icon: History, path: "/owner/contracts" },
    { name: "Settings", icon: Settings, path: "/owner/settings" },
  ];

  if (!isAdminPage) return null;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 flex flex-col overflow-y-auto z-50 transition-all duration-300 w-64`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo Section */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 pb-4 border-b border-gray-100"
      >
        <div className="items-center space-x-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img width={120} src="../assets/logo-ekrini.png" alt="logo-ekrini.png" className="block"/>
            <img width={40} src="../assets/logo-icon.png" alt="logo-icon.png" className="hidden"/>
          </motion.div>
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
        {/* Chevron button removed */}
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
                    whileHover={{ x: 3 }}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.15 : 1,
                        color: isActive ? '#0d9488' : '#4b5563'
                      }}
                      transition={{ type: "spring", stiffness: 500 }}
                      className="flex-shrink-0"
                    >
                      <Icon size={20} className="mr-3" />
                    </motion.div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center justify-between w-full"
                        >
                          <motion.span className="text-sm font-medium whitespace-nowrap capitalize">
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
                  administrator@example.com
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isExpanded && (
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="  mt-4 w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>Log out</span>
            <LogOut size={16} />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SidebarAdministrateur;