import { EllipsisVertical, Search } from "lucide-react";
import { useEffect, useState } from "react";
import HistoryService from "../../services/HistoryServcie"; // Fixed typo in import
import { SelectInput } from "../../Customcss/custom";

export default function History() {
    const [historyData, setHistoryData] = useState([]); // Corrected useState syntax
    const [filteredData, setFilteredData] = useState([]); // Store filtered data
    const [SearchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState(''); // Filter state to track selected filter
    const FilterOptions = [
        { value: 'statut', label: 'Statut' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'client', label: 'Client' },
        { value: 'cout_total', label: 'Price' }
    ];

    // Handle input change for search
    const handleSearchChange = async (e) => {
        setSearchTerm(e.target.value); // Update search term
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        const { value } = e.target;
        setFilter(value); // Update filter value
    };

    // Fetch data when filter or search term changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await HistoryService.fetchHistory();
                setHistoryData(data); // Set the fetched data into state
            } catch (e) {
                console.error("Error fetching history data:", e.message);
            }
        };

        fetchData();
    }, []); // Run only once when the component is mounted

    // Filter data based on the selected filter and search term
    useEffect(() => {
        const applyFilters = () => {
            let filtered = historyData;

            // Apply filter if set
            if (filter) {
                filtered = filtered.filter(item => {
                    return item[filter] && item[filter].toString().toLowerCase().includes(SearchTerm.toLowerCase());
                });
            }

            // Apply search term filter across all fields if no specific filter is set
            if (SearchTerm && !filter) {
                filtered = filtered.filter(item => {
                    return Object.values(item).some(value =>
                        value && value.toString().toLowerCase().includes(SearchTerm.toLowerCase())
                    );
                });
            }

            setFilteredData(filtered); 
        };

        applyFilters();
    }, [historyData, filter, SearchTerm]); 

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-500'; 
            case 'inactive':
                return 'text-red-500'; 
            case 'pending':
                return 'text-yellow-500'; 
            default:
                return 'text-gray-500'; 
        }
    };

    // Helper function to check if an array is not empty
    const isNotEmpty = (arr) => Array.isArray(arr) && arr.length > 0;

    return (
        <div className="p-6">
            <div className="flex flex-1 justify-between my-7">
                <div>
                    <h2 className="text-2xl font-bold">History</h2>
                    <p className="text-green-500">Showing all your histories</p>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            value={SearchTerm} // Bind the search term to the input
                            placeholder="Search history"
                            className="w-full p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mt-3"
                            onChange={handleSearchChange} // Handle search input change
                        />
                        <Search className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <SelectInput
                        name="filter"
                        value={filter} // Use filter as the value for the dropdown
                        onChange={handleFilterChange} // Pass the handleChange function to handle selection
                        options={FilterOptions} // Pass the options for filtering
                        placeholder="Filter Your history" // Placeholder text
                    />
                </div>
            </div>

            <div className="p-4 border border-gray-300 rounded-md bg-white">
                {isNotEmpty(filteredData) ? ( // Check if filteredData exists and has items
                    filteredData.map((section, idx) => (
                        <div key={idx} className="mb-4">
                            <h3 className="font-semibold text-gray-600 mb-2">{section.date_debut}</h3>
                            <div className="flex items-center justify-between py-2 border-b">
                                <input type="checkbox" className="w-4 h-4" />
                                <span className="text-gray-700">{section.bailleur_nom}</span>
                                <span className="font-semibold">{section.equipment}</span>
                                <span className="font-semibold">{section.cout_total}</span>
                                <span className={`font-semibold ${getStatusColor(section.statut)}`}>
                                    {section.statut}
                                </span>
                                <EllipsisVertical className="cursor-pointer" />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No history available.</p>
                )}
            </div>

            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Export</button>
        </div>
    );
}
