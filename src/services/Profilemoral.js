import axios from "axios";


const API_URL = "http://127.0.0.1:8000/api"; // Remplace par l'URL de ton API

const Profilmoralservice = {
    addProfilemoral: async (formdata) => {
       
        try {
            const response = await axios.post(`${API_URL}/profilmoral/`, formdata);
        
            // Return the response data if the request is successful
            return response.data;
          } catch (error) {
            if (error.response) {
              // If server error
              console.error('Server Error:', error.response.data);
              throw new Error(error.response.data.message || `Error: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
              // If no response was received from the server
              console.error('No response received:', error.request);
              throw new Error("No response from the server. Please check your network connection.");
            } else {
              // General error
              console.error('Error:', error.message);
              throw new Error("An unexpected error occurred.");
            }
          }
        }}

  

export default Profilmoralservice;
