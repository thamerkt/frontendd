import { useState, useRef, useEffect, useCallback } from 'react';
import { FiCamera, FiRotateCw, FiArrowRight, FiUpload, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

interface FrontCaptureProps {
  onNext?: () => void;
  onCapture?: (imageData: string) => void;
  onRetake?: () => void;
  initialImage?: string | null;
  currentStep?: number;
  totalSteps?: number;
}

interface RegistrationProgress {
  step?: number;
  subStep?: number;
  phase?: string;
  subPhase?: string;
}

const FrontCapture = ({
  onNext,
  onCapture,
  onRetake,
  initialImage = null,
  currentStep = 2,
  totalSteps = 5
}: FrontCaptureProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<'position' | 'aligned' | 'ready'>('position');
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [ip] = useState(Cookies.get('local_ip') || '');
  const [progress, setProgress] = useState<RegistrationProgress>(() => {
    const savedProgress = localStorage.getItem('registrationProgress');
    return savedProgress ? JSON.parse(savedProgress) : {
      step: 5,
      subStep: 2,
      phase: 'identity_verification',
      subPhase: 'document_capture'
    };
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const checkEnvironment = useCallback(() => {
    const isSecure =
      window.location.protocol === "https:" || 
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1";

    if (!isSecure) {
      throw new Error("Camera requires HTTPS connection");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API not supported in this browser");
    }

    return true;
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      if ("permissions" in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: "camera" as PermissionName });
          setHasPermission(permission.state === "granted");

          permission.onchange = () => {
            setHasPermission(permission.state === "granted");
          };
        } catch (permError) {
          console.log("Permissions API not fully supported, will try direct access");
          setHasPermission(null);
        }
      }
    } catch (error) {
      console.log("Permissions check failed:", error);
      setHasPermission(null);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      checkEnvironment();

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (backCameraError) {
        console.log("Back camera failed, trying front camera:", backCameraError);
        const frontConstraints = {
          video: {
            facingMode: "user",
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
        };
        stream = await navigator.mediaDevices.getUserMedia(frontConstraints);
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((playError) => {
              console.error("Video play error:", playError);
              setError("Failed to start video playback");
            });
          }
        };

        videoRef.current.onerror = (videoError) => {
          console.error("Video element error:", videoError);
          setError("Video display error");
        };
      }

      setIsCameraActive(true);
      setHasPermission(true);
      startDetectionSimulation();
    } catch (err: any) {
      console.error("Camera start failed:", err);

      let errorMessage = "Unknown camera error";
      if (err.name === "NotAllowedError") {
        errorMessage = "Camera access denied. Please allow camera permissions and try again.";
        setHasPermission(false);
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera found on this device.";
      } else if (err.name === "NotSupportedError") {
        errorMessage = "Camera not supported in this browser.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Camera constraints not supported.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setShowUploadOption(true);
    } finally {
      setIsLoading(false);
    }
  }, [checkEnvironment]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startDetectionSimulation = useCallback(() => {
    let detectionProgress = 0;
    let lastUpdate = 0;

    const detect = (timestamp: number) => {
      if (!videoRef.current || !detectionCanvasRef.current) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      const video = videoRef.current;
      const canvas = detectionCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

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
  }, [detectionStatus]);

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
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    const imageData = canvas.toDataURL("image/png");
    const imageId = Date.now();
  
    try {
      setIsSubmitting(true);
      
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], `image_${imageId}.jpg`, { type: "image/jpeg" });
      
      if (!imageData || !file) {
        throw new Error("Failed to process captured image");
      }
  
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
  
      const formDataImage = new FormData();
      formDataImage.append("image", file);
  
      let response1;
      try {
        response1 = await axios.post(`http://${ip}:8000/ocr/upload-image/`, formDataImage, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      } catch (err) {
        console.error("Upload-image API error:", err);
        localStorage.removeItem('capturedImage');
        setError("Failed to upload image. Please try again.");
        return;
      }
  
      if (!response1.data || response1.data.status !== "success" || !response1.data.data_verified) {
        localStorage.removeItem('capturedImage');
        setError("Image processing failed. Ensure the document is clear and valid.");
        return;
      }
      
      const extractedData = response1.data.extracted_data || {};
      const formData = new FormData();
      formData.append("document_name", "National ID Front");
      formData.append("document_url", file);
      formData.append("status", "pending");
      formData.append('uploaded_by', localStorage.getItem('user') || ''); 
      formData.append("document_type",'1');
      formData.append("submission_date", new Date().toISOString());
      formData.append("file", file);
  
      let response2;
      try {
        response2 = await axios.post(
          `http://${ip}:8000/ocr/document/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } catch (err) {
        console.error("Document API error:", err);
        setError("Failed to save document. Please try again.");
        return;
      }

      setCapturedImage(imageData);
      if (onCapture) onCapture(imageData);
  
      console.log("Upload successful:", {
        apiResponse1: response1.data,
        apiResponse2: response2.data,
        extractedData,
      });
  
      return { ...response2.data, localStorageImageId: imageId };
  
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      localStorage.removeItem('capturedImage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (onRetake) onRetake();
    startCamera();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('document_name', 'National ID Front');
        formData.append('document_url', file);
        formData.append('status', 'pending');
        formData.append('uploaded_by', localStorage.getItem('user') || ''); 
        formData.append("document_type",'1');
        formData.append('submission_date', new Date().toISOString());

        const response = await axios.post(
          `http://${ip}:8000/ocr/document/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        setCapturedImage(event.target?.result as string);
        if (onCapture) onCapture(event.target?.result as string);

      } catch (err: any) {
        console.error("Upload error:", err);
        setError("Failed to upload document. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getStatusMessage = () => {
    switch (detectionStatus) {
      case 'position': return "Move the front of your ID into the frame";
      case 'aligned': return "Align the front with the outline";
      case 'ready': return "Ready to capture! Hold steady";
      default: return "Position your ID front";
    }
  };

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      stopCamera();
    };
  }, [capturedImage, startCamera, stopCamera]);

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
            {error.includes("Camera") && (
              <div className="mt-2 text-sm text-red-600">
                <p className="font-medium">Troubleshooting:</p>
                <ul className="list-disc pl-5">
                  <li>Make sure you're using HTTPS</li>
                  <li>Allow camera permissions when prompted</li>
                  <li>Close other apps that might be using the camera</li>
                  <li>Refresh the page and try again</li>
                </ul>
              </div>
            )}
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
                onClick={() => {
                  const updatedProgress = {
                    ...progress,
                    step: 3,
                    subStep: 1
                  };
                  
                  localStorage.setItem('registrationProgress', JSON.stringify(updatedProgress));
                  setProgress(updatedProgress);
                  if (onNext) onNext();
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
