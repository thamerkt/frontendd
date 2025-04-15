import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8000/profile"; // Remplace par l'URL de ton API
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
      const response1 = await fetch('http://localhost:8000/user/assign/role/', {
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
     // const token = Cookies.get("token");
      let user_id = Cookies.get("keycloak_user_id");
      

    /*  if (!token) {
        console.error("Token not found in cookies");
        throw new Error("Unauthorized: Token is missing");
      }*/
      const response = await axios.get(`${API_URL}/profil/?user=${user_id}`,
        {
          headers: {
            "Content-Type": "multipart/form-data"
            //"Authorization": `Bearer ${token}`
          }
        }
      )
    
      return response.data;
    } catch (error) {
      console.error("Error adding profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding profile failed");
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
