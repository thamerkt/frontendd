import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

import { FaBell, FaSearch, FaTools, FaChartLine, FaUserCog, FaBolt, FaUsers, FaBoxes, FaTags, FaHandshake } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import "chart.js/auto";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from 'axios';
import { Package, Users, DollarSign, Clock, TrendingUp, ArrowUp, ArrowDown, XCircle, CheckCircle, Search } from "lucide-react";
import BookingComponent from "../../components/Admin/Booking";

import EquipmentService from "../../services/EquipmentService";
import authStore from "../../redux/authStore";
import { Link } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);





const Dashboard = () => {
    const [stats, setStats] = useState({
        categories: 0,
        products: 0,
        users: 0,
        partners: 0
    });
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Verify new user registration', completed: false, priority: 'high' },
        { id: 2, title: 'Search for potential partners', completed: false, priority: 'medium' },
        { id: 3, title: 'Check data availability in reports', completed: false, priority: 'low' }
    ]);

    // Fetch statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                
                // Fetch all data in parallel
                const [categories, products, users] = await Promise.all([
                    EquipmentService.fetchCategories(),
                    EquipmentService.fetchRentals(),
                    authStore.getUsers()
                ]);
                
                setStats({
                    categories: categories.length,
                    products: products.length,
                    users: users.length,
                    partners: 0 // Initialize partners to 0
                });
                console.log(users)
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching statistics:", error);
                setLoading(false);
            }
        };
        
        fetchStats();
    }, []);

    // Toggle task completion
    const toggleTask = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    // Stats cards data
    const statCards = [
        {
            title: "Categories",
            value: stats.categories,
            icon: <FaTags className="text-blue-600" />,
            color: "bg-blue-50",
            change: "+0%"
        },
        {
            title: "Products",
            value: stats.products,
            icon: <FaBoxes className="text-green-600" />,
            color: "bg-green-50",
            change: "+0%"
        },
        {
            title: "Users",
            value: stats.users,
            icon: <FaUsers className="text-purple-600" />,
            color: "bg-purple-50",
            change: "+0%"
        },
        {
            title: "Partners",
            value: stats.partners,
            icon: <FaHandshake className="text-orange-600" />,
            color: "bg-orange-50",
            change: "+0%"
        }
    ];

    // Pie chart data for statistics overview
    const pieData = {
        labels: ['Categories', 'Products', 'Users', 'Partners'],
        datasets: [
            {
                data: [stats.categories, stats.products, stats.users, stats.partners],
                backgroundColor: [
                    '#3B82F6', // blue
                    '#10B981', // green
                    '#8B5CF6', // purple
                    '#F97316' // orange
                ],
                borderWidth: 0,
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Main Content */}
            <div className="flex-1 ml-20 lg:ml-64 overflow-y-auto h-screen">
                {/* Top Navigation */}
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
                    <div className="relative w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" 
                            placeholder="Search..."
                        />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <FaBell className="h-5 w-5" />
                                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                        
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                <span className="text-teal-600 font-medium text-sm">AD</span>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Welcome Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-500">Overview of platform statistics and tasks</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {statCards.map((stat, index) => (
                            <motion.div 
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                        <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="h-4 w-4 text-teal-500" />
                                            <span className="text-sm text-teal-600 ml-1">{stat.change}</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts and Tasks */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        {/* Statistics Pie Chart */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Distribution</h2>
                            <div className="h-64">
                                <Pie 
                                    data={pieData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const label = context.label || '';
                                                        const value = context.raw || 0;
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = Math.round((value / total) * 100);
                                                        return `${label}: ${value} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Tasks Section */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Admin Tasks</h2>
                                <button className="text-xs text-teal-600 hover:text-teal-700">View All</button>
                            </div>
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <motion.div 
                                        key={task.id}
                                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <button 
                                            onClick={() => toggleTask(task.id)}
                                            className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center border ${task.completed ? 'bg-teal-100 border-teal-500 text-teal-600' : 'bg-white border-gray-300'}`}
                                        >
                                            {task.completed && <CheckCircle className="h-3 w-3" />}
                                        </button>
                                        <div className="ml-3 flex-1">
                                            <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                        {task.title.includes('Search') && (
                                            <button className="p-1 text-gray-500 hover:text-teal-600">
                                                <Search className="h-4 w-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <motion.div 
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Admin Activity</h2>
                        <div className="space-y-4">
                            {[
                                { 
                                    action: "Initialized dashboard statistics", 
                                    time: "Just now", 
                                    icon: <FaChartLine className="text-teal-500" />
                                },
                                { 
                                    action: "Loaded platform data", 
                                    time: "1 min ago", 
                                    icon: <FaBoxes className="text-blue-500" />
                                },
                                { 
                                    action: "Set up admin tasks", 
                                    time: "2 mins ago", 
                                    icon: <FaUserCog className="text-purple-500" />
                                }
                            ].map((activity, index) => (
                                <motion.div 
                                    key={index} 
                                    className="flex items-start p-2 rounded-lg hover:bg-gray-50"
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100">
                                            {activity.icon}
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div 
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaBolt className="text-teal-500" /> Admin Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {[
        { 
            title: "Manage Categories", 
            icon: <FaTags className="text-blue-600" />, 
            color: "bg-blue-50 hover:bg-blue-100",
            url: "/owner/categorie"
        },
        { 
            title: "Manage Products", 
            icon: <FaBoxes className="text-green-600" />, 
            color: "bg-green-50 hover:bg-green-100",
            url: "/owner/products"
        },
        { 
            title: "Manage Users", 
            icon: <FaUsers className="text-purple-600" />, 
            color: "bg-purple-50 hover:bg-purple-100",
            url: "/owner/users"
        },
        { 
            title: "Manage Partners", 
            icon: <FaHandshake className="text-orange-600" />, 
            color: "bg-orange-50 hover:bg-orange-100",
            url: "/owner/users"
        }
    ].map((action, index) => (
        <Link to={action.url} key={index}>
            <motion.button 
                className={`w-full flex flex-col items-center p-4 rounded-lg ${action.color} transition-all`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium">{action.title}</span>
            </motion.button>
        </Link>
    ))}
</div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;