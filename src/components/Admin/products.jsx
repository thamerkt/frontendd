import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, XCircle, Clock, Edit, Trash2, 
  Plus, ArrowUp, ArrowDown, TrendingUp, 
  Package, DollarSign, Users, Search, Filter
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Cookies from 'js-cookie';
import EquipmentService from "../../services/EquipmentService";

// API Service
const apiService = {
  reports: {
    getByUser: async (username) => {
      const response = await axios.get(`https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapports/?user=${username}`, {withCredentials: true});
      return response.data;
    },
    create: async (reportData) => {
      const response = await axios.post('https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapports/', reportData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      return response.data;
    },
    update: async (reportId, reportData) => {
      const response = await axios.patch(`https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapports/${reportId}/`, reportData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      return response.data;
    }
  },
  reportData: {
    getByReport: async (reportId) => {
      const response = await axios.get(`https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapport-data/?rapport=${reportId}`, {withCredentials: true});
      return response.data;
    },
    create: async (metricData) => {
      const response = await axios.post('https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapport-data/', metricData, {withCredentials: true});
      return response.data;
    },
    update: async (metricId, metricData) => {
      const response = await axios.patch(`https://kong-7e283b39dauspilq0.kongcloud.dev/reports/rapport-data/${metricId}/`, metricData, {withCredentials: true});
      return response.data;
    }
  }
};

const REQUIRED_REPORTS = [
  {
    type: "products_performance",
    title: "Products Performance Report",
    description: "Detailed analysis of products metrics",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Total Products", metric_value: 0, unit: "" },
      { metric_name: "Active Rentals", metric_value: 0, unit: "" },
      { metric_name: "Monthly Revenue", metric_value: 0, unit: "$" },
      { metric_name: "Out of Stock", metric_value: 0, unit: "" }
    ]
  },
  {
    type: "products_financial",
    title: "Products Financial Report",
    description: "Financial overview of products activities",
    is_scheduled: true,
    schedule_frequency: "monthly",
    metrics: [
      { metric_name: "Monthly Revenue", metric_value: 0, unit: "$" },
      { metric_name: "Monthly Growth", metric_value: 0, unit: "%" },
      { metric_name: "Average Rental Value", metric_value: 0, unit: "$" }
    ]
  }
];

const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const ProductsPage = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSidebarExpanded] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [reportError, setReportError] = useState(null);
  const [productsReports, setProductsReports] = useState([]);
  const [productsMetrics, setProductsMetrics] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeRentals: 0,
    monthlyRevenue: "$0",
    outOfStock: 0,
    monthlyGrowth: "0%",
    avgRentalValue: "$0"
  });

  const [categoryData, setCategoryData] = useState([]);
  const [revenueData, setRevenueData] = useState([
    { name: 'Jan', revenue: 0 },
    { name: 'Feb', revenue: 0 },
    { name: 'Mar', revenue: 0 },
    { name: 'Apr', revenue: 0 },
    { name: 'May', revenue: 0 },
  ]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const userId = Cookies.get('keycloak_user_id');
      const response = await EquipmentService.fetchRentalsBy('user', userId);
      console.log('Products:', response);
      setProducts(response);
      
      
      // Extract unique categories from products
      const uniqueCategories = await EquipmentService.fetchCategories();
      setCategories(uniqueCategories);
      console.log("uniqueCategories",uniqueCategories)
      
      // Calculate category distribution
      const categoryCounts = categories.reduce((acc, product) => {
        const category = product.category?.toString() || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      const updatedCategoryData = Object.keys(categoryCounts).map(category => ({
        name: category,
        value: categoryCounts[category]
      }));
      
      setCategoryData(updatedCategoryData);
      
      // Calculate stats
      const totalProducts = response.length;
      const outOfStock = response.filter(p => p.quantity === 0).length;
      const activeRentals = response.reduce((sum, p) => sum + (p.rented || 0), 0);
      const monthlyRevenue = response.reduce((sum, p) => sum + (p.price_per_day * (p.rented || 0) * 30), 0); // Approximate monthly revenue
      const avgRentalValue = totalProducts > 0 ? monthlyRevenue / totalProducts : 0;
      
      setStats({
        totalProducts,
        activeRentals,
        monthlyRevenue: `$${monthlyRevenue.toFixed(2)}`,
        outOfStock,
        monthlyGrowth: "0%",
        avgRentalValue: `$${avgRentalValue.toFixed(2)}`
      });
      
      // Update reports with new data
      await updateReportsWithProductData(totalProducts, activeRentals, monthlyRevenue, outOfStock, avgRentalValue);
      
      setLoadingProducts(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoadingProducts(false);
    }
  };

  // Update reports with current product data
  const updateReportsWithProductData = async (totalProducts, activeRentals, monthlyRevenue, outOfStock, avgRentalValue) => {
    try {
      for (const report of productsReports) {
        const metrics = await apiService.reportData.getByReport(report.id);
        
        for (const metric of metrics) {
          let newValue = metric.metric_value;
          
          switch (metric.metric_name) {
            case "Total Products":
              newValue = totalProducts;
              break;
            case "Active Rentals":
              newValue = activeRentals;
              break;
            case "Monthly Revenue":
              newValue = monthlyRevenue;
              break;
            case "Out of Stock":
              newValue = outOfStock;
              break;
            case "Monthly Growth":
              // You might want to implement growth calculation logic here
              break;
            case "Average Rental Value":
              newValue = avgRentalValue;
              break;
          }
          
          if (newValue !== metric.metric_value) {
            await apiService.reportData.update(metric.id, {
              metric_value: newValue
            });
          }
        }
      }
      
      // Refresh metrics
      const updatedMetrics = {};
      for (const report of productsReports) {
        updatedMetrics[report.type] = await apiService.reportData.getByReport(report.id);
      }
      setProductsMetrics(updatedMetrics);
    } catch (err) {
      console.error("Error updating reports:", err);
    }
  };

  // Initialize products reports and metrics
  useEffect(() => {
    const initializeProductsReports = async () => {
      try {
        setLoadingReports(true);
        setReportError(null);
        
        // Get user ID from cookies
        const userId = Cookies.get('keycloak_user_id');
        if (!userId) throw new Error("User not authenticated");
        
        // 1. Fetch existing reports
        const existingReports = await apiService.reports.getByUser(userId);
        
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
              user: userId,
              date_created: now,
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                .toISOString()
                .split('T')[0]
            };
            const response = await apiService.reports.create(reportData);
            return response;
          })
        );
        
        // 4. Combine all reports
        const allReports = [...existingReports, ...createdReports];
        setProductsReports(allReports);
        
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
        
        setProductsMetrics(metricsCollection);
        setLoadingReports(false);
        
        // Fetch products after reports are initialized
        await fetchProducts();
      } catch (err) {
        console.error("Error initializing products reports:", err);
        setReportError("Failed to initialize products reports");
        setLoadingReports(false);
      }
    };
    
    initializeProductsReports();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.stuffname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                         (product.category?.toString() === selectedCategory || 
                         (selectedCategory === 'Other' && !product.category));
    return matchesSearch && matchesCategory;
  });

  if (loadingReports || loadingProducts) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products data...</p>
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
    <div 
      className="p-6 space-y-6 min-h-screen"
      style={{ 
        marginLeft: isSidebarExpanded ? '16rem' : '5rem',
        transition: 'margin-left 0.3s ease'
      }}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddProduct(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Total Products", 
            value: stats.totalProducts, 
            change: "+0%", 
            icon: <Package className="h-6 w-6" />,
            trend: "up"
          },
          { 
            title: "Active Rentals", 
            value: stats.activeRentals, 
            change: "+0%", 
            icon: <TrendingUp className="h-6 w-6" />,
            trend: "up"
          },
          { 
            title: "Monthly Revenue", 
            value: stats.monthlyRevenue, 
            change: "+0%", 
            icon: <DollarSign className="h-6 w-6" />,
            trend: "up"
          },
          { 
            title: "Out of Stock", 
            value: stats.outOfStock, 
            change: "+0", 
            icon: <XCircle className="h-6 w-6" />,
            trend: "down"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === "up" ? (
                    <ArrowUp className="h-4 w-4 text-teal-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${stat.trend === "up" ? "text-teal-600" : "text-red-600"}`}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} products`, "Count"]}
                  contentStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Revenue"]}
                  contentStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#0d9488" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Product Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Product Inventory</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  className="group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.stuffname}</div>
                        <div className="text-sm text-gray-500">{product.short_description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category?.toString() || 'Other'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${product.price_per_day?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.location || product.rental_location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.state === "new" ? "bg-green-100 text-green-800" :
                      product.state === "used" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {product.state === "new" ? "New" :
                       product.state === "used" ? "Used" : "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        <Edit className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <AddProductModal onClose={() => setShowAddProduct(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Add Product Modal Component
const AddProductModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    stuffname: '',
    short_description: '',
    detailed_description: '',
    category: '',
    price_per_day: '',
    location: '',
    state: 'new'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = Cookies.get('keycloak_user_id');
      const productData = {
        ...formData,
        user: userId,
        price_per_day: parseFloat(formData.price_per_day),
        category: formData.category || null
      };
      
      // Here you would call your API to create the product
      // await equipmentService.createProduct(productData);
      
      onClose();
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Add New Product</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="stuffname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter product name"
                  value={formData.stuffname}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="1">Electronics</option>
                  <option value="2">Tools</option>
                  <option value="3">Furniture</option>
                  <option value="4">Vehicles</option>
                  <option value="5">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                  <input
                    type="number"
                    name="price_per_day"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.price_per_day}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  name="state"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  name="short_description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter short description"
                  value={formData.short_description}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  name="detailed_description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter detailed description"
                  value={formData.detailed_description}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="mt-1 flex items-center">
                  <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                type="button"
                whileHover={{ backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ backgroundColor: "#0d9488" }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Product
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductsPage;
