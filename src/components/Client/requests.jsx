import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiPlus, FiSearch, FiFileText, FiDownload, FiEye, FiX } from 'react-icons/fi';
import RentalRequestService from '../../services/requestService';

const ClientRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isContractVisible, setIsContractVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState({ id: null, type: null });

  // Fetch requests on component mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const clientId = user?.user_id;


        const response = await RentalRequestService.listRequests({ client: clientId });
        setRequests(response);
      } catch (err) {
        setError(err.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };
  
    fetchRequests();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isContractVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isContractVisible]);

  const filteredRequests = requests.filter(request => 
    request.equipment?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusConfig = {
    pending: { 
      color: 'bg-amber-100 text-amber-800',
      icon: <FiClock className="inline mr-1.5" />,
      actions: [
        { label: 'Cancel', icon: <FiXCircle />, action: (id) => cancelRequest(id), color: 'text-gray-600 hover:text-red-600' }
      ]
    },
    approved: { 
      color: 'bg-teal-100 text-teal-800',
      icon: <FiCheckCircle className="inline mr-1.5" />,
      actions: [
        { label: 'View Contract', icon: <FiFileText />, action: (id) => viewContract(id), color: 'text-teal-600 hover:text-teal-800' },
        { label: 'Download', icon: <FiDownload />, action: (id) => downloadContract(id), color: 'text-gray-600 hover:text-gray-800' }
      ]
    },
    rejected: { 
      color: 'bg-red-100 text-red-800',
      icon: <FiXCircle className="inline mr-1.5" />,
      actions: [
        { label: 'Reapply', icon: <FiPlus />, action: (id) => reapplyRequest(id), color: 'text-teal-600 hover:text-teal-800' }
      ]
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-800',
      icon: <FiXCircle className="inline mr-1.5" />,
      actions: [
        { label: 'Reapply', icon: <FiPlus />, action: (id) => reapplyRequest(id), color: 'text-teal-600 hover:text-teal-800' }
      ]
    }
  };

  const cancelRequest = async (id) => {
    try {
      await RentalRequestService.cancelReservation(id);
      setRequests((prevRequests) => prevRequests.map(req => 
        req.id === id ? { ...req, status: 'cancelled' } : req
      ));
    } catch (err) {
      console.error('Error cancelling request:', err);
      setError('Failed to cancel request');
    }
  };

  const viewContract = async (id) => {
    try {
      const request = requests.find(req => req.id === id);
      if (!request.contract) {
        // If contract details aren't already loaded, fetch them
        const response = await RentalRequestService.getRequestById(id);
        setSelectedRequest(response.data);
      } else {
        setSelectedRequest(request);
      }
      setIsContractVisible(true);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to load contract details');
    }
  };

  const downloadContract = async (id) => {
    try {
      console.log(`Downloading contract for request ${id}`);
      // In a real implementation:
      // window.open(`${API_URL}/rental-requests/${id}/contract/download/`, '_blank');
    } catch (err) {
      console.error('Error downloading contract:', err);
      setError('Failed to download contract');
    }
  };

  const reapplyRequest = async (id) => {
    try {
      const originalRequest = requests.find(req => req.id === id);
      const response = await RentalRequestService.createRequest({
        ...originalRequest,
        status: 'pending'
      });
      setRequests([response.data, ...requests]);
    } catch (err) {
      console.error('Error reapplying for request:', err);
      setError('Failed to reapply for request');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isContractVisible && !e.target.closest('.contract-modal')) {
        setIsContractVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isContractVisible]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 ml-20 lg:ml-64 p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 ml-20 lg:ml-64 p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-hidden ml-20 lg:ml-64 transition-all duration-300">
        <div className="h-full flex flex-col">
          <div className="p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rental Requests</h1>
                <p className="text-sm text-gray-500">Manage your equipment booking requests</p>
              </div>
              
              <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2.5 w-full text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 text-sm rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                  onClick={() => window.location.href = '/client/requests/new'}
                >
                  <FiPlus /> New Request
                </motion.button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredRequests.map((request) => (
                      <motion.tr 
                        key={request.id}
                        whileHover={{ backgroundColor: '#f8fafc' }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-medium">
                              {request.equipment?.toString().charAt(0) || 'E'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Equipment #{request.equipment}</div>
                              <div className="text-xs text-gray-500">Rental #{request.rental}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.start_date ? new Date(request.start_date).toLocaleDateString() : 'No date specified'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Duration: {request.duration || 'Unknown'} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${statusConfig[request.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusConfig[request.status]?.icon || <FiClock className="inline mr-1.5" />}
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.contract ? (
                            <div className="flex items-center relative">
                              <button
                                className={`flex items-center text-sm ${request.contract.signed ? 'text-teal-600' : 'text-amber-600'}`}
                                onClick={() => viewContract(request.id)}
                                onMouseEnter={() => setHoveredItem({ id: request.id, type: 'contract' })}
                                onMouseLeave={() => setHoveredItem({ id: null, type: null })}
                              >
                                <FiFileText className="mr-1.5" />
                                {request.contract.signed ? 'Signed' : 'Pending'}
                              </button>
                              
                              {hoveredItem.id === request.id && hoveredItem.type === 'contract' && (
                                <div className="absolute z-10 w-64 p-2 mt-1 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg">
                                  {request.contract.terms || 'Standard rental terms apply'}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not generated</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {statusConfig[request.status]?.actions?.map((action, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-1.5 rounded-md ${action.color} transition-colors relative`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.action(request.id);
                                }}
                                onMouseEnter={() => setHoveredItem({ id: `${request.id}-${idx}`, type: 'action' })}
                                onMouseLeave={() => setHoveredItem({ id: null, type: null })}
                              >
                                {action.icon}
                                
                                {hoveredItem.id === `${request.id}-${idx}` && hoveredItem.type === 'action' && (
                                  <div className="absolute z-10 bottom-full mb-2 px-2 py-1 text-xs text-gray-600 bg-white border border-gray-200 rounded shadow-lg">
                                    {action.label}
                                  </div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2 text-sm">
                      {searchTerm ? 'No matching requests found' : 'No requests found'}
                    </div>
                    <button 
                      onClick={() => window.location.href = '/client/requests/new'}
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                    >
                      Create your first request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isContractVisible && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="contract-modal bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Rental Contract</h3>
                  <button 
                    onClick={() => setIsContractVisible(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="mr-3">Request #{selectedRequest.id}</span>
                  <span>Equipment #{selectedRequest.equipment}</span>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="prose max-w-none">
                  <h4 className="text-sm font-medium text-gray-700">Contract Terms</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.contract?.terms || 'No specific terms available'}</p>
                  
                  <h4 className="text-sm font-medium text-gray-700 mt-4">Equipment Details</h4>
                  <ul className="text-sm text-gray-600 space-y-1 mt-1">
                    <li>• Equipment ID: {selectedRequest.equipment || 'Unknown'}</li>
                    <li>• Rental ID: {selectedRequest.rental || 'Unknown'}</li>
                    <li>• Start Date: {selectedRequest.start_date ? new Date(selectedRequest.start_date).toLocaleDateString() : 'Not specified'}</li>
                    <li>• Duration: {selectedRequest.duration || 'Not specified'} days</li>
                  </ul>
                  
                  <h4 className="text-sm font-medium text-gray-700 mt-4">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedRequest.contract?.terms || 'Standard rental agreement applies. Equipment must be returned in the same condition. Late returns will incur additional fees.'}
                  </p>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <button
                  onClick={() => downloadContract(selectedRequest.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiDownload /> Download PDF
                </button>
                {!selectedRequest.contract?.signed && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <FiEye /> Review and Sign
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientRequestsPage;