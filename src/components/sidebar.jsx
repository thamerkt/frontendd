import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Check if the current route is one of the specified ones
  const isRegisterPage =
  location.pathname === '/register/profil' ||
  location.pathname === '/register/email-verification' ||
  location.pathname === '/register/identity-verification' ||
  location.pathname === '/register/business-details';

  const role = localStorage.getItem('role');

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      x: -320, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const linkClasses = (isActive) =>
    `flex items-center mb-3 p-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-teal-50 text-teal-700 font-medium shadow-[inset_4px_0_0_0_rgb(13,148,136)]"
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
      description: "Verify your email",
      step: 1
    },
    {
      path: "/register/profil",
      icon: "/assets/resume (1).png",
      activeIcon: "/assets/resume.png",
      title: "Your Details",
      description: "Provide your details",
      step: 2
    },
    ...(role !== 'customer' && role !== 'equipment_manager_individual' ? [{
      path: "/register/business-details",
      icon: "/assets/businessdetails.png",
      activeIcon: "/assets/documents.png",
      title: "Business Details",
      description: "Company information",
      step: 3
    }] : []),
    {
      path: "/register/identity-verification",
      icon: "/assets/identity.png",
      activeIcon: "/assets/identitychecked.png",
      title: "Identity Verification",
      description: "Secure your account",
      step: role !== 'customer' && role !== 'equipment_manager_individual' ? 4 : 3
    }
  ];

  const currentStep = navItems.findIndex(item => item.path === location.pathname) + 1;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed left-4 top-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar Content */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 h-screen fixed lg:sticky top-0 left-0 z-40 shadow-sm"
          >
            <div className="space-y-8">
              {/* Logo and Header */}
              <div>
                <div className="flex items-center space-x-3">
                  <img 
                    src="/assets/logo.png" 
                    alt="Logo" 
                    className="w-10 h-10"
                    loading="lazy"
                  />
                  <h1 className="text-xl font-bold text-gray-800">Everything Rentals</h1>
                </div>
                <p className="text-gray-500 mt-2 text-sm font-medium">ONBOARDING PROCESS</p>
              </div>

              {/* Progress Indicator */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-teal-600">STEP {currentStep} OF {navItems.length}</span>
                  <span className="text-sm text-gray-400">{Math.round((currentStep / navItems.length) * 100)}% COMPLETE</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full" 
                    style={{ width: `${(currentStep / navItems.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.path}
                    to={item.path} 
                    className={({ isActive }) => linkClasses(isActive)}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={`w-11 h-11 mr-3 flex items-center justify-center rounded-lg ${
                      location.pathname === item.path ? 'bg-teal-100' : 'bg-gray-100'
                    }`}>
                      <img
                        src={location.pathname === item.path ? item.activeIcon : item.icon}
                        alt={item.title}
                        className="w-6 h-6"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-base font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    {location.pathname === item.path && (
                      <div className="ml-auto w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></div>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 space-y-4">
              <button 
                className="w-full py-3 px-4 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-base font-medium flex items-center justify-center"
                onClick={() => navigate("/")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </button>
              <button 
                className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-base font-medium shadow-sm flex items-center justify-center"
                onClick={() => navigate("/login")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login to Account
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;