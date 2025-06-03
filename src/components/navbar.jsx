import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Facebook, Twitter, Instagram, Mail, ShoppingCart,
    ChevronDown, MapPin, Menu, X, User, Briefcase,
    ClipboardList, List, Bell, Heart, MessageCircle
} from 'lucide-react';
import Cookies from 'js-cookie';



const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedCity, setSelectedCity] = useState('Detecting location...');
    const [locationStatus, setLocationStatus] = useState('waiting');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notificationCountt, setNotificationCountt] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [messageCount, setMessageCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token') || !!localStorage.getItem('user'));
    const [user, setUser] = useState(() => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });
    const [isCustomer, setIsCustomer] = useState(() => {
        const userData = localStorage.getItem('user');
        if (!userData) return true;
        const parsedUser = JSON.parse(userData);
        return !parsedUser.role || parsedUser.role === 'customer';
    });
    const [profile, setProfile] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const websocket = useRef(null);
    const notificationsRef = useRef(null);

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

    // Additional: Hide navbar if path starts with /owner, /client, /admin, /partner
    const shouldHideNavbar = (() => {
        const path = location.pathname;
        if (
            path.startsWith('/owner') ||
            path.startsWith('/client') ||
            path.startsWith('/admin') ||
            path.startsWith('/partner')
        ) {
            return true;
        }
        return hiddenPaths.some(hp => path.startsWith(hp));
    })();

    // Fetch notifications
    const fetchNotificationss = async () => {
        try {
            const userId = Cookies.get('keycloak_user_id');
            if (!userId) {
                console.log("No user ID found in cookies");
                return;
            }
            
            console.log("Fetching notifications for user:", userId);
            const response = await fetch(`http://127.0.0.1:8002/notify/notifications/?user=${userId}`);
            
            console.log("Response status:", response.status);
            if (!response.ok) {
                console.error("Response not OK:", await response.text());
                return;
            }
            
            const data = await response.json();
            console.log("Received notifications:", data);
            
            setNotifications(data);
            const unreadCount = data.filter(notification => !notification.is_read).length;
            setNotificationCountt(unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Mark notifications as read
    const markNotificationsAsRead = async () => {
        try {
            const userId = Cookies.get('keycloak_user_id');
            if (!userId) return;
            
            const response = await fetch(`http://127.0.0.1:8002/notify/notifications/mark-read/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user: userId })
            });
            
            if (response.ok) {
                // Update local state to mark all as read
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setNotificationCountt(0);
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    // Handle click outside notifications dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Initialize WebSocket connection for real-time updates
    useEffect(() => {
        if (isLoggedIn && user?.user_id) {
            const wsUrl = `ws://chat-service-7nng.onrender.com/ws/notifications/${user.user_id}/`;
            websocket.current = new WebSocket(wsUrl);

            websocket.current.onopen = () => {
                console.log('WebSocket connected');
                // Fetch initial counts immediately after connection
                fetchUnreadMessageCount();
                fetchNotifications();
            };

            websocket.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'new_message') {
                    // Increment message count when new message arrives
                    setMessageCount(prev => prev + 1);
                } else if (data.type === 'message_read') {
                    // Decrement message count when messages are read
                    setMessageCount(prev => Math.max(0, prev - data.count));
                } else if (data.type === 'new_notification') {
                    // Increment notification count when new notification arrives
                    setNotificationCount(prev => prev + 1);
                    // Fetch updated notifications
                    fetchNotifications();
                }
            };

            websocket.current.onclose = () => {
                console.log('WebSocket disconnected');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => {
                    if (isLoggedIn) {
                        websocket.current = new WebSocket(wsUrl);
                    }
                }, 5000);
            };

            websocket.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            return () => {
                if (websocket.current) {
                    websocket.current.close();
                }
            };
        }
    }, [isLoggedIn, user?.user_id]);

    // Fetch unread message count from REST API
    const fetchUnreadMessageCount = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8001/api/chat/chat/unread/${user?.user_id}/`);
            if (response.ok) {
                const data = await response.json();
                // Assuming data.unread_messages is an array
                const unreadCount = data.unread_messages?.length || 0;
                setMessageCount(unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread message count:', error);
        }
    };
    
    // Mark messages as read when visiting messages page
    const markMessagesAsRead = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8001/api/chat/chat/mark_read/${user?.user_id}/`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                setMessageCount(0);
                // Notify WebSocket server that messages were read
                if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                    websocket.current.send(JSON.stringify({
                        type: 'messages_read'
                    }));
                }
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Fetch initial counts when user logs in or route changes
    useEffect(() => {
        if (isLoggedIn && isCustomer) {
            fetchUnreadMessageCount();
            
            
            // If we're on the messages page, mark messages as read
            if (location.pathname === '/messanger') {
                markMessagesAsRead();
            }
        }
    }, [isLoggedIn, isCustomer, location.pathname]);

    // Sync login state and user/profile on location change
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        fetchNotificationss();
        if (token || userData) {
            setIsLoggedIn(true);
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setIsCustomer(!parsedUser.role || parsedUser.role === 'customer');
                fetchProfileDetails(parsedUser.user_id, parsedUser.role);
            }
        } else {
            setIsLoggedIn(false);
            setUser(null);
            setProfile(null);
            setProfilePicture(null);
            setMessageCount(0);
            setNotificationCount(0);
            setNotifications([]);
        }
        setMobileMenuOpen(false);
        setIsDropdownOpen(false);
        setNotificationsOpen(false);
    }, [location.pathname]);

    // Scroll event for sticky effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Detect location on mount
    useEffect(() => {
        detectLocation();
    }, []);

    const fetchProfileDetails = async (userId, isCustomerRole) => {
        if (isCustomerRole !== 'admin') {
            try {
                const profileResponse = await fetch(`https://kong-7e283b39dauspilq0.kongcloud.dev/profile/profil/?user=${userId}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                if (!profileResponse.ok) throw new Error('Profile fetch failed');
                const profileData = await profileResponse.json();
                if (profileData.length > 0) {
                    const userProfile = profileData[0];
                    setProfile(userProfile);

                    if (isCustomerRole) {
                        const physicalResponse = await fetch(`https://kong-7e283b39dauspilq0.kongcloud.dev/profile/physicalprofil/?profil=${userProfile.id}`, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        });
                        if (physicalResponse.ok) {
                            const physicalData = await physicalResponse.json();
                            if (physicalData.length > 0 && physicalData[0].profile_picture) {
                                setProfilePicture(physicalData[0].profile_picture);
                            } else {
                                setProfilePicture(null);
                            }
                        }
                    } else {
                        const moralResponse = await fetch(`https://kong-7e283b39dauspilq0.kongcloud.dev/profile/profilmoral/?profil=${userProfile.id}`, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        });
                        if (moralResponse.ok) {
                            const moralData = await moralResponse.json();
                            if (moralData.length > 0 && moralData[0].logo) {
                                setProfilePicture(moralData[0].logo);
                            } else {
                                setProfilePicture(null);
                            }
                        }
                    }
                } else {
                    setProfile(null);
                    setProfilePicture(null);
                }
            } catch (error) {
                setProfile(null);
                setProfilePicture(null);
            }
        }
    };

    const detectLocation = () => {
        setLocationStatus('detecting');
        setSelectedCity('Detecting location...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                        );
                        const data = await response.json();
                        let locationName = '';
                        if (data.address) {
                            locationName =
                                data.address.road ||
                                data.address.neighbourhood ||
                                data.address.suburb ||
                                data.address.city ||
                                data.address.town ||
                                data.address.county ||
                                data.address.state ||
                                data.address.country;
                        }
                        if (locationName) {
                            setSelectedCity(locationName);
                        } else {
                            setSelectedCity(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        }
                        setLocationStatus('granted');
                    } catch (error) {
                        setSelectedCity('Location unavailable');
                        setLocationStatus('error');
                    }
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            setSelectedCity('Location denied');
                            setLocationStatus('denied');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setSelectedCity('Location unavailable');
                            setLocationStatus('error');
                            break;
                        case error.TIMEOUT:
                            setSelectedCity('Location timeout');
                            setLocationStatus('error');
                            break;
                        default:
                            setSelectedCity('Location error');
                            setLocationStatus('error');
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setSelectedCity('Geolocation not supported');
            setLocationStatus('unsupported');
        }
    };

    const requestLocation = () => {
        setLocationStatus('requesting');
        detectLocation();
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        setProfile(null);
        setProfilePicture(null);
        setMessageCount(0);
        setNotificationCount(0);
        setNotifications([]);
        if (websocket.current) {
            websocket.current.close();
        }
        navigate('/');
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
        setNotificationsOpen(false);
    };

    const toggleNotifications = () => {
        setNotificationsOpen((prev) => !prev);
        setIsDropdownOpen(false);
        
        // When opening notifications, mark them as read
        if (IsDropdownOpen && notificationCount > 0) {
            markNotificationsAsRead();
        }
    };

    const handleMessagesClick = () => {
        // Mark messages as read when clicking the messages icon
        if (messageCount > 0) {
            markMessagesAsRead();
        }
        navigate('/messanger');
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
                    <a href="/client/favorite" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Heart className="w-4 h-4 mr-2" />
                        My Wishlist
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
                        {(locationStatus === 'denied' || locationStatus === 'error') && (
                            <button
                                onClick={requestLocation}
                                className="text-xs text-teal-300 underline ml-1"
                            >
                                Enable location
                            </button>
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
                        <div className="relative" ref={notificationsRef}>
                            <button
                                className="text-gray-300 hover:text-teal-400 transition-colors duration-200 relative"
                                onClick={toggleNotifications}
                            >
                                <Bell className="w-4 h-4" />
                                {notificationCountt > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {notificationCountt}
                                    </span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 border-b border-gray-100 text-sm font-medium text-gray-700">
                                        Notifications
                                    </div>
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div 
                                                key={notification.id} 
                                                className={`px-4 py-3 text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-900 bg-gray-50'}`}
                                            >
                                                <div className="font-medium">{notification.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500">
                                            No notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

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
                                <div className="flex items-center space-x-4">
                                    {/* Wishlist button */}
                                    <a
                                        href="/client/favorite"
                                        className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors duration-200"
                                        aria-label="Wishlist"
                                    >
                                        <Heart className="w-5 h-5" />
                                    </a>

                                    {/* Messenger button - only for logged-in customers */}
                                    {isCustomer && (
                                        <button
                                            onClick={handleMessagesClick}
                                            className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors duration-200"
                                            aria-label="Messages"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            {messageCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                    {messageCount > 9 ? '9+' : messageCount}
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    {/* User dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={toggleDropdown}
                                            className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600 group"
                                        >
                                            {profilePicture ? (
                                                <img
                                                    src={profilePicture}
                                                    alt="Profile"
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 group-hover:text-teal-600" />
                                            )}
                                            <span>{profile?.first_name || user?.name || 'Account'}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                                {renderDropdownItems()}
                                            </div>
                                        )}
                                    </div>
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
                                        <a
                                            href="/client/favorite"
                                            className="flex items-center justify-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600"
                                        >
                                            <Heart className="w-4 h-4" />
                                            <span>Wishlist</span>
                                        </a>

                                        {/* Messenger button for mobile */}
                                        {isCustomer && (
                                            <button
                                                onClick={handleMessagesClick}
                                                className="flex items-center justify-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600 relative"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Messages</span>
                                                {messageCount > 0 && (
                                                    <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                        {messageCount > 9 ? '9+' : messageCount}
                                                    </span>
                                                )}
                                            </button>
                                        )}

                                        <button
                                            onClick={toggleDropdown}
                                            className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-teal-600"
                                        >
                                            {profilePicture ? (
                                                <img
                                                    src={profilePicture}
                                                    alt="Profile"
                                                    className="w-5 h-5 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                            <span>{profile?.first_name || user?.name || 'Account'}</span>
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