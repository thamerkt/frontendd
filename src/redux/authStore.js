import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "https://5b22-197-29-209-95.ngrok-free.app/user"; 

const authStore = {
  login: async (email,password) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, { email,password });
      Cookies.set("token", response.data.token.access_token);
      Cookies.set('keycloak_user_id', response.data.user_id);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },

  signup: async (email, password,role) => {
    try {
      const response = await axios.post(`${API_URL}/register/`, { email, password,role});
      Cookies.set("token", response.data.token.access_token);
      Cookies.set('keycloak_user_id', response.data.user_id);
      
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
    return !!Cookies.get("token");
  },
  verify: async (otp) => {
    try {
      let user_id = Cookies.get("keycloak_user_id"); // Retrieve user_id from cookies
      console.log(user_id)
      if (!user_id) {
        throw new Error("User ID is missing in the cookies.");
      }
  
      // Send OTP verification request
      let response = await axios.post(`${API_URL}/verify-otp/`, { user_id, otp });
  
      return response.data; // Return response data on successful verification
    }catch (error) {
      console.error("Failed to verify:", error);
    
      // Log full error details
      if (error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Response Status:", error.response.status);
        console.error("Response Headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request made but no response received:", error.request);
      } else {
        console.error("Unexpected Error:", error.message);
      }}}};

export default authStore;
