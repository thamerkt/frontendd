import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import SidebarAdmin from '../../components/Admin/sidebar';
import { FaBell, FaSearch } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import "chart.js/auto";
import { useState } from "react";
import BookingComponent from '../../components/Admin/Booking';
import ClientComponent from "../../components/Admin/clients";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [timeframe, setTimeframe] = useState("Days");
    const [date, setDate] = useState(new Date());

    const dataSets = {
        Days: [500000, 950000, 200000, 400000, 600000, 300000, 800000],
        Weeks: [2000000, 2500000, 2200000, 2800000, 2600000, 2700000, 2900000],
        Months: [5000000, 5200000, 5100000, 5300000, 5400000, 5500000, 5600000],
        Years: [10000000, 12000000, 15000000, 14000000, 13000000, 16000000, 17000000],
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
    
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <SidebarAdmin />
            
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Top Navigation */}
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
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
                        <h1 className="text-2xl font-bold text-gray-800">Welcome back, <span className="text-teal-500">Alex</span></h1>
                        <p className="text-gray-500">Here's what's happening with your business today</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                        {[
                            { title: "Total Products", value: "45", icon: "/assets/box.png", change: "+12%", trend: "up" },
                            { title: "New Orders", value: "6", icon: "/assets/box.png", change: "+3%", trend: "up" },
                            { title: "Active Clients", value: "6", icon: "/assets/customer.png", change: "+5%", trend: "up" },
                            { title: "Total Balance", value: "$4,780,000", icon: "/assets/dollar-symbol.png", change: "+18%", trend: "up" }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                                        <p className="mt-1 text-2xl font-semibold text-teal-500">{stat.value}</p>
                                    </div>
                                    <div className="p-2 bg-teal-50 rounded-lg">
                                        <img src={stat.icon} alt={stat.title} className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.change} from last week
                                        {stat.trend === 'up' ? (
                                            <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
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
                                            className={`px-3 py-1 text-xs rounded-md ${timeframe === option ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
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
                                    { name: "Dellai M", date: "12 Dec", amount: "+1,500,000", status: "completed" },
                                    { name: "Kthiri Th", date: "11 Dec", amount: "+800,000", status: "completed" },
                                    { name: "Smith J", date: "10 Dec", amount: "+2,300,000", status: "pending" },
                                    { name: "Johnson A", date: "9 Dec", amount: "+1,200,000", status: "completed" },
                                    { name: "Williams B", date: "8 Dec", amount: "+950,000", status: "completed" }
                                ].map((payment, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${payment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                            {payment.status === 'completed' ? (
                                                <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900">{payment.name}</p>
                                            <p className="text-xs text-gray-500">{payment.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-teal-600">{payment.amount}</p>
                                            <p className={`text-xs ${payment.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {payment.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking and Client Components */}
                    <BookingComponent />
                    <ClientComponent />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;