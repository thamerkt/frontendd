import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8000/profile";

const Profileservice = {
  // CREATE: Add Profile and Assign Role
  addProfil: async (formData, role) => {
    try {
      const user_id = Cookies.get("keycloak_user_id");
      if (!user_id) throw new Error("User ID is missing");
  
      // Log formData structure
      console.log('🚀 Raw formData:', formData);
  
      // Log each entry in formData for inspection
      if (formData instanceof FormData) {
        console.log('🔍 FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
      } else {
        console.warn('⚠️ formData is not FormData! It might be a plain object.');
        console.log(formData);
      }
  
      // 1. Create profile
      const profileResponse = await axios.post(`${API_URL}/profil/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("✅ Profile created:", profileResponse);
  
      // 2. Assign role
      const roleResponse = await axios.post(`http://localhost:8000/user/assign/role/`, { role, user_id }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("✅ Role assigned:", roleResponse);
  
      return { profile: profileResponse.data, roleAssignment: roleResponse.data };
    } catch (error) {
      console.error("❌ Error adding profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding profile failed");
    }
  },
  

  // FETCH (single profile by user_id)
  fetchProfilereceiver: async (user_id) => {
    try {
      if (!user_id) throw new Error("User ID is missing");

      const response = await axios.get(`${API_URL}/profil/?user=${user_id}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Fetching profile failed");
    }
  },

  // FETCH (current user's profile)
  fetchProfile: async () => {
    try {
      const user = localStorage.getItem("user");
      const user_id = JSON.parse(user)?.user_id;
      if (!user_id) throw new Error("User ID is missing");

      const response = await axios.get(`${API_URL}/profil/?user=${user_id}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Fetching profile failed");
    }
  },

  // FETCH (all profiles - admin)
  fetchAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/profil/`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all users:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Fetching all users failed");
    }
  },

  // UPDATE (profile)
  updateProfile: async (profileId, updateData) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Unauthorized: Token is missing");

      const response = await axios.patch(`${API_URL}/profil/${profileId}/`, updateData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      if (!token) throw new Error("Unauthorized: Token is missing");

      await axios.delete(`${API_URL}/profil/${profileId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Deleting profile failed");
    }
  },

  // UPDATE (user status for admin)
  updateUserStatus: async (userId, newStatus) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Unauthorized: Token is missing");

      const response = await axios.patch(`${API_URL}/profil/${userId}/`, { status: newStatus }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating user status:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Updating user status failed");
    }
  },

  // CREATE (physical profile)
  addPhysicalProfile: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/physicalprofil/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      console.error("Error adding physical profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding physical profile failed");
    }
  },
};

export default Profileservice;
