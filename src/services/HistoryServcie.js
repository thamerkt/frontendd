import axios from "axios";

const API_URL = "https://f468-41-230-62-140.ngrok-free.apphistory/"; 



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
   fetchHistory : async () => {
    try {
        
        const response = await axios.get(`${API_URL}historiques/`, 
        );
        console.log(response.data);
        return response.data
    } catch (error) {
        console.error("Error fetching history:", error);
    }
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
