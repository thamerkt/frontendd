import { useState, useEffect, useRef } from "react";
import { FiSearch, FiFilter, FiDownload, FiTrash2, FiEye, FiMoreVertical } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { SelectInput } from "../Customcss/custom";
import ContractService from "../services/contractService";
import { useLocation } from "react-router-dom";
import * as XLSX from 'xlsx';

export default function Contracts() {
    const [contractsData, setContractsData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('');
    const [moreVisible, setMoreVisible] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const moreRef = useRef(null);
    const location = useLocation();

    const filterOptions = [
        { value: 'status', label: 'Status' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'client_name', label: 'Client' },
        { value: 'owner_name', label: 'Owner' },
        { value: 'total_price', label: 'Price' }
    ];

    // Close dropdown when clicking outside
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                let data;
                
                // Determine which fetch method to use based on the URL path
                if (location.pathname.startsWith('/admin')) {
                    data = await ContractService.fetchContracts('owner_name', 'John');
                } else if (location.pathname.startsWith('/owner')) {
                    data = await ContractService.fetchContracts();
                } else if (location.pathname.startsWith('/client')) {
                    data = await ContractService.fetchContracts('client_name', 'Acme Corporation');
                } else {
                    // Default to regular fetch if path doesn't match
                    data = await ContractService.fetchContracts();
                }
                
                setContractsData(data || []);
                setFilteredData(data || []);
                setError(null);
            } catch (e) {
                console.error("Error fetching contracts data:", e.message);
                setError("Failed to load contracts data");
                setContractsData([]);
                setFilteredData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [location.pathname]);

    useEffect(() => {
        const applyFilters = () => {
            if (!contractsData || !Array.isArray(contractsData)) return;

            let filtered = [...contractsData];

            if (filter) {
                filtered = filtered.filter(item => {
                    return item && item[filter] && 
                           item[filter].toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
            }

            if (searchTerm && !filter) {
                filtered = filtered.filter(item => {
                    return item && Object.values(item).some(value =>
                        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                    );
                });
            }

            setFilteredData(filtered);
        };

        applyFilters();
    }, [contractsData, filter, searchTerm]);

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'signed':
                return 'bg-blue-100 text-blue-800';
            case 'expired':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const toggleSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const deleteSelected = async () => {
        try {
            await Promise.all(selectedItems.map(id => 
                ContractService.deleteContract(id)
            ));
            // Remove deleted items from state
            setContractsData(prev => prev.filter(item => !selectedItems.includes(item.id)));
            setFilteredData(prev => prev.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
        } catch (e) {
            console.error("Error deleting contracts:", e);
            alert("Failed to delete some contracts");
        }
    };

    const exportToExcel = () => {
        // Prepare data for export
        const dataToExport = filteredData.map(item => ({
            'Contract ID': item.id || 'N/A',
            'Start Date': item.start_date || 'N/A',
            'End Date': item.end_date || 'N/A',
            'Client': item.client_name || 'N/A',
            'Owner': item.owner_name || 'N/A',
            'Equipment': item.equipment || 'N/A',
            'Status': item.status || 'N/A',
            'Total Price': item.total_value || 'N/A',
            'Signed Date': item.signed_date || 'Not signed'
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contracts");
        
        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `Contracts_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    if (isLoading) {
        return (
            <div className="ml-64 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading contracts data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ml-64 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="text-lg font-medium">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ml-64 p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold text-gray-800">Contracts</h2>
                    <p className="text-teal-500">Showing your all contracts</p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
                        <FiSearch className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            className="outline-none w-full"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    
                    <SelectInput
                        name="filter"
                        value={filter}
                        onChange={handleFilterChange}
                        options={filterOptions}
                        placeholder="Filter"
                        className="w-40"
                    />
                    
                    {selectedItems.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={deleteSelected}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                            <FiTrash2 size={14} />
                            <span>Delete Selected ({selectedItems.length})</span>
                        </motion.button>
                    )}
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Select
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contract ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Period
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Owner
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Equipment
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData && filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    item && (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
                                                #{item.id || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {item.start_date || 'N/A'} to {item.end_date || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.client_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.owner_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.equipment || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                                {item.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.total_value ? `$${item.total_value}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="relative inline-block text-left" ref={moreRef}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMoreVisible(moreVisible === item.id ? null : item.id);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <FiMoreVertical />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {moreVisible === item.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ duration: 0.1 }}
                                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="py-1">
                                                                <button
                                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                                                                    onClick={() => {
                                                                        // Navigate to contract details
                                                                        window.location.href = `/contracts/${item.id}`;
                                                                        setMoreVisible(null);
                                                                    }}
                                                                >
                                                                    <FiEye className="mr-2" /> View Details
                                                                </button>
                                                                <button
                                                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await ContractService.deleteContract(item.id);
                                                                            // Remove from state
                                                                            setContractsData(prev => prev.filter(contract => contract.id !== item.id));
                                                                            setFilteredData(prev => prev.filter(contract => contract.id !== item.id));
                                                                        } catch (e) {
                                                                            console.error("Error deleting contract:", e);
                                                                            alert("Failed to delete contract");
                                                                        }
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
                                    )
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No contracts data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {filteredData && filteredData.length > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Showing {filteredData.length} of {contractsData.length} records
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                            <FiDownload className="mr-2" />
                            Export to Excel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}