import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiRotateCw, FiArrowRight, FiUpload, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const BackCapture = ({
  onNext,
  onCapture,
  onRetake,
  initialImage,
  currentStep = 3, // Default to step 3 (Back Card)
  totalSteps = 5   // Default total steps
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState('position');
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [capturedImage, setCapturedImage] = useState(initialImage || null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [ip, setIP] = useState(Cookies.get('local_ip'));


  const [progress, setProgress] = useState(() => {
    const savedProgress = JSON.parse(localStorage.getItem('registrationProgress') || '{}');
    return savedProgress;
  });

  // Use the currentStep from props if available, otherwise fall back to progress.step
  const activeStep = currentStep || progress?.step || 3;

  useEffect(() => {
    console.log('Current progress:', progress);
    const url = new URL(window.location.href);
    const hostname = url.hostname;

    // Optional: Regex to make sure it's an IPv4 address
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      setIP(hostname);
    } else {
      setIP('Not an IPv4 address');
    }

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play();
          setIsCameraActive(true);
          startDetectionSimulation();
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
        setShowUploadOption(true);
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

      // Adjusted capture zone for back card
      const zoneWidth = (video.videoWidth * 80) / 100;
      const zoneHeight = (video.videoHeight * 55) / 100; // Slightly taller than front
      const zoneX = (video.videoWidth * 10) / 100;
      const zoneY = (video.videoHeight * 22.5) / 100; // Positioned slightly lower

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

  const capturePhoto = async () => {
    if (!isCameraActive || detectionStatus !== 'ready') {
      setError("Camera is not ready. Please try again.");
      return;
    }

    if (!navigator.onLine) {
      setError("No internet connection. Please check your network.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png");

      try {
        setIsLoading(true);

        // Convert base64 image to Blob
        const blob = await (await fetch(imageData)).blob();
        const file = new File([blob], "national_id_backend.jpg", { type: "image/jpeg" });

        // ✅ Upload directly to /api/document/
        const formData = new FormData();
        formData.append('document_name', 'National ID Back');
        formData.append('status', 'pending');
        formData.append('document_url', file);
        formData.append('uploaded_by', localStorage.getItem('user')); 
        formData.append("document_type",'1');
        formData.append('submission_date', new Date().toISOString());
        formData.append('file', file);

        let response;
        try {
          response = await axios.post(`https://5b22-197-29-209-95.ngrok-free.app/ocr/document/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (err) {
          console.error("Document API error:", err.response?.data || err.message);
          setError("Failed to save document. Please try again.");
          return;
        }

        // ✅ Set image after successful upload
        setCapturedImage(imageData);
        if (onCapture) onCapture(imageData);

        console.log("Upload successful:", response.data);
        return response.data;

      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (onRetake) onRetake();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        if (onCapture) onCapture(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusMessage = () => {
    switch (detectionStatus) {
      case 'position': return "Move the back of your ID into the frame";
      case 'aligned': return "Align the back with the outline";
      case 'ready': return "Ready to capture! Hold steady";
      default: return "Position your ID back";
    }
  };

  const handleNext = () => {
    // Update progress in localStorage before navigating

    navigate('/register/identity-verification/verification/selfie')


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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Back of ID Card</h2>
          <p className="text-sm sm:text-base text-gray-600">Ensure all details are clearly visible</p>

          {/* Progress Stepper */}
          <div className="mt-6 overflow-x-auto px-2">
            <div className="flex justify-center min-w-max">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step < activeStep ? 'bg-green-100 text-green-600' :
                      step === activeStep ? 'bg-blue-600 text-white' :
                        'bg-gray-100 text-gray-400'
                    }`}>
                    {step < activeStep ? <FiCheck size={14} /> : step}
                  </div>

                  {step < 5 && (
                    <div className={`h-1 w-6 ${step < activeStep ? 'bg-green-100' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-2 px-1 text-center">
              {['Select', 'Front', 'Back', 'Selfie', 'Confirm'].map((label, index) => (
                <span
                  key={label}
                  className={`text-xs w-12 ${index + 1 === activeStep ? 'font-medium text-blue-600' :
                      index + 1 < activeStep ? 'text-green-600' : 'text-gray-400'
                    }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-gray-200">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-gray-500">Starting camera...</p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured Back" className="w-full h-full object-contain" />
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
            {capturedImage ? "Back captured successfully" : getStatusMessage()}
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
              <label className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-full flex-1 flex items-center justify-center">
                <FiUpload className="mr-2" /> Upload Back Photo
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
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
                onClick={handleNext}
                className="bg-blue-600 text-white py-2 px-4 rounded-full flex-1 flex items-center justify-center"
              >
                Next <FiArrowRight className="ml-2" />
              </button>
            </>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || detectionStatus !== 'ready'}
              className={`py-2 px-4 rounded-full flex-1 flex items-center justify-center ${(!isCameraActive || detectionStatus !== 'ready')
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-blue-600 text-white'
                }`}
            >
              <FiCamera className="mr-2" /> Capture Back
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BackCapture;