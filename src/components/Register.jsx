import React, { useState } from "react";
import axios from "axios";
import { FormContainer } from "../Customcss/custom";

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

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters, include a number and a special character.");
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

  return (
    <FormContainer>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          {/* Password Field */}
          <div className="relative w-full">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <img
              src={passwordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
              alt="Toggle Visibility"
              className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
              onClick={() => setPasswordVisible(!passwordVisible)}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="relative w-full">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <img
              src={confirmPasswordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
              alt="Toggle Visibility"
              className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            className="w-full p-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition duration-300 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {[ 
            { img: "search.png", bg: "bg-white", text: "text-black", hover: "hover:bg-gray-200", label: "Sign in with Google" },
            { img: "f2.png", bg: "bg-blue-600", text: "text-white", hover: "hover:bg-blue-700", label: "Sign in with Facebook" },
            { img: "apple.png", bg: "bg-white", text: "text-black", hover: "hover:bg-gray-200", label: "Sign in with Apple" }
          ].map(({ img, bg, text, hover, label }, index) => (
            <button
              key={index}
              className={`w-full p-3 border ${bg} ${text} rounded-md flex items-center justify-center ${hover} transition duration-300`}
            >
              <img src={`/assets/${img}`} alt={label} className="w-5 h-5 mr-3" />
              {label}
            </button>
          ))}
        </div>
      </form>
    </FormContainer>
  );
};

export default Register;
