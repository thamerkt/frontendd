import { CheckCircle, XCircle, Clock, Edit, Trash2, ArrowUp, ArrowDown, TrendingUp, Package, DollarSign, Users } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from "react";
import axios from 'axios';

// API Service
const apiService = {
  reports: {
    getByUser: async (username) => {
      const response = await axios.get(`https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapports/?user=${username}`,{withCredentials: true});
      return response.data;
    },
    create: async (reportData) => {
      const response = await axios.post('https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapports/', reportData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      return response.data;
    }
  },
  reportData: {
    getByReport: async (reportId) => {
      const response = await axios.get(`https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapport-data/?rapport=${reportId}`,{withCredentials: true});
      return response.data;
    },
    create: async (metricData) => {
      const response = await axios.post('https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapport-data/', metricData,{withCredentials: true});
      return response.data;
    }
  }
};

const REQUIRED_REPORTS = [
  {
    type: "client_performance",
    title: "Client Performance Report",
    description: "Detailed analysis of client rental metrics",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Total Revenue", metric_value: 0, unit: "$" },
      { metric_name: "Total Rentals", metric_value: 0, unit: "" },
      { metric_name: "Active Customers", metric_value: 0, unit: "" },
      { metric_name: "Most Rented Product", metric_value: "None", unit: "" }
    ]
  },
  {
    type: "client_financial",
    title: "Client Financial Report",
    description: "Financial overview of rental activities",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Monthly Revenue", metric_value: 0, unit: "$" },
      { metric_name: "Monthly Growth", metric_value: 0, unit: "%" },
      { metric_name: "Average Rental Value", metric_value: 0, unit: "$" }
    ]
  }
];

const rentalProducts = [
  { 
    id: "#20462", 
    image: "assets/apple.png", 
    product: "Hat", 
    customer: "Matt Dickerson", 
    date: "13/05/2022", 
    amount: "$4.95", 
    payment: "Transfer Bank", 
    status: "Delivered" 
  },
  { 
    id: "#18933", 
    image: "assets/apple.png",
    product: "Laptop", 
    customer: "Wiktoria", 
    date: "22/05/2022", 
    amount: "$8.95", 
    payment: "Cash on Delivery", 
    status: "Delivered" 
  },
  { 
    id: "#45169", 
    image: "assets/apple.png",
    product: "Phone", 
    customer: "Trixie Byrd", 
    date: "15/06/2022", 
    amount: "$11,149.95", 
    payment: "Cash on Delivery", 
    status: "Process" 
  },
  { 
    id: "#17188", 
    image: "assets/apple.png",
    product: "Headset", 
    customer: "Sanderson", 
    date: "25/09/2022", 
    amount: "$22.95", 
    payment: "Cash on Delivery", 
    status: "Canceled" 
  },
  { 
    id: "#34304", 
    image: "assets/apple.png",
    product: "Bag", 
    customer: "Brad Mason", 
    date: "06/09/2022", 
    amount: "$899.95", 
    payment: "Transfer Bank", 
    status: "Process" 
  },
];

const COLORS = ['#0d9488', '#f59e0b', '#ef4444'];

const ClientComponent = () => {
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportError, setReportError] = useState(null);
  const [clientReports, setClientReports] = useState([]);
  const [clientMetrics, setClientMetrics] = useState({});
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRentals: 0,
    activeCustomers: 0,
    popularProduct: "None",
    monthlyGrowth: "0%",
    avgRentalValue: 0
  });

  const [statusData, setStatusData] = useState([
    { name: 'Delivered', value: 0 },
    { name: 'Processing', value: 0 },
    { name: 'Canceled', value: 0 },
  ]);

  const [monthlyRevenueData, setMonthlyRevenueData] = useState([
    { name: 'Jan', revenue: 0 },
    { name: 'Feb', revenue: 0 },
    { name: 'Mar', revenue: 0 },
    { name: 'Apr', revenue: 0 },
    { name: 'May', revenue: 0 },
    { name: 'Jun', revenue: 0 },
    { name: 'Jul', revenue: 0 },
  ]);

  // Initialize client reports and metrics
  useEffect(() => {
    const initializeClientReports = async () => {
      try {
        setLoadingReports(true);
        setReportError(null);
        
        // Simulate client data
        const clientName = "client";
        
        // 1. Fetch existing reports
        const existingReports = await apiService.reports.getByUser(clientName);
        
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
              user: clientName,
              date_created: now,
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                .toISOString()
                .split('T')[0]
            };
            const response = await apiService.reports.create(reportData);
            return response.data.id;
          })
        );
        
        // 4. Combine all reports
        const allReports = [...existingReports, ...createdReports];
        setClientReports(allReports);
        
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
        
        setClientMetrics(metricsCollection);
        setLoadingReports(false);
        
      } catch (err) {
        console.error("Error initializing client reports:", err);
        setReportError("Failed to initialize client reports");
        setLoadingReports(false);
      }
    };
    
    initializeClientReports();
  }, []);

  if (loadingReports) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing client reports...</p>
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
    <div className="ml-20 lg:ml-64 p-6 overflow-y-auto h-screen">
      <div className="space-y-6">
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
                  <span className="text-sm text-teal-600 ml-1">{stats.monthlyGrowth} from last month</span>
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
                <p className="text-sm font-medium text-gray-500">Active Customers</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.activeCustomers}</p>
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
                <p className="text-sm font-medium text-gray-500">Most Rented</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.popularProduct}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-teal-600 ml-1">0 rentals this month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-teal-50">
                <Package className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rental Status Pie Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rental Status Distribution</h3>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Monthly Revenue Bar Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
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
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #eee',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
            <h2 className="text-xl font-semibold text-gray-800">Recent Rental Products</h2>
            <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rentalProducts.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                  >
                    <td className="p-3 text-sm text-gray-900">{item.id}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 mr-3">
                          <img 
                            src={item.image} 
                            alt={item.product}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.product}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{item.customer}</td>
                    <td className="p-3 text-sm text-gray-500">{item.date}</td>
                    <td className="p-3 text-sm font-medium text-gray-900">{item.amount}</td>
                    <td className="p-3 text-sm text-gray-500">{item.payment}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {item.status === "Delivered" && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs text-green-800">Delivered</span>
                          </div>
                        )}
                        {item.status === "Process" && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-xs text-yellow-800">Processing</span>
                          </div>
                        )}
                        {item.status === "Canceled" && (
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-xs text-red-800">Canceled</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <motion.button 
                          className="p-1 rounded-md hover:bg-blue-50 text-blue-500"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button 
                          className="p-1 rounded-md hover:bg-red-50 text-red-500"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">5</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 rounded-md bg-teal-600 text-sm font-medium text-white hover:bg-teal-700">
                1
              </button>
              <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientComponent;