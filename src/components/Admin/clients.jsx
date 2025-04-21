import { CheckCircle, XCircle, Clock, Edit, Trash2, ArrowUp, ArrowDown, TrendingUp, Package, DollarSign, Users } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const statusData = [
  { name: 'Delivered', value: 2 },
  { name: 'Processing', value: 2 },
  { name: 'Canceled', value: 1 },
];

const monthlyRevenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

const COLORS = ['#0d9488', '#f59e0b', '#ef4444'];

const ClientComponent = () => {
  const totalRevenue = 18976.75;
  const totalRentals = 24;
  const activeCustomers = 15;
  const popularProduct = "Camera";

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
                <p className="text-2xl font-semibold text-gray-800 mt-1">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-teal-600 ml-1">12.5% from last month</span>
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
                <p className="text-2xl font-semibold text-gray-800 mt-1">{totalRentals}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-teal-600 ml-1">8.2% from last month</span>
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
                <p className="text-2xl font-semibold text-gray-800 mt-1">{activeCustomers}</p>
                <div className="flex items-center mt-2">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 ml-1">2.1% from last month</span>
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
                <p className="text-2xl font-semibold text-gray-800 mt-1">{popularProduct}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                  <span className="text-sm text-teal-600 ml-1">15 rentals this month</span>
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