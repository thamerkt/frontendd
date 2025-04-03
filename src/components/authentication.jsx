import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authStore from "../redux/authStore";
import { FormContainer } from "../Customcss/custom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Cookies from "js-cookie";

const clientId = '348131616981-85ms78t7eshj5l60pg07adpe9fc00tbt.apps.googleusercontent.com';

const AuthForm = () => {
  const location = useLocation();
  const isRegister = location.pathname === "/register";
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    ...(isRegister && {
      role: "customer",
      confirmPassword: "",
    })
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSuccess = async (credentialResponse) => {
    console.log("Google OAuth Success:", credentialResponse);
    const { credential } = credentialResponse;

    try {
      const response = await fetch('http://localhost:8000/user/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User authenticated:', data);

        if (data.userdata.access_token) {
          localStorage.setItem('access_token', data.userdata.access_token);
          Cookies.set('token', data.userdata.access_token);
          Cookies.set('keycloak_user_id', data.userdata.user_id);
          Cookies.set('first_name', data.userdata.first_name);
          Cookies.set('last_name', data.userdata.last_name);
        }

        toast.success("Google login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 3000);
      } else {
        const errorData = await response.json();
        console.error('Authentication error:', errorData);
        toast.error("Google login failed. Please try again.");
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleError = () => {
    console.error('Google OAuth failed');
    toast.error("Google login failed. Please try again.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }

      if (!validatePassword(formData.password)) {
        setError("Password must be at least 8 characters, include a number and a special character.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        await authStore.signup(formData.email, formData.password, formData.role);
        setFormData({ email: "", password: "", confirmPassword: "", role: "customer" });
        toast.success("Registration successful! Redirecting...");
        setTimeout(() => navigate("/register/email-verification"), 3000);
      } else {
        await authStore.login(formData.email, formData.password);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (error) {
      console.error(error);
      const action = isRegister ? "Registration" : "Login";
      setError(`${action} Failed. Please try again.`);
      toast.error(`${action} Failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormContainer>
        <h2 className="text-2xl font-bold text-center mb-6">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <form className="space-y-6 justify-center" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-1/2 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />

          <div className="flex flex-col space-y-6">
            <div className="relative w-full">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <img
                src={passwordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
                alt="Toggle Visibility"
                className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              />
            </div>

            {isRegister && (
              <div className="relative w-full">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <img
                  src={confirmPasswordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
                  alt="Toggle Visibility"
                  className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                />
              </div>
            )}
          </div>

          {!isRegister && (
            <div className="flex justify-end">
              <button 
                type="button" 
                className="text-teal-600 hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full p-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition duration-300 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading 
                ? isRegister ? "Registering..." : "Logging in..." 
                : isRegister ? "Sign Up" : "Sign In"}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <GoogleOAuthProvider clientId={clientId}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                text={isRegister ? "signup_with" : "signin_with"}
              />
            </GoogleOAuthProvider>

            {[
              { img: "f2.png", bg: "bg-blue-600", text: "text-white", hover: "hover:bg-blue-700", label: `Continue with Facebook` },
              { img: "apple.png", bg: "bg-white", text: "text-black", hover: "hover:bg-gray-200", label: `Continue with Apple` }
            ].map(({ img, bg, text, hover, label }, index) => (
              <button
                key={index}
                className={`w-full p-3 border ${bg} ${text} rounded-md flex items-center justify-center ${hover} transition duration-300`}
                type="button"
              >
                <img src={`/assets/${img}`} alt={label} className="w-5 h-5 mr-3" />
                {label}
              </button>
            ))}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button 
              type="button" 
              className="ml-2 text-teal-600 hover:underline"
              onClick={() => navigate(isRegister ? "/login" : "/signup")}
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </FormContainer>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AuthForm;