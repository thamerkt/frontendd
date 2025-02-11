import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isRegisterPage = ["/register/", "/register/details","/register/email-verification","/register/identity-verification","/register/business-details"].includes(location.pathname)

  const linkClasses = (isActive) =>
    `flex items-center mb-6 p-2 ${
      isActive ? "text-gray-800" : "text-gray-400"
    }`;

  return (
    <>
      {isRegisterPage && (
        <div className="w-full sm:w-1/4 bg-gray-50 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
              Everything Rentals
            </h1>
            <p className="text-gray-600 mb-8">New User Registration</p>
            <div className="flex space-x-3 mb-8">
              <p className="font-medium text-base">Client</p>
              <p className="font-medium text-base">Rentals</p>
            </div>

            {/* Sidebar Links */}
            <NavLink to="/register/details" className={({ isActive }) => linkClasses(isActive)}>
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? "/assets/resume.png" : "/assets/resume (1).png"}
                    alt="Details"
                    className="w-8 h-8 mr-3"
                  />
                  <span>
                    Your Details <br />Provide Your Details
                  </span>
                </>
              )}
            </NavLink>

            <NavLink to="/register/email-verification" className={({ isActive }) => linkClasses(isActive)}>
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? "/assets/otp4.png" : "/assets/otp.png"}
                    alt="Verify"
                    className="w-8 h-8 mr-3"
                  />
                  <span>
                    Verify Email <br />Provide Your Details
                  </span>
                </>
              )}
            </NavLink>

            <NavLink to="/register/business-details" className={({ isActive }) => linkClasses(isActive)}>
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? "/assets/documents.png"
                        : "/assets/businessdetails.png"
                    }
                    alt="Business"
                    className="w-8 h-8 mr-3"
                  />
                  <span>
                    Business Details <br />Provide Your Details
                  </span>
                </>
              )}
            </NavLink>

            <NavLink to="/register/identity-verification" className={({ isActive }) => linkClasses(isActive)}>
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? "/assets/identitychecked.png" : "/assets/identity.png"}
                    alt="Identity Verify"
                    className="w-8 h-8 mr-3"
                  />
                  <span>
                    Identity Verify <br />Provide Your Details
                  </span>
                </>
              )}
            </NavLink>

            <NavLink to="/" className={({ isActive }) => linkClasses(isActive)}>
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? "/assets/enter.png" : "/assets/out.png"}
                    alt="Welcome"
                    className="w-8 h-8 mr-3"
                  />
                  <span>Welcome</span>
                </>
              )}
            </NavLink>
          </div>

          {/* Buttons */}
          <div className="flex space-x-6 mt-8">
            <button className="text-blue-500 hover:underline" onClick={() => navigate("/")}>
              Back to Home
            </button>
            <button className="text-blue-500 hover:underline" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
