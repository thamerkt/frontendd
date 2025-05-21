import { useState, useRef, useEffect } from "react";
import { FiSearch, FiFilter, FiBell, FiMoreVertical, FiDownload, FiTrash2, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import HistoryService from "../services/HistoryService";
import { getAuthToken } from "../services/AuthService";

const HistoryPage = () => {
  const [isSidebarExpanded] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [moreVisible, setMoreVisible] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const moreRef = useRef(null);
  const filterRef = useRef(null);

  // Fetch history data on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await HistoryService.fetchHistory();
        setHistoryData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreVisible(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filterOptions = [
    { value: "status", label: "Status" },
    { value: "equipment", label: "Equipment" },
    { value: "client", label: "Client" },
    { value: "totalCost", label: "Price" },
  ];

  // Group data by date
  const groupedHistory = historyData.reduce((acc, item) => {
    const date = item.date || item.createdAt; // Use whichever field your API returns
    acc[date] = acc[date] || [];
    acc[date].push(item);
    return acc;
  }, {});

  // Filter data based on search term
  const filteredData = Object.entries(groupedHistory).reduce((acc, [date, items]) => {
    const filteredItems = items.filter(item => {
      if (!searchTerm) return true;
      return Object.values(item).some(
        value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    if (filteredItems.length > 0) acc[date] = filteredItems;
    return acc;
  }, {});

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    try {
      const deletePromises = selectedItems.map(id => 
        HistoryService.DeleteHistory(id)
      );
      await Promise.all(deletePromises);
      
      // Remove deleted items from state
      setHistoryData(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      alert("Selected items deleted successfully");
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Failed to delete items");
    }
  };

  const deleteSingleItem = async (id) => {
    try {
      await HistoryService.DeleteHistory(id);
      setHistoryData(prev => prev.filter(item => item.id !== id));
      alert("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await HistoryService.ExportHistory();
      // Create a download link for the Excel file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'history_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data");
    }
  };

  if (loading) {
    return (
      <div 
        className="p-6 bg-gray-50 min-h-screen flex items-center justify-center"
        style={{ 
          marginLeft: isSidebarExpanded ? '16rem' : '5rem',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-6 bg-gray-50 min-h-screen flex items-center justify-center"
        style={{ 
          marginLeft: isSidebarExpanded ? '16rem' : '5rem',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900">Error loading history</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 bg-gray-50 min-h-screen"
      style={{ 
        marginLeft: isSidebarExpanded ? '16rem' : '5rem',
        transition: 'margin-left 0.3s ease'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">History</h2>
          <p className="text-teal-500">Showing your all histories</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
            <FiSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search history..."
              className="outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="text-gray-600" />
              <span className="text-sm">Filter</span>
            </button>
            
            <AnimatePresence>
              {filterVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 top-12 left-0 bg-white border rounded-lg w-40 shadow-lg"
                >
                  {filterOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value);
                        setFilterVisible(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {option.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button className="p-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors">
            <FiBell className="text-gray-600" />
          </button>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <h3 className="text-lg font-medium text-gray-900">No history found</h3>
          <p className="mt-2 text-gray-600">There are no history records to display.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredData).map(([date, items]) => {
            const hasSelectedItemsInGroup = items.some(item => selectedItems.includes(item.id));
            
            return (
              <div key={date} className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                
                {hasSelectedItemsInGroup && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={deleteSelected}
                    className="mb-4 px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-2 hover:bg-red-600 transition-colors"
                  >
                    <FiTrash2 />
                    <span>Delete Selected ({selectedItems.filter(id => items.some(item => item.id === id)).length})</span>
                  </motion.button>
                )}
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bailleur
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleSelection(item.id)}
                              className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.client}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.equipment}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.bailleur}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === "Completed" ? "bg-green-100 text-green-800" :
                              item.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalCost}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative inline-block text-left" ref={moreRef}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMoreVisible(moreVisible === item.id ? null : item.id);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <FiMoreVertical />
                              </button>
                              
                              <AnimatePresence>
                                {moreVisible === item.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="py-1">
                                      <button
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        onClick={() => {
                                          alert(`View details for ${item.id}`);
                                          setMoreVisible(null);
                                        }}
                                      >
                                        <FiEye className="mr-2" /> View Details
                                      </button>
                                      <button
                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                        onClick={() => {
                                          deleteSingleItem(item.id);
                                          setMoreVisible(null);
                                        }}
                                      >
                                        <FiTrash2 className="mr-2" /> Delete
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <FiDownload className="mr-2" />
                    Export to Excel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;