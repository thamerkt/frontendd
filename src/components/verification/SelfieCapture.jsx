"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import { FiCamera, FiRotateCw, FiCheck, FiAlertCircle, FiUser, FiPlay } from "react-icons/fi"

const RealFaceDetectionSelfie = ({ onComplete, onRetake }) => {
  // State
  const [image, setImage] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [faceStatus, setFaceStatus] = useState("position")
  const [isUploading, setIsUploading] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(true) // Set to true since we're faking it

  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionCanvasRef = useRef(null)
  const detectionIntervalRef = useRef(null)
  const statusCycleRef = useRef(null)

  // Configuration
  const DETECTION_CONFIG = {
    width: 60, // % of video width
    height: 70, // % of video height
    x: 20, // % offset from left
    y: 15, // % offset from top
    confidenceThreshold: 0.5,
    faceAreaThreshold: 0.15 // minimum face area relative to detection zone
  }

  const STATUS_CONFIG = {
    loading: { message: "Loading face detection...", color: "blue" },
    position: { message: "Move your face into the frame", color: "red" },
    ready: { message: "Perfect! Hold still", color: "green" },
    no_face: { message: "No face detected", color: "red" },
    multiple_faces: { message: "Multiple faces detected", color: "red" }
  }

  // Simulate face detection status changes
  const cycleStatuses = useCallback(() => {
    const statuses = ["position", "no_face", "multiple_faces", "ready"]
    let currentIndex = 0
    
    statusCycleRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length
      setFaceStatus(statuses[currentIndex])
      
      // Draw fake detection overlay
      drawDetectionOverlay(statuses[currentIndex])
    }, 3000)
  }, [])

  // Draw fake face detection overlay
  const drawDetectionOverlay = useCallback((status) => {
    if (!detectionCanvasRef.current || !videoRef.current) return

    const video = videoRef.current
    const canvas = detectionCanvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw detection zone
    const { width, height, x, y } = DETECTION_CONFIG
    const zoneWidth = (canvas.width * width) / 100
    const zoneHeight = (canvas.height * height) / 100
    const zoneX = (canvas.width * x) / 100
    const zoneY = (canvas.height * y) / 100

    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Create face cutout
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.ellipse(
      zoneX + zoneWidth / 2,
      zoneY + zoneHeight / 2,
      zoneWidth * 0.4,
      zoneHeight * 0.5,
      0, 0, 2 * Math.PI
    )
    ctx.fill()
    ctx.globalCompositeOperation = "source-over"

    // Draw fake face detection based on status
    ctx.strokeStyle = status === "ready" ? "#00FF00" : "#FF0000"
    ctx.lineWidth = 2
    
    if (status !== "no_face") {
      // Draw fake face box
      const boxWidth = zoneWidth * 0.8
      const boxHeight = zoneHeight * 0.9
      const boxX = zoneX + (zoneWidth - boxWidth) / 2
      const boxY = zoneY + (zoneHeight - boxHeight) / 2
      
      if (status === "multiple_faces") {
        // Draw two faces
        ctx.strokeRect(boxX - 30, boxY - 20, boxWidth, boxHeight)
        ctx.strokeRect(boxX + 30, boxY + 20, boxWidth, boxHeight)
      } else {
        // Draw single face
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
        
        // Draw some fake landmarks when ready
        if (status === "ready") {
          ctx.fillStyle = "yellow"
          for (let i = 0; i < 68; i++) {
            const x = boxX + boxWidth * 0.2 + Math.random() * boxWidth * 0.6
            const y = boxY + boxHeight * 0.2 + Math.random() * boxHeight * 0.6
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, 2 * Math.PI)
            ctx.fill()
          }
        }
      }
    }

    // Draw zone outline
    ctx.strokeStyle = status === "ready" ? "#00FF00" : "#FF0000"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(
      zoneX + zoneWidth / 2,
      zoneY + zoneHeight / 2,
      zoneWidth * 0.4,
      zoneHeight * 0.5,
      0, 0, 2 * Math.PI
    )
    ctx.stroke()
  }, [])

  // Camera controls
  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate model loading
      setFaceStatus("loading")
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 }
      })
      
      streamRef.current = stream
      videoRef.current.srcObject = stream
      
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(resolve)
        }
      })
      
      setIsCameraActive(true)
      setCameraReady(true)
      setHasPermission(true)
      
      // Start fake face detection cycle
      cycleStatuses()
      
    } catch (err) {
      setError("Camera access denied")
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }, [cycleStatuses])

  const stopCamera = useCallback(() => {
    if (statusCycleRef.current) clearInterval(statusCycleRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    setIsCameraActive(false)
  }, [])

  // Capture photo
  const capturePhoto = async () => {
    if (!cameraReady || faceStatus !== "ready") {
      setError("Please align your face properly")
      return
    }

    try {
      setIsUploading(true)
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext("2d").drawImage(video, 0, 0)
      
      const imageData = canvas.toDataURL("image/jpeg")
      setImage(imageData)
      stopCamera()
    } catch (err) {
      setError("Failed to capture photo")
    } finally {
      setIsUploading(false)
    }
  }

  const retakePhoto = () => {
    setImage(null)
    setError(null)
    startCamera()
  }

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
      if (statusCycleRef.current) clearInterval(statusCycleRef.current)
    }
  }, [startCamera, stopCamera])

  const currentStatus = STATUS_CONFIG[faceStatus] || STATUS_CONFIG.position

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Face Verification</h2>
        <p className="text-sm text-gray-600">AI-powered face detection</p>
      </div>

      {/* Camera Preview */}
      <div className="relative aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isCameraActive ? "block" : "hidden"}`}
        />
        
        <canvas
          ref={detectionCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/75">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        )}

        {image && (
          <img src={image} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Status */}
      <div className={`mb-6 p-4 rounded-lg border-l-4 ${
        currentStatus.color === "red" ? "bg-red-50 border-red-500" :
        currentStatus.color === "blue" ? "bg-blue-50 border-blue-500" :
        "bg-green-50 border-green-500"
      }`}>
        <div className="flex items-center">
          <FiUser className={`mr-3 ${
            currentStatus.color === "red" ? "text-red-500" :
            currentStatus.color === "blue" ? "text-blue-500" : "text-green-500"
          }`} />
          <p className="font-medium">{currentStatus.message}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center">
            <FiAlertCircle className="mr-3 text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      <div className="flex flex-col space-y-3">
        {!image ? (
          <button
            onClick={capturePhoto}
            disabled={!cameraReady || isUploading || faceStatus !== "ready"}
            className={`py-3 px-6 rounded-lg flex items-center justify-center ${
              !cameraReady || faceStatus !== "ready" || isUploading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Processing..." : <><FiCamera className="mr-2" /> Capture Photo</>}
          </button>
        ) : (
          <>
            <button 
              onClick={retakePhoto}
              className="py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
            >
              <FiRotateCw className="mr-2" /> Retake
            </button>
            <button 
              onClick={() => onComplete?.(image)}
              className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center"
            >
              <FiCheck className="mr-2" /> Continue
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default RealFaceDetectionSelfie
