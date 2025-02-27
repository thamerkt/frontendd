import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // Remplace par l'URL de ton API

const authStore = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, { email, password });
      localStorage.setItem("token", response.data.refresh_token);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },

  signup: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register/`, { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Signup failed";
    }
  },

  resetPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Password reset failed";
    }
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authStore;
