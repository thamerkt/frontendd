import axios from "axios";

const API_BASE_URL = "https://your-api-endpoint.com"; // Replace with your actual API URL

// Function to add a new profile
export const addProfile = async (profileData, token = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_BASE_URL}/profiles`, profileData, { headers });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Function to get all profiles
export const getProfiles = async (token = null) => {
  try {
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/profiles`, { headers });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Function to update a profile by ID
export const updateProfile = async (profileId, profileData, token = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.put(`${API_BASE_URL}/profiles/${profileId}`, profileData, { headers });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Function to delete a profile by ID
export const deleteProfile = async (profileId, token = null) => {
  try {
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await axios.delete(`${API_BASE_URL}/profiles/${profileId}`, { headers });

    return { message: "Profile deleted successfully" };
  } catch (error) {
    handleAxiosError(error);
  }
};

// Centralized function to handle errors
const handleAxiosError = (error) => {
  if (error.response) {
    console.error("API Error:", error.response.data);
    throw new Error(error.response.data.message || "An error occurred while processing your request");
  } else if (error.request) {
    console.error("No response received:", error.request);
    throw new Error("No response from server");
  } else {
    console.error("Request error:", error.message);
    throw new Error("Unexpected error occurred");
  }
};
