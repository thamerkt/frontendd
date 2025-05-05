import { motion } from "framer-motion";
import { Home, CalendarDays, Mailbox, Settings, CreditCard, Heart, LogOut,ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const SidebarClient = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const isClientPage = location.pathname.startsWith("/client");

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/client/dashboard" },
    { name: "Bookings", icon: CalendarDays, path: "/client/bookings" },
    { name: "Payments", icon: CreditCard, path: "/client/payments" },
    { name: "Favorites", icon: Heart, path: "/client/favorite" },
    { name: "Requests", icon: Mailbox, path: "/client/request" },
    { name: "Settings", icon: Settings, path: "/client/settings" },
  ];

  if (!isClientPage) return null;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col overflow-y-auto z-30"
    >
      {/* Logo Section */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 pb-4 border-b border-gray-100"
      >
        <div className=" items-center space-x-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className=""
          >
            <img width={120} src="../assets/logo-ekrini.png" alt="logo-ekrini.png"/>
          </motion.div>
          <br />
          <div>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Welcome to</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Client Portal</p>
          </div>
        </div>
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
                  {hoveredItem === item.path && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-teal-50 rounded-lg"
                    />
                  )}

                  <div className={`relative z-10 flex items-center transition-colors ${
                    isActive ? "text-teal-600" : "text-gray-600 hover:text-gray-900"
                  }`}>
                    <motion.div
                      animate={{
                        scale: isActive ? 1.15 : 1,
                        color: isActive ? "#0d9488" : "#4b5563",
                      }}
                      transition={{ type: "spring", stiffness: 500 }}
                      className="flex-shrink-0"
                    >
                      <Icon size={20} className="mr-3" />
                    </motion.div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{item.name}</span>
                      {isActive && <ChevronRight size={16} />}
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <motion.div
            whileHover={{ rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-inner flex-shrink-0"
          >
            <span className="text-teal-600 font-medium text-sm">CU</span>
          </motion.div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 truncate">Client User</p>
            <p className="text-xs text-gray-500 truncate">client@example.com</p>
          </div>
        </div>

        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span>Log out</span>
          <LogOut size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SidebarClient;