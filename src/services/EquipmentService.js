import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const EquipmentService = {
  
  fetchRentals: async () => {
    try {
      const response = await axios.get(`${API_URL}/stuffs/`, {
        headers: {
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTQwNDg1NiwiaWF0IjoxNzQxMzE4NDU2LCJqdGkiOiJiMmRkYmI1ZDg4MDk0Y2Y4ODRiYTRmNGI2NzQ5NGRkZSIsInVzZXJfaWQiOjMsImlzcyI6ImF1dGhtaWNyb3NlcnZpY2Uta2V5In0.1HwbVwrvlSIcXbsXSE2XQsUcBReaxTqluRTIwr-gbdY`,
            "Content-Type": "application/json",
        },
        withCredentials: true, // Ensures credentials are sent
    });
    console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching rentals:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch rentals");
    }
  },
  fetchRentalsBy: async (filter) => {
    try {
      const response = await axios.get(`${API_URL}/stuffs/?${filter}`,  {
        headers: {
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTQwNDg1NiwiaWF0IjoxNzQxMzE4NDU2LCJqdGkiOiJiMmRkYmI1ZDg4MDk0Y2Y4ODRiYTRmNGI2NzQ5NGRkZSIsInVzZXJfaWQiOjMsImlzcyI6ImF1dGhtaWNyb3NlcnZpY2Uta2V5In0.1HwbVwrvlSIcXbsXSE2XQsUcBReaxTqluRTIwr-gbdY`,
            "Content-Type": "application/json",
        },
        withCredentials: true, // Ensures credentials are sent
    });
    console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching rentals:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch rentals");
    }
  },
  
  fetchRentalById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/stuffs/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rental:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch rental");
    }
  },

  
  createRental: async (rentalData) => {
    try {
      const response = await axios.post(`${API_URL}/stuffs/`, rentalData);
      return response.data;
    } catch (error) {
      console.error("Error creating rental:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create rental");
    }
  },

  
  updateRental: async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/stuffs/${id}/`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating rental:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update rental");
    }
  },

  
  deleteRental: async (id) => {
    try {
      await axios.delete(`${API_URL}/stuffs/${id}/`);
      return true;
    } catch (error) {
      console.error("Error deleting rental:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete rental");
    }
  },

  
  fetchCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/`, {
        headers: {
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTQwNDg1NiwiaWF0IjoxNzQxMzE4NDU2LCJqdGkiOiJiMmRkYmI1ZDg4MDk0Y2Y4ODRiYTRmNGI2NzQ5NGRkZSIsInVzZXJfaWQiOjMsImlzcyI6ImF1dGhtaWNyb3NlcnZpY2Uta2V5In0.1HwbVwrvlSIcXbsXSE2XQsUcBReaxTqluRTIwr-gbdY`,
            "Content-Type": "application/json",
        },
        withCredentials: true, // Ensures credentials are sent
    });
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch categories");
    }
  },

  
  fetchCategoryById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/categories/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch category");
    }
  },

  
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(`${API_URL}/categories/`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create category");
    }
  },

  
  updateCategory: async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/categories/${id}/`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update category");
    }
  },

  
  deleteCategory: async (id) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}/`);
      return true;
    } catch (error) {
      console.error("Error deleting category:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete category");
    }
  }
};

export default EquipmentService;