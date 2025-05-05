import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "https://674c-165-50-136-134.ngrok-free.app/profile"; // Remplace par l'URL de ton API
const token = Cookies.get('token')
const Profileservice = {

  addProfil: async (formData,role) => {
    try {
      const token = Cookies.get("token");
      let user_id = Cookies.get("keycloak_user_id");
      

      if (!token) {
        console.error("Token not found in cookies");
        throw new Error("Unauthorized: Token is missing");
      }
      const response = await axios.post(`${API_URL}/profil/`, formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const response1 = await fetch('https://674c-165-50-136-134.ngrok-free.app/user/assign/role/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id,role }),
      });
      return response1.data,response.data;
    } catch (error) {
      console.error("Error adding profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding profile failed");
    }
  },
  fetchProfile: async () => {
    try {
      // Example: Later you might want to use the token
      // const token = Cookies.get("token");
      const user_id = "38aa41ef-6bb7-4e83-8a9f-72e3b9b5db50";
  
      /* 
      if (!token) {
        console.error("Token not found in cookies");
        throw new Error("Unauthorized: Token is missing");
      }
      */
  
      const response = await axios.get(`${API_URL}/profil/?user=${user_id}`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
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
      const response = await axios.post(`${API_URL}/physicalprofil/`, formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding Physical profile failed");
    }
  },
  
};


export default Profileservice;
