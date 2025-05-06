import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "https://4499-196-224-227-105.ngrok-free.app/profile";
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
      const roleResponse = await fetch(
        "https://4499-196-224-227-105.ngrok-free.app/user/assign/role/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, role }),
        }
      );

      if (!roleResponse.ok) {
        const errorData = await roleResponse.json();
        throw new Error(errorData.message || "Role assignment failed");
      }

      const roleResult = await roleResponse.json();

      return {
        profile: response.data,
        roleAssignment: roleResult,
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
          "Authorization": `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error adding physical profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding Physical profile failed");
    }
  },
};

export default Profileservice;
