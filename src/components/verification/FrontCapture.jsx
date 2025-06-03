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
  const { user } = useParams();
  const navigate = useNavigate();

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const fileInputRef = useRef(null);

  // Camera initialization
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check for HTTPS in production
        if (!window.location.href.startsWith('https://') && 
            !window.location.href.startsWith('http://localhost')) {
          throw new Error('Camera requires HTTPS in production');
        }

        // Check media devices support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported');
        }

        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        // Get camera stream
        stream = await navigator.mediaDevices.getUserMedia(constraints)
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              throw new Error('Camera permission denied');
            }
            throw err;
          });

        if (!videoRef.current) {
          throw new Error('Video element not ready');
        }

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsCameraActive(true);
              startDetectionSimulation();
            })
            .catch(err => {
              throw new Error('Failed to play video stream');
            });
        };

      } catch (err) {
        console.error('Camera error:', err);
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

  // Detection simulation
  const startDetectionSimulation = () => {
    let lastUpdate = 0;
    let detectionProgress = 0;

    const detect = (timestamp) => {
      if (!videoRef.current || !detectionCanvasRef.current) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      const video = videoRef.current;
      const canvas = detectionCanvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw detection zone
      const zoneWidth = video.videoWidth * 0.85;
      const zoneHeight = video.videoHeight * 0.7;
      const zoneX = video.videoWidth * 0.075;
      const zoneY = video.videoHeight * 0.15;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated border
      const pulse = 0.7 + 0.3 * Math.sin(timestamp / 300);
      ctx.strokeStyle = 
        detectionStatus === 'ready' ? `rgba(74, 222, 128, ${pulse})` :
        detectionStatus === 'aligned' ? `rgba(250, 204, 21, ${pulse})` :
        `rgba(239, 68, 68, ${pulse})`;
      
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
      ctx.setLineDash([]);

      // Update detection status
      if (timestamp - lastUpdate > 1000) {
        detectionProgress = (detectionProgress + 0.2) % 1;
        lastUpdate = timestamp;

        setDetectionStatus(
          detectionProgress < 0.4 ? 'position' :
          detectionProgress < 0.8 ? 'aligned' :
          'ready'
        );
      }

      animationRef.current = requestAnimationFrame(detect);
    };

    animationRef.current = requestAnimationFrame(detect);
  };

  // Update verification progress
  const updateVerificationProgress = (progress, status) => {
    setVerificationProgress(progress);
    setVerificationStatus(status);
  };

  // Capture photo handler
  const capturePhoto = async () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) {
      setError("Camera not ready");
      return;
    }

    try {
      setIsSubmitting(true);
      updateVerificationProgress(10, "Processing image...");

      // Capture image from video
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg');
      const imageId = Date.now();

      // Convert to file
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], `id_front_${imageId}.jpg`, { type: 'image/jpeg' });

      // Save to localStorage
      localStorage.setItem('capturedImage', JSON.stringify({
        id: imageId,
        imageData,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        timestamp: new Date().toISOString()
      }));

      // Upload to API
      updateVerificationProgress(30, "Uploading image...");
      const formData = new FormData();
      formData.append('image', file);
      formData.append('document_type', 'id_front');
      formData.append('user_id', user || 'unknown');

      const response = await axios.post(
        'https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/upload-image/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.min(90, 30 + Math.round((progressEvent.loaded * 60) / progressEvent.total));
            updateVerificationProgress(percent, "Uploading image...");
          }
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Verification failed');
      }

      // Success
      updateVerificationProgress(100, "Verification complete!");
      setCapturedImage(imageData);
      onCapture(imageData);

    } catch (err) {
      console.error('Capture error:', err);
      setError(err.message || 'Failed to process image');
      updateVerificationProgress(0, "Error occurred");
      localStorage.removeItem('capturedImage');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setVerificationProgress(0);
        setVerificationStatus(null);
      }, 2000);
    }
  };

  // Retake handler
  const handleRetake = () => {
    setCapturedImage(null);
    setVerificationProgress(0);
    setVerificationStatus(null);
    onRetake();
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      onCapture(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Status message
  const getStatusMessage = () => {
    switch (detectionStatus) {
      case 'position': return "Position your ID in the frame";
      case 'aligned': return "Align with the guidelines";
      case 'ready': return "Ready to capture";
      default: return "Preparing camera...";
    }
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

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="font-medium text-red-700">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

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
