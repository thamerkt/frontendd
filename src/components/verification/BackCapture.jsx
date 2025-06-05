"use client"

import { useState, useRef, useEffect } from "react"
import { FiCamera, FiRotateCw, FiArrowRight,FiVideo, FiUpload, FiCheck, FiPlay, FiAlertCircle, FiShield } from "react-icons/fi"
import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"


const BackCaptureWithFrame = ({ onNext, onCapture, onRetake, initialImage = null, currentStep = 3 }) => {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(initialImage)
  const [detectionStatus, setDetectionStatus] = useState("position")
  const [hasPermission, setHasPermission] = useState(null)
  const [showUploadOption, setShowUploadOption] = useState(false)
  
  
    const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionCanvasRef = useRef(null)
  const animationRef = useRef(null)
  const fileInputRef = useRef(null)
  

  const checkPermissions = async () => {
    try {
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "camera" })
        setHasPermission(permission.state === "granted")
        return permission.state
      }
      return "unknown"
    } catch {
      return "unknown"
    }
  }

  const requestCameraPermission = async () => {
    try {
      const currentPermission = await checkPermissions()
      if (currentPermission === "granted") return true
      if (currentPermission === "denied") throw new Error("Camera permission denied")

      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
      tempStream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      return true
    } catch (error) {
      setError("Camera access denied. Please enable camera permissions.")
      setHasPermission(false)
      setShowUploadOption(true)
      return false
    }
  }

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!hasPermission && !await requestCameraPermission()) return

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: "environment" }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      
      setIsCameraActive(true)
      startDetectionSimulation()
    } catch (err) {
      setError(err.message || "Failed to start camera")
      setShowUploadOption(true)
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setIsCameraActive(false)
  }

  const startDetectionSimulation = () => {
    const detect = (timestamp) => {
      if (!videoRef.current || !detectionCanvasRef.current) {
        animationRef.current = requestAnimationFrame(detect)
        return
      }

      const video = videoRef.current
      const canvas = detectionCanvasRef.current
      const ctx = canvas.getContext("2d")
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const frameWidth = canvas.width * 0.75
      const frameHeight = canvas.height * 0.5
      const frameX = (canvas.width - frameWidth) / 2
      const frameY = (canvas.height - frameHeight) / 2
      const pulse = 0.8 + 0.2 * Math.sin(timestamp / 400)

      let frameColor
      switch (detectionStatus) {
        case "ready": frameColor = `rgba(34, 197, 94, ${pulse})`; break
        case "aligned": frameColor = `rgba(251, 191, 36, ${pulse})`; break
        default: frameColor = `rgba(239, 68, 68, ${pulse})`
      }

      // Draw frame
      ctx.strokeStyle = frameColor
      ctx.lineWidth = 4
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight)

      // Draw corners
      const cornerLength = 30
      ctx.lineWidth = 6
      ctx.strokeStyle = frameColor.replace(/[\d.]+\)$/, "1)")

      // Top-left corner
      ctx.beginPath()
      ctx.moveTo(frameX, frameY + cornerLength)
      ctx.lineTo(frameX, frameY)
      ctx.lineTo(frameX + cornerLength, frameY)
      ctx.stroke()

      // Other corners would be drawn similarly...

      // Simulate detection state changes
      if (timestamp % 6000 < 2000) setDetectionStatus("position")
      else if (timestamp % 6000 < 4000) setDetectionStatus("aligned")
      else setDetectionStatus("ready")

      animationRef.current = requestAnimationFrame(detect)
    }
    animationRef.current = requestAnimationFrame(detect)
  }

  const capturePhoto = async () => {
    if (!isCameraActive || !cameraReady || !streamActive) {
      setError("Camera is not ready. Please wait or restart the camera.")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Video stream is not ready. Please wait and try again.")
      return
    }

    try {
      setIsSubmitting(true)

      const context = canvas.getContext("2d")
      if (!context) throw new Error("Canvas context not available")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      if (!navigator.onLine) {
        setError("No internet connection. Please check your network.")
        return
      }

      try {
        const blob = await (await fetch(imageData)).blob()
        const file = new File([blob], "national_id_backend.jpg", { type: "image/jpeg" })

        const formData = new FormData()
        formData.append("document_name", "National ID Back")
        formData.append("status", "pending")
        formData.append("document_url", file)
        formData.append("uploaded_by", Cookies.get("user"))
        formData.append("document_type", "1")
        formData.append("submission_date", new Date().toISOString())
        formData.append("file", file)

        const response = await axios.post(`https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/document/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        console.log("Upload successful:", response.data)
      } catch (err) {
        console.error("Document API error:", err.response?.data || err.message)
        setError("Failed to save document. Please try again.")
        return
      }

      setCapturedImage(imageData)
      if (onCapture) onCapture(imageData)
    } catch (err) {
      console.error("Capture failed:", err)
      setError("Failed to capture photo. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    checkPermissions()
    return () => stopCamera()
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      >
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Back of ID Card</h2>
          <p className="text-sm sm:text-base text-gray-600">Position your ID within the red frame</p>

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

        <canvas ref={canvasRef} className="hidden" />
        
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4 border-2 border-gray-200">
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

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured ID Back"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {!isCameraActive && !capturedImage && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <FiVideo className="h-16 w-16 opacity-50" />
            </div>
          )}
        </div>

        <div className="mb-4 text-center">
          <p className={`text-sm font-medium ${
            capturedImage ? "text-green-600" :
            detectionStatus === "ready" ? "text-green-600" :
            detectionStatus === "aligned" ? "text-yellow-500" : "text-red-500"
          }`}>
            {capturedImage ? "✅ Back captured successfully" : 
             detectionStatus === "ready" ? "Ready to capture" :
             detectionStatus === "aligned" ? "Align ID card" : "Position ID card"}
          </p>
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

        <div className="flex gap-2">
          {(!isCameraActive && !capturedImage) || showUploadOption ? (
            <>
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-full flex items-center justify-center"
              >
                <FiPlay className="mr-2" /> Start Camera
              </button>
              <label className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full flex items-center justify-center">
                <FiUpload className="mr-2" /> Upload Photo
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </>
          ) : capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full flex items-center justify-center"
              >
                <FiRotateCw className="mr-2" /> Retake
              </button>
              <button
                onClick={() => navigate('/register/identity-verification/verification/selfie')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-full flex items-center justify-center"
              >
                Next <FiArrowRight className="ml-2" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full"
              >
                Stop
              </button>
              <button
                onClick={capturePhoto}
                disabled={isSubmitting || detectionStatus !== "ready"}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center ${
                  isSubmitting || detectionStatus !== "ready" ? "bg-gray-300 text-gray-500" : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <FiCamera className="mr-2" />
                )}
                Capture Back
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default BackCaptureWithFrame
