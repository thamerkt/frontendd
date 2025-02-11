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
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for confirm password visibility

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

    setLoading(true); // Set loading state

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
      setLoading(false); // Set loading state back to false
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl flex flex-col sm:flex-row justify-center items-center">
        {/* Sidebar */}
        

        {/* Form Section */}
        <div className="w-full sm:w-2/3 p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Create an account
          </h2>
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
              <div className="relative w-full sm:w-1/2">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <img
                  src={passwordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
                  alt="Toggle Visibility"
                  className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              </div>
              <div className="relative w-full sm:w-1/2">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
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

              <button className="w-full p-3 bg-white border text-black text-base rounded-md flex items-center justify-center hover:bg-gray-100 transition duration-300">
                <img
                  src="/assets/search.png"
                  alt="Google"
                  className="w-5 h-5 mr-3"
                />
                Sign in with Google
              </button>

              <button className="w-full p-3 bg-blue-600 text-white text-base rounded-md flex items-center justify-center hover:bg-blue-700 transition duration-300">
                <img
                  src="/assets/f2.png"
                  alt="Facebook"
                  className="w-5 h-5 mr-3"
                />
                Sign in with Facebook
              </button>

              <button className="w-full p-3 bg-white border text-black text-base rounded-md flex items-center justify-center hover:bg-gray-100 transition duration-300">
                <img
                  src="/assets/apple.png"
                  alt="Apple"
                  className="w-5 h-5 mr-3"
                />
                Sign in with Apple
              </button>
            </div>
          </form>

          <div className="mt-6 text-center ml-5">
            <a href="#" className="text-blue-500 hover:underline">
              I already have an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


