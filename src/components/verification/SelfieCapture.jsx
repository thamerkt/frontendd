"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { FiCamera, FiRotateCw, FiCheck, FiAlertCircle, FiUser } from "react-icons/fi"
import Cookies from "js-cookie"
const SelfieCapture = ({ onComplete, onRetake, currentStep = 4 }) => {
  const navigate = useNavigate()
  
  // State management
  const [image, setImage] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [faceStatus, setFaceStatus] = useState("position")
  const [isUploading, setIsUploading] = useState(false)
  const [imageId, setImageId] = useState(null)

  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionCanvasRef = useRef(null)
 
  const animationRef = useRef(null)

  // Status configurations
  const STATUS_CONFIG = {
    position: { message: "Move your face into the frame", color: "red" },
    centered: { message: "Center your face in the frame", color: "yellow" },
    ready: { message: "Perfect! Hold still", color: "green" }
  }

  // Start camera function
  const startCamera = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 }
      })
      
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      
      setIsCameraActive(true)
      startFaceDetectionSimulation()
    } catch (err) {
      setError("Camera access denied. Please allow permissions.")
    } finally {
      setIsLoading(false)
    }
  }

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  // Face detection simulation
  const startFaceDetectionSimulation = () => {
    const detectFace = (timestamp) => {
      if (!videoRef.current || !detectionCanvasRef.current) {
        requestAnimationFrame(detectFace)
        return
      }

      const video = videoRef.current
      const canvas = detectionCanvasRef.current
      const ctx = canvas.getContext("2d")
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw detection zone (60% width, 70% height, centered)
      const zoneWidth = video.videoWidth * 0.6
      const zoneHeight = video.videoHeight * 0.7
      const zoneX = (video.videoWidth - zoneWidth) / 2
      const zoneY = (video.videoHeight - zoneHeight) / 2

      const pulse = 0.7 + 0.3 * Math.sin(timestamp / 300)
      const status = STATUS_CONFIG[faceStatus]
      
      ctx.strokeStyle = 
        status.color === "red" ? `rgba(239, 68, 68, ${pulse})` :
        status.color === "yellow" ? `rgba(234, 179, 8, ${pulse})` :
        `rgba(16, 185, 129, ${pulse})`

      ctx.lineWidth = 3
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight)

      // Draw face oval guide
      ctx.beginPath()
      ctx.ellipse(
        zoneX + zoneWidth/2, 
        zoneY + zoneHeight/2, 
        zoneWidth * 0.4, 
        zoneHeight * 0.5, 
        0, 0, 2 * Math.PI
      )
      ctx.stroke()

      // Simulate face detection states
      if (timestamp % 6000 < 2000) setFaceStatus("position")
      else if (timestamp % 6000 < 4000) setFaceStatus("centered")
      else setFaceStatus("ready")

      requestAnimationFrame(detectFace)
    }
    requestAnimationFrame(detectFace)
  }

  // Capture photo function
  const capturePhoto = async () => {
    if (faceStatus !== "ready") {
      setError("Please align your face properly")
      return
    }
    const video = videoRef.current
    const canvas = canvasRef.current
    let newImageId = null
    try {
      setIsUploading(true)
      newImageId = Date.now()
      setImageId(newImageId)

      const context = canvas.getContext("2d")
      if (!context) throw new Error("Canvas context not available")

      // Capture image from video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert the captured image to a base64 string (imageData)
      const imageData = canvas.toDataURL("image/jpeg", 0.8) // Base64 encoded image

      // Create a file object
      const blob = await (await fetch(imageData)).blob()
      const file = new File([blob], `selfie_${newImageId}.jpg`, { type: "image/jpeg" })

      // Prepare the data to be stored in localStorage
      const selfieData = {
        imageData, // Base64 encoded image
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        },
        timestamp: new Date().toISOString(),
        imageId: newImageId,
      }

      // Save to localStorage
      localStorage.setItem("selfie", JSON.stringify(selfieData))

      // Check for internet connection
      if (!navigator.onLine) {
        setError("No internet connection. Your selfie has been saved locally.")
        setImage(imageData)
        stopCamera()
        return
      }

      // Upload to API
      const formData = new FormData()
      formData.append("selfie", file)

      const response = await axios.post(`http://192.168.1.120:8000/ocr/selfie/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data?.status !== "success") {
        localStorage.removeItem('selfie')
        throw new Error(response.data?.message || "Selfie upload failed")
      }

      // Upload document metadata
      const documentFormData = new FormData()
      documentFormData.append("document_name", "Selfie")
      documentFormData.append('status', 'pending')
      documentFormData.append('document_url', file)
      documentFormData.append('uploaded_by', Cookies.get('user')) 
      documentFormData.append("document_type",'1')
      documentFormData.append('submission_date', new Date().toISOString())
      documentFormData.append('file', file)

      const documentResponse = await axios.post(
        `http://192.168.1.120:8000/ocr/document/`,
        documentFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      // Success handling
      setImage(imageData)
      stopCamera()
      console.log("Upload successful:", documentResponse.data)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "An error occurred while capturing")
      if (newImageId) {
        localStorage.removeItem("selfie")
        setImageId(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const retakePhoto = () => {
    setImage(null)
    setError(null)
    if (onRetake) onRetake()
    startCamera()
  }

  const handleContinue = () => {
    onComplete?.(image)
    navigate("/register/identity-verification/verification/verification-complete")
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const currentStatus = STATUS_CONFIG[faceStatus]

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      >
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Face Verification</h2>
          <p className="text-sm sm:text-base text-gray-600">Align your face with the outline</p>

          {/* Progress Stepper */}
          <div className="mt-6 flex justify-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step < currentStep ? "bg-green-100 text-green-600" :
                  step === currentStep ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {step < currentStep ? <FiCheck size={14} /> : step}
                </div>
                {step < 5 && <div className={`h-1 w-6 ${step < currentStep ? "bg-green-100" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded-lg">
            <div className="flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        
        <div className="relative aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden mb-4 border-2 border-gray-200">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive ? "block" : "hidden"}`}
          />

          {isCameraActive && (
            <canvas ref={detectionCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-75">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          )}

          {image && (
            <img src={image} alt="Captured selfie" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        <div className={`mb-6 p-4 rounded-lg ${
          currentStatus.color === "red" ? "bg-red-50 border-l-4 border-red-500" :
          currentStatus.color === "yellow" ? "bg-yellow-50 border-l-4 border-yellow-500" :
          "bg-green-50 border-l-4 border-green-500"
        }`}>
          <div className="flex items-start">
            <FiUser className={`mr-3 mt-0.5 ${
              currentStatus.color === "red" ? "text-red-500" :
              currentStatus.color === "yellow" ? "text-yellow-500" : "text-green-500"
            }`} />
            <div>
              <p className={`font-medium ${
                currentStatus.color === "red" ? "text-red-700" :
                currentStatus.color === "yellow" ? "text-yellow-700" : "text-green-700"
              }`}>
                {currentStatus.message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          {!image ? (
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || isUploading || faceStatus !== "ready"}
              className={`py-3 px-6 rounded-lg flex items-center justify-center ${
                !isCameraActive || isUploading || faceStatus !== "ready" ?
                "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <FiCamera className="mr-2" />
              )}
              Capture Photo
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200"
              >
                <FiRotateCw className="mr-2" />
                Retake Photo
              </button>
              <button
                onClick={handleContinue}
                className="py-3 px-6 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700"
              >
                <FiCheck className="mr-2" />
                Confirm and Continue
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default SelfieCapture
