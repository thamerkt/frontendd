import Cookies from "js-cookie";

const API_URL = "https://4499-196-224-227-105.ngrok-free.app/api"; // removed trailing slash

const getHeaders = (isJson = false) => {
  const headers = {
    "Content-Type": isJson ? "application/json" : "multipart/form-data",
  };

  // Add the Authorization token if it exists
  const token = Cookies.get("token");
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
      credentials: "include", // ensures cookies are sent if needed
    };

    if (data) {
      if (isJson) {
        options.body = JSON.stringify(data); // for JSON data
      } else {
        options.body = data; // for FormData (multipart)
      }
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Assuming the response is JSON
    const responseData = await res.json();
    return responseData;

  } catch (err) {
    console.error(`${method.toUpperCase()} ${url} error:`, err.message);
    throw new Error(err.message);
  }
};

const EquipmentService = {
  fetchRentals: () => request("get", `${API_URL}/stuffs/`, null, true),
  fetchRentalsmanagementbyid: (id) => request("get", `${API_URL}/stuffmanagment/${id}/`, null, true),
  fetchRentalsBy: (filter, data) => {
    if (!filter || data == null || data === undefined) {
      return request("get", `${API_URL}/stuffs/`, null, true);
    }
    return request("get", `${API_URL}/stuffs/?${filter}=${encodeURIComponent(data)}`, null, true);
  },
  fetchRentalById: (id) => request("get", `${API_URL}/stuffs/${id}/`, null, true),
  createRental: (data) => request("post", `${API_URL}/stuffs/`, data, true),
  updateRental: (id, data) => request("put", `${API_URL}/stuffs/${id}/`, data, true),
  deleteRental: (id) => request("delete", `${API_URL}/stuffs/${id}/`, null, true),

  fetchCategories: () => request("get", `${API_URL}/categories/`, null, true),
  fetchCategoryById: (id) => request("get", `${API_URL}/categories/${id}/`, null, true),
  createCategory: (data) => request("post", `${API_URL}/categories/`, data, true),
  updateCategory: (id, data) => request("put", `${API_URL}/categories/${id}/`, data, true),
  deleteCategory: (id) => request("delete", `${API_URL}/categories/${id}/`, null, true),

  fetchImages: () => request("get", `${API_URL}/images/`, null, true),

  trackView: (data) => request("post", `${API_URL}/item-views/`, data, false, true),

  trackCart: async (data) => {
    const result = await request("post", `${API_URL}/cart-activities/`, data, false, true);
    if (result.session_key) {
      localStorage.setItem("session_key", result.session_key);
    }
    return result;
  },

  CreateVisitor: (session_key) =>
    request("post", `${API_URL}/visitors/`, { session_key: session_key || null }, false, true),
};

export default EquipmentService;
