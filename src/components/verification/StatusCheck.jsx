import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiMail, FiClock, FiArrowRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Cookie } from 'lucide-react';

const VerificationComplete = () => {
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('pending');
  const navigate = useNavigate();
  const [ip, setIP] = useState(Cookies.get('local_ip'));
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
    // Safely get hostname
    let hostname = '';
    try {
      if (typeof window !== 'undefined' && window.location) {
        hostname = window.location.hostname;
      } else {
        throw new Error('Window location not available');
      }
    } catch (err) {
      console.error('Error getting hostname:', err);
      setIP('localhost');
      hostname = 'localhost';
    }

    // Optional: Regex to make sure it's an IPv4 address
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      setIP(hostname);
    } else {
      setIP('localhost'); // Default to localhost if not IP
    }

    console.log(progress);

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

        if (!storedImage.fileInfo || !selfieStored.fileInfo) {
          throw new Error('Missing file metadata');
        }

        const formData = new FormData();

        // Process files - removed timeout or increased timeout
        const [docFile, selfieFile] = await Promise.all([
          processImage(storedImage),
          processImage(selfieStored)
        ]);
        formData.append('image', docFile);
        formData.append('selfie', selfieFile);
        formData.append('keycloak_user', Cookies.get('user'));

        const apiUrl = `https://4499-196-224-227-105.ngrok-free.app/ocr/publish-event/`;

        // Upload with longer timeout (10 minutes = 600,000ms)
        const uploadResponse = await axios.post(apiUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 600000, // 10 minutes in milliseconds
          maxBodyLength: Infinity, // Allow large file uploads
          maxContentLength: Infinity // Allow large response data
        });

        if (uploadResponse.status !== 200) {
          throw new Error(uploadResponse.data?.message || 'Upload failed');
        }

        setUploadStatus('success');
        
        // Start countdown after successful upload
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

        return () => clearInterval(timer);
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.message || 'Failed to process documents');
        setUploadStatus('failed');
      }
    };

    uploadFiles();
  }, [navigate, ip]);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl"
      >
        <div className="p-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-100">
              <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3 text-xl" />
              <div>
                <h3 className="font-medium text-lg">Document Processing Error</h3>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-xs mt-2 text-red-600">
                  Your account is active, but please retry document upload later.
                </p>
              </div>
            </div>
          )}

          {/* Upload Status Indicator */}
          {uploadStatus === 'uploading' && (
            <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center border border-blue-100">
              <div className="animate-spin mr-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span>Finalizing document upload...</span>
            </div>
          )}

          {/* Progress Stepper */}
          <div className="mb-8 overflow-x-auto">
            <nav className="flex items-center justify-center">
              <ol className="flex items-center space-x-2 sm:space-x-4">
                {steps.map((step) => (
                  <li key={step.name} className="flex items-center">
                    {step.completed ? (
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step.current ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-800'}`}>
                        {step.current ? (
                          <FiClock className="w-4 h-4" />
                        ) : (
                          <FiCheck className="w-4 h-4" />
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800">
                        {step.id}
                      </span>
                    )}
                    {step.id !== steps.length && (
                      <span className="ml-2 sm:ml-4 h-px w-8 sm:w-12 bg-gray-300"></span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Success Illustration */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className={`absolute inset-0 rounded-full flex items-center justify-center ${uploadStatus === 'failed' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
              {uploadStatus === 'failed' ? (
                <FiAlertCircle className="text-5xl" />
              ) : (
                <FiCheckCircle className="text-5xl" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
              <FiMail className="text-lg" />
            </div>
          </div>

          {/* Success/Error Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {uploadStatus === 'failed'
                ? 'Documents submitted with issues'
                : uploadStatus === 'success'
                  ? 'Your Documents are submitted'
                  : 'Processing your documents'}
            </h2>
            <p className="text-gray-600">
              {uploadStatus === 'failed'
                ? 'Your account isn t active, because document processing encountered issues.'
                : uploadStatus === 'success'
                  ? 'Your identity verification was successful. You now have full access to your account.'
                  : 'Please wait while we process your documents...'}
            </p>
          </div>

          {/* Next Steps */}
          {uploadStatus !== 'pending' && (
            <div className={`p-5 rounded-lg mb-8 ${uploadStatus === 'failed' ? 'bg-orange-50 border border-orange-100' : 'bg-teal-50 border border-teal-100'}`}>
              <h3 className="font-medium text-lg mb-3">
                {uploadStatus === 'failed' ? 'What to do next:' : 'Next steps:'}
              </h3>
              <ul className="space-y-2 text-sm">
                {uploadStatus === 'failed' ? (
                  <>
                    <li className="flex items-start">
                      <span className="inline-block bg-orange-100 text-orange-600 rounded-full p-1 mr-2">
                        <FiCheck className="w-3 h-3" />
                      </span>
                      <span>You can continue using your account</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-orange-100 text-orange-600 rounded-full p-1 mr-2">
                        <FiCheck className="w-3 h-3" />
                      </span>
                      <span>Try uploading your documents again later</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-orange-100 text-orange-600 rounded-full p-1 mr-2">
                        <FiCheck className="w-3 h-3" />
                      </span>
                      <span>Contact support if the problem persists</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <span className="inline-block bg-teal-100 text-teal-600 rounded-full p-1 mr-2">
                        <FiCheck className="w-3 h-3" />
                      </span>
                      <span>Access all account features immediately</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-teal-100 text-teal-600 rounded-full p-1 mr-2">
                        <FiCheck className="w-3 h-3" />
                      </span>
                      <span>Check your email for confirmation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-teal-100 text-teal-600 rounded-full p-1 mr-2">
                        <FiCheck className="w-3 h-3" />
                      </span>
                      <span>Set up additional security options</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Countdown - Only show if upload was successful */}
          {uploadStatus === 'success' && (
            <div className="text-center text-sm text-gray-500 mb-6">
              <p>Redirecting to dashboard in {countdown} seconds...</p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => navigate('/login')}
            className={`w-full py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${uploadStatus === 'uploading'
              ? 'bg-gray-300 cursor-not-allowed'
              : uploadStatus === 'failed'
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-teal-600 hover:bg-teal-700'
              } text-white font-medium`}
            disabled={uploadStatus === 'uploading'}
          >
            {uploadStatus === 'uploading' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Go to Dashboard Now
                <FiArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationComplete;