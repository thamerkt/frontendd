import { CheckCircle, XCircle, Clock, Edit, Trash2, ArrowUp, ArrowDown, TrendingUp, Package, DollarSign, Users, Search, Filter, ChevronDown, ChevronUp, Calendar, FileText, Plus, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API Service
const apiService = {
  partnerStats: {
    get: async (partnerId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/partner-stats/${partnerId}/`);
        return response.data;
      } catch (error) {
        console.error("Error fetching partner stats:", error);
        return {
          totalRevenue: 0,
          totalRentals: 0,
          activeCustomers: 0,
          overdueRentals: 0
        };
      }
    }
  },
  rentalStatus: {
    get: async (partnerId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/rental-status/${partnerId}/`);
        return response.data;
      } catch (error) {
        console.error("Error fetching rental status:", error);
        return [
          { name: 'Delivered', value: 0 },
          { name: 'Processing', value: 0 },
          { name: 'Canceled', value: 0 }
        ];
      }
    }
  },
  monthlyPerformance: {
    get: async (partnerId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/monthly-performance/${partnerId}/`);
        return response.data;
      } catch (error) {
        console.error("Error fetching monthly performance:", error);
        return [
          { name: 'Jan', revenue: 0, rentals: 0 },
          { name: 'Feb', revenue: 0, rentals: 0 },
          { name: 'Mar', revenue: 0, rentals: 0 },
          { name: 'Apr', revenue: 0, rentals: 0 },
          { name: 'May', revenue: 0, rentals: 0 },
          { name: 'Jun', revenue: 0, rentals: 0 },
          { name: 'Jul', revenue: 0, rentals: 0 }
        ];
      }
    }
  },
  categoryDistribution: {
    get: async (partnerId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/category-distribution/${partnerId}/`);
        return response.data;
      } catch (error) {
        console.error("Error fetching category distribution:", error);
        return [
          { name: 'Photography', value: 0 },
          { name: 'Computers', value: 0 },
          { name: 'Phones', value: 0 },
          { name: 'Audio', value: 0 },
          { name: 'Other', value: 0 }
        ];
      }
    }
  },
  recentRentals: {
    get: async (partnerId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/recent-rentals/${partnerId}/`);
        return response.data;
      } catch (error) {
        console.error("Error fetching recent rentals:", error);
        return [];
      }
    }
  }
};

const COLORS = ['#0d9488', '#f59e0b', '#ef4444'];
const CATEGORY_COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const PartenaireClientComponent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRentals: 0,
    activeCustomers: 0,
    overdueRentals: 0
  });
  const [statusData, setStatusData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [rentalProducts, setRentalProducts] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  // Initialize partner data
  useEffect(() => {
    const initializePartnerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, you would get the partner ID from auth context or similar
        const partnerId = "1"; // Hardcoded for example
        
        // Fetch all data in parallel
        const [statsData, statusData, monthlyData, categoryData, rentalsData] = await Promise.all([
          apiService.partnerStats.get(partnerId),
          apiService.rentalStatus.get(partnerId),
          apiService.monthlyPerformance.get(partnerId),
          apiService.categoryDistribution.get(partnerId),
          apiService.recentRentals.get(partnerId)
        ]);
        
        setStats(statsData);
        setStatusData(statusData);
        setMonthlyRevenueData(monthlyData);
        setCategoryData(categoryData);
        setRentalProducts(rentalsData);
        setLoading(false);
        
      } catch (err) {
        console.error("Error initializing partner data:", err);
        setError("Failed to load partner data");
        setLoading(false);
      }
    };
    
    initializePartnerData();
  }, []);

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
      
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partner dashboard...</p>
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
    <div className="ml-20 lg:ml-64 p-6 overflow-y-auto h-screen bg-gray-50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Partner Dashboard</h1>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            <button className="flex items-center px-4 py-2 bg-teal-600 rounded-lg text-sm font-medium text-white hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Rental
            </button>
          </div>
        </div>

        <SidebarPartner />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">${stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-teal-600 ml-1">0% from last month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-teal-50">
                <DollarSign className="h-6 w-6 text-teal-600" />
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
                <p className="text-sm font-medium text-gray-500">Total Rentals</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.totalRentals}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-teal-600 ml-1">0% from last month</span>
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
                <p className="text-sm font-medium text-gray-500">Active Rentals</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.activeCustomers}</p>
                <div className="flex items-center mt-2">
                  {stats.activeCustomers > 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-teal-500" />
                      <span className="text-sm text-teal-600 ml-1">0% from last month</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 ml-1">0% from last month</span>
                    </>
                  )}
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
                <p className="text-sm font-medium text-gray-500">Overdue Rentals</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.overdueRentals}</p>
                <div className="flex items-center mt-2">
                  {stats.overdueRentals > 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 ml-1">Need attention</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-teal-500" />
                      <span className="text-sm text-teal-600 ml-1">On track</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rental Status Pie Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Rental Status</h3>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View Details
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} rentals`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #eee',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Revenue & Rentals Line Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Performance</h3>
              <div className="flex space-x-2">
                <button className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded">Revenue</button>
                <button className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Rentals</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyRevenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis yAxisId="left" stroke="#0d9488" />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #eee',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0d9488" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="rentals" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View All
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #eee',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                  ></div>
                  <span className="text-xs text-gray-600">{category.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Rentals Table */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Rentals</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search rentals..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>

          {rentalProducts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rentalProducts.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <motion.tr 
                          className="hover:bg-gray-50 cursor-pointer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          onClick={() => toggleRowExpand(item.id)}
                        >
                          <td className="p-3 text-sm font-medium text-gray-900">{item.id}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 mr-3">
                                <img 
                                  src={item.image} 
                                  alt={item.product}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900">{item.product}</span>
                                <span className="block text-xs text-gray-500">{item.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-900">{item.customer}</td>
                          <td className="p-3 text-sm text-gray-500">{item.date}</td>
                          <td className="p-3 text-sm font-medium text-gray-900">{item.amount}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              {item.status === "Delivered" && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Delivered
                                </span>
                              )}
                              {item.status === "Processing" && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                  Processing
                                </span>
                              )}
                              {item.status === "Canceled" && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Canceled
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <motion.button 
                                className="p-1 rounded-md hover:bg-blue-50 text-blue-500"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit className="h-4 w-4" />
                              </motion.button>
                              <motion.button 
                                className="p-1 rounded-md hover:bg-gray-50 text-gray-500"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </motion.button>
                              {expandedRow === item.id ? (
                                <ChevronUp className="h-4 w-4 text-gray-500 ml-2" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
                              )}
                            </div>
                          </td>
                        </motion.tr>
                        
                        {expandedRow === item.id && (
                          <motion.tr 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-50"
                          >
                            <td colSpan="7" className="p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Payment Method</p>
                                  <p className="font-medium">{item.payment}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Rental Duration</p>
                                  <p className="font-medium">{item.duration}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Category</p>
                                  <p className="font-medium">{item.category}</p>
                                </div>
                                <div className="flex space-x-3 items-center">
                                  <button className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Invoice
                                  </button>
                                  <button className="flex items-center px-3 py-1 bg-teal-600 rounded-lg text-xs font-medium text-white hover:bg-teal-700">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{rentalProducts.length}</span> of <span className="font-medium">{rentalProducts.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 rounded-md bg-teal-600 text-sm font-medium text-white hover:bg-teal-700">
                    1
                  </button>
                  <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent rentals</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any rental history yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PartenaireClientComponent;