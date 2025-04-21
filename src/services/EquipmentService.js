import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://127.0.0.1:8000/api";
const getHeaders = () => ({
  "Content-Type": "multipart/form-data",
  Authorization: `Bearer ${Cookies.get("token")}`,
});

const request = async (method, url, data = null, auth = false) => {
  try {
    const res = await axios({ method, url, data});
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.error(`${method.toUpperCase()} error:`, msg);
    throw new Error(msg);
  }
};

const EquipmentService = {
  fetchRentals: () => request("get", `${API_URL}/stuffs/`),
  fetchRentalsmanagementbyid: (id) => request("get", `${API_URL}/stuffmanagment/${id}/`),
  fetchRentalsBy: (filter,data) => request("get", `${API_URL}/stuffs/?${filter}=${data}`, null, true),
  fetchRentalById: (id) => request("get", `${API_URL}/stuffs/${id}/`, null, true),
  createRental: (data) => request("post", `${API_URL}/stuffs/`, data, true),
  updateRental: (id, data) => request("put", `${API_URL}/stuffs/${id}/`, data, true),
  deleteRental: (id) => request("delete", `${API_URL}/stuffs/${id}/`, null, true),

  fetchCategories: () => request("get", `${API_URL}/categories/`, null, true),
  fetchCategoryById: (id) => request("get", `${API_URL}/categories/${id}/`, null, true),
  createCategory: (data) => request("post", `${API_URL}/categories/`, data, true),
  updateCategory: (id, data) => request("put", `${API_URL}/categories/${id}/`, data, true),
  deleteCategory: (id) => request("delete", `${API_URL}/categories/${id}/`, null, true),
  fetchImages: () => request("get", `${API_URL}/images/`),
};

export default EquipmentService;
