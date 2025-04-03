import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QrScanner from 'qr-scanner';

const QRScanner = () => {
  const videoRef = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [verificationLevel, setVerificationLevel] = useState(null);

  useEffect(() => {
    if (videoRef.current && !scanner) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      setScanner(qrScanner);
      qrScanner.start();
    }

    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [videoRef, scanner]);

  const handleScan = async (url) => {
    try {
      // Extract verification_id and secret_code from URL
      const parts = url.split('/');
      const verification_id = parts[parts.length - 3];
      const secret_code = parts[parts.length - 2];
      
      const response = await axios.post(
        `/api/verify/${verification_id}/${secret_code}/`
      );
      
      setResult(response.data);
      setVerificationLevel(response.data.level);
      if (scanner) scanner.stop();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="qr-scanner">
      <h2>Scan Verification QR Code</h2>
      
      <div className="scanner-container">
        <video ref={videoRef} />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="verification-result">
          <h3>Identity Verified!</h3>
          <p>Account: {result.username}</p>
          <p>Verification Level: {verificationLevel}</p>
          <p>Verified at: {new Date(result.verified_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;