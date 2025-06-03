import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiRotateCw, FiArrowRight, FiUpload, FiCheck, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from "js-cookie";

const FrontCapture = ({
  onNext = () => {},
  onCapture = () => {},
  onRetake = () => {},
  initialImage = null,
  currentStep = 2,
  totalSteps = 5
}) => {
  // State management
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState('position');
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [capturedImage, setCapturedImage] = useState(initialImage);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { user } = useParams();
  const navigate = useNavigate();

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check camera permission state
  const checkCameraPermission = async () => {
    try {
      // Check if the browser supports permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        return permission.state;
      }
      return 'unknown';
    } catch (err) {
      console.error('Permission check error:', err);
      return 'unknown';
    }
  };

  // Camera initialization
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setPermissionDenied(false);

        // Check for HTTPS in production
        if (!window.location.href.startsWith('https://') && 
            !window.location.href.startsWith('http://localhost')) {
          throw new Error('Camera requires HTTPS in production');
        }

        // Check media devices support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }

        // Check if we already know permission is denied
        const permissionState = await checkCameraPermission();
        if (permissionState === 'denied') {
          setPermissionDenied(true);
          throw new Error('Camera permission previously denied. Please enable it in your browser settings.');
        }

        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        // Get camera stream with timeout
        const getUserMediaWithTimeout = () => {
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              reject(new Error('Camera access timed out. Please try again.'));
            }, 10000); // 10 second timeout

            navigator.mediaDevices.getUserMedia(constraints)
              .then(stream => {
                clearTimeout(timer);
                resolve(stream);
              })
              .catch(err => {
                clearTimeout(timer);
                reject(err);
              });
          });
        };

        stream = await getUserMediaWithTimeout()
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              setPermissionDenied(true);
              throw new Error('Camera permission denied. Please allow camera access to continue.');
            } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
              throw new Error('No suitable camera found. Please check your device.');
            } else if (err.name === 'NotReadableError') {
              throw new Error('Camera is already in use by another application.');
            }
            throw err;
          });

        // Wait for video element to be ready
        if (!videoRef.current) {
          await new Promise((resolve, reject) => {
            const checkVideoRef = () => {
              if (videoRef.current) {
                resolve();
              } else {
                setTimeout(checkVideoRef, 100);
              }
            };
            checkVideoRef();
          });
        }

        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready to play
        await new Promise((resolve, reject) => {
          const onSuccess = () => {
            videoRef.current.removeEventListener('loadedmetadata', onSuccess);
            videoRef.current.removeEventListener('error', onError);
            resolve();
          };

          const onError = (err) => {
            videoRef.current.removeEventListener('loadedmetadata', onSuccess);
            videoRef.current.removeEventListener('error', onError);
            reject(new Error('Failed to load video stream'));
          };

          videoRef.current.addEventListener('loadedmetadata', onSuccess);
          videoRef.current.addEventListener('error', onError);

          // Fallback in case events don't fire
          setTimeout(() => {
            if (videoRef.current.readyState >= 3) {
              onSuccess();
            }
          }, 2000);
        });

        await videoRef.current.play().catch(err => {
          throw new Error('Failed to play video stream');
        });

        setIsCameraActive(true);
        startDetectionSimulation();

      } catch (err) {
        console.error('Camera initialization error:', err);
        setError(err.message || 'Failed to access camera');
        setShowUploadOption(true);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  // Handle permission recovery
  const handleRetryPermission = async () => {
    setError(null);
    setPermissionDenied(false);
    setShowUploadOption(false);
    setCapturedImage(null);
  };

  // Rest of your component code remains the same...
  // [Keep all your existing functions like startDetectionSimulation, capturePhoto, etc.]

  // Enhanced error display
  const renderError = () => {
    if (!error) return null;

    let actionButton = null;
    if (permissionDenied) {
      actionButton = (
        <button
          onClick={handleRetryPermission}
          className="mt-2 bg-blue-600 text-white py-1 px-3 rounded text-sm"
        >
          Retry Camera Access
        </button>
      );
    } else if (error.includes('No suitable camera') || error.includes('Camera is already in use')) {
      actionButton = (
        <button
          onClick={() => setShowUploadOption(true)}
          className="mt-2 bg-blue-600 text-white py-1 px-3 rounded text-sm"
        >
          Upload Photo Instead
        </button>
      );
    }

    return (
      <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <p className="font-medium text-red-700">Error</p>
        <p className="text-red-600">{error}</p>
        {actionButton}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Front of ID Card</h2>
          <p className="text-gray-600">Ensure all details are clearly visible</p>
          
          {/* Progress steps */}
          <div className="mt-6 flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step < currentStep ? 'bg-green-100 text-green-600' :
                  step === currentStep ? 'bg-blue-600 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step < currentStep ? <FiCheck size={14} /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-6 h-1 ${
                    step < currentStep ? 'bg-green-100' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Camera preview area */}
        <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 border-2 border-gray-200">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured ID" 
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={detectionCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </>
          )}
        </div>

        {/* Verification progress */}
        {verificationProgress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {verificationStatus}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {verificationProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${verificationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Status message */}
        <div className="mb-4 text-center">
          <p className={`text-sm font-medium ${
            detectionStatus === 'ready' ? 'text-green-600' :
            detectionStatus === 'aligned' ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {capturedImage ? "Capture successful" : getStatusMessage()}
          </p>
        </div>

        {/* Enhanced error message */}
        {renderError()}

        {/* Action buttons */}
        <div className="flex space-x-3">
          {showUploadOption && !capturedImage ? (
            <label className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-full flex items-center justify-center cursor-pointer">
              <FiUpload className="mr-2" />
              Upload Photo
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
          ) : capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-full flex items-center justify-center"
              >
                <FiRotateCw className="mr-2" />
                Retake
              </button>
              <button
                onClick={() => navigate('/register/identity-verification/verification/back-document')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-full flex items-center justify-center"
              >
                Next
                <FiArrowRight className="ml-2" />
              </button>
            </>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || detectionStatus !== 'ready'}
              className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center ${
                (!isCameraActive || detectionStatus !== 'ready') ? 
                'bg-gray-300 text-gray-500' : 
                'bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCamera className="mr-2" />
                  Capture
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FrontCapture;
