import Cookies from "js-cookie";

const API_URL = "https://f7d3-197-27-48-225.ngrok-free.app/api"; // no trailing slash

const getHeaders = (isJson = false) => {
  const token = Cookies.get("token");
  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async (method, url, data = null, isJson = false) => {
  try {
    const headers = getHeaders(isJson);

    const options = {
      method,
      headers,
      credentials: "include",
    };

    if (data) {
      options.body = isJson ? JSON.stringify(data) : data;
      if (!isJson && headers["Content-Type"]) {
        delete headers["Content-Type"]; // Let browser set correct multipart/form-data boundary
      }
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // If response is 204 No Content or empty, skip parsing
    const contentType = res.headers.get("content-type");
    if (res.status === 204 || !contentType || !contentType.includes("application/json")) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`${method.toUpperCase()} ${url} error:`, err.message);
    throw err;
  }
};

const EquipmentService = {
  // Rentals
  fetchRentals: () => request("get", `${API_URL}/stuffs/`, null, true),
  fetchRentalsmanagementbyid: (id) => request("get", `${API_URL}/stuffmanagment/${id}/`, null, true),
  fetchRentalsBy: (filter, data) =>
    filter && data != null
      ? request("get", `${API_URL}/stuffs/?${filter}=${encodeURIComponent(data)}`, null, true)
      : request("get", `${API_URL}/stuffs/`, null, true),
  fetchRentalById: (id) => request("get", `${API_URL}/stuffs/${id}/`, null, true),
  createRental: (data) => request("post", `${API_URL}/stuffs/`, data, true),
  updateRental: (id, data) => request("put", `${API_URL}/stuffs/${id}/`, data, true),
  deleteRental: (id) => request("delete", `${API_URL}/stuffs/${id}/`),

  // Categories
  fetchCategories: () => request("get", `${API_URL}/categories/`, null, true),
  fetchCategoryById: (id) => request("get", `${API_URL}/categories/${id}/`, null, true),
  createCategory: (data) => request("post", `${API_URL}/categories/`, data, true),
  updateCategory: (id, data) => request("put", `${API_URL}/categories/${id}/`, data, true),
  deleteCategory: (id) => request("delete", `${API_URL}/categories/${id}/`),

  // Subcategories
  fetchsubcatgeory: () => request("get", `${API_URL}/subcatgeory/`, null, true),
  fetchsubcatgeoryById: (id) => request("get", `${API_URL}/subcatgeory/${id}/`, null, true),
  createsubcatgeory: (data) => request("post", `${API_URL}/subcatgeory/`, data, true),
  updatesubcatgeory: (id, data) => request("put", `${API_URL}/subcatgeory/${id}/`, data, true),
  deletesubcatgeory: (id) => request("delete", `${API_URL}/subcatgeory/${id}/`),

  // Images
  fetchImages: () => request("get", `${API_URL}/images/`, null, true),

  // Analytics
  trackView: (data) => request("post", `${API_URL}/item-views/`, data, true),

  trackCart: async (data) => {
    const result = await request("post", `${API_URL}/cart-activities/`, data, true);
    if (result?.session_key) {
      localStorage.setItem("session_key", result.session_key);
    }
    return result;
  },

  CreateVisitor: (session_key) =>
    request("post", `${API_URL}/visitors/`, { session_key: session_key || null }, true),
};

export default EquipmentService;
