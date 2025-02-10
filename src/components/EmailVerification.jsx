import React, { useState } from "react";

const EmailVerification = () => {
  const [code, setCode] = useState(new Array(6).fill(""));

  const handleInputChange = (value, index) => {
    if (!isNaN(value)) {
      let newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Automatically focus the next input
      if (value !== "" && index < 5) {
        document.getElementById(`input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && index > 0 && code[index] === "") {
      document.getElementById(`input-${index - 1}`).focus();
    }
  };

  const handleVerify = () => {
    alert(`Code entered: ${code.join("")}`);
  };

  const handleResend = () => {
    alert("Resend email initiated!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-green-100 p-16 rounded-3xl shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-center mb-8">Please check your email</h2>
        <p className="text-xl text-center text-gray-700 mb-10">
          We have sent a code to <span className="font-medium">medkh@gmail.com</span>
        </p>
        <div className="flex justify-center gap-6 mb-10">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-20 h-20 text-center text-2xl font-bold border rounded-xl focus:outline-none focus:ring focus:ring-green-300"
            />
          ))}
        </div>
        <button
          onClick={handleVerify}
          className="w-full bg-teal-500 text-white py-4 text-xl rounded-xl hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-400 mb-8"
        >
          Verify
        </button>
        <p className="text-xl text-center text-gray-700">
          Didn’t receive an email?{' '}
          <button
            onClick={handleResend}
            className="text-teal-600 hover:underline hover:text-teal-800 focus:outline-none"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
