import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authStore from "../redux/authStore";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"

const EmailVerification = () => {
  const [code, setCode] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  
  const [progress, setProgress] = useState({
    phase: "emailverification",
    step: 2,
    totalSteps: 3
  });
  const navigate = useNavigate();

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('registrationProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const handleInputChange = (value, index) => {
    if (!isNaN(value)) {
      let newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(`input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && index > 0 && code[index] === "") {
      const prevInput = document.getElementById(`input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const mycode = code.join("");

      const response = await authStore.verify(mycode);
      
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success("Verification successful!");
      }

      // Update progress
      const newProgress = {
        phase: "Personal",
        step: 2,
        totalSteps: 3
      };
      setProgress(newProgress);
      localStorage.setItem('registrationProgress', JSON.stringify(newProgress));

      setTimeout(() => navigate("/register/profil"), 3000);
    } catch (error) {
      console.error("Failed to verify:", error);
      const errorMessage = error.response?.data?.message || error.message || "Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    toast.info("Verification code resent!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Main Container - Different styles for mobile vs PC */}
      <div className="bg-green-100 p-8 md:p-16 rounded-xl md:rounded-3xl shadow-lg md:shadow-2xl w-full max-w-md md:max-w-2xl">
        {/* Progress Bar - Same for both but with responsive text */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm md:text-base font-medium text-gray-700 capitalize">
              {progress.phase.replace(/([A-Z])/g, ' $1').trim()} ({progress.step}/{progress.totalSteps})
            </span>
            <span className="text-xs md:text-sm text-gray-500">
              Step {progress.step} of {progress.totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-teal-500 h-2.5 rounded-full" 
              style={{ width: `${(progress.step / progress.totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Please check your email</h2>
        <p className="text-base md:text-xl text-center text-gray-700 mb-6 md:mb-10">
          We have sent a code to <span className="font-medium">{Cookies.get('email')}</span>
        </p>
        
        {/* Code Inputs - Different spacing for mobile vs PC */}
        <div className="flex justify-center gap-3 md:gap-6 mb-8 md:mb-10">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`input-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 md:w-20 md:h-20 text-center text-xl md:text-2xl font-bold border rounded-lg md:rounded-xl focus:outline-none focus:ring focus:ring-green-300"
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        {/* Verify Button - Same style but with responsive padding */}
        <button
          onClick={handleVerify}
          className="w-full bg-teal-500 text-white py-3 md:py-4 text-base md:text-xl rounded-lg md:rounded-xl hover:bg-teal-600 focus:outline-none focus:ring focus:ring-teal-400 mb-6 md:mb-8 transition-colors"
          disabled={loading || code.some(digit => digit === "")}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : "Verify"}
        </button>
        
        {/* Resend Link - Responsive text size */}
        <p className="text-base md:text-xl text-center text-gray-700">
          Didn't receive an email?{" "}
          <button
            onClick={handleResend}
            className="text-teal-600 hover:underline hover:text-teal-800 focus:outline-none"
          >
            Resend
          </button>
        </p>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default EmailVerification;