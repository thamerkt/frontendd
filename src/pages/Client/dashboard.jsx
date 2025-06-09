import { FaBell, FaSearch, FaBoxOpen, FaHistory, FaQuestionCircle, FaPlus, FaChevronRight } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

import ClientBookingComponent from '../../components/Client/Booking';
import { useState, useEffect } from "react";
import axios from 'axios';

// Sample images (using Unsplash placeholders)
const equipmentImages = {
  camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
  drone: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZHJvbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
  lens: "https://images.unsplash.com/photo-1552168324-d612d77725e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNhbWVyYSUyMGxlbnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
  lighting: "https://images.unsplash.com/photo-1517971053561-8f4a6ef72a90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxpZ2h0aW5nJTIwa2l0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
};

// API Service
const apiService = {
  clientStats: {
    get: async (clientId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/client-stats/${clientId}/`,{withCredentials: true});
        return response.data;
      } catch (error) {
        console.error("Error fetching client stats:", error);
        return {
          activeRentals: 0,
          upcomingBookings: 0,
          pendingRequests: 0,
          rentalHistory: 0
        };
      }
    }
  },
  clientRentals: {
    getActive: async (clientId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/client-rentals/${clientId}/active/`,{withCredentials: true});
        return response.data;
      } catch (error) {
        console.error("Error fetching active rentals:", error);
        return [];
      }
    }
  },
  clientBookings: {
    getUpcoming: async (clientId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/client-bookings/${clientId}/upcoming/`,{withCredentials: true});
        return response.data;
      } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        return [];
      }
    }
  }
};

const ClientDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clientStats, setClientStats] = useState({
        activeRentals: 0,
        upcomingBookings: 0,
        pendingRequests: 0,
        rentalHistory: 0
    });
    const [activeRentals, setActiveRentals] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);

    // Initialize client data
    useEffect(() => {
        const initializeClientData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const clientId = "1"; // Hardcoded for example
                
                const [stats, rentals, bookings] = await Promise.all([
                    apiService.clientStats.get(clientId),
                    apiService.clientRentals.getActive(clientId),
                    apiService.clientBookings.getUpcoming(clientId)
                ]);
                
                setClientStats(stats);
                setActiveRentals(rentals);
                setUpcomingBookings(bookings);
                setLoading(false);
                
            } catch (err) {
                console.error("Error initializing client data:", err);
                setError("Failed to load client data");
                setLoading(false);
            }
        };
        
        initializeClientData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
                    <div className="text-red-500 text-2xl mb-3">⚠️</div>
                    <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
                    <p className="mt-2 text-red-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Main Content */}
            <div className="flex-1 ml-20 lg:ml-64 overflow-y-auto h-screen">
                {/* Top Navigation */}
                

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Welcome Header */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl font-bold text-gray-800">Welcome back, <span className="text-teal-500">Thamer</span></h1>
                        <p className="text-gray-500">Here's your rental activity and upcoming bookings</p>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {[
                            { 
                                title: "Active Rentals", 
                                value: clientStats.activeRentals, 
                                icon: <FaBoxOpen className="text-teal-500" />, 
                                change: "+0", 
                                trend: "neutral" 
                            },
                            { 
                                title: "Upcoming Bookings", 
                                value: clientStats.upcomingBookings, 
                                icon: <FaBoxOpen className="text-teal-500" />, 
                                change: "0", 
                                trend: "neutral" 
                            },
                            { 
                                title: "Pending Requests", 
                                value: clientStats.pendingRequests, 
                                icon: <FaQuestionCircle className="text-teal-500" />, 
                                change: "+0", 
                                trend: "neutral" 
                            },
                            { 
                                title: "Rental History", 
                                value: clientStats.rentalHistory, 
                                icon: <FaHistory className="text-teal-500" />, 
                                change: "+0", 
                                trend: "neutral" 
                            }
                        ].map((stat, index) => (
                            <motion.div 
                                key={index} 
                                className="bg-white rounded-xl shadow-xs p-5 border border-gray-100 hover:shadow-sm transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                    delay: 0.1 + index * 0.1,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                whileHover={{ y: -5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-800">{stat.value}</p>
                                    </div>
                                    <div className="p-2 bg-teal-50 rounded-lg">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center text-xs font-medium ${
                                        stat.trend === 'up' ? 'text-green-600' : 
                                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {stat.change} from last month
                                        {stat.trend === 'up' ? (
                                            <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : stat.trend === 'down' ? (
                                            <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : null}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Current Rentals Section */}
                    <motion.section 
                        className="bg-white rounded-xl shadow-xs p-6 border border-gray-100 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">Your Current Rentals</h2>
                            <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
                                View All <FaChevronRight className="ml-1" size={12} />
                            </button>
                        </div>
                        
                        {activeRentals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeRentals.map((rental, index) => (
                                    <motion.div 
                                        key={index}
                                        className="border border-gray-200 rounded-xl p-4 hover:shadow-xs transition-all"
                                        whileHover={{ scale: 1.01 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            delay: 0.4 + index * 0.1,
                                            type: "spring"
                                        }}
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img 
                                                    src={equipmentImages[rental.itemType] || equipmentImages.camera} 
                                                    alt={rental.itemName} 
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">{rental.itemName}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{rental.reference}</p>
                                                
                                                <div className="mt-3">
                                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-teal-500 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${rental.progress}%` }}
                                                            transition={{ delay: 0.5 + index * 0.1 }}
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            rental.status === "Active" ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {rental.status}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700">{rental.dueDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <motion.button 
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="text-xs bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-all"
                                            >
                                                Extend Rental
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                                            >
                                                View Details
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No active rentals</h3>
                                <p className="mt-1 text-sm text-gray-500">You don't have any active rentals at the moment.</p>
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                    >
                                        <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                        New Rental
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.section>

                    {/* Upcoming Bookings and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Upcoming Bookings */}
                        <motion.section
                            className="lg:col-span-2 bg-white rounded-xl shadow-xs p-6 border border-gray-100"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-gray-800">Upcoming Bookings</h2>
                                <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
                                    View All <FaChevronRight className="ml-1" size={12} />
                                </button>
                            </div>
                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingBookings.map((booking, index) => (
                                        <motion.div 
                                            key={index} 
                                            className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
                                            whileHover={{ x: 5 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ 
                                                delay: 0.6 + index * 0.1,
                                                type: "spring", 
                                                stiffness: 300 
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={equipmentImages[booking.itemType] || equipmentImages.camera} 
                                                        alt={booking.itemName} 
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{booking.itemName}</h3>
                                                    <p className="text-sm text-gray-500">{booking.dateRange}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs ${
                                                    booking.status === "Confirmed" ? "bg-green-100 text-green-800" :
                                                    booking.status === "Pending payment" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {booking.status}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`text-xs px-3 py-1.5 rounded-lg ${
                                                        booking.status === "Confirmed" ? "bg-green-50 text-green-600 hover:bg-green-100" :
                                                        booking.status === "Pending payment" ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" :
                                                        "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                    } transition-colors`}
                                                >
                                                    {booking.status === "Confirmed" ? "View details" : 
                                                     booking.status === "Pending payment" ? "Complete payment" : 
                                                     "View request"}
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FaBoxOpen className="mx-auto h-10 w-10 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
                                    <p className="mt-1 text-sm text-gray-500">You don't have any upcoming bookings scheduled.</p>
                                </div>
                            )}
                        </motion.section>

                        {/* Quick Actions */}
                        <motion.section
                            className="bg-white rounded-xl shadow-xs p-6 border border-gray-100"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className="text-lg font-semibold text-gray-800 mb-5">Quick Actions</h2>
                            <div className="space-y-3">
                                {[
                                    { 
                                        title: "New Rental Request", 
                                        icon: <FaPlus className="text-teal-500" />,
                                        color: "bg-teal-50 text-teal-600 hover:bg-teal-100",
                                        delay: 0.6
                                    },
                                    { 
                                        title: "View Rental History", 
                                        icon: <FaHistory className="text-green-500" />,
                                        color: "bg-green-50 text-green-600 hover:bg-green-100",
                                        delay: 0.7
                                    },
                                    { 
                                        title: "Payment Methods", 
                                        icon: <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>,
                                        color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
                                        delay: 0.8
                                    },
                                    { 
                                        title: "Help Center", 
                                        icon: <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>,
                                        color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
                                        delay: 0.9
                                    }
                                ].map((action, index) => (
                                    <motion.button
                                        key={index}
                                        className={`w-full flex items-center justify-between p-4 ${action.color} rounded-lg transition-colors`}
                                        whileHover={{ x: 5 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            delay: action.delay,
                                            type: "spring",
                                            stiffness: 300
                                        }}
                                    >
                                        <span className="font-medium">{action.title}</span>
                                        {action.icon}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.section>
                    </div>

                    {/* Booking Calendar */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <ClientBookingComponent />
                    </motion.section>
                </main>
            </div>
        </div>
    );
};

export default ClientDashboard;
