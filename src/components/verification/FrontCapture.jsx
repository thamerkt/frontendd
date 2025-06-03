import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiRotateCw, FiArrowRight, FiUpload, FiCheck, FiLoader } from 'react-icons/fi';
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
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { user } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const fileInputRef = useRef(null);
  const [ip, setIP] = useState(Cookies.get('local_ip'));
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem('registrationProgress') || '{}';
    return {
      step: savedProgress.step || 5,
      subStep: savedProgress.subStep || 2,
      phase: savedProgress.phase || 'identity_verification',
      subPhase: savedProgress.subPhase || 'document_capture'
    };
  });

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if we're on HTTPS (except localhost for development)
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        const isSecure = window.location.protocol === 'https:';
        
        if (!isLocalhost && !isSecure) {
          throw new Error('Camera access requires HTTPS in production environment');
        }

        // Check if browser supports mediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }

        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        // Check camera permissions first
        if (navigator.permissions && navigator.permissions.query) {
          const permissions = await navigator.permissions.query({ name: 'camera' });
          if (permissions.state === 'denied') {
            throw new Error('Camera permissions denied. Please enable in browser settings.');
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              throw new Error('Camera access denied. Please allow camera permissions.');
            } else if (err.name === 'NotFoundError') {
              throw new Error('No camera device found.');
            } else if (err.name === 'NotReadableError') {
              throw new Error('Camera is already in use by another application.');
            } else if (err.name === 'OverconstrainedError') {
              throw new Error('Camera does not support requested constraints.');
            } else {
              throw new Error('Could not access camera: ' + err.message);
            }
          });

        if (!videoRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        // Handle cases where play() might fail
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise.catch(err => {
            stream.getTracks().forEach(track => track.stop());
            throw new Error('Could not play video stream: ' + err.message);
          });
        }

        setIsCameraActive(true);
        startDetectionSimulation();
      } catch (err) {
        console.error("Camera initialization error:", err);
        setError(err.message || "Could not access camera. Please ensure permissions are granted.");
        setShowUploadOption(true);
        
        // Stop any tracks if we got a stream but failed later
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
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

  const startDetectionSimulation = () => {
    let detectionProgress = 0;
    let lastUpdate = 0;

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
    };

    animationRef.current = requestAnimationFrame(detect);
  };

  const updateVerificationProgress = (progress, status) => {
    setVerificationProgress(progress);
    setVerificationStatus(status);
  };

  const capturePhoto = async () => {
    if (!isCameraActive || detectionStatus !== "ready") {
      setError("Camera is not ready. Please try again.");
      return;
    }
  
    if (!navigator.onLine) {
      setError("No internet connection. Please check your network.");
      return;
    }
  
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
  
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    const imageData = canvas.toDataURL("image/png");
    const imageId = Date.now();
  
    try {
      setIsSubmitting(true);
      setVerificationProgress(10);
      setVerificationStatus("Processing image...");
      
      // Convert base64 to Blob
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], `image_${imageId}.jpg`, { type: "image/jpeg" });
      
      if (!imageData || !file) {
        throw new Error("Failed to process captured image");
      }

      updateVerificationProgress(20, "Preparing for upload...");
  
      // Save image to localStorage
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

      updateVerificationProgress(30, "Uploading image...");
  
      // Upload image to first API
      const formDataImage = new FormData();
      formDataImage.append("image", file);
  
      let response1;
      try {
        response1 = await axios.post(`https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/upload-image/`, formDataImage, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total);
            updateVerificationProgress(30 + percentCompleted, "Uploading image...");
          }
        });
      } catch (err) {
        console.error("Upload-image API error:", err.response?.data || err.message);
        localStorage.removeItem('capturedImage');
        setError("Failed to upload image. Please try again.");
        updateVerificationProgress(0, "Upload failed");
        return;
      }

      updateVerificationProgress(80, "Verifying document...");
  
      if (!response1.data || response1.data.status !== "success" || !response1.data.data_verified) {
        localStorage.removeItem('capturedImage');
        setError("Image processing failed. Ensure the document is clear and valid.");
        updateVerificationProgress(0, "Verification failed");
        return;
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

      updateVerificationProgress(90, "Saving document...");
  
      let response2;
      try {
        response2 = await axios.post(
          `https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/document/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } catch (err) {
        console.error("Document API error:", err.response?.data || err.message);
        setError("Failed to save document. Please try again.");
        updateVerificationProgress(0, "Save failed");
        return;
      }

      updateVerificationProgress(100, "Verification complete!");
  
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
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      localStorage.removeItem('capturedImage');
      updateVerificationProgress(0, "Error occurred");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setVerificationProgress(0);
        setVerificationStatus(null);
      }, 2000);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setVerificationProgress(0);
    setVerificationStatus(null);
    if (onRetake) onRetake();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setIsSubmitting(true);
          setVerificationProgress(20, "Processing uploaded file...");

          // Create FormData
          const formData = new FormData();
          formData.append('document_name', 'National ID Front');
          formData.append('document_url', file);
          formData.append('status', 'pending');
          formData.append('uploaded_by', localStorage.getItem('user')); 
          formData.append("document_type",'1');
          formData.append('submission_date', new Date().toISOString());

          setVerificationProgress(40, "Uploading document...");

          // Make API call
          const response = await axios.post(
            `https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/document/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true,
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                setVerificationProgress(40 + percentCompleted);
              }
            }
          );

          setVerificationProgress(100, "Upload complete!");
          
          // Update state if successful
          setCapturedImage(event.target.result);
          if (onCapture) onCapture(event.target.result);

        } catch (err) {
          console.error("Upload error:", err);
          setError("Failed to upload document. Please try again.");
          setVerificationProgress(0, "Upload failed");
        } finally {
          setIsSubmitting(false);
          setTimeout(() => {
            setVerificationProgress(0);
            setVerificationStatus(null);
          }, 2000);
        }
      };
      reader.readAsDataURL(file);
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
            <img src={capturedImage} alt="Captured Front" className="w-full h-full object-contain" />
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

        {verificationProgress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                {verificationStatus || "Processing..."}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {verificationProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${verificationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

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
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          {showUploadOption && !capturedImage ? (
            <>
              <label className={`cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-full flex-1 flex items-center justify-center ${isSubmitting ? 'opacity-70' : ''
                }`}>
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
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
                onClick={() => {
                  const updatedProgress = {
                    ...progress,
                    step: 3, // Moving to step 3 (back capture)
                    subStep: 1
                  };
                  
                  localStorage.setItem('registrationProgress', JSON.stringify(updatedProgress));
                  setProgress(updatedProgress);
                  navigate('/register/identity-verification/verification/back-document');
                }}
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
                  <FiLoader className="animate-spin mr-2" />
                  Processing...
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
