import React, { useState } from "react";
import axios from "axios";
import {TextInput, FormContainer } from "../Customcss/custom";



const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    d
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous errors
    setError("");

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters, include a number and a special character."
      );
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      alert("Registration Successful!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setError("");
    } catch (error) {
      console.error(error);
      setError("Registration Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
  
      <FormContainer>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
            <TextInput
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
            <TextInput
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
          <TextInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
            <div className="relative w-full sm:w-1/2">
              <TextInput
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
              <img
                src={passwordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
                alt="Toggle Visibility"
                className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            </div>
            <div className="relative w-full sm:w-1/2">
              <TextInput
                type={confirmPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
              />
              <img
                src={confirmPasswordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
                alt="Toggle Visibility"
                className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
                onClick={toggleConfirmPasswordVisibility}
              />
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full mt-6 p-3 bg-teal-500 text-white text-base rounded-md hover:bg-teal-600 transition duration-300 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
            <button className="w-full p-3 bg-white border text-black text-base rounded-md flex items-center justify-center hover:bg-gray-200 transition duration-300">
              <img src="/assets/search.png" alt="Google" className="w-5 h-5 mr-3" />
              Sign in with Google
            </button>
            <button className="w-full p-3 bg-blue-600 text-white text-base rounded-md flex items-center justify-center hover:bg-blue-700 transition duration-300">
              <img src="/assets/f2.png" alt="Facebook" className="w-5 h-5 mr-3" />
              Sign in with Facebook
            </button>
            <button className="w-full p-3 bg-white border text-black text-base rounded-md flex items-center justify-center hover:bg-gray-200 transition duration-300">
              <img src="/assets/apple.png" alt="Apple" className="w-5 h-5 mr-3" />
              Sign in with Apple
            </button>
          </div>
        </form>
      </FormContainer>
    );
  };
  
 
  

export default Register;
