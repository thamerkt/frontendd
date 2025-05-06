import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Facebook, Twitter, Instagram, Mail, ShoppingCart, 
  ChevronDown, MapPin, Menu, X, User, Briefcase,
  ClipboardList, List, Bell
} from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedCity, setSelectedCity] = useState('Detecting...');
    const [locationStatus, setLocationStatus] = useState('detecting');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isCustomer, setIsCustomer] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Navigation items - direct links
    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Rentals', path: '/shopgrid' },
        { label: 'Categories', path: '/categories' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' }
    ];

    // List of paths where navbar should be hidden
    const hiddenPaths = [
        '/register',
        '/login',
        '/admin',
        '/client/dashboard',
        '/client/booking',
        '/client/request',
        '/client/favorite',
        '/client/settings'
    ];

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token || userData) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userData));
            // Check if user is admin or customer
            setIsCustomer(!userData.includes('"role":"admin"'));
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Close mobile menu when navigating
        setMobileMenuOpen(false);
    }, [location]);

    const detectLocation = () => {
        setLocationStatus('detecting');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSelectedCity('Tunis');
                    setLocationStatus('granted');
                },
                (error) => {
                    console.error("Location error:", error);
                    setSelectedCity('Tunis');
                    setLocationStatus('denied');
                }
            );
        } else {
            setSelectedCity('Tunis');
            setLocationStatus('unsupported');
        }
    };

    const shouldHideNavbar = hiddenPaths.some(path => location.pathname.startsWith(path));

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        navigate('/');
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        setNotificationsOpen(false);
    };

    const toggleNotifications = () => {
        setNotificationsOpen(!notificationsOpen);
        setIsDropdownOpen(false);
        if (notificationsOpen) {
            setNotificationCount(0);
        }
    };

    const renderDropdownItems = () => {
        if (isCustomer) {
            return (
                <>
                    <a href="/client/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                    </a>
                    <a href="/client/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Dashboard
                    </a>
                    <a href="/client/booking" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        My bookings
                    </a>
                    <a href="/client/request" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <List className="w-4 h-4 mr-2" />
                        My Requests
                    </a>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                        Logout
                    </button>
                </>
            );
        } else {
            return (
                <>
                    <a href="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                    </a>
                    <a href="/admin/dashbord" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Dashboard
                    </a>
                    <a href="/admin/products" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Equipments
                    </a>
                    <a href="/admin/booking" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Bookings
                    </a>
                    <a href="/admin/clients" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <List className="w-4 h-4 mr-2" />
                        Requests
                    </a>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                        Logout
                    </button>
                </>
            );
        }
    };

    if (shouldHideNavbar) {
        return null;
    }

    return (
        <>
            {/* Top utility bar */}
            <div className="bg-gray-900 text-gray-100 text-sm px-4 lg:px-20 py-3 hidden md:flex justify-between items-center w-full">
                <div className="flex items-center space-x-6">
                    <a 
                        href="mailto:contact@everythingrentals.com" 
                        className="flex items-center hover:text-teal-400 transition-colors duration-200"
                        aria-label="Contact us via email"
                    >
                        <Mail className="w-4 h-4 text-teal-400 mr-2" />
                        contact@everythingrentals.com
                    </a>
                    
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-teal-400 mr-2" />
                        <span className="mr-1">{selectedCity}</span>
                        {locationStatus === 'detecting' && (
                            <span className="text-xs text-teal-300 animate-pulse">Detecting...</span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center space-x-6">
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                            <Facebook className="w-4 h-4" />
                        </a>
                        <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                            <Instagram className="w-4 h-4" />
                        </a>
                    </div>
                    
                    <div className="h-5 w-px bg-gray-600"></div>
                    
                    <div className="flex items-center space-x-4">
                        <button 
                            className="text-gray-300 hover:text-teal-400 transition-colors duration-200 relative"
                            onClick={toggleNotifications}
                        >
                            <Bell className="w-4 h-4" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                        
                        <button className="text-gray-300 hover:text-teal-400 transition-colors duration-200 relative">
                            <ShoppingCart className="w-4 h-4" />
                            <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                0
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main navigation bar */}
            <header className={`sticky top-0 z-50 bg-white shadow-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'} border-b border-gray-100 w-full`}>
                <div className="container mx-auto px-4 lg:px-32">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <a href="/" className="flex items-center">
                                <img 
                                    src="/assets/logo-ekrini.png"
                                    alt="Everything Rentals" 
                                    className={`h-10 transition-all duration-300 ${isScrolled ? 'h-9' : 'h-10'}`}
                                />
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <a 
                                    key={item.label}
                                    href={item.path} 
                                    className={`px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group ${location.pathname === item.path ? 'text-teal-600' : ''}`}
                                >
                                    <span className="relative">
                                        {item.label}
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left ${location.pathname === item.path ? 'scale-x-100' : ''}`}></span>
                                    </span>
                                </a>
                            ))}
                        </nav>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-3">
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600 group"
                                    >
                                        <User className="w-4 h-4 group-hover:text-teal-600" />
                                        <span>{user?.name || 'Account'}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                            {renderDropdownItems()}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600 group"
                                    >
                                        <User className="w-4 h-4 group-hover:text-teal-600" />
                                        <span>Sign In</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="hidden md:flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white"
                                        style={{
                                            background: 'linear-gradient(270deg, #0d9488, #0f766e, #115e59, #134e4a)',
                                            backgroundSize: '800% 800%',
                                            animation: 'gradientAnimation 8s ease infinite'
                                        }}
                                    >
                                        List Equipment
                                    </button>
                                </>
                            )}
                            
                            {/* Mobile menu button */}
                            <button 
                                className="lg:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
                        <div className="container mx-auto px-4 py-3">
                            <div className="flex flex-col space-y-2">
                                {navItems.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.path}
                                        className="block py-3 text-gray-700 hover:text-teal-600 font-medium transition-colors duration-200 border-b border-gray-100 last:border-0"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col space-y-3">
                                {isLoggedIn ? (
                                    <>
                                        <button
                                            onClick={toggleDropdown}
                                            className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>{user?.name || 'Account'}</span>
                                        </button>
                                        
                                        {isDropdownOpen && (
                                            <div className="w-full bg-white rounded-md shadow-sm py-1 border border-gray-200">
                                                {renderDropdownItems()}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Sign In</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="w-full flex items-center justify-center px-5 py-3 rounded-lg font-medium transition-all duration-200 text-white"
                                            style={{
                                                background: 'linear-gradient(270deg, #0d9488, #0f766e, #115e59, #134e4a)',
                                                backgroundSize: '800% 800%',
                                                animation: 'gradientAnimation 8s ease infinite'
                                            }}
                                        >
                                            List Equipment
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Add the animation keyframes to the document */}
            <style>
                {`
                @keyframes gradientAnimation {
                    0% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                }
                `}
            </style>
        </>
    );
};

export default Navbar;