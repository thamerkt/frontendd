import axios from "axios";

const API_URL = "https://kong-7e283b39dauspilq0.kongcloud.dev/rental/rental_requests/"; 



const handleError = (error) => {
    if (error.response) {
        console.error("Server Error:", error.response.data);
        throw new Error(error.response.data.message || `Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("No response from the server. Please check your network connection.");
    } else {
        console.error("Error:", error.message);
        throw new Error("An unexpected error occurred.");
    }
};

const HistoryService = {
    fetchHistoryByParam: (filters = {}) => {
    // Remove keys with undefined, null, or empty string values
    const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    // Build the query string
    const queryParams = new URLSearchParams(cleanedFilters).toString();

    // Compose full URL
    const url = `${API_URL}historiques/${queryParams ? `?${queryParams}` : ""}`;

    // Make the request
    return axios.get(url, { withCredentials: true })
        .then(response => response.data)
        .catch(handleError);
},


    DeleteHistory: async (historyId) => {
        try {
            const response = await axios.delete(`${API_URL}Historique/${historyId}`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    ExportHistory: async () => {
        try {
            const response = await axios.get(`${API_URL}Historique/export`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
};

export default HistoryService;
