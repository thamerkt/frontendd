import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, XCircle, Clock, Edit, Trash2, Plus, 
  ArrowUp, ArrowDown, TrendingUp, Truck, 
  CreditCard, Search, Filter, Users, ChevronDown,
  ChevronUp, Star, Download, RefreshCw, X
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { div } from "@tensorflow/tfjs";
import SidebarPartner from "./sidebar";
// Constants
const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

const STATS = [
  { title: "Total Delivery Services", value: "8", change: "+12%", trend: "up", icon: <Truck className="h-6 w-6" /> },
  { title: "Active Delivery Partners", value: "6", change: "+5%", trend: "up", icon: <Users className="h-6 w-6" /> },
  { title: "Average Delivery Time", value: "2.4h", change: "-0.3h", trend: "up", icon: <Clock className="h-6 w-6" /> },
  { title: "Delivery Revenue", value: "$8,420", change: "+15.2%", trend: "up", icon: <CreditCard className="h-6 w-6" /> },
];

const DELIVERY_TYPES = [
  { id: 1, name: "Standard Delivery", icon: <Truck className="h-5 w-5" /> },
  { id: 2, name: "Express Delivery", icon: <Truck className="h-5 w-5" /> },
  { id: 3, name: "Same-Day Delivery", icon: <Truck className="h-5 w-5" /> },
  { id: 4, name: "Overnight Delivery", icon: <Truck className="h-5 w-5" /> },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Pending", label: "Pending" },
  { value: "Inactive", label: "Inactive" },
];

const MONTHLY_DELIVERY_DATA = [
  { name: 'Jan', deliveries: 1200 },
  { name: 'Feb', deliveries: 1800 },
  { name: 'Mar', deliveries: 2100 },
  { name: 'Apr', deliveries: 1950 },
  { name: 'May', deliveries: 2400 },
  { name: 'Jun', deliveries: 2750 },
  { name: 'Jul', deliveries: 3100 },
];

const DeliveryServicesManagement = () => {
  const [showAddService, setShowAddService] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deliveryServices, setDeliveryServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedService, setExpandedService] = useState(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        name: "Standard Ground Delivery",
        provider: "QuickShip Logistics",
        type: "Standard Delivery",
        price: "$5.99/delivery",
        coverage: "2-5 business days",
        status: "Active",
        rating: 4.3,
        terms: "Delivery to residential and commercial addresses. Weight limit: 50 lbs.",
        deliveryTime: "2-5 days",
        usage: 1850,
        lastUpdated: "2023-06-15"
      },
      {
        id: 2,
        name: "Express Delivery",
        provider: "FastTrack Couriers",
        type: "Express Delivery",
        price: "$12.99/delivery",
        coverage: "Next business day",
        status: "Active",
        rating: 4.7,
        terms: "Guaranteed next business day delivery before 5pm. Available in major cities.",
        deliveryTime: "1 day",
        usage: 3420,
        lastUpdated: "2023-06-02"
      },
      {
        id: 3,
        name: "Same-Day City Delivery",
        provider: "Urban Rush",
        type: "Same-Day Delivery",
        price: "$19.99/delivery",
        coverage: "Same day within city limits",
        status: "Active",
        rating: 4.5,
        terms: "Order before 2pm for same-day delivery. Limited to 20 mile radius.",
        deliveryTime: "Same day",
        usage: 2450,
        lastUpdated: "2023-05-28"
      },
      {
        id: 4,
        name: "Overnight Priority",
        provider: "National Carriers",
        type: "Overnight Delivery",
        price: "$24.99/delivery",
        coverage: "Next morning by 10:30am",
        status: "Pending",
        rating: 4.1,
        terms: "Overnight delivery with morning guarantee. Additional fees for rural areas.",
        deliveryTime: "Overnight",
        usage: 980,
        lastUpdated: "2023-06-10"
      }
    ];
    
    setDeliveryServices(sampleData);
    setIsLoading(false);
  }, []);

  const [newService, setNewService] = useState({
    name: "",
    provider: "",
    type: "",
    price: "",
    coverage: "",
    deliveryTime: "",
    terms: "",
    status: "Active"
  });

  const handleAddService = () => {
    const newId = Math.max(...deliveryServices.map(s => s.id)) + 1;
    const serviceToAdd = {
      ...newService,
      id: newId,
      rating: 4.0,
      usage: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setDeliveryServices([...deliveryServices, serviceToAdd]);
    setShowAddService(false);
    setNewService({
      name: "",
      provider: "",
      type: "",
      price: "",
      coverage: "",
      deliveryTime: "",
      terms: "",
      status: "Active"
    });
  };

  const handleDeleteService = (id) => {
    setDeliveryServices(deliveryServices.filter(service => service.id !== id));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedServices = [...deliveryServices].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const getServiceDistribution = () => {
    const typeMap = {};
    
    deliveryServices.forEach(service => {
      typeMap[service.type] = (typeMap[service.type] || 0) + 1;
    });
    
    return Object.entries(typeMap).map(([name, value]) => ({
      name,
      value
    }));
  };

  const filteredServices = sortedServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         service.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || service.type === selectedType;
    const matchesStatus = selectedStatus === "all" || service.status === selectedStatus;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && service.status === 'Active') ||
                      (activeTab === 'pending' && service.status === 'Pending') ||
                      (activeTab === 'inactive' && service.status === 'Inactive');
    
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleServiceExpand = (id) => {
    setExpandedService(expandedService === id ? null : id);
  };

  return (
  
    
    
    <div className="flex flex-1 min-h-screen bg-gray-50">
        <div className="fixed inset-y-0 left-0 w-64">
        <SidebarPartner />
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-auto">
      
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Services Management</h1>
            <p className="text-gray-600">Manage your delivery services and partners</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddService(true)}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Delivery Service
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              All Services
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inactive' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Inactive
            </button>
          </nav>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Delivery Type Distribution */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Delivery Type Distribution</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getServiceDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getServiceDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} services`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Delivery Service Status */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Delivery Service Status</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Active</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-green-900">
                      {deliveryServices.filter(s => s.status === "Active").length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between">
                      <span className="text-red-800 font-medium">Inactive</span>
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-red-900">
                      {deliveryServices.filter(s => s.status === "Inactive").length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-medium">Top Rated</span>
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-blue-900">
                      {deliveryServices.filter(s => s.rating >= 4.5).length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-800 font-medium">Pending</span>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-yellow-900">
                      {deliveryServices.filter(s => s.status === "Pending").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Deliveries */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Monthly Deliveries</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_DELIVERY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deliveries" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Delivery Services Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Delivery Services</h2>
                  <p className="text-sm text-gray-500">
                    {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
                    {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' ? ' (filtered)' : ''}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search delivery services..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Delivery Types</option>
                    {DELIVERY_TYPES.map(type => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center hover:text-gray-700"
                      >
                        Service
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('price')}
                        className="flex items-center hover:text-gray-700"
                      >
                        Price
                        {sortConfig.key === 'price' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('deliveryTime')}
                        className="flex items-center hover:text-gray-700"
                      >
                        Delivery Time
                        {sortConfig.key === 'deliveryTime' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('rating')}
                        className="flex items-center hover:text-gray-700"
                      >
                        Rating
                        {sortConfig.key === 'rating' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <>
                        <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button 
                                onClick={() => toggleServiceExpand(service.id)}
                                className="mr-2 text-gray-400 hover:text-gray-600"
                              >
                                {expandedService === service.id ? 
                                  <ChevronUp className="h-4 w-4" /> : 
                                  <ChevronDown className="h-4 w-4" />
                                }
                              </button>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                <div className="text-xs text-gray-500">Last updated: {service.lastUpdated}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {service.provider}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Truck className="h-5 w-5" />
                              <span className="ml-2 text-sm text-gray-500">{service.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {service.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {service.deliveryTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.status)}`}>
                              {service.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 text-sm font-medium text-gray-900">
                                {service.rating.toFixed(1)}
                              </span>
                            </div>
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
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedService === service.id && (
                          <tr>
                            <td colSpan="8" className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage Details</h4>
                                  <p className="text-sm text-gray-600">{service.coverage}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                                  <p className="text-sm text-gray-600">{service.terms}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Statistics</h4>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">{service.usage}</span> deliveries this month
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No delivery services found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Delivery Service Modal */}
      <AnimatePresence>
        {showAddService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Delivery Service</h2>
                <button 
                  onClick={() => setShowAddService(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name*</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    placeholder="e.g. Express Delivery"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider*</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={newService.provider}
                    onChange={(e) => setNewService({...newService, provider: e.target.value})}
                    placeholder="e.g. FastTrack Couriers"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type*</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newService.type}
                      onChange={(e) => setNewService({...newService, type: e.target.value})}
                      required
                    >
                      <option value="">Select delivery type</option>
                      {DELIVERY_TYPES.map(type => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newService.status}
                      onChange={(e) => setNewService({...newService, status: e.target.value})}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pricing*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                      placeholder="e.g. $12.99/delivery"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newService.deliveryTime}
                      onChange={(e) => setNewService({...newService, deliveryTime: e.target.value})}
                      placeholder="e.g. 1-2 business days"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage/Details*</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    value={newService.coverage}
                    onChange={(e) => setNewService({...newService, coverage: e.target.value})}
                    placeholder="Describe what areas this service covers"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="2"
                    value={newService.terms}
                    onChange={(e) => setNewService({...newService, terms: e.target.value})}
                    placeholder="Any special terms or conditions"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddService(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddService}
                  disabled={!newService.name || !newService.provider || !newService.type || !newService.price || !newService.coverage || !newService.deliveryTime}
                  className={`px-4 py-2 rounded-md text-white ${!newService.name || !newService.provider || !newService.type || !newService.price || !newService.coverage || !newService.deliveryTime ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                  Add Delivery Service
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    
  );
};

export default DeliveryServicesManagement;