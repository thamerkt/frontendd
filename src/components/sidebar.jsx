import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();  // Get current location
  const navigate = useNavigate();  // To navigate programmatically

  // Check if pathname is '/login'
  const isLoginPage = location.pathname === '/login';

  return (
    <div
      className="w-full sm:w-1/4 bg-gray-50 p-8 flex flex-col justify-between"
      style={{
        fontFamily: "DM Sans, sans-serif",
        color: "#8A898B",
      }}
    >
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Everything Rentals</h1>
        

        <div>
          

          {!isLoginPage && (
            <>
            <p className="text-gray-600 mb-8">New User Registration</p>
        <div className="flex space-x-3 mb-8">
          <p className="font-medium text-base">Client</p>
          <p className="font-medium text-base">Rentals</p>
        </div>
            <a className="flex items-center mb-6">
            <img
              src="/assets/info.png"
              alt="Details"
              className="w-6 h-6 mr-3"
            />
            <div>
              <span className="block">Your Details</span>
              <p className="text-sm">Provide your essential details</p>
            </div>
          </a>
            
              <a  href='' className="flex items-center mb-6">
                <img
                  src="/assets/otp.png"
                  alt="Verify"
                  className="w-6 h-6 mr-3"
                />
                <div>
                  <span className="block">Verify Email</span>
                  <p className="text-sm">Enter your verification code</p>
                </div>
              </a>

              <a  href='' className="flex items-center mb-6">
                <img
                  src="/assets/businessdetails.png"
                  alt="Business"
                  className="w-6 h-6 mr-3"
                />
                <div>
                  <span className="block">Business Details</span>
                  <p className="text-sm">Provide details for your business</p>
                </div>
              </a>

              <a href='' className="flex items-center mb-6">
                <img
                  src="/assets/identity.png"
                  alt="Identity Verify"
                  className="w-6 h-6 mr-3"
                />
                <div>
                  <span className="block">Identity Verify</span>
                  <p className="text-sm">Verify your identity</p>
                </div>
              </a>

              <a href='' className="flex items-center mb-6">
                <img
                  src="/assets/out.png"
                  alt="Welcome"
                  className="w-6 h-6 mr-3"
                />
                <div>
                  <span className="block">Welcome</span>
                  <p className="text-sm">Go to the home page</p>
                </div>
              </a>
            </>
          )}
        </div>
      </div>

      <div className="flex space-x-6 mt-8">
        <button className="text-blue-500 hover:underline">Back to home</button>
        <button className="text-blue-500 hover:underline" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
