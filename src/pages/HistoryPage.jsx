import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import HistoryService from "../services/HistoryServcie";
import * as XLSX from "xlsx";  

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [moreVisible, setMoreVisible] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  
  const moreRef = useRef(null);
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History"); 
    XLSX.writeFile(wb, "history_data.xlsx"); 
  };

  const FilterOptions = [
    { value: "statut", label: "Statut" },
    { value: "equipment", label: "Equipment" },
    { value: "client", label: "Client" },
    { value: "cout_total", label: "Price" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await HistoryService.fetchHistory();
        setHistoryData(data);
      } catch (e) {
        console.error("Error fetching history data:", e.message);
      }
    };
    fetchData();
  }, []);

  // Optimized filtering logic
  useEffect(() => {
    if (!searchTerm && !filter) {
      setFilteredData(historyData);
      return;
    }

    setFilteredData(
      historyData.filter((item) => {
        if (filter) {
          return (
            item[filter] &&
            item[filter].toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return Object.values(item).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }, [historyData, filter, searchTerm]);

  const groupedHistory = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      acc[item.date] = acc[item.date] || [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreVisible(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = useCallback((id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const deleteSelected = useCallback(() => {
    setHistoryData((prevData) => prevData.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  }, [selectedItems]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">History</h2>
          <p className="text-teal-500">Showing your all histories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center border rounded-md px-3 py-2 bg-white">
            <img src="/assets/search1.png" alt="Search" className="w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search history"
              className="outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterVisible((prev) => !prev)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white"
            >
              <img src="/assets/filter.png" alt="Filter" className="w-5 h-5" />
              <span>Filter</span>
            </button>
            {filterVisible && (
              <div className="absolute top-12 left-0 bg-white border rounded-md w-40 shadow-lg">
                {FilterOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setFilterVisible(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="relative p-2 border rounded-md bg-white">
            <img src="/assets/bell.png" alt="Notifications" className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedHistory).map((date) => (
          <div key={date} className="bg-white p-4 shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Yesterday - {date}</h3>
            {selectedItems.length > 0 && (
              <button
                onClick={deleteSelected}
                className="mb-3 px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete Selected
              </button>
            )}
            <div className="divide-y">
              {groupedHistory[date].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <input
                    type="checkbox"
                    onChange={() => toggleSelection(item.id)}
                    className="mr-2"
                  />
                  <span className="text-black font-bold text-sm">
                    {item.date_debut}
                    </span>
                  <span className="flex-1 text-gray-500 text-sm">
                    Thamer Kthiri -{" "}
                    
                  </span>
                  <span className="text-black font-bold text-lg">
                    {item.bailleur_nom}
                  </span>

                  <span className="text-black font-bold text-lg">
                    {item.equipment}
                    </span>
                    
                  <span
                    className={`text-sm font-medium ${
                      item.statut === "Completed"
                        ? "text-green-500"
                        : item.status === "In Progress"
                        ? "text-orange-500"
                        : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-gray-700 ml-6">{item.cout_total}</span>
                  <div className="relative" ref={moreRef}>
                    <button onClick={() => setMoreVisible(moreVisible === item.id ? null : item.id)}>
                      <img src="/assets/mor.png" alt="More" className="w-5 h-5" />
                    </button>
                    {moreVisible === item.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg">
                        <div
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => alert("See More Details")}
                        >
                          See More Details
                        </div>
                        <div
                          className="p-2 hover:bg-red-100 text-red-500 cursor-pointer"
                          onClick={() =>
                            setHistoryData((prevData) => prevData.filter((h) => h.id !== item.id))
                          }
                        >
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={exportToExcel} className="mt-3 px-4 py-2 bg-teal-500 text-white rounded-lg">Export</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
