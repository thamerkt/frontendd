import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = "https://5b22-197-29-209-95.ngrok-free.https://f7d3-197-27-48-225.ngrok-free.app/api";

const getAuthHeaders = (isFormData = true) => {
  const token = Cookies.get("token");
  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json'
  };
  
  if (isFormData) {
    headers['Content-Type'] = 'multipart/form-data';
  } else {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

const handleResponse = (response) => {
  if (response.data && response.data.id) {
    return response.data;
  }
  throw new Error("Invalid response from server");
};

const handleError = (error) => {
  if (error.response) {
    // Server responded with a status code that falls out of 2xx range
    if (error.response.headers['content-type']?.includes('text/html')) {
      return "Server error occurred (500)";
    }

    if (error.response.data) {
      if (typeof error.response.data === 'object') {
        // Handle validation errors or other object responses
        return Object.entries(error.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('; ');
      }
      return error.response.data.toString();
    }
    return error.response.statusText;
  } else if (error.request) {
    // Request was made but no response received
    return "No response from server";
  }
  // Something happened in setting up the request
  return error.message || "Unknown error occurred";
};

const AddProductService = {
  // Category Operations
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/categories/`, 
        categoryData,
        { headers: getAuthHeaders(false) }
      );
      return handleResponse(response);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Stuff Management Operations
  createStuffManagement: async (managementData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/stuffmanagment/`, 
        managementData,
        { headers: getAuthHeaders() }
      );
      return handleResponse(response);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Product (Stuff) Operations
  createStuff: async (stuffData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/stuffs/`, 
        stuffData,
        { headers: getAuthHeaders() }
      );
      return handleResponse(response);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Image Operations
  uploadImage: async (imageData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/images/`, 
        imageData,
        { headers: getAuthHeaders() }
      );
      return handleResponse(response);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  deleteImage: async (imageId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/images/${imageId}`, 
        { headers: getAuthHeaders() }
      );
      return true;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Helper to get categories (if needed for dropdowns)
  getCategories: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/categories/`,
        { headers: getAuthHeaders(false) }
      );
      return response.data || [];
    } catch (error) {
      throw new Error(handleError(error));
    }
  }
};

export default AddProductService;