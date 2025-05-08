import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "https://f468-41-230-62-140.ngrok-free.app/profile";
const Profileservice = {
  addProfil: async (formData, role) => {
    try {
      const token = Cookies.get("token");
      const user_id = Cookies.get("keycloak_user_id");

      if (!token || !user_id) {
        throw new Error("Unauthorized: Token or user ID is missing");
      }

      // 1. Create profile
      const response = await axios.post(`${API_URL}/profil/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      // 2. Assign role
      

      
     

      return {
        profile: response.data,
        
      };
    } catch (error) {
      console.error("Error adding profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Adding profile failed");
    }
  },

  fetchProfile: async () => {
    try {
      const user_id = Cookies.get("keycloak_user_id");
      if (!user_id) {
        throw new Error("User ID is missing");
      }

      const response = await axios.get(`${API_URL}/profil/?user=${user_id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Fetching profile failed");
    }
  },

  addPhysicalProfile: async (formData) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Unauthorized: Token is missing");
      }

      const response = await axios.post(`${API_URL}/physicalprofil/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
         
        },
      }); 
      console.log(response)

      return response.data;
    } catch (error) {
      console.error("Error adding physical profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding Physical profile failed");
    }
  },
};

export default Profileservice;
