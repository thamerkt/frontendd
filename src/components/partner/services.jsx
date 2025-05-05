import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, XCircle, Clock, Edit, Trash2, Plus, 
  ArrowUp, ArrowDown, TrendingUp, Truck, 
  CreditCard, Search, Users, ChevronDown,
  ChevronUp, Star, Download, RefreshCw, X
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';


const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

// API Service
const apiService = {
  deliveryServices: {
    getAll: async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/delivery-services/');
        return response.data;
      } catch (error) {
        console.error("Error fetching delivery services:", error);
        return [];
      }
    },
    create: async (serviceData) => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/delivery-services/', serviceData);
        return response.data;
      } catch (error) {
        console.error("Error creating delivery service:", error);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/delivery-services/${id}/`);
      } catch (error) {
        console.error("Error deleting delivery service:", error);
        throw error;
      }
    }
  },
  deliveryStats: {
    get: async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/delivery-stats/');
        return response.data;
      } catch (error) {
        console.error("Error fetching delivery stats:", error);
        return {
          totalServices: 0,
          activeServices: 0,
          avgDeliveryTime: "0h",
          deliveryRevenue: "$0"
        };
      }
    }
  },
  deliveryAnalytics: {
    getTypeDistribution: async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/delivery-type-distribution/');
        return response.data;
      } catch (error) {
        console.error("Error fetching type distribution:", error);
        return [];
      }
    },
    getMonthlyDeliveries: async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/monthly-deliveries/');
        return response.data;
      } catch (error) {
        console.error("Error fetching monthly deliveries:", error);
        return [];
      }
    }
  }
};

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

export default function DeliveryServicesManagement() {
  const [state, setState] = useState({
    showAddService: false,
    searchTerm: "",
    selectedType: "all",
    selectedStatus: "all",
    sortConfig: { key: null, direction: 'asc' },
    deliveryServices: [],
    isLoading: true,
    activeTab: 'all',
    expandedService: null,
    error: null,
    stats: {
      totalServices: 0,
      activeServices: 0,
      avgDeliveryTime: "0h",
      deliveryRevenue: "$0"
    },
    typeDistribution: [],
    monthlyDeliveries: [],
    newService: {
      name: "", 
      provider: "", 
      type: "", 
      price: "", 
      coverage: "",
      deliveryTime: "", 
      terms: "", 
      status: "Active",
      is_scheduled: true, 
      schedule_frequency: "month"
    }
  });

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => {
    const initializeData = async () => {
      try {
        updateState({ isLoading: true, error: null });
        
        // Fetch all data in parallel
        const [services, stats, typeDistribution, monthlyDeliveries] = await Promise.all([
          apiService.deliveryServices.getAll(),
          apiService.deliveryStats.get(),
          apiService.deliveryAnalytics.getTypeDistribution(),
          apiService.deliveryAnalytics.getMonthlyDeliveries()
        ]);
        
        updateState({
          deliveryServices: services,
          stats,
          typeDistribution,
          monthlyDeliveries,
          isLoading: false
        });
      } catch (err) {
        console.error("Error initializing data:", err);
        updateState({ 
          error: "Failed to load delivery services data",
          isLoading: false
        });
      }
    };
    
    initializeData();
  }, []);

  const handleAddService = async () => {
    try {
      const { newService } = state;
      const createdService = await apiService.deliveryServices.create(newService);
      
      updateState(prev => ({
        deliveryServices: [...prev.deliveryServices, createdService],
        showAddService: false,
        newService: {
          name: "", 
          provider: "", 
          type: "", 
          price: "", 
          coverage: "",
          deliveryTime: "", 
          terms: "", 
          status: "Active",
          is_scheduled: true, 
          schedule_frequency: "month"
        }
      }));
    } catch (err) {
      console.error("Error adding service:", err);
      alert("Failed to add new delivery service");
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await apiService.deliveryServices.delete(id);
      updateState(prev => ({
        deliveryServices: prev.deliveryServices.filter(service => service.id !== id)
      }));
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Failed to delete delivery service");
    }
  };

  const handleSort = (key) => {
    updateState(prev => ({
      sortConfig: { 
        key, 
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleServiceExpand = (id) => {
    updateState(prev => ({
      expandedService: prev.expandedService === id ? null : id
    }));
  };

  const sortedServices = [...state.deliveryServices].sort((a, b) => {
    if (state.sortConfig.key) {
      if (a[state.sortConfig.key] < b[state.sortConfig.key]) {
        return state.sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[state.sortConfig.key] > b[state.sortConfig.key]) {
        return state.sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredServices = sortedServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
                         service.provider.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesType = state.selectedType === "all" || service.type === state.selectedType;
    const matchesStatus = state.selectedStatus === "all" || service.status === state.selectedStatus;
    const matchesTab = state.activeTab === 'all' || 
                      (state.activeTab === 'active' && service.status === 'Active') ||
                      (state.activeTab === 'pending' && service.status === 'Pending') ||
                      (state.activeTab === 'inactive' && service.status === 'Inactive');
    
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery services...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-red-800">Error Loading Services</h3>
          <p className="mt-2 text-red-600">{state.error}</p>
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

  const STATS = [
    { 
      title: "Total Delivery Services", 
      value: state.stats.totalServices, 
      change: "+0%", 
      trend: "up", 
      icon: <Truck className="h-6 w-6" /> 
    },
    { 
      title: "Active Delivery Services", 
      value: state.stats.activeServices, 
      change: "+0%", 
      trend: "up", 
      icon: <Users className="h-6 w-6" /> 
    },
    { 
      title: "Avg. Delivery Time", 
      value: state.stats.avgDeliveryTime, 
      change: "-0h", 
      trend: "up", 
      icon: <Clock className="h-6 w-6" /> 
    },
    { 
      title: "Delivery Revenue", 
      value: state.stats.deliveryRevenue, 
      change: "+0%", 
      trend: "up", 
      icon: <CreditCard className="h-6 w-6" /> 
    },
  ];

  return (
    <div className="flex flex-1 min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64">
        <SidebarPartner />
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-auto ml-64">
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
              onClick={() => updateState({ showAddService: true })}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Delivery Service
            </motion.button>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'active', 'pending', 'inactive'].map(tab => (
              <button
                key={tab}
                onClick={() => updateState({ activeTab: tab })}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${state.activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab === 'all' ? 'All Services' : `${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
              </button>
            ))}
          </nav>
        </div>

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

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Delivery Type Distribution</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={async () => {
                    const typeDistribution = await apiService.deliveryAnalytics.getTypeDistribution();
                    updateState({ typeDistribution });
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={state.typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {state.typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} services`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Delivery Service Status</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={async () => {
                    const services = await apiService.deliveryServices.getAll();
                    updateState({ deliveryServices: services });
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { status: 'Active', icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: 'green' },
                    { status: 'Inactive', icon: <XCircle className="h-5 w-5 text-red-600" />, color: 'red' },
                    { status: 'Top Rated', icon: <TrendingUp className="h-5 w-5 text-blue-600" />, color: 'blue' },
                    { status: 'Pending', icon: <Clock className="h-5 w-5 text-yellow-600" />, color: 'yellow' }
                  ].map((item, index) => (
                    <div key={index} className={`bg-${item.color}-50 p-4 rounded-lg border border-${item.color}-100`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-${item.color}-800 font-medium`}>{item.status}</span>
                        {item.icon}
                      </div>
                      <p className={`text-2xl font-bold mt-2 text-${item.color}-900`}>
                        {item.status === 'Top Rated' 
                          ? state.deliveryServices.filter(s => s.rating >= 4.5).length
                          : state.deliveryServices.filter(s => 
                              item.status === 'Top Rated' ? s.rating >= 4.5 : s.status === item.status
                            ).length}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Monthly Deliveries</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={async () => {
                    const monthlyDeliveries = await apiService.deliveryAnalytics.getMonthlyDeliveries();
                    updateState({ monthlyDeliveries });
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={state.monthlyDeliveries}>
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Delivery Services</h2>
                  <p className="text-sm text-gray-500">
                    {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
                    {state.searchTerm || state.selectedType !== 'all' || state.selectedStatus !== 'all' ? ' (filtered)' : ''}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search delivery services..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.searchTerm}
                      onChange={(e) => updateState({ searchTerm: e.target.value })}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={state.selectedType}
                    onChange={(e) => updateState({ selectedType: e.target.value })}
                  >
                    <option value="all">All Delivery Types</option>
                    {DELIVERY_TYPES.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={state.selectedStatus}
                    onChange={(e) => updateState({ selectedStatus: e.target.value })}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['name', 'price', 'deliveryTime', 'rating'].map((key) => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort(key)}
                          className="flex items-center hover:text-gray-700"
                        >
                          {key === 'name' ? 'Service' : 
                           key === 'price' ? 'Price' : 
                           key === 'deliveryTime' ? 'Delivery Time' : 'Rating'}
                          {state.sortConfig.key === key && (
                            state.sortConfig.direction === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.length > 0 ? filteredServices.map((service) => (
                    <>
                      <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button 
                              onClick={() => toggleServiceExpand(service.id)}
                              className="mr-2 text-gray-400 hover:text-gray-600"
                            >
                              {state.expandedService === service.id ? 
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.deliveryTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 text-sm font-medium text-gray-900">
                              {service.rating?.toFixed(1) || 'N/A'}
                            </span>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-teal-600 hover:text-teal-900 p-1 rounded hover:bg-teal-50" title="Edit">
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
                      {state.expandedService === service.id && (
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
                                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-2">Scheduling</h4>
                                <p className="text-sm text-gray-600">
                                  {service.is_scheduled ? 
                                    `Scheduled (${service.schedule_frequency})` : 
                                    "Not scheduled"}
                                </p>
                                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-2">Delivery Statistics</h4>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">{service.usage || 0}</span> deliveries this month
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )) : (
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

      <AnimatePresence>
        {state.showAddService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Delivery Service</h2>
                <button onClick={() => updateState({ showAddService: false })} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {['name', 'provider'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field === 'name' ? 'Service Name*' : 'Provider*'}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newService[field]}
                      onChange={(e) => updateState(prev => ({
                        newService: { ...prev.newService, [field]: e.target.value }
                      }))}
                      placeholder={field === 'name' ? 'e.g. Express Delivery' : 'e.g. FastTrack Couriers'}
                      required
                    />
                  </div>
                ))}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type*</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newService.type}
                      onChange={(e) => updateState(prev => ({
                        newService: { ...prev.newService, type: e.target.value }
                      }))}
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
                      value={state.newService.status}
                      onChange={(e) => updateState(prev => ({
                        newService: { ...prev.newService, status: e.target.value }
                      }))}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {['price', 'deliveryTime'].map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field === 'price' ? 'Pricing*' : 'Delivery Time*'}
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={state.newService[field]}
                        onChange={(e) => updateState(prev => ({
                          newService: { ...prev.newService, [field]: e.target.value }
                        }))}
                        placeholder={field === 'price' ? 'e.g. $12.99/delivery' : 'e.g. 1-2 business days'}
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage/Details*</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    value={state.newService.coverage}
                    onChange={(e) => updateState(prev => ({
                      newService: { ...prev.newService, coverage: e.target.value }
                    }))}
                    placeholder="Describe what areas this service covers"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="2"
                    value={state.newService.terms}
                    onChange={(e) => updateState(prev => ({
                      newService: { ...prev.newService, terms: e.target.value }
                    }))}
                    placeholder="Any special terms or conditions"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newService.is_scheduled}
                      onChange={(e) => updateState(prev => ({
                        newService: { ...prev.newService, is_scheduled: e.target.value === 'true' }
                      }))}
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Frequency</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newService.schedule_frequency}
                      onChange={(e) => updateState(prev => ({
                        newService: { ...prev.newService, schedule_frequency: e.target.value }
                      }))}
                      disabled={!state.newService.is_scheduled}
                    >
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateState({ showAddService: false })}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddService}
                  disabled={!state.newService.name || !state.newService.provider || !state.newService.type || 
                           !state.newService.price || !state.newService.coverage || !state.newService.deliveryTime}
                  className={`px-4 py-2 rounded-md text-white ${!state.newService.name || !state.newService.provider || !state.newService.type || 
                             !state.newService.price || !state.newService.coverage || !state.newService.deliveryTime ? 
                             'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
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
}