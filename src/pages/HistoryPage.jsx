import { useState, useEffect, useRef } from "react";

const HistoryPage = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [moreVisible, setMoreVisible] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [historyData, setHistoryData] = useState([
    { id: 1, date: "Sunday 2 March 2025", name: "Thamer Kthiri - LED Wall Lights (8m) - Wedding", status: "Completed", price: "1000DT" },
    { id: 2, date: "Sunday 2 March 2025", name: "Thamer Kthiri - LED Wall Lights (8m) - Wedding", status: "Canceled", price: "--------" },
    { id: 3, date: "Saturday 1 March 2025", name: "Thamer Kthiri - LED Wall Lights (8m) - Wedding", status: "In progress", price: "1000DT" },
    { id: 4, date: "Saturday 1 March 2025", name: "Thamer Kthiri - LED Wall Lights (8m) - Wedding", status: "Completed", price: "1000DT" }
  ]);

  const moreRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreVisible(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    setHistoryData(historyData.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  // Group history items by date
  const groupedHistory = historyData.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">History</h2>
          <p className="text-teal-500">Showing your all histories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center border rounded-md px-3 py-2 bg-white">
            <img src="/assets/search1.png" alt="Search" className="w-5 h-5 mr-2" />
            <input type="text" placeholder="Search history" className="outline-none" />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white"
            >
              <img src="/assets/filter.png" alt="Filter" className="w-5 h-5" />
              <span>Filter</span>
            </button>
            {filterVisible && (
              <div className="absolute top-12 left-0 bg-white border rounded-md w-40 shadow-lg">
                {["Completed", "In Progress", "Canceled"].map((status) => (
                  <div
                    key={status}
                    onClick={() => {
                      setSelectedFilter(status);
                      setFilterVisible(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {status}
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

      {/* History List - Grouped by Date */}
      <div className="space-y-6">
        {Object.keys(groupedHistory).map((date) => (
          <div key={date} className="bg-white p-4 shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Yesterday - {date}</h3>
            {selectedItems.length > 0 && (
              <button onClick={deleteSelected} className="mb-3 px-4 py-2 bg-red-500 text-white rounded-lg">
                Delete Selected
              </button>
            )}
            <div className="divide-y">
              {groupedHistory[date].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <input type="checkbox" onChange={() => toggleSelection(item.id)} className="mr-2" />
                  
                  <span className="flex-1 text-gray-500 text-sm">
                    Thamer Kthiri - <span className="text-black font-bold text-lg">LED Wall Lights (8m) - Wedding</span>
                  </span>

                  <span
                    className={`text-sm font-medium ${
                      item.status === "Completed" ? "text-green-500" :
                      item.status === "In Progress" ? "text-orange-500" : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-gray-700 ml-6">{item.price}</span>
                  <div className="relative" ref={moreRef}>
                    <button onClick={() => setMoreVisible(moreVisible === item.id ? null : item.id)}>
                      <img src="/assets/mor.png" alt="More" className="w-5 h-5" />
                    </button>
                    {moreVisible === item.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg">
                        <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => alert("See More Details")}>
                          See More Details
                        </div>
                        <div className="p-2 hover:bg-red-100 text-red-500 cursor-pointer" onClick={() => setHistoryData(historyData.filter((h) => h.id !== item.id))}>
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 px-4 py-2 bg-teal-500 text-white rounded-lg">Export</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
