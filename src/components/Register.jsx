import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear errors on input change
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

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
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      {/* Navbar */}
      <div className="bg-black text-white px-6 py-3 flex justify-between items-center w-full">
        <span className="text-sm">
          Email us at:{" "}
          <a href="mailto:medkh@gmail.com" className="underline">
            medkh@gmail.com
          </a>
        </span>
        <div className="flex space-x-4">
          <img src="/assets/f3.png" alt="Facebook" className="w-5 h-5" />
          <img src="/assets/twitter.png" alt="Twitter" className="w-5 h-5" />
          <img src="/assets/email.png" alt="Google" className="w-5 h-5" />
          <img src="/assets/cart.png" alt="Cart" className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 w-full items-center justify-center p-8">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl flex flex-col sm:flex-row">
          {/* Sidebar */}
          <div className="w-full sm:w-1/3 bg-gray-50 p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-4">Everything Rentals</h1>
              <p className="text-gray-600 mb-6">New User Registration.</p>
              <div>
                <div className="flex items-center mb-4">
                  <img src="/assets/info.png" alt="Details" className="w-6 h-6 mr-3" />
                  <span>Your details</span>
                </div>
                <div className="flex items-center mb-4">
                  <img src="/assets/otp.png" alt="Verify" className="w-6 h-6 mr-3" />
                  <span>Verify email</span>
                </div>
                <div className="flex items-center">
                  <img src="/assets/welcome-icon.png" alt="Welcome" className="w-6 h-6 mr-3" />
                  <span>Welcome</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button className="text-blue-500 hover:underline">Back to home</button>
              <button className="text-blue-500 hover:underline">Login</button>
            </div>
          </div>

          {/* Registration Form */}
          <div className="w-full sm:w-2/3 p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Register</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full sm:w-1/2 p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full sm:w-1/2 p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full sm:w-1/2 p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full sm:w-1/2 p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full p-3 bg-teal-500 text-white text-base rounded-md hover:bg-teal-600 transition duration-300"
              >
                Register
              </button>
              <div className="space-y-3">
                <button className="w-full p-3 bg-red-500 text-white text-base rounded-md flex items-center justify-center hover:bg-red-600 transition duration-300">
                  <img src="/assets/google.png" alt="Google" className="w-5 h-5 mr-3" />
                  Sign in with Google
                </button>
                <button className="w-full p-3 bg-blue-600 text-white text-base rounded-md flex items-center justify-center hover:bg-blue-700 transition duration-300">
                  <img src="/assets/f2.png" alt="Facebook" className="w-5 h-5 mr-3" />
                  Sign in with Facebook
                </button>
                <button className="w-full p-3 bg-black text-white text-base rounded-md flex items-center justify-center hover:bg-gray-800 transition duration-300">
                  <img src="/assets/apple.png" alt="Apple" className="w-5 h-5 mr-3" />
                  Sign in with Apple
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <a href="#" className="text-blue-500 hover:underline">
                I already have an account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
