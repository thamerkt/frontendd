"use client"

import { useState, useRef, useEffect } from "react"
import { FiCamera, FiRotateCw,FiVideo,FiArrowRight, FiUpload, FiCheck, FiPlay, FiAlertCircle } from "react-icons/fi"
import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import Cookies from "js-cookie"
const FrontCapture = ({ onNext, onCapture, onRetake, initialImage = null, currentStep = 2, totalSteps = 5 }) => {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(initialImage)
  const [frameColor, setFrameColor] = useState("rgba(239, 68, 68, 0.7)")
  const [cardDetected, setCardDetected] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const navigate = useNavigate()

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionCanvasRef = useRef(null)
  const animationRef = useRef(null)
  const fileInputRef = useRef(null)
  const { user } = useParams()


  const startCamera = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      
      setIsCameraActive(true)
      startDetectionSimulation()
    } catch (err) {
      setError("Camera access denied. Please allow permissions.")
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsCameraActive(false)
  }

  const startDetectionSimulation = () => {
    const detect = (timestamp) => {
      if (!videoRef.current || !detectionCanvasRef.current) {
        animationRef.current = requestAnimationFrame(detect)
        return
      }
      
      const canvas = detectionCanvasRef.current
      const ctx = canvas.getContext("2d")
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Frame dimensions
      const frameWidth = Math.min(video.videoWidth * 0.8, 600)
      const frameHeight = frameWidth * 0.63
      const frameX = (video.videoWidth - frameWidth) / 2
      const frameY = (video.videoHeight - frameHeight) / 2
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Simulate detection (every 5 seconds)
      const isDetected = timestamp % 5000 > 3000
      setCardDetected(isDetected)
      const newColor = isDetected ? `rgba(34, 197, 94, ${0.7 + 0.3 * Math.sin(timestamp/300)})` 
                                : `rgba(239, 68, 68, ${0.7 + 0.3 * Math.sin(timestamp/300)})`
      setFrameColor(newColor)
      
      // Draw frame
      ctx.strokeStyle = newColor
      ctx.lineWidth = 3
      ctx.setLineDash([8, 8])
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight)
      ctx.setLineDash([])
      
      // Draw corner markers
      const cornerSize = 20
      ctx.lineWidth = 4
      
      const corners = [
        [frameX, frameY, frameX + cornerSize, frameY, frameX, frameY + cornerSize],
        [frameX + frameWidth - cornerSize, frameY, frameX + frameWidth, frameY, frameX + frameWidth, frameY + cornerSize],
        [frameX, frameY + frameHeight - cornerSize, frameX, frameY + frameHeight, frameX + cornerSize, frameY + frameHeight],
        [frameX + frameWidth, frameY + frameHeight - cornerSize, frameX + frameWidth, frameY + frameHeight, frameX + frameWidth - cornerSize, frameY + frameHeight]
      ]

      corners.forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.stroke()
      })

      // Add instructional text
      ctx.fillStyle = "white"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Position your ID card inside this frame", video.videoWidth / 2, frameY - 20)

      if (isDetected) {
        ctx.fillStyle = "rgba(34, 197, 94, 0.9)"
        ctx.font = "bold 18px Arial"
        ctx.fillText("Card detected! Ready to capture", video.videoWidth / 2, frameY + frameHeight + 40)
      }
      
      animationRef.current = requestAnimationFrame(detect)
    }
    
    animationRef.current = requestAnimationFrame(detect)
  }

  const capturePhoto = async () => {
    

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Video stream is not ready. Please wait and try again.")
      return
    }

    try {
      setIsSubmitting(true)
      setUploadProgress(0)

      const context = canvas.getContext("2d")
      if (!context) throw new Error("Canvas context not available")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      setCapturedImage(imageData)

      // Convert to blob for upload
      const blob = await (await fetch(imageData)).blob()
      const file = new File([blob], `id_front_${Date.now()}.jpg`, { type: "image/jpeg" })

      // First API call
      const formDataImage = new FormData()
      formDataImage.append("image", file)

      const uploadConfig = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      }

      // First API call to process image
      const response1 = await axios.post(`https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/upload-image/`,formDataImage,
        {
          ...uploadConfig,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      )

      if (!response1.data || response1.data.status !== "success" || !response1.data.data_verified) {
        throw new Error("Image processing failed. Ensure the document is clear and valid.")
      }

      // Second API call to save document
      const formData = new FormData()
      formData.append("document_name", "National ID Front")
      formData.append("document_url", file)
      formData.append("status", "pending")
      formData.append("uploaded_by", Cookies.get("user") || "")
      formData.append("document_type", "1")
      formData.append("submission_date", new Date().toISOString())
      formData.append("file", file)

      const response2 = await axios.post(
        `https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/document/`,
        formData,
        {
          ...uploadConfig,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      console.log("Upload successful:", {
        apiResponse1: response1.data,
        apiResponse2: response2.data,
      })

      if (onCapture) onCapture(imageData)
    } catch (err) {
      console.error("Capture failed:", err)
      setError(err.response?.data?.message || err.message || "Failed to capture and upload photo")
      setCapturedImage(null)
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    if (onRetake) onRetake()
    stopCamera()
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsSubmitting(true)
      setUploadProgress(0)

      const reader = new FileReader()
      reader.onload = async (event) => {
        const result = event.target?.result
        setCapturedImage(result)

        // Upload the file
        const formData = new FormData()
        formData.append("document_name", "National ID Front (Upload)")
        formData.append("document_url", file)
        formData.append("status", "pending")
        formData.append("uploaded_by", localStorage.getItem("user") || "")
        formData.append("document_type", "1")
        formData.append("submission_date", new Date().toISOString())
        formData.append("file", file)

        await axios.post(
          `https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/document/`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress(percentCompleted)
            },
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        )

        if (onCapture) onCapture(result)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.response?.data?.message || err.message || "Failed to upload document")
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }
  useEffect(() => {
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Front of ID Card</h2>
          <p className="text-sm sm:text-base text-gray-600">Ensure all details are clearly visible</p>

          <div className="mt-6 overflow-x-auto px-2">
            <div className="flex justify-center min-w-max">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step < currentStep
                        ? "bg-green-100 text-green-600"
                        : step === currentStep
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step < currentStep ? <FiCheck size={14} /> : step}
                  </div>
                  {step < 5 && <div className={`h-1 w-6 ${step < currentStep ? "bg-green-100" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
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
            <canvas 
              ref={detectionCanvasRef} 
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-75">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          )}

          {isSubmitting && uploadProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-white text-sm">{uploadProgress}%</span>
            </div>
          )}

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured ID Front"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {!isCameraActive && !capturedImage && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center p-8">
                <FiVideo className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="mb-4 opacity-75">Camera not active</p>
                <button
                  onClick={startCamera}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full flex items-center justify-center mx-auto"
                >
                  <FiPlay className="mr-2" /> Start Camera
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 text-center">
          <p className={`text-sm font-medium ${capturedImage ? "text-green-600" : cardDetected ? "text-green-600" : "text-gray-500"}`}>
            {capturedImage ? "✅ Front captured successfully" : cardDetected ? "Ready to capture" : "Position your ID"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded-lg flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isCameraActive && !capturedImage ? (
            <>
              <button
                onClick={startCamera}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center font-medium ${
                  isLoading ? "bg-gray-300 text-gray-500" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-2" /> Start Camera
                  </>
                )}
              </button>
              <label className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full flex items-center justify-center font-medium">
                <FiUpload className="mr-2" /> Upload Photo
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </>
          ) : capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full flex items-center justify-center font-medium"
              >
                <FiRotateCw className="mr-2" /> Retake
              </button>
              <button
                onClick={() => navigate('/register/identity-verification/verification/back-document')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-full flex items-center justify-center font-medium"
              >
                Next <FiArrowRight className="ml-2" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full font-medium"
              >
                Stop
              </button>
              <button
                onClick={capturePhoto}
                disabled={isSubmitting || !cardDetected}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center font-medium ${
                  isSubmitting || !cardDetected
                    ? "bg-gray-300 text-gray-500"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Capturing...
                  </>
                ) : (
                  <>
                    <FiCamera className="mr-2" /> Capture
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default FrontCapture
