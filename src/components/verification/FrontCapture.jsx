import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiRotateCw, FiArrowRight, FiUpload, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from "js-cookie";

const FrontCapture = ({
  onNext,
  onCapture,
  onRetake,
  initialImage,
  currentStep = 2,
  totalSteps = 5
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState('position');
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [capturedImage, setCapturedImage] = useState(initialImage || null);
  const { user } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const fileInputRef = useRef(null);
  const [ip, setIP] = useState(Cookies.get('local_ip'));
  const [progress, setProgress] = useState(() => {
    try {
      const savedProgress = JSON.parse(localStorage.getItem('registrationProgress') || '{}');
      return {
        step: savedProgress.step || 5,
        subStep: savedProgress.subStep || 2,
        phase: savedProgress.phase || 'identity_verification',
        subPhase: savedProgress.subPhase || 'document_capture'
      };
    } catch (e) {
      console.error("Error parsing saved progress:", e);
      return {
        step: 5,
        subStep: 2,
        phase: 'identity_verification',
        subPhase: 'document_capture'
      };
    }
  });

  // Error types for better error handling
  const ERROR_TYPES = {
    CAMERA_ACCESS: "Could not access camera. Please ensure permissions are granted.",
    NETWORK: "Network error. Please check your internet connection.",
    IMAGE_PROCESSING: "Image processing failed. Ensure the document is clear and valid.",
    UPLOAD_FAILED: "Failed to upload document. Please try again.",
    UNEXPECTED: "An unexpected error occurred. Please try again.",
    INVALID_RESPONSE: "Received invalid response from server.",
    STORAGE: "Failed to save data locally.",
    FILE_READ: "Failed to read the selected file."
  };

  useEffect(() => {
    let stream = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        if (!isMounted) return;
        
        setIsLoading(true);
        setError(null);

        // Check if browser supports mediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints)
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              throw new Error("Camera access denied. Please allow camera permissions.");
            } else if (err.name === 'NotFoundError') {
              throw new Error("No camera found on this device.");
            } else {
              throw new Error("Could not access camera: " + err.message);
            }
          });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          
          // Handle video play errors
          videoRef.current.onerror = () => {
            throw new Error("Failed to play video stream");
          };
          
          await videoRef.current.play().catch(err => {
            throw new Error("Failed to play video: " + err.message);
          });
          
          setIsCameraActive(true);
          startDetectionSimulation();
        }
      } catch (err) {
        console.error("Camera initialization error:", err);
        if (isMounted) {
          setError(err.message || ERROR_TYPES.CAMERA_ACCESS);
          setShowUploadOption(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      isMounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const startDetectionSimulation = () => {
    let detectionProgress = 0;
    let lastUpdate = 0;

    const detect = (timestamp) => {
      try {
        if (!videoRef.current || !detectionCanvasRef.current) {
          animationRef.current = requestAnimationFrame(detect);
          return;
        }

        const video = videoRef.current;
        const canvas = detectionCanvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error("Could not get canvas context");
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const zoneWidth = (video.videoWidth * 85) / 100;
        const zoneHeight = (video.videoHeight * 70) / 100;
        const zoneX = (video.videoWidth * 7.5) / 100;
        const zoneY = (video.videoHeight * 15) / 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const pulse = 0.7 + 0.3 * Math.sin(timestamp / 300);

        ctx.strokeStyle =
          detectionStatus === 'ready' ? `rgba(74, 222, 128, ${pulse})` :
            detectionStatus === 'aligned' ? `rgba(250, 204, 21, ${pulse})` :
              `rgba(239, 68, 68, ${pulse})`;

        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
        ctx.setLineDash([]);

        if (timestamp - lastUpdate > 1000) {
          detectionProgress = (detectionProgress + 0.2) % 1;
          lastUpdate = timestamp;

          if (detectionProgress < 0.4) {
            setDetectionStatus('position');
          } else if (detectionProgress < 0.8) {
            setDetectionStatus('aligned');
          } else {
            setDetectionStatus('ready');
          }
        }

        animationRef.current = requestAnimationFrame(detect);
      } catch (err) {
        console.error("Detection simulation error:", err);
        cancelAnimationFrame(animationRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(detect);
  };

  const capturePhoto = async () => {
    if (!isCameraActive || detectionStatus !== "ready") {
      setError("Camera is not ready. Please try again.");
      return;
    }
  
    if (!navigator.onLine) {
      setError(ERROR_TYPES.NETWORK);
      return;
    }
  
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      setError("Camera components not initialized properly.");
      return;
    }
  
    try {
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not get canvas context");
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      const imageData = canvas.toDataURL("image/png");
      if (!imageData || imageData.length < 100) { // Simple check if image is valid
        throw new Error("Failed to capture image");
      }
  
      const imageId = Date.now();
      setIsSubmitting(true);
      setError(null);
      
      // Convert base64 to Blob
      let blob;
      try {
        const response = await fetch(imageData);
        if (!response.ok) throw new Error("Failed to convert image to blob");
        blob = await response.blob();
      } catch (err) {
        throw new Error(ERROR_TYPES.IMAGE_PROCESSING);
      }
      
      const file = new File([blob], `image_${imageId}.jpg`, { type: "image/jpeg" });
      
      // Save image to localStorage
      try {
        const imagePayload = { 
          id: imageId, 
          imageData, 
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          },
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('capturedImage', JSON.stringify(imagePayload));
      } catch (err) {
        console.error("Local storage error:", err);
        throw new Error(ERROR_TYPES.STORAGE);
      }
  
      // Upload image to first API
      const formDataImage = new FormData();
      formDataImage.append("image", file);
  
      let response1;
      try {
        response1 = await axios.post(`http://192.168.1.120:8000/ocr/upload-image/`, formDataImage, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          timeout: 30000 // 30 seconds timeout
        });
        
        if (!response1.data || response1.data.status !== "success" || !response1.data.data_verified) {
          localStorage.removeItem('capturedImage');
          throw new Error(ERROR_TYPES.IMAGE_PROCESSING);
        }
      } catch (err) {
        console.error("Upload-image API error:", err.response?.data || err.message);
        localStorage.removeItem('capturedImage');
        throw new Error(
          err.response?.data?.message || 
          err.message || 
          ERROR_TYPES.UPLOAD_FAILED
        );
      }
      
      // Upload to second API
      const extractedData = response1.data.extracted_data || {};
      const formData = new FormData();
      formData.append("document_name", "National ID Front");
      formData.append("document_url", file);
      formData.append("status", "pending");
      formData.append('uploaded_by', localStorage.getItem('user')); 
      formData.append("document_type",'1');
      formData.append("submission_date", new Date().toISOString());
      formData.append("file", file);
  
      let response2;
      try {
        response2 = await axios.post(
          `http://192.168.1.120:8000/ocr/document/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000 // 30 seconds timeout
          }
        );
        
        if (!response2.data) {
          throw new Error(ERROR_TYPES.INVALID_RESPONSE);
        }
      } catch (err) {
        console.error("Document API error:", err.response?.data || err.message);
        throw new Error(
          err.response?.data?.message || 
          err.message || 
          ERROR_TYPES.UPLOAD_FAILED
        );
      }

      // Final success handling
      setCapturedImage(imageData);
      if (onCapture) onCapture(imageData);
  
      console.log("Upload successful:", {
        apiResponse1: response1.data,
        apiResponse2: response2.data,
        extractedData,
      });
  
      return { ...response2.data, localStorageImageId: imageId };
  
    } catch (err) {
      console.error("Capture error:", err);
      setError(err.message || ERROR_TYPES.UNEXPECTED);
      try {
        localStorage.removeItem('capturedImage');
      } catch (e) {
        console.error("Failed to remove image from storage:", e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    try {
      setCapturedImage(null);
      if (onRetake) onRetake();
    } catch (err) {
      console.error("Retake error:", err);
      setError(ERROR_TYPES.UNEXPECTED);
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setError("No file selected");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("File size too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    
    reader.onloadstart = () => {
      setIsSubmitting(true);
      setError(null);
    };
    
    reader.onerror = () => {
      setError(ERROR_TYPES.FILE_READ);
      setIsSubmitting(false);
    };
    
    reader.onload = async (event) => {
      try {
        const imageData = event.target.result;
        
        // Create FormData
        const formData = new FormData();
        formData.append('document_name', 'National ID Front');
        formData.append('document_url', file);
        formData.append('status', 'pending');
        formData.append('uploaded_by', localStorage.getItem('user')); 
        formData.append("document_type",'1');
        formData.append('submission_date', new Date().toISOString());

        // Make API call
        const response = await axios.post(
          `http://192.168.1.120:8000/ocr/document/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
            timeout: 30000
          }
        );

        if (!response.data) {
          throw new Error(ERROR_TYPES.INVALID_RESPONSE);
        }

        // Update state if successful
        setCapturedImage(imageData);
        if (onCapture) onCapture(imageData);

      } catch (err) {
        console.error("Upload error:", err);
        setError(
          err.response?.data?.message || 
          err.message || 
          ERROR_TYPES.UPLOAD_FAILED
        );
      } finally {
        setIsSubmitting(false);
      }
    };
    
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      setError(ERROR_TYPES.FILE_READ);
      setIsSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (detectionStatus) {
      case 'position': return "Move the front of your ID into the frame";
      case 'aligned': return "Align the front with the outline";
      case 'ready': return "Ready to capture! Hold steady";
      default: return "Position your ID front";
    }
  };

  const handleNextStep = () => {
    try {
      const updatedProgress = {
        ...progress,
        step: 3, // Moving to step 3 (back capture)
        subStep: 1
      };
      
      // Save to localStorage and state
      localStorage.setItem('registrationProgress', JSON.stringify(updatedProgress));
      setProgress(updatedProgress);
      navigate('/register/identity-verification/verification/back-document');
    } catch (err) {
      console.error("Navigation error:", err);
      setError("Failed to proceed to next step. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      >
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Front of ID Card</h2>
          <p className="text-sm sm:text-base text-gray-600">Ensure all details are clearly visible</p>

          <div className="mt-6 overflow-x-auto px-2">
            <div className="flex justify-center min-w-max">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step < currentStep ? 'bg-green-100 text-green-600' :
                      step === currentStep ? 'bg-blue-600 text-white' :
                        'bg-gray-100 text-gray-400'
                    }`}>
                    {step < currentStep ? <FiCheck size={14} /> : step}
                  </div>

                  {step < 5 && (
                    <div className={`h-1 w-6 ${step < currentStep ? 'bg-green-100' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-2 px-1 text-center">
              {['Select', 'Front', 'Back', 'Selfie', 'Confirm'].map((label, index) => (
                <span
                  key={label}
                  className={`text-xs w-12 ${index + 1 === currentStep ? 'font-medium text-blue-600' :
                      index + 1 < currentStep ? 'text-green-600' : 'text-gray-400'
                    }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-gray-200">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-gray-500">Starting camera...</p>
            </div>
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured Front" 
              className="w-full h-full object-contain"
              onError={() => setError("Failed to load captured image")}
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
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </>
          )}
        </div>

        <div className="mb-4 text-center">
          <p className={`text-sm font-medium ${detectionStatus === 'ready' ? 'text-green-600' :
              detectionStatus === 'aligned' ? 'text-yellow-500' :
                'text-red-500'
            }`}>
            {capturedImage ? "Front captured successfully" : getStatusMessage()}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          {showUploadOption && !capturedImage ? (
            <>
              <label className={`cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-full flex-1 flex items-center justify-center ${isSubmitting ? 'opacity-70' : ''
                }`}>
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" /> Upload Front Photo
                  </>
                )}
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                />
              </label>
            </>
          ) : capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-full flex-1 flex items-center justify-center"
              >
                <FiRotateCw className="mr-2" /> Retake
              </button>
              <button
                onClick={handleNextStep}
                className="bg-blue-600 text-white py-2 px-4 rounded-full flex-1 flex items-center justify-center"
              >
                Next <FiArrowRight className="ml-2" />
              </button>
            </>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || detectionStatus !== 'ready' || isSubmitting}
              className={`py-2 px-4 rounded-full flex-1 flex items-center justify-center ${(!isCameraActive || detectionStatus !== 'ready' || isSubmitting)
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-blue-600 text-white'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <FiCamera className="mr-2" /> Capture Front
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
