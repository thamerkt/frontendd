import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "https://kong-7e283b39dauspilq0.kongcloud.dev/user";

const setToken = (token) => token && Cookies.set("token", token);
const getToken = () => Cookies.get("token");
const getAuth = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });
const handleError = (e, msg) => {
  // Try to get server error message, fallback to msg or e.message
  const errorMsg =
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.message ||
    msg ||
    "An error occurred";
  throw new Error(errorMsg);
};

const authStore = {
  login: async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/login/`, { email, password });
      console.log("data",data)
      setToken(data.token?.access_token);
      if (data.user_id) Cookies.set("keycloak_user_id", data.user_id);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (e) {
      handleError(e, "Login failed");
    }
  },

  signup: async (email, password, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/register/`, { email, password, role });
      setToken(data.token?.access_token);
      if (data.user_id) Cookies.set("keycloak_user_id", data.user_id);
      return data;
    } catch (e) {
      handleError(e, "Signup failed");
    }
  },

  resendVerificationCode: async () => {
    try {
      const { data } = await axios.post(`${API_URL}/resend-verification-code/`);
      return data;
    } catch (e) {
      handleError(e, "Resend verification code failed");
    }
  },

  loginWithGoogle: async (credential) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/google/`, { credential });
      if (data?.userdata) {
        setToken(data.token?.access_token);
        Cookies.set("keycloak_user_id", data.userdata.user_id);
        localStorage.setItem("user", JSON.stringify(data.userdata));
      }
      return data;
    } catch (e) {
      handleError(e, "Google login failed");
    }
  },

  loginWithFacebook: async (accessToken) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/facebook/`, { access_token: accessToken });
      if (data?.userdata) {
        setToken(data.token?.access_token);
        Cookies.set("keycloak_user_id", data.userdata.user_id);
        localStorage.setItem("user", JSON.stringify(data.userdata));
      }
      return data;
    } catch (e) {
      handleError(e, "Facebook login failed");
    }
  },

  refreshToken: async () => {
    try {
      const refresh_token = Cookies.get("refresh_token");
      if (!refresh_token) throw new Error("No refresh token available");
      const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh_token });
      setToken(data.access_token);
      return data;
    } catch (e) {
      handleError(e, "Token refresh failed");
    }
  },

  updateProfile: async (userData) => {
    try {
      const { data } = await axios.put(`${API_URL}/profile/`, userData, getAuth());
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (e) {
      handleError(e, "Profile update failed");
    }
  },

  validateSession: async () => {
    try {
      if (!getToken()) return false;
      const { data } = await axios.get(`${API_URL}/validate-session/`, getAuth());
      return data.valid;
    } catch {
      return false;
    }
  },

  verify: async (otp) => {
    try {
      const user_id = Cookies.get("keycloak_user_id");
      const token = getToken();

      if (!user_id || !token) {
        throw new Error("User ID or token is missing in the cookies.");
      }

      const response = await axios.post(
        `${API_URL}/verify-otp/`,
        { user_id, otp },
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Verification failed:", error);

      if (error.response) {
        throw new Error(error.response.data?.error || "OTP verification failed.");
      } else if (error.request) {
        throw new Error("No response received from the server.");
      } else {
        throw new Error(error.message || "An unknown error occurred.");
      }
    }
  },

  resetPasswordRequest: async (email) => {
    try {
      const { data } = await axios.post(`${API_URL}/password-reset-request/`, { email });
      return data;
    } catch (e) {
      handleError(e, "Password reset request failed");
    }
  },

  resetPassword: async (uidb64, token, new_password) => {
    try {
      const { data } = await axios.post(`${API_URL}/reset-password/${uidb64}/${token}/`, { new_password });
      return data;
    } catch (e) {
      handleError(e, "Password reset failed");
    }
  },

  logout: async (refreshToken) => {
    try {
      if (refreshToken) {
        await axios.post(`${API_URL}/logout/`, { refresh_token: refreshToken });
      }
    } catch {
      // ignore logout errors
    } finally {
      Cookies.remove("token");
      Cookies.remove("keycloak_user_id");
      localStorage.removeItem("user");
    }
  },

  isAuthenticated: () => !!getToken(),

  assignRole: async (user_id, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/assign/role/`, { user_id, role }, getAuth());
      return data;
    } catch (e) {
      handleError(e, "Role assignment failed");
    }
  },

  getUsers: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/`, { withCredentials: true, ...getAuth() });
      return data;
    } catch (e) {
      handleError(e, "Fetching users failed");
    }
  },

  suspendUser: async (user_id) => {
    try {
      const { data } = await axios.post(`${API_URL}/users/${user_id}/suspend/`, {}, getAuth());
      return data;
    } catch (e) {
      handleError(e, "User suspension failed");
    }
  },

  getSuspendedUsers: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/suspended/`, getAuth());
      return data;
    } catch (e) {
      handleError(e, "Fetching suspended users failed");
    }
  },

  getActiveUsers: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/active/`, getAuth());
      return data;
    } catch (e) {
      handleError(e, "Fetching active users failed");
    }
  },
};

export default authStore;
