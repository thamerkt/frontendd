import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiMail, FiClock, FiArrowRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const VerificationComplete = () => {
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('pending');
  const navigate = useNavigate();
  const [progress, setProgress] = useState(() => {
    const savedProgress = JSON.parse(localStorage.getItem('registrationProgress') || '{}');
    return savedProgress;
  });
  const steps = [
    { id: 1, name: 'Select', completed: true },
    { id: 2, name: 'Front', completed: true },
    { id: 3, name: 'Back', completed: true },
    { id: 4, name: 'Selfie', completed: true },
    { id: 5, name: 'Complete', completed: true, current: true }
  ];

  useEffect(() => {
    console.log(progress)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const uploadFiles = async () => {
      try {
        setUploadStatus('uploading');
        
        // Validate localStorage data exists
        const storedImageJson = localStorage.getItem('capturedImage');
        const selfieStoredJson = localStorage.getItem('selfie');
        
        if (!storedImageJson || !selfieStoredJson) {
          throw new Error('Missing document data in storage');
        }

        // Parse with error handling
        const storedImage = safeJsonParse(storedImageJson);
        const selfieStored = safeJsonParse(selfieStoredJson);
        
        if (!storedImage?.imageData || !selfieStored?.imageData) {
          throw new Error('Invalid image data format');
        }

        // Validate file info exists
        if (!storedImage.fileInfo || !selfieStored.fileInfo) {
          throw new Error('Missing file metadata');
        }

        const formData = new FormData();
        
        // Process files with timeout
        const fileProcessing = Promise.all([
          processImage(storedImage),
          processImage(selfieStored)
        ]);

        const [docFile, selfieFile] = await timeout(fileProcessing, 10000); // 10s timeout

        formData.append('image', docFile);
        formData.append('selfie', selfieFile);

        // Upload with timeout
        const uploadResponse = await timeout(
          axios.post('http://192.168.134.136:8000/api/publish-event/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            validateStatus: () => true // Handle all status codes
          }),
          15000 // 15s timeout
        );

        if (uploadResponse.status !== 200) {
          throw new Error(uploadResponse.data?.message || 'Upload failed');
        }

        setUploadStatus('success');
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.message || 'Failed to process documents');
        setUploadStatus('failed');
      }
    };

    uploadFiles();

    return () => clearInterval(timer);
  }, [navigate]);

  // Helper functions
  const safeJsonParse = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      throw new Error('Invalid stored data format');
    }
  };

  const processImage = async (imageData) => {
    try {
      const response = await fetch(imageData.imageData);
      if (!response.ok) throw new Error('Failed to process image');
      const blob = await response.blob();
      return new File(
        [blob],
        imageData.fileInfo.name,
        { type: imageData.fileInfo.type }
      );
    } catch (e) {
      throw new Error(`Image processing failed: ${e.message}`);
    }
  };

  const timeout = (promise, ms) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Operation timed out'));
      }, ms);

      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (err) => {
          clearTimeout(timer);
          reject(err);
        }
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
          <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium">Document Processing Error</h3>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">
              Your account is active, but please retry document upload later.
            </p>
          </div>
        </div>
      )}

      {/* Upload Status Indicator */}
      {uploadStatus === 'uploading' && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center">
          <div className="animate-spin mr-2">⏳</div>
          Finalizing document upload...
        </div>
      )}

      {/* Progress Stepper */}
      <div className="mb-8">
        {/* ... (keep existing stepper code) ... */}
      </div>

      {/* Success Illustration */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className={`absolute inset-0 rounded-full flex items-center justify-center ${
          uploadStatus === 'failed' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
        }`}>
          {uploadStatus === 'failed' ? (
            <FiAlertCircle className="text-5xl" />
          ) : (
            <FiCheckCircle className="text-5xl" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
          <FiMail className="text-lg" />
        </div>
      </div>

      {/* Success/Error Message */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {uploadStatus === 'failed' 
            ? 'Documents submitted with issues' 
            : 'Your Documents are submitted'}
        </h2>
        <p className="text-gray-600">
          {uploadStatus === 'failed'
            ? 'Your account is active, but document processing encountered issues.'
            : 'Your identity verification was successful. You now have full access to your account.'}
        </p>
      </div>

      {/* Next Steps */}
      <div className={`p-4 rounded-lg mb-6 ${
        uploadStatus === 'failed' ? 'bg-orange-50' : 'bg-teal-50'
      }`}>
        {/* ... (keep existing next steps content) ... */}
      </div>

      {/* Countdown */}
      <div className="text-center text-sm text-gray-500 mb-4">
        <p>Redirecting to dashboard in {countdown} seconds...</p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
      >
        Go to Dashboard Now
        <FiArrowRight className="ml-2" />
      </button>
    </motion.div>
  );
};

export default VerificationComplete;