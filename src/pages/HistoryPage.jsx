import { useState, useRef, useEffect } from "react";
import { FiSearch, FiFilter, FiBell, FiMoreVertical, FiDownload, FiTrash2, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const HistoryPage = () => {
  // Mock data - replace with real API calls later
  const mockHistoryData = [
    {
      id: 1,
      date: "2023-06-15",
      client: "Thamer Kthiri",
      equipment: "Excavator CAT 320",
      startDate: "2023-06-10",
      endDate: "2023-06-14",
      status: "Completed",
      totalCost: "1,250 TND",
      bailleur: "Mohamed Ali"
    },
    {
      id: 2,
      date: "2023-06-15",
      client: "Sarah Johnson",
      equipment: "Concrete Mixer",
      startDate: "2023-06-12",
      endDate: "2023-06-15",
      status: "In Progress",
      totalCost: "850 TND",
      bailleur: "Ahmed Ben"
    },
    {
      id: 3,
      date: "2023-06-14",
      client: "David Wilson",
      equipment: "Scaffolding Set",
      startDate: "2023-06-08",
      endDate: "2023-06-13",
      status: "Completed",
      totalCost: "600 TND",
      bailleur: "Fatma Zouari"
    },
    {
      id: 4,
      date: "2023-06-14",
      client: "Emma Davis",
      equipment: "Forklift",
      startDate: "2023-06-09",
      endDate: "2023-06-12",
      status: "Cancelled",
      totalCost: "950 TND",
      bailleur: "Youssef Hammami"
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [moreVisible, setMoreVisible] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const moreRef = useRef(null);
  const filterRef = useRef(null);

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
  const groupedHistory = mockHistoryData.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
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

  const deleteSelected = () => {
    // In a real implementation, this would call an API
    alert(`Would delete items: ${selectedItems.join(', ')}`);
    setSelectedItems([]);
  };

  const exportToExcel = () => {
    // In a real implementation, this would generate an Excel file
    alert("Would export data to Excel");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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
                                        alert(`Delete item ${item.id}`);
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
    </div>
  );
};

export default HistoryPage;