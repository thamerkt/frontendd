import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Facebook, Twitter, Mail, ShoppingCart, 
  ChevronDown, SearchIcon, MapPin, Bell,
  User, LogIn, UserPlus, Home, 
  Hammer, Layers, Info, Phone,
  LogOut, Settings, Heart, List,
  ClipboardList, Briefcase, Box
} from 'lucide-react';

const Navbar = () => {
    // Tunisian cities with coordinates
    const tunisianCities = {
        'Tunis': { lat: 36.8065, lng: 10.1815 },
        'Ariana': { lat: 36.8665, lng: 10.1647 },
        'Ben Arous': { lat: 36.7531, lng: 10.2189 },
        'La Manouba': { lat: 36.8101, lng: 10.0956 },
        'Nabeul': { lat: 36.4561, lng: 10.7376 },
        'Zaghouan': { lat: 36.4029, lng: 10.1429 },
        'Bizerte': { lat: 37.2744, lng: 9.8739 },
        'Beja': { lat: 36.7256, lng: 9.1817 },
        'Jendouba': { lat: 36.5012, lng: 8.7802 },
        'Kef': { lat: 36.1822, lng: 8.7148 },
        'Kairouan': { lat: 35.6712, lng: 10.1006 },
        'Sidi Bouzid': { lat: 35.0382, lng: 9.4849 },
        'Kasserine': { lat: 35.1676, lng: 8.8365 },
        'Monastir': { lat: 35.7643, lng: 10.8113 },
        'Mahdia': { lat: 35.5047, lng: 11.0622 },
        'Sousse': { lat: 35.8254, lng: 10.6360 },
        'Gabes': { lat: 33.8886, lng: 10.0972 },
        'Medenine': { lat: 33.3549, lng: 10.5055 },
        'Tataouine': { lat: 32.9297, lng: 10.4510 },
        'Tozeur': { lat: 33.9197, lng: 8.1338 },
        'Gafsa': { lat: 34.4250, lng: 8.7842 },
        'Siliana': { lat: 36.0849, lng: 9.3708 },
        'Sfax': { lat: 34.7406, lng: 10.7603 }
    };

    const [selectedCity, setSelectedCity] = useState('Tunis');
    const [locationStatus, setLocationStatus] = useState('detecting');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(3);
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const isLoggedIn = !!user;
    const isCustomer = user?.role === 'customer';

    const isRegisterPage = location.pathname.startsWith('/register');
    const isLoginPage = location.pathname.startsWith('/login');
    const isAdminPage = location.pathname.startsWith('/admin');
    const isclientPage = location.pathname.startsWith('/client');
    const ispartnerPage = location.pathname.startsWith('/partner');

    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        setLocationStatus('detecting');
        
        if (!navigator.geolocation) {
            setLocationStatus('unsupported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const city = findNearestCity(position.coords);
                setSelectedCity(city);
                setLocationStatus('granted');
            },
            (error) => {
                console.error("Location error:", error);
                setLocationStatus('denied');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const findNearestCity = (coords) => {
        let nearestCity = 'Tunis';
        let minDistance = Infinity;
        
        for (const [city, cityCoords] of Object.entries(tunisianCities)) {
            const distance = calculateDistance(
                coords.latitude,
                coords.longitude,
                cityCoords.lat,
                cityCoords.lng
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city;
            }
        }
        
        return nearestCity;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const handleCityChange = (e) => {
        if (e.target.value === "detect") {
            detectLocation();
        } else {
            setSelectedCity(e.target.value);
        }
    };

    const getStatusMessage = () => {
        switch(locationStatus) {
            case 'detecting': return 'Detecting your location...';
            case 'granted': return 'Using your current location';
            case 'denied': return 'Location access denied - using default';
            case 'unsupported': return 'Geolocation not supported';
            default: return '';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
                    
                </>
            );
        }
    };

    return (
        <>
            {!isRegisterPage && !isLoginPage && !isAdminPage && !isclientPage && !ispartnerPage &&(
                <>
                    {/* Top bar */}
                    <div className="bg-gray-900 text-gray-100 px-4 md:px-20 py-3 flex flex-col md:flex-row justify-between items-center w-full border-b border-gray-800">
                        <div className="flex items-center space-x-2 md:mb-0">
                            <Mail className="w-4 h-4 text-teal-400" />
                            <span className="text-xs md:text-sm">
                                <a href="mailto:contact@everythingrentals.com" className="hover:text-teal-400 transition">
                                    contact@everythingrentals.com
                                </a>
                            </span>
                        </div>
                        
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-teal-400 transition">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-300 hover:text-teal-400 transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-300 hover:text-teal-400 transition">
                                <Mail className="w-5 h-5" />
                            </a>
                            <button className="text-gray-300 hover:text-teal-400 transition relative">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    0
                                </span>
                            </button>
                        </div>
                    </div>
                    {/* Search bar */}
                    <div className="bg-white shadow-md py-6 px-4 md:px-20 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                    <div className="flex items-center space-x-1 mb-4 md:mb-0">
                            <MapPin className="w-5 h-5 text-teal-700 mr-2" />
                            <div className="flex flex-col">
                                <span className="text-teal-700 text-sm">
                                    Tunisia • {selectedCity}
                                </span>
                                <span className="text-xs text-teal-700">
                                    {getStatusMessage()}
                                </span>
                            </div>
                        </div>
        
                        <img src="assets/logo-ekrini.png" width={300} alt="logo-ekrini" />
                        <div className="flex space-x-3 items-center">
                            {isLoggedIn && (
                                <button 
                                    onClick={toggleNotifications}
                                    className="relative text-gray-300 hover:text-teal-400 transition"
                                >
                                    <Bell className="w-5 h-5" />
                                    {notificationCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                            )}
                            
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button 
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                                    >
                                        {user.profilePicture ? (
                                            <img 
                                                src={user.profilePicture} 
                                                alt="Profile" 
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <span className="text-sm">{user.name}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                                            {renderDropdownItems()}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition"
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="flex items-center px-4 py-2 text-teal-500 border border-teal-500 hover:bg-teal-600 hover:text-white text-sm rounded-lg transition"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Register
                                    </button>
                                </>
                            )}
                        </div>

                        
                    </div>

                    {/* Main navigation */}
                    <div className="px-4 md:px-20 py-4 text-white flex flex-col md:flex-row items-center justify-center w-full bg-[#0F0D23]">
                        
                        
                        <ul className="flex flex-wrap justify-center md:flex-nowrap space-x-2 md:space-x-6 mb-4 md:mb-0">
                            <NavItem icon={<Home className="w-3 h-3 mr-1" />} text="HOME" />
                            <NavItem icon={<Hammer className="w-3 h-3 mr-1" />} text="RENTALS" />
                            <NavItem icon={<Layers className="w-3 h-3 mr-1" />} text="CATEGORIES" />
                            <NavItem icon={<Info className="w-3 h-3 mr-1" />} text="ABOUT" />
                            <NavItem icon={<Phone className="w-3 h-3 mr-1" />} text="CONTACT" />
                        </ul>
                        
                        
                    </div>

                    {/* Notifications dropdown */}
                    {notificationsOpen && (
                        <div className="absolute right-20 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50">
                            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                                Notifications
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b">
                                    <div className="font-medium">New rental request</div>
                                    <div className="text-xs text-gray-500">Your item "Power Drill" has a new request</div>
                                </a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b">
                                    <div className="font-medium">Contract approved</div>
                                    <div className="text-xs text-gray-500">Your contract #1234 has been approved</div>
                                </a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <div className="font-medium">Payment received</div>
                                    <div className="text-xs text-gray-500">You've received payment for rental #5678</div>
                                </a>
                            </div>
                            <a href="/notifications" className="block px-4 py-2 text-sm text-center text-teal-600 hover:bg-gray-100 border-t">
                                View all notifications
                            </a>
                        </div>
                    )}

                    
                </>
            )}
        </>
    );
};

const NavItem = ({ icon, text }) => (
    <li className="flex items-center px-2 py-1 text-sm font-medium text-gray-300 hover:text-teal-400 cursor-pointer transition">
        {icon}
        {text}
    </li>
);

export default Navbar;