import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { FaBell, FaSearch, FaChartLine, FaHandshake, FaFileContract, FaMoneyBillWave, FaTruck, FaShieldAlt } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Enhanced Report Configuration with more static data
const REQUIRED_REPORTS = [
  {
    type: "partner_performance",
    title: "Partner Performance Report",
    description: "Detailed analysis of partner performance metrics",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Completed Transactions", metric_value: 1245, unit: "" },
      { metric_name: "Success Rate", metric_value: 92, unit: "%" },
      { metric_name: "Average Rating", metric_value: 4.7, unit: "stars" },
      { metric_name: "Customer Satisfaction", metric_value: 89, unit: "%" },
      { metric_name: "On-Time Delivery", metric_value: 94, unit: "%" }
    ]
  },
  {
    type: "partner_financial",
    title: "Partner Financial Report",
    description: "Financial overview of partnership activities",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Total Revenue", metric_value: 1520000, unit: "$" },
      { metric_name: "Revenue Share", metric_value: 228000, unit: "$" },
      { metric_name: "Processing Fees", metric_value: 45600, unit: "$" },
      { metric_name: "Tax Deductions", metric_value: 68400, unit: "$" },
      { metric_name: "Net Earnings", metric_value: 159600, unit: "$" }
    ]
  },
  {
    type: "partner_quarterly",
    title: "Quarterly Performance Review",
    description: "Quarterly summary of partnership metrics",
    is_scheduled: true,
    schedule_frequency: "quarterly",
    metrics: [
      { metric_name: "Quarterly Growth", metric_value: 12.5, unit: "%" },
      { metric_name: "New Customers Acquired", metric_value: 342, unit: "" },
      { metric_name: "Revenue per Transaction", metric_value: 1220, unit: "$" }
    ]
  }
];

// API Service
const apiService = {
  reports: {
    getByUser: async (username) => {
      const response = await axios.get(`http://127.0.0.1:8000/api/rapports/?user=${username}`);
      return response.data;
    },
    create: async (reportData) => {
      const response = await axios.post('http://127.0.0.1:8000/api/rapports/', reportData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    }
  },
  reportData: {
    getByReport: async (reportId) => {
      const response = await axios.get(`http://127.0.0.1:8000/api/rapport-data/?rapport=${reportId}`);
      return response.data;
    },
    create: async (metricData) => {
      const response = await axios.post('http://127.0.0.1:8000/api/rapport-data/', metricData);
      return response.data;
    }
  }
};

const PartnerDashboard = () => {
    const [timeframe, setTimeframe] = useState("Days");
    const [activeTab, setActiveTab] = useState("overview");
    const [partnerType, setPartnerType] = useState("delivery");
    const [loadingReports, setLoadingReports] = useState(true);
    const [reportError, setReportError] = useState(null);
    const [partnerReports, setPartnerReports] = useState([]);
    const [partnerMetrics, setPartnerMetrics] = useState({});
    const [partnerInfo, setPartnerInfo] = useState({
        name: "Global Logistics Partner",
        since: new Date('2022-01-15').toISOString(),
        performance: 0,
        completedDeliveries: 0,
        pendingDeliveries: 0,
        revenueShare: "0%",
        avgDeliveryTime: "0",
        activePolicies: 0,
        claimsThisMonth: 0,
        claimApprovalRate: "0%",
        avgProcessingTime: "",
        activeLoans: 387,
        avgApprovalTime: "",
        defaultRate: "0%",
        totalRevenue: 0,
        quarterlyGrowth: "0%",
        customerSatisfaction: "0%"
    });

    // Initialize partner reports and metrics
    useEffect(() => {
        const initializePartnerReports = async () => {
            try {
                setLoadingReports(true);
                setReportError(null);
                
                // Simulate partner data based on type
                const partnerName = "global_logistics";
                
                // 1. Fetch existing reports
                const existingReports = await apiService.reports.getByUser(partnerName);
                
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
                            user: partnerName,
                            date_created: now,
                            start_date: new Date().toISOString().split('T')[0],
                            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                                .toISOString()
                                .split('T')[0]
                        };
                        const response= await apiService.reports.create(reportData);
                        return response.data.id
                    })
                );
                
                // 4. Combine all reports
                const allReports = [...existingReports, ...createdReports];
                setPartnerReports(allReports);
                
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
                
                setPartnerMetrics(metricsCollection);
                setLoadingReports(false);
                
            } catch (err) {
                console.error("Error initializing partner reports:", err);
                setReportError("Failed to initialize partner reports");
                setLoadingReports(false);
            }
        };
        
        initializePartnerReports();
    }, [partnerType]);

    // More realistic revenue data starting from 0
    const generateRevenueData = (timeframe) => {
        const baseValues = {
            Days: [0, 45000, 85000, 120000, 180000, 220000, 250000],
            Weeks: [0, 180000, 350000, 520000, 680000, 820000, 950000],
            Months: [0, 420000, 800000, 1150000, 1450000, 1700000, 1900000],
            Years: [0, 1200000, 2300000, 3300000, 4200000, 5000000, 5700000]
        };
        
        // Add some minor randomization to make it look more natural
        return baseValues[timeframe].map(value => 
            value > 0 ? value + Math.floor(Math.random() * value * 0.1) : 0
        );
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
                label: `Joint Revenue (${timeframe})`,
                data: dataSets[timeframe],
                backgroundColor: "#2EA099",
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
    };

    const pieData = {
        labels: ['Completed', 'Pending', 'Cancelled', 'In Process'],
        datasets: [
            {
                data: [
                    partnerInfo.completedDeliveries,
                    partnerInfo.pendingDeliveries,
                    Math.floor(partnerInfo.completedDeliveries * 0.05),
                    Math.floor(partnerInfo.completedDeliveries * 0.05)
                ],
                backgroundColor: [
                    '#2EA099',
                    '#F59E0B',
                    '#EF4444',
                    '#3B82F6'
                ],
                borderWidth: 0,
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
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `Revenue: $${context.raw.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                grid: {
                    color: '#E5E7EB',
                    drawBorder: false
                },
                ticks: {
                    callback: function (value) {
                        return '$' + (value / 1000) + 'K';
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

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: '#1F2937',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 6,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const partnerStats = {
        delivery: [
            { title: "Completed Deliveries", value: partnerInfo.completedDeliveries, icon: <FaTruck className="text-2xl text-teal-500" /> },
            { title: "Pending Deliveries", value: partnerInfo.pendingDeliveries, icon: <FaTruck className="text-2xl text-yellow-500" /> },
            { title: "Avg Delivery Time", value: partnerInfo.avgDeliveryTime, icon: <FaChartLine className="text-2xl text-blue-500" /> },
            { title: "Total Revenue", value: `$${(partnerInfo.totalRevenue / 1000).toFixed(0)}K`, icon: <FaMoneyBillWave className="text-2xl text-green-500" /> }
        ],
        assurance: [
            { title: "Active Policies", value: partnerInfo.activePolicies, icon: <FaShieldAlt className="text-2xl text-teal-500" /> },
            { title: "Claims This Month", value: partnerInfo.claimsThisMonth, icon: <FaFileContract className="text-2xl text-red-500" /> },
            { title: "Claim Approval Rate", value: partnerInfo.claimApprovalRate, icon: <FaChartLine className="text-2xl text-blue-500" /> },
            { title: "Customer Satisfaction", value: partnerInfo.customerSatisfaction, icon: <FaChartLine className="text-2xl text-purple-500" /> }
        ],
        finance: [
            { title: "Active Loans", value: partnerInfo.activeLoans, icon: <FaMoneyBillWave className="text-2xl text-teal-500" /> },
            { title: "Avg Approval Time", value: partnerInfo.avgApprovalTime, icon: <FaChartLine className="text-2xl text-blue-500" /> },
            { title: "Default Rate", value: partnerInfo.defaultRate, icon: <FaChartLine className="text-2xl text-red-500" /> },
            { title: "Quarterly Growth", value: partnerInfo.quarterlyGrowth, icon: <FaChartLine className="text-2xl text-green-500" /> }
        ]
    };

    if (loadingReports) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Initializing partner reports...</p>
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
            <SidebarPartner />

            <div className="flex-1 ml-20 lg:ml-64 overflow-y-auto h-screen">
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
                                <IoPersonCircle className="text-teal-600 text-xl" />
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">Partner Portal</span>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {partnerInfo.name} Dashboard
                            </h1>
                            <p className="text-gray-500">
                                Partner since {new Date(partnerInfo.since).toLocaleDateString()} •
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    ⭐ {partnerInfo.performance} Rating
                                </span>
                            </p>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPartnerType("delivery")}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${partnerType === "delivery" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                Delivery
                            </button>
                            <button
                                onClick={() => setPartnerType("assurance")}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${partnerType === "assurance" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                Assurance
                            </button>
                            <button
                                onClick={() => setPartnerType("finance")}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${partnerType === "finance" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                Finance
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            {["overview", "performance", "transactions", "documents"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? "border-teal-500 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                        {partnerStats[partnerType].map((stat, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all"
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-800">{stat.value}</p>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        {stat.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Revenue Performance</h2>
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
                            <div className="mt-4 text-sm text-gray-500">
                                <p>Showing revenue data for the current period. Hover over bars for details.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Overview</h2>
                            <div className="h-64">
                                <Pie data={pieData} options={pieOptions} />
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                <p>Breakdown of transaction status for the current period.</p>
                            </div>
                        </div>
                    </div>

                    {/* Partner Reports Section */}
                    <motion.section 
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Your Partner Reports</h2>
                            <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">View All</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {partnerReports.map((report) => (
                                <motion.div
                                    key={report.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <div className="flex items-start">
                                        <div className="p-2 bg-teal-50 rounded-lg mr-3">
                                            <FaFileContract className="text-teal-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                                            <p className="text-sm text-gray-500 mb-2">{report.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-400">
                                                    Last updated: {new Date(report.date_created).toLocaleDateString()}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className="text-xs bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-all"
                                                >
                                                    View Details
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Recent Transactions */}
                    <motion.div
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaMoneyBillWave className="text-teal-500" /> Recent Transactions
                            </h2>
                            <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {[
                                        { id: "TRX-45892", date: new Date(), amount: 1850.50, status: "completed" },
                                        { id: "TRX-45891", date: new Date(new Date().setDate(new Date().getDate() - 1)), amount: 1250.00, status: "completed" },
                                        { id: "TRX-45890", date: new Date(new Date().setDate(new Date().getDate() - 2)), amount: 980.75, status: "completed" },
                                        { id: "TRX-45889", date: new Date(new Date().setDate(new Date().getDate() - 3)), amount: 2450.00, status: "pending" }
                                    ].map((transaction, index) => (
                                        <motion.tr
                                            key={index}
                                            className="hover:bg-gray-50"
                                            whileHover={{ backgroundColor: "#f9fafb" }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date.toISOString().split('T')[0]}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">${transaction.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-teal-600 hover:text-teal-900 mr-3">Details</button>
                                                <button className="text-gray-600 hover:text-gray-900">Invoice</button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Partner Resources */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Partner Agreement */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FaFileContract className="text-blue-500 text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Partner Agreement</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Review the current partnership agreement terms and conditions.
                            </p>
                            <div className="flex space-x-3">
                                <button className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100 font-medium">
                                    View Document
                                </button>
                                <button className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-md hover:bg-gray-100 font-medium">
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Support Center */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-teal-50 rounded-lg">
                                    <FaHandshake className="text-teal-500 text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Partner Support</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Get help with any partnership-related questions or issues.
                            </p>
                            <div className="flex space-x-3">
                                <button className="px-3 py-1 bg-teal-50 text-teal-600 text-sm rounded-md hover:bg-teal-100 font-medium">
                                    Contact Support
                                </button>
                                <button className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-md hover:bg-gray-100 font-medium">
                                    FAQ
                                </button>
                            </div>
                        </div>

                        {/* Performance Report */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <FaChartLine className="text-purple-500 text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Performance Report</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Download your latest performance metrics and KPIs.
                            </p>
                            <div className="flex space-x-3">
                                <button className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-md hover:bg-purple-100 font-medium">
                                    Generate Report
                                </button>
                                <button className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-md hover:bg-gray-100 font-medium">
                                    Previous Reports
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Upcoming Tasks */}
                    <motion.div
                        className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Upcoming Tasks & Deadlines</h2>
                            <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">View Calendar</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                {
                                    title: "Quarterly Review Meeting",
                                    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
                                    description: "Discuss partnership performance and improvements",
                                    priority: "high"
                                },
                                {
                                    title: "Revenue Share Payment Due",
                                    date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
                                    description: "Process partner payment for current period",
                                    priority: "medium"
                                },
                                {
                                    title: "Contract Renewal",
                                    date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                                    description: "Partnership agreement renewal discussion",
                                    priority: "low"
                                }
                            ].map((task, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start p-3 border rounded-lg hover:shadow-md transition-all"
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className={`flex-shrink-0 h-3 w-3 mt-1.5 rounded-full ${task.priority === "high" ? "bg-red-500" :
                                            task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                                        }`}></div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                                            <span className="text-xs text-gray-500">{task.date}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{task.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default PartnerDashboard;