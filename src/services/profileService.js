import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8000/profile";
const Profileservice = {
  // CREATE
  addProfil: async (formData, role) => {
    try {
      const user_id = Cookies.get("keycloak_user_id");

      if (!user_id) {
        throw new Error("User ID is missing");
      }

      // 1. Create profile (no token sent)
      const response = await axios.post(`${API_URL}/profil/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 2. Assign role (not implemented)
      
      return response
      
    } catch (error) {
      console.error("Error adding profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Adding profile failed");
    }
  },

  // READ (single profile for current user)
  fetchProfile: async () => {
    try {
      const user = localStorage.getItem("user");
      const user_id = JSON.parse(user).user_id;
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

  // READ (all users - for admin)
  fetchAllUsers: async () => {
    try {
      
      const response = await axios.get(`${API_URL}/profil/`, {
        headers: {
          "Content-Type": "application/json",
         
        },
        withCredentials: true,
      });
      return response;
    } catch (error) {
      console.error("Error fetching all users:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Fetching all users failed");
    }
  },

  // UPDATE (profile)
  updateProfile: async (profileId, updateData) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Unauthorized: Token is missing");
      }
      const response = await axios.patch(`${API_URL}/profil/${profileId}/`, updateData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Updating profile failed");
    }
  },

  // DELETE (profile)
  deleteProfile: async (profileId) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Unauthorized: Token is missing");
      }
      await axios.delete(`${API_URL}/profil/${profileId}/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Deleting profile failed");
    }
  },

  // UPDATE user status (for admin)
  updateUserStatus: async (userId, newStatus) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Unauthorized: Token is missing");
      }
      const response = await axios.patch(
        `${API_URL}/profil/${userId}/`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user status:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Updating user status failed");
    }
  },

  // CREATE physical profile
  addPhysicalProfile: async (formData) => {
    try {
      // No token sent
      const response = await axios.post(`${API_URL}/physicalprofil/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);

      return response.data;
    } catch (error) {
      console.error("Error adding physical profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding Physical profile failed");
    }
  },
};

export default Profileservice;
