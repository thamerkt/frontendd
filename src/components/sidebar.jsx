import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, LogIn, Menu, X, 
  MailCheck, UserRound, Building2, 
  BadgeCheck, ChevronRight, Check 
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    `flex items-center mb-2 p-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-teal-50 text-teal-700 font-medium border border-teal-100 shadow-[0_0_0_1px_rgba(13,148,136,0.1)]"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  if (!isRegisterPage) return null;

  // Navigation items data
  const navItems = [
    {
      path: "/register/email-verification",
      icon: <MailCheck className="w-5 h-5" />,
      activeIcon: <MailCheck className="w-5 h-5 text-teal-600" />,
      title: "Verify Email",
      description: "Verify your email address",
      step: 1
    },
    {
      path: "/register/profil",
      icon: <UserRound className="w-5 h-5" />,
      activeIcon: <UserRound className="w-5 h-5 text-teal-600" />,
      title: "Your Details",
      description: "Provide your personal details",
      step: 2
    },
    ...(role !== 'customer' && role !== 'equipment_manager_individual' ? [{
      path: "/register/business-details",
      icon: <Building2 className="w-5 h-5" />,
      activeIcon: <Building2 className="w-5 h-5 text-teal-600" />,
      title: "Business Details",
      description: "Company information",
      step: 3
    }] : []),
    {
      path: "/register/identity-verification",
      icon: <BadgeCheck className="w-5 h-5" />,
      activeIcon: <BadgeCheck className="w-5 h-5 text-teal-600" />,
      title: "Identity Verification",
      description: "Secure your account",
      step: role !== 'customer' && role !== 'equipment_manager_individual' ? 4 : 3
    }
  ];

  const currentStep = navItems.findIndex(item => item.path === location.pathname) + 1;
  const progressPercentage = Math.round((currentStep / navItems.length) * 100);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed left-4 top-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar Content */}
      <AnimatePresence>
        {(isOpen || windowWidth >= 1024) && (
          <motion.aside
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 h-screen fixed lg:sticky top-0 left-0 z-40 shadow-sm"
          >
            <div className="space-y-8">
              {/* Logo and Header */}
              <div className="pt-2">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/assets/logo-ekrini.png" 
                    alt="Logo" 
                    className="w-30 h-5"
                    loading="lazy"
                  />
                </div>
                <p className="text-gray-500 mt-3 text-xs font-medium uppercase tracking-wider">Onboarding Process</p>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-teal-600 tracking-wider">Step {currentStep} of {navItems.length}</span>
                  <span className="text-xs text-gray-400">{progressPercentage}% complete</span>
                </div>
                <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-teal-600 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  const isCompleted = currentStep > item.step;
                  
                  return (
                    <NavLink 
                      key={item.path}
                      to={item.path} 
                      className={({ isActive }) => linkClasses(isActive)}
                      onClick={() => windowWidth < 1024 && setIsOpen(false)}
                    >
                      <div className={`w-10 h-10 mr-3 flex items-center justify-center rounded-lg ${
                        isActive ? 'bg-teal-100' : isCompleted ? 'bg-teal-50' : 'bg-gray-50'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-teal-600" />
                        ) : isActive ? (
                          item.activeIcon
                        ) : (
                          item.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                      </div>
                      {isActive && (
                        <div className="ml-2 w-2 h-2 rounded-full bg-teal-600 animate-pulse"></div>
                      )}
                      {!isActive && (
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 space-y-3">
              <button 
                className="w-full py-2.5 px-4 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </button>
              <button 
                className="w-full py-2.5 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm flex items-center justify-center"
                onClick={() => navigate("/login")}
              >
                <LogIn className="h-4 w-4 mr-2" />
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