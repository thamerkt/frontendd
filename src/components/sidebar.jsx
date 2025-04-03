import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isRegisterPage = location.pathname.startsWith('/register');

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 20
      }
    },
    exit: { x: -300, opacity: 0 }
  };

  const linkClasses = (isActive) =>
    `flex items-center mb-3 p-3 rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500 font-medium"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  if (!isRegisterPage) return null;

  // Navigation items data
  const navItems = [
    {
      path: "/register/email-verification",
      icon: "/assets/otp.png",
      activeIcon: "/assets/otp4.png",
      title: "Verify Email",
      description: "Verify your email"
    },
    {
      path: "/register/profil",
      icon: "/assets/resume (1).png",
      activeIcon: "/assets/resume.png",
      title: "Your Details",
      description: "Provide your details"
    },
    {
      path: "/register/business-details",
      icon: "/assets/businessdetails.png",
      activeIcon: "/assets/documents.png",
      title: "Business Details",
      description: "Company information"
    },
    {
      path: "/register/identity-verification",
      icon: "/assets/identity.png",
      activeIcon: "/assets/identitychecked.png",
      title: "Identity Verification",
      description: "Secure your account"
    }
  ];

  return (
    <>
      {/* Toggle Button - Only shown on small screens */}
      <button 
        className="sm:hidden fixed left-4 top-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar Content */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 640) && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            className="w-72 bg-white p-6 flex flex-col justify-between border-r border-gray-100 h-screen fixed sm:sticky top-0 left-0 z-40"
          >
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <img 
                    src="/assets/logo.png" 
                    alt="Logo" 
                    className="w-8 h-8 mr-2"
                    loading="lazy"
                  />
                  Everything Rentals
                </h1>
                <p className="text-gray-500 mt-2 text-sm">New User Registration</p>
              </div>

              <div className="flex items-center space-x-2 mb-6 p-2 bg-teal-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-800">Client Registration</p>
                  <p className="text-xs text-teal-600">Step-by-step process</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.path}
                    to={item.path} 
                    className={({ isActive }) => linkClasses(isActive)}
                    onClick={() => setIsOpen(false)} // Close sidebar when a link is clicked
                  >
                    <div className="w-14 h-14 mr-3 flex items-center justify-center bg-teal-100 rounded-full">
                      <img
                        src={location.pathname === item.path ? item.activeIcon : item.icon}
                        alt={item.title}
                        className="w-8 h-8"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100">
              <button 
                className="w-full mb-3 py-2 px-4 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
              <button 
                className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm"
                onClick={() => navigate("/login")}
              >
                Login to Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;