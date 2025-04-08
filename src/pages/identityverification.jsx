import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';

const IdentityVerification = () => {
  const [qrCode, setQrCode] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const user = Cookies.get('keycloak_user_id');

  useEffect(() => {
    if (!user) return;

    axios
      .post("http://127.0.0.1:8000/api/generate-qr/",  {
        user: user,
      } )
      .then((response) => {
        setQrCode(response.data.qr_code);
        setVerificationLink(response.data.link);
      })
      .catch((error) => console.error("Error fetching QR Code:", error));
  }, [user]);

  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-1 items-center justify-center w-1/2">
        <div className="text-center p-8 shadow-lg rounded-lg bg-white">
          <h2 className="text-4xl font-bold">Identity Verification</h2>
          <p className="text-gray-600 mt-2 text-lg">
            Complete Your Identity Verification to Proceed Securely
          </p>
          <span>Scan the QR with your phone</span>

          <div className="flex space-x-4 justify-center items-center">
            <div className="mt-6 flex justify-center">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <p>Loading QR Code...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerification;
