import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import {
  FiCamera,
  FiRotateCw,
  FiCheck,
  FiAlertCircle,
  FiUser
} from "react-icons/fi";
import { removeImage } from "../../redux/selfieSlice";

const SelfieCapture = ({ onComplete, onRetake, currentStep = 4, totalSteps = 5 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('registrationProgress')) || {};
    } catch {
      return {};
    }
  });

  const [image, setImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faceStatus, setFaceStatus] = useState('position');
  const [isUploading, setIsUploading] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [ip, setIP] = useState(Cookies.get('local_ip'));

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  // Configuration for face detection zone
  const DETECTION_CONFIG = {
    width: 60,  // % of video width
    height: 70, // % of video height
    x: 20,      // % offset from left
    y: 15       // % offset from top
  };

  // Status messages and colors
  const STATUS_CONFIG = {
    position: {
      message: "Move your face into the frame",
      hint: "Make sure your entire face is visible",
      color: "red"
    },
    centered: {
      message: "Center your face in the frame",
      color: "yellow"
    },
    ready: {
      message: "Perfect! Hold still",
      color: "green"
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const hostname = url.hostname;

    // Optional: Regex to make sure it's an IPv4 address
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      setIP(hostname);
    } else {
      setIP('localhost'); // Default to localhost if not IPv4
    }
    console.log('Current progress:', progress);

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play();
          setIsCameraActive(true);
          startFaceDetectionSimulation();
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera access denied. Please allow camera permissions.");
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startFaceDetectionSimulation = () => {
    let detectionState = 0;
    let lastUpdate = 0;

    const detectFace = (timestamp) => {
      if (!videoRef.current || !detectionCanvasRef.current) {
        animationRef.current = requestAnimationFrame(detectFace);
        return;
      }

      const video = videoRef.current;
      const canvas = detectionCanvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Calculate detection zone
      const { width, height, x, y } = DETECTION_CONFIG;
      const zoneWidth = (video.videoWidth * width) / 100;
      const zoneHeight = (video.videoHeight * height) / 100;
      const zoneX = (video.videoWidth * x) / 100;
      const zoneY = (video.videoHeight * y) / 100;

      // Clear and draw detection zone
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pulse = 0.5 + 0.5 * Math.sin(timestamp / 300);
      const statusColor = STATUS_CONFIG[faceStatus].color;

      ctx.strokeStyle = statusColor === 'red' ? `rgba(239, 68, 68, ${pulse})` :
        statusColor === 'yellow' ? `rgba(234, 179, 8, ${pulse})` :
          `rgba(16, 185, 129, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
      ctx.setLineDash([]);

      // Simulate face detection states
      if (timestamp - lastUpdate > 2000) {
        detectionState = (detectionState + 1) % 3;
        lastUpdate = timestamp;
        setFaceStatus(['position', 'centered', 'ready'][detectionState]);
      }

      animationRef.current = requestAnimationFrame(detectFace);
    };

    animationRef.current = requestAnimationFrame(detectFace);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (faceStatus !== "ready") {
      setError("Please align your face properly before capturing");
      return;
    }

    let newImageId = null;
    try {
      setIsUploading(true);
      newImageId = Date.now();
      setImageId(newImageId);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Capture image from video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the captured image to a base64 string (imageData)
      const imageData = canvas.toDataURL("image/jpeg", 0.8); // Base64 encoded image

      // Create a file object
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], `selfie_${newImageId}.jpg`, { type: "image/jpeg" });

      // Prepare the data to be stored in localStorage
      const selfieData = {
        imageData, // Base64 encoded image
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        timestamp: new Date().toISOString(),
        imageId: newImageId
      };

      // Save to localStorage
      localStorage.setItem('selfie', JSON.stringify(selfieData));

      // Upload to API
      const formData = new FormData();
      formData.append("selfie", file);

      const response = await axios.post(`https://f7d3-197-27-48-225.ngrok-free.app/ocr/selfie/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.status !== "success") {
        localStorage.removeItem('selfie');
        throw new Error(response.data?.message || "Selfie upload failed");
      }

      // Upload document metadata
      const documentFormData = new FormData();
      documentFormData.append("document_name", "Selfie");
      documentFormData.append('status', 'pending');
      documentFormData.append('document_url', file);
      documentFormData.append('uploaded_by', localStorage.getItem('user')); 
      documentFormData.append("document_type",'1');
      documentFormData.append('submission_date', new Date().toISOString());
      documentFormData.append('file', file);

      const documentResponse = await axios.post(
        `https://f7d3-197-27-48-225.ngrok-free.app/ocr/document/`,
        documentFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Success handling
      setImage(imageData);
      stopCamera();
      console.log("Upload successful:", documentResponse.data);

      return documentResponse.data;
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred while uploading");
      if (newImageId) {
        localStorage.removeItem('selfie');
        setImageId(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const retakePhoto = () => {
    if (imageId) {
      dispatch(removeImage(imageId));
    }
    setImage(null);
    setError(null);
    setImageId(null);
    if (onRetake) onRetake();
    startFaceDetectionSimulation();
  };

  const currentStatus = STATUS_CONFIG[faceStatus] || STATUS_CONFIG.position;

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      >
        {/* Header and Progress Stepper */}
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Face Verification</h2>
          <p className="text-sm sm:text-base text-gray-600">Align your face with the outline</p>

          <div className="mt-6 overflow-x-auto px-2">
            <div className="flex justify-center min-w-max">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step < currentStep ? 'bg-green-100 text-green-600' :
                      step === currentStep ? 'bg-blue-600 text-white' :
                        'bg-gray-100 text-gray-400'
                    }`}>
                    {step < currentStep ? <FiCheck size={14} /> : step}
                  </div>

                  {step < totalSteps && (
                    <div className={`h-1 w-6 ${step < currentStep ? 'bg-green-100' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Camera Preview */}
        <div className="relative aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-gray-200">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3" />
              <p className="text-gray-500">Starting camera...</p>
            </div>
          ) : image ? (
            <img src={image} alt="Captured selfie" className="w-full h-full object-cover" />
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
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </>
          )}
        </div>

        {/* Status Indicator */}
        <div className={`mb-6 p-4 rounded-lg ${currentStatus.color === 'red' ? 'bg-red-50 border-l-4 border-red-500' :
            currentStatus.color === 'yellow' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
              'bg-green-50 border-l-4 border-green-500'
          }`}>
          <div className="flex items-start">
            {faceStatus === 'ready' ? (
              <FiCheck className={`${currentStatus.color === 'red' ? 'text-red-500' :
                  currentStatus.color === 'yellow' ? 'text-yellow-500' :
                    'text-green-500'
                } mr-3 mt-0.5`} />
            ) : (
              <FiUser className={`${currentStatus.color === 'red' ? 'text-red-500' :
                  currentStatus.color === 'yellow' ? 'text-yellow-500' :
                    'text-green-500'
                } mr-3 mt-0.5`} />
            )}
            <div>
              <p className={`font-medium ${currentStatus.color === 'red' ? 'text-red-700' :
                  currentStatus.color === 'yellow' ? 'text-yellow-700' :
                    'text-green-700'
                }`}>
                {currentStatus.message}
              </p>
              {currentStatus.hint && (
                <p className="text-sm text-gray-600 mt-1">
                  {currentStatus.hint}
                </p>
              )}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {!image ? (
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || isLoading || faceStatus !== 'ready' || isUploading}
              className={`py-3 px-6 rounded-lg flex items-center justify-center transition-colors ${(!isCameraActive || isLoading || faceStatus !== 'ready' || isUploading)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              <FiCamera className="mr-2" />
              {isUploading ? 'Uploading...' : 'Capture Photo'}
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FiRotateCw className="mr-2" />
                Retake Photo
              </button>
              <button
                onClick={() => {
                  onComplete?.(image);
                  const updatedProgress = {
                    step: 5,
                    subStep: 5,
                    phase: 'identity_verification',
                    subPhase: 'complete'
                  };
                  localStorage.setItem('registrationProgress', JSON.stringify(updatedProgress));
                  setProgress(updatedProgress);
                  navigate('/register/identity-verification/verification/verification-complete');
                }}
                className="py-3 px-6 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                <FiCheck className="mr-2" />
                Confirm and Continue
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SelfieCapture;