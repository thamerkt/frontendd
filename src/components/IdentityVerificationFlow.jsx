import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

const VerificationFlow = () => {
  const [step, setStep] = useState(1);
  const [verification, setVerification] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState({
    type: 'id_card',
    number: '',
    front: null,
    back: null,
    selfie: null
  });
  const url='https://4499-196-224-227-105.ngrok-free.app'

  const startVerification = async () => {
    try {
      const response = await axios.post(`${url}/api/verification/start/`);
      setVerification(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start verification');
    }
  };

  const handleDocumentUpload = async () => {
    const formData = new FormData();
    formData.append('document_type', documents.type);
    formData.append('document_number', documents.number);
    formData.append('document_front', documents.front);
    if (documents.back) formData.append('document_back', documents.back);
    formData.append('selfie', documents.selfie);

    try {
      const response = await axios.post(
        `${url}/api/verification/${verification.verification_id}/upload/`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setStatus(response.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Document upload failed');
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const response = await axios.get(
        `${url}/api/verification/${verification.verification_id}/status/`
      );
      setStatus(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Status check failed');
    }
  };

  return (
    <div className="verification-container">
      {step === 1 && (
        <div className="start-step">
          <h2>Identity Verification</h2>
          <button onClick={startVerification}>Begin Verification</button>
        </div>
      )}

      {step === 2 && verification && (
        <div className="document-upload-step">
          <h2>Document Upload</h2>
          
          <div className="qr-code-container">
            <QRCode value={`https://yourdomain.com/verify/${verification.verification_id}/${verification.secret_code}/`} />
            <p>Expires at: {new Date(verification.expires_at).toLocaleString()}</p>
          </div>

          <select value={documents.type} onChange={e => setDocuments({...documents, type: e.target.value})}>
            <option value="id_card">ID Card</option>
            <option value="passport">Passport</option>
            <option value="driving_license">Driver's License</option>
          </select>

          <input 
            type="text" 
            placeholder="Document Number" 
            value={documents.number}
            onChange={e => setDocuments({...documents, number: e.target.value})}
          />

          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setDocuments({...documents, front: e.target.files[0]})}
          />
          <label>Front of Document</label>

          {documents.type !== 'passport' && (
            <>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setDocuments({...documents, back: e.target.files[0]})}
              />
              <label>Back of Document</label>
            </>
          )}

          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setDocuments({...documents, selfie: e.target.files[0]})}
          />
          <label>Selfie</label>

          <button onClick={handleDocumentUpload}>Submit Documents</button>
        </div>
      )}

      {step === 3 && status && (
        <div className="status-step">
          <h2>Verification Status: {status.status}</h2>
          <p>Verification ID: {verification.verification_id}</p>
          <button onClick={checkVerificationStatus}>Refresh Status</button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default VerificationFlow;