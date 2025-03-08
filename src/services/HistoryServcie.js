import axios from "axios";

const API_URL = "http://localhost:8000/history/"; // Update with your API URL

// Function to get the token (Modify as per your auth system)
const getAuthToken = () => {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTQwNDg1NiwiaWF0IjoxNzQxMzE4NDU2LCJqdGkiOiJiMmRkYmI1ZDg4MDk0Y2Y4ODRiYTRmNGI2NzQ5NGRkZSIsInVzZXJfaWQiOjMsImlzcyI6ImF1dGhtaWNyb3NlcnZpY2Uta2V5In0.1HwbVwrvlSIcXbsXSE2XQsUcBReaxTqluRTIwr-gbdY'; // Assuming token is stored in localStorage
};

// Common function to handle errors
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
        
        const response = await axios.get(`${API_URL}historiques/`, {
            headers: {
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTQwNDg1NiwiaWF0IjoxNzQxMzE4NDU2LCJqdGkiOiJiMmRkYmI1ZDg4MDk0Y2Y4ODRiYTRmNGI2NzQ5NGRkZSIsInVzZXJfaWQiOjMsImlzcyI6ImF1dGhtaWNyb3NlcnZpY2Uta2V5In0.1HwbVwrvlSIcXbsXSE2XQsUcBReaxTqluRTIwr-gbdY`,
                "Content-Type": "application/json",
            },
            withCredentials: true, // Ensures credentials are sent
        });
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
