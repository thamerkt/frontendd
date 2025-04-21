import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, XCircle, Clock, Edit, Trash2, 
  Plus, ArrowUp, ArrowDown, TrendingUp, 
  Package, DollarSign, Users, Search, Filter
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import EquipmentService from "../../services/EquipmentService";
import axios from "axios";
import SidebarAdmin from "./sidebar";

const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const STATS = [
  { title: "Total Products", value: "124", change: "+12%", trend: "up", icon: <Package className="h-6 w-6" /> },
  { title: "Revenue", value: "$8,240", change: "+8.2%", trend: "up", icon: <DollarSign className="h-6 w-6" /> },
  { title: "Active Rentals", value: "42", change: "-3.2%", trend: "down", icon: <Users className="h-6 w-6" /> },
  { title: "Low Stock", value: "7", change: "+1.1%", trend: "up", icon: <TrendingUp className="h-6 w-6" /> },
];

const ProductsPage = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesData = await EquipmentService.fetchCategories();
      const productsData = await EquipmentService.fetchRentalsBy("user", 2);
      
      const productDetails = await Promise.all(
        productsData.map(async (product) => {
          try {
            const [imageData, managementData] = await Promise.all([
              axios.get(`http://127.0.0.1:8000/api/images/?stuff=${product.id}`),
              EquipmentService.fetchRentalsmanagementbyid(product.stuff_management)
            ]);
            
            return {
              ...product,
              image: imageData.data[0]?.url || 'https://via.placeholder.com/150',
              management: managementData || {}
            };
          } catch (error) {
            console.error(`Error fetching details for product ${product.id}:`, error);
            return {
              ...product,
              image: 'https://via.placeholder.com/150',
              management: {}
            };
          }
        })
      );

      setCategories(categoriesData);
      setProducts(productDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategoryDistribution = () => {
    const categoryMap = {};
    
    products.forEach(product => {
      const categoryName = categories.find(c => c.id === product.category)?.name || 'Other';
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.stuffname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      (categories.find(c => c.id === product.category)?.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-screen bg-gray-50">
      
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage your rental products and inventory</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddProduct(true)}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-4 w-4 text-teal-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs ml-1 ${stat.trend === "up" ? "text-teal-600" : "text-red-600"}`}>
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Category Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCategoryDistribution().map((entry, index) => (
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
            </div>

            {/* Product Status */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Status</h3>
              <div className="h-64 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Available</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-green-900">
                      {products.filter(p => p.management?.availability === "Available").length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between">
                      <span className="text-red-800 font-medium">Unavailable</span>
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-red-900">
                      {products.filter(p => p.management?.availability !== "Available").length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-medium">New</span>
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-blue-900">
                      {products.filter(p => p.state === "new").length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-800 font-medium">Used</span>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-yellow-900">
                      {products.filter(p => p.state === "used").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Product Inventory</h2>
                  <p className="text-sm text-gray-500">{filteredProducts.length} products found</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const categoryName = categories.find(c => c.id === product.category)?.name || 'Other';
                      const management = product.management || {};
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden border border-gray-200">
                                <img 
                                  className="h-full w-full object-cover" 
                                  src={product.image} 
                                  alt={product.stuffname} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.stuffname}</div>
                                <div className="text-sm text-gray-500">{product.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {categoryName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${product.price_per_day}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {management.condition || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              management.availability === "Available" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {management.availability || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-teal-600 hover:text-teal-900 p-1 rounded hover:bg-teal-50"
                                title="Edit"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No products found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;