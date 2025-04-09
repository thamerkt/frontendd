import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authStore from "../redux/authStore";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const EmailVerification = () => {
  const [code, setCode] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const toastIdRef = useRef(null);
  const [countdown, setCountdown] = useState(30);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showToast = (message, type = "success") => {
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    toastIdRef.current = toast[type](message, {
      position: "top-center",
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const handleInputChange = (value, index) => {
    if (!isNaN(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== "" && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    const pasteDigits = pasteData.split('').slice(0, 6);
    
    if (pasteDigits.every(d => !isNaN(d))) {
      const newCode = [...code];
      pasteDigits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && code[index] === "") {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const verificationCode = code.join("");
      const response = await authStore.verify(verificationCode);
      showToast(response?.message || "Verification successful!");
      setTimeout(() => navigate("/register/profil"), 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Verification failed";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    showToast("New verification code sent!", "info");
    setCountdown(30);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-12 rounded-xl shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-8">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Verify your email address</h1>
          <p className="text-gray-600 text-lg">
            We've sent a 6-digit confirmation code to <span className="font-medium text-gray-800">{Cookies.get('email')}</span>
          </p>
        </div>
        
        {/* Code Input - Desktop Optimized */}
        <div className="mb-10">
          <div 
            className="flex justify-center gap-4 mb-8"
            onPaste={handlePaste}
          >
            {code.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  className="w-16 h-20 text-4xl text-center font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all hover:border-gray-300"
                  autoFocus={index === 0}
                  disabled={loading}
                />
                {index < 5 && (
                  <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={handleVerify}
            disabled={loading || code.some(digit => digit === "")}
            className={`w-full py-5 px-6 rounded-xl text-xl font-medium transition-all duration-300 ${
              loading || code.some(digit => digit === "") 
                ? "bg-teal-400 cursor-not-allowed" 
                : "bg-teal-600 hover:bg-teal-700 hover:shadow-md"
            } text-white shadow-sm`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : "Verify and Continue"}
          </button>
        </div>
        
        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-600 text-lg">
            {countdown > 0 ? (
              `Didn't receive a code? Resend available in ${countdown}s`
            ) : (
              <>
                Didn't receive a code?{" "}
                <button
                  onClick={handleResend}
                  className="text-teal-600 font-medium hover:text-teal-700 focus:outline-none transition-colors"
                  disabled={countdown > 0}
                >
                  Click to resend
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar
        toastClassName="rounded-lg shadow-md text-base font-medium"
        bodyClassName="p-4"
      />
    </div>
  );
};

export default EmailVerification;