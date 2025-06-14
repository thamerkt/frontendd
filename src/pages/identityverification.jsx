import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useProgressGuard from "../components/utils/ProcessGuard";

const IdentityVerification = () => {
  const [qrCode, setQrCode] = useState(""); // controlled from start
  const [verificationLink, setVerificationLink] = useState(""); // optional for linking
  const user = Cookies.get("keycloak_user_id");

  // Uncomment when ready to use guard
  // useProgressGuard(1, 3);

  useEffect(() => {
    if (!user) return;

    axios
      .post("https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/generate-qr/", {
        user: user,
      })
      .then((response) => {
        setQrCode(response.data.qr_code || ""); // ensure never undefined
        setVerificationLink(response.data.link || "");
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
