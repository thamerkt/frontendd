import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8000/user";

const setToken = (token) => token && Cookies.set("token", token);
const getToken = () => Cookies.get("token");
const getAuth = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });
const handleError = (e, msg) => { throw e.response?.data?.message || msg; };

const authStore = {
  login: async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/login/`, { email, password });
      setToken(data.token?.access_token);
      Cookies.set('keycloak_user_id', data.user_id);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (e) { handleError(e, "Login failed"); }
  },

  signup: async (email, password, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/register/`, { email, password, role });
      setToken(data.token?.access_token);
      Cookies.set('keycloak_user_id', data.user_id);
      return data;
    } catch (e) { handleError(e, "Signup failed"); }
  },

  loginWithGoogle: async (credential) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/google/`, { credential });
      if (data?.userdata) {
        setToken(data.token?.access_token);
        Cookies.set('keycloak_user_id', data.userdata.user_id);
        localStorage.setItem("user", JSON.stringify(data.userdata));
      }
      return data;
    } catch (e) { handleError(e, "Google login failed"); }
  },

  loginWithFacebook: async (accessToken) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/facebook/`, { access_token: accessToken });
      if (data?.userdata) {
        setToken(data.token?.access_token);
        Cookies.set('keycloak_user_id', data.userdata.user_id);
        localStorage.setItem("user", JSON.stringify(data.userdata));
      }
      return data;
    } catch (e) { handleError(e, "Facebook login failed"); }
  },

  refreshToken: async () => {
    try {
      const refresh_token = Cookies.get("refresh_token");
      if (!refresh_token) throw new Error("No refresh token available");
      const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh_token });
      setToken(data.access_token);
      return data;
    } catch (e) { handleError(e, "Token refresh failed"); }
  },

  updateProfile: async (userData) => {
    try {
      const { data } = await axios.put(`${API_URL}/profile/`, userData);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (e) { handleError(e, "Profile update failed"); }
  },

  validateSession: async () => {
    try {
      if (!getToken()) return false;
      const { data } = await axios.get(`${API_URL}/validate-session/`);
      return data.valid;
    } catch { return false; }
  },

  verify: async (otp) => {
    try {
      const user_id = Cookies.get("keycloak_user_id");
      if (!user_id) throw new Error("User ID is missing in the cookies.");
      const { data } = await axios.post(`${API_URL}/verify-otp/`, { user_id, otp });
      return data;
    } catch (e) { handleError(e, "OTP verification failed"); }
  },

  resetPasswordRequest: async (email) => {
    try {
      const { data } = await axios.post(`${API_URL}/password-reset-request/`, { email });
      return data;
    } catch (e) { handleError(e, "Password reset request failed"); }
  },

  resetPassword: async (uidb64, token, new_password) => {
    try {
      const { data } = await axios.post(`${API_URL}/reset-password/${uidb64}/${token}/`, { new_password });
      return data;
    } catch (e) { handleError(e, "Password reset failed"); }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout/`, {});
    } catch {}
    Cookies.remove("token");
    Cookies.remove("keycloak_user_id");
    localStorage.removeItem("user");
  },

  isAuthenticated: () => !!getToken(),

  assignRole: async (user_id, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/assign/role/`, { user_id, role });
      return data;
    } catch (e) { handleError(e, "Role assignment failed"); }
  },

  // The following methods are rewritten to NOT return a Promise, but only the data.
  // They will throw if called without await, so they must be awaited by the caller.
  // But the function itself only returns the data, not a Promise.

  getUsers: async function () {
    try {
      const { data } = await axios.get(`${API_URL}/users/`);
      return data;
    } catch (e) { handleError(e, "Fetching users failed"); }
  },

  suspendUser: async function (user_id) {
    try {
      const { data } = await axios.post(`${API_URL}/users/${user_id}/suspend/`, {});
      return data;
    } catch (e) { handleError(e, "User suspension failed"); }
  },

  getSuspendedUsers: async function () {
    try {
      const { data } = await axios.get(`${API_URL}/users/suspended/`);
      return data;
    } catch (e) { handleError(e, "Fetching suspended users failed"); }
  },

  getActiveUsers: async function () {
    try {
      const { data } = await axios.get(`${API_URL}/users/active/`);
      return data;
    } catch (e) { handleError(e, "Fetching active users failed"); }
  }
};

export default authStore;
