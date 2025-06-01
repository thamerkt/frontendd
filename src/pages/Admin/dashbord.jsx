import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

import { FaBell, FaSearch, FaTools, FaChartLine, FaUserCog, FaBolt } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import "chart.js/auto";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from 'axios';
import { Package, Users, DollarSign, Clock, TrendingUp, ArrowUp, ArrowDown, XCircle } from "lucide-react";
import BookingComponent from "../../components/Admin/Booking";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// API Service
const apiService = {
  reports: {
    getByUser: async (username) => {
      const response = await axios.get(`http://localhost:8000/reports/rapports/?user=${username}`,{withCredentials: true});
      return response.data;
    },
    create: async (reportData) => {
      const response = await axios.post('http://localhost:8000/reports/rapports/', reportData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      return response.data;
    }
  },
  reportData: {
    getByReport: async (reportId) => {
      const response = await axios.get(`http://localhost:8000/reports/rapport-data/?rapport=${reportId}`,{withCredentials: true});
      return response.data;
    },
    create: async (metricData) => {
      const response = await axios.post('http://localhost:8000/reports/rapport-data/', metricData,{withCredentials: true});
      return response.data;
    }
  }
};

const REQUIRED_REPORTS = [
  {
    type: "admin_performance",
    title: "Admin Performance Report",
    description: "Detailed analysis of admin performance metrics",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Total Products", metric_value: 0, unit: "" },
      { metric_name: "New Orders", metric_value: 0, unit: "" },
      { metric_name: "Active Clients", metric_value: 0, unit: "" },
      { metric_name: "Total Balance", metric_value: 0, unit: "$" }
    ]
  },
  {
    type: "admin_financial",
    title: "Admin Financial Report",
    description: "Financial overview of business activities",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Total Revenue", metric_value: 0, unit: "$" },
      { metric_name: "Monthly Growth", metric_value: 0, unit: "%" },
      { metric_name: "Average Transaction", metric_value: 0, unit: "$" }
    ]
  }
];

const Dashboard = () => {
    const [timeframe, setTimeframe] = useState("Days");
    const [date, setDate] = useState(new Date());
    const [loadingReports, setLoadingReports] = useState(true);
    const [reportError, setReportError] = useState(null);
    const [adminReports, setAdminReports] = useState([]);
    const [adminMetrics, setAdminMetrics] = useState({});
    const [adminStats, setAdminStats] = useState({
        totalProducts: 0,
        newOrders: 0,
        activeClients: 0,
        totalBalance: 0,
        monthlyGrowth: "0%",
        avgTransaction: 0
    });

    // Initialize admin reports and metrics
    useEffect(() => {
        const initializeAdminReports = async () => {
            try {
                setLoadingReports(true);
                setReportError(null);
                
                // Simulate admin data
                const adminName = "admin";
                
                // 1. Fetch existing reports
                const existingReports = await apiService.reports.getByUser(adminName);
                
                // 2. Check which required reports are missing
                const missingReports = REQUIRED_REPORTS.filter(requiredReport => 
                    !existingReports.some(existingReport => existingReport.type === requiredReport.type)
                );
                
                // 3. Create missing reports
                const createdReports = await Promise.all(
                    missingReports.map(async reportTemplate => {
                        const now = new Date().toISOString();
                        const reportData = {
                            ...reportTemplate,
                            user: adminName,
                            date_created: now,
                            start_date: new Date().toISOString().split('T')[0],
                            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                                .toISOString()
                                .split('T')[0]
                        };
                        const response = await apiService.reports.create(reportData);
                        return response.id;
                    })
                );
                
                // 4. Combine all reports
                const allReports = [...existingReports, ...createdReports];
                setAdminReports(allReports);
                
                // 5. Initialize metrics for each report and collect them
                const metricsCollection = {};
                
                await Promise.all(
                    allReports.map(async report => {
                        let metrics = await apiService.reportData.getByReport(report.id);
                        
                        if (metrics.length === 0) {
                            const reportTemplate = REQUIRED_REPORTS.find(r => r.type === report.type);
                            
                            if (reportTemplate?.metrics) {
                                await Promise.all(
                                    reportTemplate.metrics.map(metricTemplate => 
                                        apiService.reportData.create({
                                            rapport: report.id,
                                            ...metricTemplate
                                        })
                                    )
                                );
                                metrics = reportTemplate.metrics;
                            }
                        }
                        
                        metricsCollection[report.type] = metrics;
                    })
                );
                
                setAdminMetrics(metricsCollection);
                setLoadingReports(false);
                
            } catch (err) {
                console.error("Error initializing admin reports:", err);
                setReportError("Failed to initialize admin reports");
                setLoadingReports(false);
            }
        };
        
        initializeAdminReports();
    }, []);

    // Generate revenue data starting from 0
    const generateRevenueData = (timeframe) => {
        const baseValues = {
            Days: [0, 0, 0, 0, 0, 0, 0],
            Weeks: [0, 0, 0, 0, 0, 0, 0],
            Months: [0, 0, 0, 0, 0, 0, 0],
            Years: [0, 0, 0, 0, 0, 0, 0]
        };
        
        return baseValues[timeframe];
    };

    const dataSets = {
        Days: generateRevenueData("Days"),
        Weeks: generateRevenueData("Weeks"),
        Months: generateRevenueData("Months"),
        Years: generateRevenueData("Years"),
    };

    const barData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: `Revenue (${timeframe})`,
                data: dataSets[timeframe],
                backgroundColor: "#2EA099",
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1F2937',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 6,
                displayColors: false
            }
        },
        scales: { 
            y: { 
                beginAtZero: true,
                grid: {
                    color: '#E5E7EB',
                    drawBorder: false
                },
                ticks: {
                    callback: function(value) {
                        return '$' + (value / 1000000) + 'M';
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                }
            }
        },
    };

    if (loadingReports) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Initializing admin reports...</p>
                </div>
            </div>
        );
    }

    if (reportError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
                    <div className="text-red-500 text-2xl mb-3">⚠️</div>
                    <h3 className="text-lg font-medium text-red-800">Error Loading Reports</h3>
                    <p className="mt-2 text-red-600">{reportError}</p>
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
            {/* Sidebar */}
            
            
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
                    
                    
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Welcome Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Welcome back, <span className="text-teal-500">Alex</span></h1>
                        <p className="text-gray-500">Here's what's happening with your business today</p>
                    </div>

                    {/* Stats Cards - First Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">{adminStats.totalProducts}</p>
                                    <div className="flex items-center mt-2">
                                        <ArrowUp className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm text-teal-600 ml-1">+0% from last month</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <Package className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">New Orders</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">{adminStats.newOrders}</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm text-teal-600 ml-1">+0% from last week</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <Package className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Clients</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">{adminStats.activeClients}</p>
                                    <div className="flex items-center mt-2">
                                        <ArrowDown className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600 ml-1">0% from last month</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <Users className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Balance</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">${adminStats.totalBalance}</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm text-teal-600 ml-1">+0% from last month</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <DollarSign className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Rental Performance Metrics - Second Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Avg. Rental Duration</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">0 days</p>
                                    <div className="flex items-center mt-2">
                                        <ArrowUp className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm text-teal-600 ml-1">+0 days</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <Clock className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Peak Rental Days</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">None</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm text-teal-600 ml-1">+0% demand</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <TrendingUp className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Item Utilization</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">0%</p>
                                    <div className="flex items-center mt-2">
                                        <ArrowUp className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm text-teal-600 ml-1">+0% MoM</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <Package className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Cancellation Rate</p>
                                    <p className="text-2xl font-semibold text-gray-800 mt-1">0%</p>
                                    <div className="flex items-center mt-2">
                                        <ArrowDown className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600 ml-1">-0%</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-teal-50">
                                    <XCircle className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Charts and Recent Payments */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
                                <div className="flex space-x-1">
                                    {["Days", "Weeks", "Months", "Years"].map(option => (
                                        <button
                                            key={option}
                                            className={`px-3 py-1 text-xs rounded-md transition-all ${timeframe === option ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                            onClick={() => setTimeframe(option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-64">
                                <Bar data={barData} options={barOptions} />
                            </div>
                        </div>

                        {/* Recent Payments */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
                            <div className="space-y-4">
                                {[
                                    { name: "No transactions yet", date: "--", amount: "$0", status: "none" }
                                ].map((payment, index) => (
                                    <motion.div 
                                        key={index} 
                                        className="flex items-center p-2 rounded-lg hover:bg-gray-50"
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-100`}>
                                            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900">{payment.name}</p>
                                            <p className="text-xs text-gray-500">{payment.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-teal-600">{payment.amount}</p>
                                            <p className="text-xs text-gray-500">
                                                {payment.status}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Maintenance & Item Health */}
                    <motion.div 
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaTools className="text-teal-500" /> Maintenance & Item Health
                            </h2>
                            <button className="text-xs text-teal-600 hover:text-teal-700">View All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border-l-4 border-red-500 pl-3 py-1">
                                <h3 className="font-medium text-gray-700">🔴 High Priority (0)</h3>
                                <p className="text-sm text-gray-500">No high priority items</p>
                            </div>
                            <div className="border-l-4 border-yellow-500 pl-3 py-1">
                                <h3 className="font-medium text-gray-700">🟡 Medium Priority (0)</h3>
                                <p className="text-sm text-gray-500">No medium priority items</p>
                            </div>
                            <div className="border-l-4 border-green-500 pl-3 py-1">
                                <h3 className="font-medium text-gray-700">🟢 Routine Checks (0)</h3>
                                <p className="text-sm text-gray-500">No routine checks needed</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Admin Quick Actions */}
                    <motion.div 
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaBolt className="text-teal-500" /> Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { title: "Add New Item", icon: <FaTools className="text-teal-600" />, color: "bg-teal-50 hover:bg-teal-100" },
                                { title: "Process Return", icon: <FaTools className="text-blue-600" />, color: "bg-blue-50 hover:bg-blue-100" },
                                { title: "Create Invoice", icon: <FaTools className="text-purple-600" />, color: "bg-purple-50 hover:bg-purple-100" },
                                { title: "Send Notification", icon: <FaTools className="text-orange-600" />, color: "bg-orange-50 hover:bg-orange-100" }
                            ].map((action, index) => (
                                <motion.button 
                                    key={index}
                                    className={`flex flex-col items-center p-4 rounded-lg ${action.color} transition-all`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="text-2xl mb-2">{action.icon}</span>
                                    <span className="text-sm font-medium">{action.title}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Staff Management */}
                    <motion.div 
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaUserCog className="text-teal-500" /> Staff Management
                            </h2>
                            <button className="text-xs text-teal-600 hover:text-teal-700">Manage Team</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {[
                                        { name: "No staff yet", role: "--", action: "--", status: "--" }
                                    ].map((staff, index) => (
                                        <motion.tr 
                                            key={index}
                                            className="hover:bg-gray-50"
                                            whileHover={{ backgroundColor: "#f9fafb" }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.action}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800`}>
                                                    {staff.status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Booking and Client Components */}
                    <BookingComponent />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;