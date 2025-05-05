import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BarChart2, Handshake, FileText,
  Truck, Shield, CreditCard, Settings, 
  ChevronRight, LogOut, Package, Users
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const SidebarPartner = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activePartnerType, setActivePartnerType] = useState("delivery"); // delivery, assurance, finance

  const partnerMenuItems = {
    delivery: [
      { name: "Dashboard", icon: Home, path: "/partner/delivery/dashboard" },
      { name: "Deliveries", icon: Truck, path: "/partner/delivery/orders" },
      { name: "Tracking", icon: Package, path: "/partner/delivery/tracking" },
      { name: "Analytics", icon: BarChart2, path: "/partner/delivery/analytics" },
    ],
    assurance: [
      { name: "Dashboard", icon: Home, path: "/partner/assurance/dashboard" },
      { name: "Policies", icon: FileText, path: "/partner/assurance/policies" },
      { name: "Claims", icon: Shield, path: "/partner/assurance/claims" },
      { name: "Analytics", icon: BarChart2, path: "/partner/assurance/analytics" },
    ],
    finance: [
      { name: "Dashboard", icon: Home, path: "/partner/finance/dashboard" },
      { name: "Loans", icon: CreditCard, path: "/partner/finance/loans" },
      { name: "Payments", icon: Users, path: "/partner/finance/payments" },
      { name: "Analytics", icon: BarChart2, path: "/partner/finance/analytics" },
    ],
    common: [
      { name: "Partnership", icon: Handshake, path: "/partner/agreement" },
      { name: "Settings", icon: Settings, path: "/partenaire/settings" },
    ]
  };

  

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
            <Handshake size={20} />
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
                  Partner Portal
                </motion.h1>
                <motion.p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {activePartnerType === "delivery" ? "Delivery Partner" : 
                   activePartnerType === "assurance" ? "Assurance Partner" : "Finance Partner"}
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

      {/* Partner Type Selector (only visible when expanded) */}
      {isExpanded && (
        <motion.div 
          className="px-4 py-3 border-b border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex rounded-lg bg-gray-100 p-1">
            {["delivery", "assurance", "finance"].map((type) => (
              <button
                key={type}
                onClick={() => setActivePartnerType(type)}
                className={`flex-1 py-1 text-xs rounded-md transition-all ${activePartnerType === type ? "bg-white shadow-sm" : "text-gray-600"}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Partner-specific menu items */}
        {partnerMenuItems[activePartnerType].map((item) => (
          <SidebarItem 
            key={item.path}
            item={item}
            isExpanded={isExpanded}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            location={location}
          />
        ))}

        {/* Common partner items */}
        <div className="pt-4 border-t border-gray-100 mt-4">
          {partnerMenuItems.common.map((item) => (
            <SidebarItem 
              key={item.path}
              item={item}
              isExpanded={isExpanded}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              location={location}
            />
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <motion.div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <motion.div
            whileHover={{ rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-inner flex-shrink-0"
          >
            <span className="text-teal-600 font-medium text-sm">
              {activePartnerType === "delivery" ? "DP" : 
               activePartnerType === "assurance" ? "AP" : "FP"}
            </span>
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
                  {activePartnerType === "delivery" ? "Delivery Partner" : 
                   activePartnerType === "assurance" ? "Assurance Partner" : "Finance Partner"}
                </motion.p>
                <motion.p className="text-xs text-gray-500 truncate">
                  {activePartnerType}@everythingrentals.com
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

// Reusable sidebar item component
const SidebarItem = ({ item, isExpanded, hoveredItem, setHoveredItem, location }) => {
  const Icon = item.icon;
  const isActive = location.pathname === item.path;

  return (
    <NavLink
      to={item.path}
      className="relative block px-3 py-2.5"
      onMouseEnter={() => setHoveredItem(item.path)}
      onMouseLeave={() => setHoveredItem(null)}
    >
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
    </NavLink>
  );
};

export default SidebarPartner;