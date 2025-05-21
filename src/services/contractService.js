import Cookies from "js-cookie";

const API_URL = "https://f7d3-197-27-48-225.ngrok-free.app/contracts"; // no trailing slash

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

    const res = await fetch(url, options,{withCredentials: true});

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

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

const ContractService = {
  fetchContracts: (filter, value) =>
    filter && value != null
      ? request("get", `${API_URL}/contracts/?${filter}=${encodeURIComponent(value)}`, null, true)
      : request("get", `${API_URL}/contracts/`, null, true),


  fetchContractById: (id) => request("get", `${API_URL}/contracts/${id}/`, null, true),

  // ✅ Create new contract
  createContract: (data) => request("post", `${API_URL}/contracts/`, data, true),

  // ✅ Update existing contract
  updateContract: (id, data) => request("put", `${API_URL}/contracts/${id}/`, data, true),

  // ✅ Delete contract
  deleteContract: (id) => request("delete", `${API_URL}/contracts/${id}/`),

  // ✅ Sign contract with signature (POST)
  signContract: (data) => request("post", `${API_URL}/contracts/sign/`, data, true),

  
};

export default ContractService;
