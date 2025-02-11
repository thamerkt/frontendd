import React from "react";

const IdentityVerification = () => {
  // Replace this URL with a dynamically generated one if needed
  const qrCodeUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://your-verification-link.com";

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar (peut être ajusté selon le design) */}
      

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center w-1/2">
        <div className="text-center p-8 shadow-lg rounded-lg bg-white">
          <h2 className="text-4xl font-bold">Identity Verification</h2>
          <p className="text-gray-600 mt-2 text-lg">
            Complete Your Identity Verification to Proceed Securely
          </p>

          {/* QR Code as an Image */}
          <div className="flex space-x-4 justify-center items-center">
          
          <div className="mt-6 flex justify-center">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-40 h-40 object-contain"
            />
          </div>
          <div className="mt-6 flex justify-center">
          <p className="text-gray-600 mt-2 text-lg">
            Or continue in PC <br/>using this <a className="text-teal-500 underline" href="/link">link</a>
          </p>
            
          </div>
          </div>

          {/* Navigation Button */}
          <div className="mt-6 flex justify-end items-end">
            <button className="bg-teal-500 text-white px-6 py-2 rounded-lg flex items-end">
              <span className="mr-2">Next</span>
              <span>➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerification;
