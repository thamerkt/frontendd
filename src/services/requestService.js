import Cookies from "js-cookie";

const API_URL = "https://4499-196-224-227-105.ngrok-free.app/rental"; // base path updated

const getHeaders = (isJson = false) => {
  const headers = {
    "Content-Type": isJson ? "application/json" : "multipart/form-data",
  };

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
      credentials: "include",
    };

    if (data) {
      options.body = isJson ? JSON.stringify(data) : data;
    }

    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`${method.toUpperCase()} ${url} error:`, err.message);
    throw new Error(err.message);
  }
};

const RentalRequestService = {
  listRequests: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_URL}/rental_requests/${queryParams ? `?${queryParams}` : ""}`;
    return request("get", url, null, true);
  },

  getRequestById: (id) => request("get", `${API_URL}/rental_requests/${id}/`, null, true),
  createRequest: (data) => request("post", `${API_URL}/rental_requests/`, data, true),
  updateRequest: (id, data) => request("put", `${API_URL}/rental_requests/${id}/`, data, true),
  deleteRequest: (id) => request("delete", `${API_URL}/rental_requests/${id}/`, null, true),

  placeReservation: (id) => request("post", `${API_URL}/rental_requests/${id}/place_reservation/`, null, true),
  confirmReservation: (id) => request("post", `${API_URL}/rental-requests/${id}/confirm/`, null, true),
  cancelReservation: (id) => request("post", `${API_URL}/rental_requests/${id}/cancel/`, null, true),
};

export default RentalRequestService;
