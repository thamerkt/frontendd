import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiRotateCw, FiArrowRight, FiUpload, FiAlertCircle, FiCheck } from 'react-icons/fi';

const DocumentCapture = ({ 
  documentType,
  step,
  onNext,
  onCapture,
  onRetake,
  initialImage
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const title = step === 'front' 
    ? `Capture Front of ${documentType === 'passport' ? 'Passport' : 'ID Card'}`
    : step === 'back' 
      ? 'Capture Back of ID Card' 
      : 'Take a Selfie';

  const instructions = step === 'front' 
    ? `Take a clear photo of the front of your ${documentType === 'passport' ? 'passport' : 'ID card'}`
    : step === 'back' 
      ? 'Take a clear photo of the back of your ID card'
      : 'Position your face within the frame and look directly at the camera';

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const constraints = {
          video: { 
            facingMode: step === 'selfie' ? 'user' : 'environment',
            width: { ideal: 720 },
            height: { ideal: 1280 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play();
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
        setShowUploadOption(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialImage) {
      startCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, initialImage]);

  const capturePhoto = () => {
    if (!isCameraActive || isLoading) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL("image/png"));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCapture(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{instructions}</p>

      <div className="relative w-full h-64 md:h-80 bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-gray-200">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-500">Starting camera...</p>
          </div>
        ) : initialImage ? (
          <img src={initialImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-start">
            <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-700">{error}</p>
              {showUploadOption && (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Upload image instead
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!initialImage && isCameraActive && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center">
            <FiCheck className="text-blue-500 mr-2" />
            <p className="text-blue-700">Camera ready - take a clear photo of the entire document</p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden"></canvas>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col space-y-3">
        {!initialImage ? (
          <>
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || isLoading}
              className={`py-3 px-6 rounded-lg flex items-center justify-center ${
                (!isCameraActive || isLoading) ?
                'bg-gray-300 text-gray-500 cursor-not-allowed' :
                'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FiCamera className="mr-2" />
              {isLoading ? 'Loading...' : 'Take Photo'}
            </button>
            {showUploadOption && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200"
              >
                <FiUpload className="mr-2" />
                Upload Image Instead
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={onNext}
              className="py-3 px-6 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700"
            >
              Continue <FiArrowRight className="ml-2" />
            </button>
            <button
              onClick={onRetake}
              className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200"
            >
              <FiRotateCw className="mr-2" />
              Retake
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentCapture;