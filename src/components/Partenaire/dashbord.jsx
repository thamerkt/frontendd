import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import SidebarAdmin from '../../components/Admin/sidebar';
import { FaBell, FaSearch, FaChartLine, FaHandshake, FaFileContract, FaMoneyBillWave, FaTruck, FaShieldAlt } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import "chart.js/auto";
import { useState } from "react";
import { motion } from "framer-motion";
import SidebarPartner from "./sidebar";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const PartnerDashboard = () => {
    const [timeframe, setTimeframe] = useState("Days");
    const [activeTab, setActiveTab] = useState("overview");
    const [partnerType, setPartnerType] = useState("delivery"); // delivery, assurance, finance

    const partnerData = {
        delivery: {
            name: "FastLogistics Co.",
            since: "2022-03-15",
            performance: 4.8,
            completedDeliveries: 1245,
            pendingDeliveries: 18,
            revenueShare: "15%",
            avgDeliveryTime: "2.4 hours"
        },
        assurance: {
            name: "SafeCover Insurance",
            since: "2021-11-02",
            performance: 4.6,
            activePolicies: 876,
            claimsThisMonth: 23,
            claimApprovalRate: "92%",
            avgProcessingTime: "3.2 days"
        },
        finance: {
            name: "QuickLease Financial",
            since: "2023-01-20",
            performance: 4.7,
            activeLoans: 342,
            avgApprovalTime: "1.8 days",
            defaultRate: "2.1%",
            revenueShare: "12.5%"
        }
    };

    const dataSets = {
        Days: [120000, 185000, 90000, 140000, 160000, 130000, 180000],
        Weeks: [520000, 625000, 522000, 628000, 626000, 727000, 729000],
        Months: [1520000, 1620000, 1510000, 1530000, 1540000, 1550000, 1560000],
        Years: [5100000, 6120000, 6150000, 5140000, 5130000, 6160000, 6170000],
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
                data: [78, 12, 5, 5],
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

    const partnerStats = {
        delivery: [
            { title: "Completed Deliveries", value: partnerData.delivery.completedDeliveries, icon: <FaTruck className="text-2xl text-teal-500" /> },
            { title: "Pending Deliveries", value: partnerData.delivery.pendingDeliveries, icon: <FaTruck className="text-2xl text-yellow-500" /> },
            { title: "Avg Delivery Time", value: partnerData.delivery.avgDeliveryTime, icon: <FaChartLine className="text-2xl text-blue-500" /> },
            { title: "Revenue Share", value: partnerData.delivery.revenueShare, icon: <FaMoneyBillWave className="text-2xl text-green-500" /> }
        ],
        assurance: [
            { title: "Active Policies", value: partnerData.assurance.activePolicies, icon: <FaShieldAlt className="text-2xl text-teal-500" /> },
            { title: "Claims This Month", value: partnerData.assurance.claimsThisMonth, icon: <FaFileContract className="text-2xl text-red-500" /> },
            { title: "Claim Approval Rate", value: partnerData.assurance.claimApprovalRate, icon: <FaChartLine className="text-2xl text-blue-500" /> },
            { title: "Avg Processing Time", value: partnerData.assurance.avgProcessingTime, icon: <FaChartLine className="text-2xl text-purple-500" /> }
        ],
        finance: [
            { title: "Active Loans", value: partnerData.finance.activeLoans, icon: <FaMoneyBillWave className="text-2xl text-teal-500" /> },
            { title: "Avg Approval Time", value: partnerData.finance.avgApprovalTime, icon: <FaChartLine className="text-2xl text-blue-500" /> },
            { title: "Default Rate", value: partnerData.finance.defaultRate, icon: <FaChartLine className="text-2xl text-red-500" /> },
            { title: "Revenue Share", value: partnerData.finance.revenueShare, icon: <FaMoneyBillWave className="text-2xl text-green-500" /> }
        ]
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <SidebarPartner />

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
                                <IoPersonCircle className="text-teal-600 text-xl" />
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">Partner Portal</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Partner Header */}
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {partnerData[partnerType].name} Partner Dashboard
                            </h1>
                            <p className="text-gray-500">
                                Partner since {new Date(partnerData[partnerType].since).toLocaleDateString()} •
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    ⭐ {partnerData[partnerType].performance} Rating
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

                    {/* Navigation Tabs */}
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

                    {/* Stats Cards */}
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
                                        <p className="mt-1 text-2xl font-semibold text-teal-500">{stat.value}</p>
                                    </div>
                                    <div className="p-2 bg-teal-50 rounded-lg">
                                        {stat.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts and Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Joint Revenue Performance</h2>
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

                        {/* Status Overview */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Overview</h2>
                            <div className="h-64">
                                <Pie data={pieData} />
                            </div>
                        </div>
                    </div>

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
                            <button className="text-xs text-teal-600 hover:text-teal-700">View All</button>
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
                                        { id: "TRX-78945", date: "2023-06-15", amount: "$1,245.00", status: "completed" },
                                        { id: "TRX-78944", date: "2023-06-14", amount: "$845.50", status: "completed" },
                                        { id: "TRX-78943", date: "2023-06-13", amount: "$2,150.00", status: "pending" },
                                        { id: "TRX-78942", date: "2023-06-12", amount: "$1,020.00", status: "completed" },
                                    ].map((transaction, index) => (
                                        <motion.tr
                                            key={index}
                                            className="hover:bg-gray-50"
                                            whileHover={{ backgroundColor: "#f9fafb" }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">{transaction.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                    }`}>
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
                                <button className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100">
                                    View Document
                                </button>
                                <button className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-md hover:bg-gray-100">
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
                                <button className="px-3 py-1 bg-teal-50 text-teal-600 text-sm rounded-md hover:bg-teal-100">
                                    Contact Support
                                </button>
                                <button className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-md hover:bg-gray-100">
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
                                <button className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-md hover:bg-purple-100">
                                    Generate Report
                                </button>
                                <button className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-md hover:bg-gray-100">
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
                            <button className="text-xs text-teal-600 hover:text-teal-700">View Calendar</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                {
                                    title: "Quarterly Review Meeting",
                                    date: "2023-06-20",
                                    description: "Discuss partnership performance and improvements",
                                    priority: "high"
                                },
                                {
                                    title: "Revenue Share Payment Due",
                                    date: "2023-06-25",
                                    description: "Process partner payment for May 2023",
                                    priority: "medium"
                                },
                                {
                                    title: "Contract Renewal",
                                    date: "2023-07-15",
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