import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, XCircle, Clock, Edit, Trash2, Plus, 
  ArrowUp, ArrowDown, TrendingUp, Truck, 
  CreditCard, Search, Users, ChevronDown,
  ChevronUp, Star, Download, RefreshCw, X,
  Handshake, Warehouse , Calendar
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';


const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

const apiService = {
  reports: {
    getByUser: async (username) => (await axios.get(`http://127.0.0.1:8000/api/rapports/?user=${username}`)).data,
    create: async (reportData) => (await axios.post('http://127.0.0.1:8000/api/rapports/', reportData, {
      headers: { 'Content-Type': 'application/json' }
    })).data
  },
  reportData: {
    getByReport: async (reportId) => (await axios.get(`http://127.0.0.1:8000/api/rapport-data/?rapport=${reportId}`)).data,
    create: async (metricData) => (await axios.post('http://127.0.0.1:8000/api/rapport-data/', metricData)).data
  }
};

const REQUIRED_PARTNERSHIPS = [
  {
    name: "Express Logistics & Heavy Equipment Rentals",
    deliveryPartner: "Express Logistics",
    rentalPartner: "Heavy Equipment Rentals",
    type: "Long-term",
    startDate: "2023-01-15",
    endDate: "2025-01-14",
    value: "$250,000",
    status: "Active",
    rating: 4.5,
    terms: "Exclusive partnership for equipment transportation. 15% discount on rentals for Express Logistics.",
    equipmentTypes: ["Forklifts", "Pallet Jacks", "Loading Docks"],
    usage: 320,
    is_scheduled: true,
    schedule_frequency: "quarter"
  },
  {
    name: "QuickShip & Mobile Storage Solutions",
    deliveryPartner: "QuickShip",
    rentalPartner: "Mobile Storage Solutions",
    type: "Project-based",
    startDate: "2023-03-10",
    endDate: "2023-12-31",
    value: "$85,000",
    status: "Active",
    rating: 4.2,
    terms: "Storage container transport and temporary rental solutions for QuickShip hubs.",
    equipmentTypes: ["Storage Containers", "Temporary Warehousing"],
    usage: 145,
    is_scheduled: false,
    schedule_frequency: "none"
  },
  {
    name: "Urban Rush & City Construction Rentals",
    deliveryPartner: "Urban Rush",
    rentalPartner: "City Construction Rentals",
    type: "Seasonal",
    startDate: "2023-05-01",
    endDate: "2023-11-30",
    value: "$120,000",
    status: "Inactive",
    rating: 4.0,
    terms: "Summer season equipment rental and transport partnership for construction materials.",
    equipmentTypes: ["Cranes", "Conveyors", "Dump Trucks"],
    usage: 210,
    is_scheduled: true,
    schedule_frequency: "month"
  }
];

const STATS = [
  { title: "Active Partnerships", value: "6", change: "+2", trend: "up", icon: <Handshake className="h-6 w-6" /> },
  { title: "Total Value", value: "$1.2M", change: "+15%", trend: "up", icon: <CreditCard className="h-6 w-6" /> },
  { title: "Equipment Types", value: "14", change: "+3", trend: "up", icon: <Warehouse className="h-6 w-6" /> },
  { title: "Avg. Partnership Duration", value: "18mo", change: "+2mo", trend: "up", icon: <Calendar className="h-6 w-6" /> },
];

const PARTNERSHIP_TYPES = [
  { id: 1, name: "Long-term", icon: <Calendar className="h-5 w-5" /> },
  { id: 2, name: "Project-based", icon: ""  },
  { id: 3, name: "Seasonal", icon: <RefreshCw className="h-5 w-5" /> },
  { id: 4, name: "Trial", icon: <Clock className="h-5 w-5" /> },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Pending", label: "Pending" },
  { value: "Inactive", label: "Inactive" },
];

const MONTHLY_PARTNERSHIP_DATA = [
  { name: 'Jan', partnerships: 3, value: "$150K" },
  { name: 'Feb', partnerships: 2, value: "$95K" },
  { name: 'Mar', partnerships: 4, value: "$210K" },
  { name: 'Apr', partnerships: 5, value: "$275K" },
  { name: 'May', partnerships: 3, value: "$180K" },
  { name: 'Jun', partnerships: 6, value: "$320K" },
  { name: 'Jul', partnerships: 4, value: "$240K" },
];

export default function PartnershipManagement() {
  const [state, setState] = useState({
    showAddPartnership: false,
    searchTerm: "",
    selectedType: "all",
    selectedStatus: "all",
    sortConfig: { key: null, direction: 'asc' },
    partnerships: [],
    isLoading: true,
    activeTab: 'all',
    expandedPartnership: null,
    error: null,
    newPartnership: {
      name: "", 
      deliveryPartner: "", 
      rentalPartner: "", 
      type: "", 
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      value: "", 
      terms: "", 
      status: "Active",
      equipmentTypes: [],
      is_scheduled: true, 
      schedule_frequency: "quarter",
      currentEquipmentType: ""
    }
  });

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => {
    const initializePartnerships = async () => {
      try {
        updateState({ isLoading: true, error: null });
        const username = "global_logistics";
        const existingReports = await apiService.reports.getByUser(username);
        
        const existingPartnerships = existingReports.filter(report => 
          report.type?.includes("partnership")
        );
        
        const missingPartnerships = REQUIRED_PARTNERSHIPS.filter(requiredPartnership => 
          !existingPartnerships.some(existingPartnership => 
            existingPartnership.title?.includes(requiredPartnership.name)
          )
        );
        
        const createdPartnerships = await Promise.all(
          missingPartnerships.map(async partnershipTemplate => {
            const now = new Date().toISOString();
            const reportData = {
              title: `Partnership: ${partnershipTemplate.name}`,
              type: "partnership",
              description: partnershipTemplate.terms,
              is_scheduled: partnershipTemplate.is_scheduled || true,
              schedule_frequency: partnershipTemplate.schedule_frequency,
              metrics: [
                { metric_name: "Delivery Partner", metric_value: partnershipTemplate.deliveryPartner, unit: "" },
                { metric_name: "Rental Partner", metric_value: partnershipTemplate.rentalPartner, unit: "" },
                { metric_name: "Type", metric_value: partnershipTemplate.type, unit: "" },
                { metric_name: "Value", metric_value: partnershipTemplate.value, unit: "" },
                { metric_name: "Status", metric_value: partnershipTemplate.status, unit: "" },
                { metric_name: "Rating", metric_value: partnershipTemplate.rating, unit: "stars" },
                { metric_name: "Usage", metric_value: partnershipTemplate.usage, unit: "transactions" },
                
                { metric_name: "Start Date", metric_value: partnershipTemplate.startDate, unit: "" },
                { metric_name: "End Date", metric_value: partnershipTemplate.endDate, unit: "" }
              ],
              user: username,
              date_created: now,
              start_date: partnershipTemplate.startDate,
              end_date: partnershipTemplate.endDate
            };
            
            const response = await apiService.reports.create(reportData);
            await Promise.all(reportData.metrics.map(metric => 
              apiService.reportData.create({ rapport: response.id, ...metric })));
            
            return {
              id: response.id,
              ...partnershipTemplate,
              lastUpdated: now.split('T')[0]
            };
          }))
        ;
        
        const allPartnerships = [
          ...existingPartnerships.map(report => {
            const metrics = report.metrics || [];
            
            return {
              id: report.id,
              name: report.title ? report.title.replace("Partnership: ", "") : "Unknown Partnership",
              deliveryPartner: metrics.find(m => m?.metric_name === "Delivery Partner")?.metric_value || "",
              rentalPartner: metrics.find(m => m?.metric_name === "Rental Partner")?.metric_value || "",
              type: metrics.find(m => m?.metric_name === "Type")?.metric_value || "",
              value: metrics.find(m => m?.metric_name === "Value")?.metric_value || "",
              status: metrics.find(m => m?.metric_name === "Status")?.metric_value || "Active",
              rating: parseFloat(metrics.find(m => m?.metric_name === "Rating")?.metric_value) || 4.0,
              terms: report.description || "",
              equipmentTypes: metrics.find(m => m?.metric_name === "Equipment Types")?.metric_value?.split(", ") || [],
              usage: parseInt(metrics.find(m => m?.metric_name === "Usage")?.metric_value) || 0,
              startDate: metrics.find(m => m?.metric_name === "Start Date")?.metric_value || new Date().toISOString().split('T')[0],
              endDate: metrics.find(m => m?.metric_name === "End Date")?.metric_value || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
              is_scheduled: report.is_scheduled || false,
              schedule_frequency: report.schedule_frequency || "quarter",
              lastUpdated: report.date_created ? report.date_created.split('T')[0] : new Date().toISOString().split('T')[0]
            };
          }),
          ...createdPartnerships
        ];
        
        updateState({ partnerships: allPartnerships, isLoading: false });
      } catch (err) {
        console.error("Error initializing partnerships:", err);
        updateState({ 
          error: "Failed to initialize partnerships",
          partnerships: REQUIRED_PARTNERSHIPS.map(partnership => ({
            ...partnership,
            id: Math.floor(Math.random() * 10000),
            lastUpdated: new Date().toISOString().split('T')[0]
          })),
          isLoading: false
        });
      }
    };
    
    initializePartnerships();
  }, []);

  const handleAddPartnership = async () => {
    try {
      const { newPartnership } = state;
      const username = "global_logistics";
      const now = new Date().toISOString();
      
      const reportData = {
        title: `Partnership: ${newPartnership.name}`,
        type: "partnership",
        description: newPartnership.terms,
        is_scheduled: newPartnership.is_scheduled,
        schedule_frequency: newPartnership.schedule_frequency,
        metrics: [
          { metric_name: "Delivery Partner", metric_value: newPartnership.deliveryPartner, unit: "" },
          { metric_name: "Rental Partner", metric_value: newPartnership.rentalPartner, unit: "" },
          { metric_name: "Type", metric_value: newPartnership.type, unit: "" },
          { metric_name: "Value", metric_value: newPartnership.value, unit: "" },
          { metric_name: "Status", metric_value: newPartnership.status, unit: "" },
          { metric_name: "Rating", metric_value: "4.0", unit: "stars" },
          { metric_name: "Usage", metric_value: "0", unit: "transactions" },
          { metric_name: "Equipment Types", metric_value: newPartnership.equipmentTypes.join(", "), unit: "" },
          { metric_name: "Start Date", metric_value: newPartnership.startDate, unit: "" },
          { metric_name: "End Date", metric_value: newPartnership.endDate, unit: "" }
        ],
        user: username,
        date_created: now,
        start_date: newPartnership.startDate,
        end_date: newPartnership.endDate
      };
      
      const response = await apiService.reports.create(reportData);
      await Promise.all(reportData.metrics.map(metric => 
        apiService.reportData.create({ rapport: response.id, ...metric })
      ));
      
      const partnershipToAdd = {
        id: response.id,
        name: newPartnership.name,
        deliveryPartner: newPartnership.deliveryPartner,
        rentalPartner: newPartnership.rentalPartner,
        type: newPartnership.type,
        value: newPartnership.value,
        status: newPartnership.status,
        rating: 4.0,
        terms: newPartnership.terms,
        equipmentTypes: [...newPartnership.equipmentTypes],
        usage: 0,
        startDate: newPartnership.startDate,
        endDate: newPartnership.endDate,
        is_scheduled: newPartnership.is_scheduled,
        schedule_frequency: newPartnership.schedule_frequency,
        lastUpdated: now.split('T')[0]
      };
      
      updateState(prev => ({
        partnerships: [...prev.partnerships, partnershipToAdd],
        showAddPartnership: false,
        newPartnership: {
          name: "", 
          deliveryPartner: "", 
          rentalPartner: "", 
          type: "", 
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          value: "", 
          terms: "", 
          status: "Active",
          equipmentTypes: [],
          is_scheduled: true, 
          schedule_frequency: "quarter",
          currentEquipmentType: ""
        }
      }));
    } catch (err) {
      console.error("Error adding partnership:", err);
      alert("Failed to add new partnership");
    }
  };

  const handleDeletePartnership = (id) => {
    updateState(prev => ({
      partnerships: prev.partnerships.filter(partnership => partnership.id !== id)
    }));
  };

  const handleSort = (key) => {
    updateState(prev => ({
      sortConfig: { 
        key, 
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  };

  const getPartnershipDistribution = () => {
    const typeMap = {};
    state.partnerships.forEach(partnership => {
      typeMap[partnership.type] = (typeMap[partnership.type] || 0) + 1;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const togglePartnershipExpand = (id) => {
    updateState(prev => ({
      expandedPartnership: prev.expandedPartnership === id ? null : id
    }));
  };

  const addEquipmentType = () => {
    if (state.newPartnership.currentEquipmentType.trim()) {
      updateState(prev => ({
        newPartnership: {
          ...prev.newPartnership,
          equipmentTypes: [...prev.newPartnership.equipmentTypes, prev.newPartnership.currentEquipmentType.trim()],
          currentEquipmentType: ""
        }
      }));
    }
  };

  const removeEquipmentType = (index) => {
    updateState(prev => {
      const newEquipmentTypes = [...prev.newPartnership.equipmentTypes];
      newEquipmentTypes.splice(index, 1);
      return {
        newPartnership: {
          ...prev.newPartnership,
          equipmentTypes: newEquipmentTypes
        }
      };
    });
  };

  const sortedPartnerships = [...state.partnerships].sort((a, b) => {
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

  const filteredPartnerships = sortedPartnerships.filter(partnership => {
    const matchesSearch = partnership.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
                         partnership.deliveryPartner.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         partnership.rentalPartner.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesType = state.selectedType === "all" || partnership.type === state.selectedType;
    const matchesStatus = state.selectedStatus === "all" || partnership.status === state.selectedStatus;
    const matchesTab = state.activeTab === 'all' || 
                      (state.activeTab === 'active' && partnership.status === 'Active') ||
                      (state.activeTab === 'pending' && partnership.status === 'Pending') ||
                      (state.activeTab === 'inactive' && partnership.status === 'Inactive');
    
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partnerships...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-red-800">Error Loading Partnerships</h3>
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

  return (
    <div className="flex flex-1 min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64">
        <SidebarPartner />
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-auto ml-64">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partnership Management</h1>
            <p className="text-gray-600">Manage partnerships between delivery and rental companies</p>
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
              onClick={() => updateState({ showAddPartnership: true })}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Partnership
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
                {tab === 'all' ? 'All Partnerships' : `${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
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
                      {stat.change} from last quarter
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
                <h3 className="text-lg font-semibold text-gray-800">Partnership Type Distribution</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPartnershipDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getPartnershipDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} partnerships`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Partnership Status</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { status: 'Active', icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: 'green' },
                    { status: 'Inactive', icon: <XCircle className="h-5 w-5 text-red-600" />, color: 'red' },
                    { status: 'Top Rated', icon: <TrendingUp className="h-5 w-5 text-blue-600" />, color: 'blue' },
                    { status: 'Expiring Soon', icon: <Clock className="h-5 w-5 text-yellow-600" />, color: 'yellow' }
                  ].map((item, index) => (
                    <div key={index} className={`bg-${item.color}-50 p-4 rounded-lg border border-${item.color}-100`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-${item.color}-800 font-medium`}>{item.status}</span>
                        {item.icon}
                      </div>
                      <p className={`text-2xl font-bold mt-2 text-${item.color}-900`}>
                        {item.status === 'Top Rated' 
                          ? state.partnerships.filter(p => p.rating >= 4.5).length
                          : item.status === 'Expiring Soon'
                            ? state.partnerships.filter(p => {
                                const endDate = new Date(p.endDate);
                                const today = new Date();
                                const diffTime = endDate - today;
                                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                return p.status === 'Active' && diffDays <= 30;
                              }).length
                            : state.partnerships.filter(p => p.status === item.status).length}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Quarterly Partnership Value</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_PARTNERSHIP_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="partnerships" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Partnerships</h2>
                  <p className="text-sm text-gray-500">
                    {filteredPartnerships.length} {filteredPartnerships.length === 1 ? 'partnership' : 'partnerships'} found
                    {state.searchTerm || state.selectedType !== 'all' || state.selectedStatus !== 'all' ? ' (filtered)' : ''}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search partnerships..."
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
                    <option value="all">All Partnership Types</option>
                    {PARTNERSHIP_TYPES.map(type => (
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
                    {['name', 'value', 'startDate', 'rating'].map((key) => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort(key)}
                          className="flex items-center hover:text-gray-700"
                        >
                          {key === 'name' ? 'Partnership' : 
                           key === 'value' ? 'Value' : 
                           key === 'startDate' ? 'Start Date' : 'Rating'}
                          {state.sortConfig.key === key && (
                            state.sortConfig.direction === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Partner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Partner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPartnerships.length > 0 ? filteredPartnerships.map((partnership) => (
                    <>
                      <tr key={partnership.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button 
                              onClick={() => togglePartnershipExpand(partnership.id)}
                              className="mr-2 text-gray-400 hover:text-gray-600"
                            >
                              {state.expandedPartnership === partnership.id ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              }
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{partnership.name}</div>
                              <div className="text-xs text-gray-500">Last updated: {partnership.lastUpdated}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {partnership.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(partnership.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 text-sm font-medium text-gray-900">
                              {partnership.rating.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {partnership.deliveryPartner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {partnership.rentalPartner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {PARTNERSHIP_TYPES.find(t => t.name === partnership.type)?.icon || <Handshake className="h-5 w-5" />}
                            <span className="ml-2 text-sm text-gray-500">{partnership.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(partnership.status)}`}>
                            {partnership.status}
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
                              onClick={() => handleDeletePartnership(partnership.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {state.expandedPartnership === partnership.id && (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Partnership Details</h4>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Duration:</span> {new Date(partnership.startDate).toLocaleDateString()} - {new Date(partnership.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Equipment Types:</span> {partnership.equipmentTypes.join(", ")}
                                </p>
                                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-3">Terms & Conditions</h4>
                                <p className="text-sm text-gray-600">{partnership.terms}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Scheduling</h4>
                                <p className="text-sm text-gray-600">
                                  {partnership.is_scheduled ? 
                                    `Scheduled (${partnership.schedule_frequency})` : 
                                    "Not scheduled"}
                                </p>
                                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-3">Usage Statistics</h4>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">{partnership.usage}</span> transactions this period
                                </p>
                                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-3">Partners</h4>
                                <div className="flex space-x-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Delivery:</p>
                                    <p className="text-sm text-gray-800">{partnership.deliveryPartner}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Rental:</p>
                                    <p className="text-sm text-gray-800">{partnership.rentalPartner}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                        No partnerships found matching your criteria
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
        {state.showAddPartnership && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Partnership</h2>
                <button onClick={() => updateState({ showAddPartnership: false })} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Name*</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={state.newPartnership.name}
                    onChange={(e) => updateState(prev => ({
                      newPartnership: { ...prev.newPartnership, name: e.target.value }
                    }))}
                    placeholder="e.g. Express Logistics & Heavy Equipment Rentals"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Partner*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.deliveryPartner}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, deliveryPartner: e.target.value }
                      }))}
                      placeholder="e.g. Express Logistics"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rental Partner*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.rentalPartner}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, rentalPartner: e.target.value }
                      }))}
                      placeholder="e.g. Heavy Equipment Rentals"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Type*</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.type}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, type: e.target.value }
                      }))}
                      required
                    >
                      <option value="">Select partnership type</option>
                      {PARTNERSHIP_TYPES.map(type => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.status}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, status: e.target.value }
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.startDate}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, startDate: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.endDate}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, endDate: e.target.value }
                      }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Value*</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={state.newPartnership.value}
                    onChange={(e) => updateState(prev => ({
                      newPartnership: { ...prev.newPartnership, value: e.target.value }
                    }))}
                    placeholder="e.g. $250,000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Types</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.currentEquipmentType}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, currentEquipmentType: e.target.value }
                      }))}
                      placeholder="e.g. Forklifts"
                      onKeyPress={(e) => e.key === 'Enter' && addEquipmentType()}
                    />
                    <button
                      onClick={addEquipmentType}
                      className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700"
                    >
                      Add
                    </button>
                  </div>
                  {state.newPartnership.equipmentTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {state.newPartnership.equipmentTypes.map((type, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {type}
                          <button
                            onClick={() => removeEquipmentType(index)}
                            className="ml-1.5 inline-flex text-teal-600 hover:text-teal-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    value={state.newPartnership.terms}
                    onChange={(e) => updateState(prev => ({
                      newPartnership: { ...prev.newPartnership, terms: e.target.value }
                    }))}
                    placeholder="Describe the terms of the partnership"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Reporting</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.is_scheduled}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, is_scheduled: e.target.value === 'true' }
                      }))}
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Frequency</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={state.newPartnership.schedule_frequency}
                      onChange={(e) => updateState(prev => ({
                        newPartnership: { ...prev.newPartnership, schedule_frequency: e.target.value }
                      }))}
                      disabled={!state.newPartnership.is_scheduled}
                    >
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                      <option value="year">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateState({ showAddPartnership: false })}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddPartnership}
                  disabled={!state.newPartnership.name || !state.newPartnership.deliveryPartner || 
                           !state.newPartnership.rentalPartner || !state.newPartnership.type || 
                           !state.newPartnership.value || !state.newPartnership.startDate || 
                           !state.newPartnership.endDate}
                  className={`px-4 py-2 rounded-md text-white ${!state.newPartnership.name || !state.newPartnership.deliveryPartner || 
                             !state.newPartnership.rentalPartner || !state.newPartnership.type || 
                             !state.newPartnership.value || !state.newPartnership.startDate || 
                             !state.newPartnership.endDate ? 
                             'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                  Create Partnership
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}