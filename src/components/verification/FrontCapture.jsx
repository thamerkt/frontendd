"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  FiCamera,
  FiRotateCw,
  FiArrowRight,
  FiUpload,
  FiCheck,
  FiPlay,
  FiVideo,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi"
import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import Cookies from "js-cookie"

const FrontCapture = ({ onNext, onCapture, onRetake, initialImage = null, currentStep = 2, totalSteps = 5 }) => {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [detectionStatus, setDetectionStatus] = useState("position")
  const [capturedImage, setCapturedImage] = useState(initialImage)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [streamActive, setStreamActive] = useState(false)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const [componentMounted, setComponentMounted] = useState(false)
  const [ip] = useState(Cookies.get("local_ip") || "")
  const [frameColor, setFrameColor] = useState("rgba(239, 68, 68, 0.7)") // Default red
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cardDetected, setCardDetected] = useState(false)
  
  const { user } = useParams()
  const navigate = useNavigate()

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionCanvasRef = useRef(null)
  const animationRef = useRef(null)
  const fileInputRef = useRef(null)
  const retryCountRef = useRef(0)

  // Enhanced environment check
  const checkEnvironment = useCallback(() => {
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("vusercontent.net")

    console.log("Environment check:", {
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      isSecure,
      userAgent: navigator.userAgent,
    })

    if (!isSecure) {
      throw new Error("Camera requires HTTPS connection")
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API not supported in this browser")
    }

    return true
  }, [])

  // Enhanced permission check
  const checkPermissions = useCallback(async () => {
    try {
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "camera" })
        console.log("Permission state:", permission.state)
        setHasPermission(permission.state === "granted")

        permission.onchange = () => {
          console.log("Permission changed to:", permission.state)
          setHasPermission(permission.state === "granted")
        }

        return permission.state
      }
    } catch (error) {
      console.log("Permissions check not supported, will request directly")
      setHasPermission(null)
      return "unknown"
    }
  }, [])

  // Request camera permission explicitly
  const requestCameraPermission = useCallback(async () => {
    console.log("🔐 Requesting camera permission explicitly...")
    setPermissionRequested(true)
    setError(null)

    try {
      const currentPermission = await checkPermissions()

      if (currentPermission === "granted") {
        console.log("✅ Permission already granted")
        return true
      }

      if (currentPermission === "denied") {
        throw new Error("Camera permission was denied. Please enable camera access in your browser settings.")
      }

      console.log("📱 Triggering permission prompt...")
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      })

      tempStream.getTracks().forEach((track) => track.stop())

      console.log("✅ Permission granted successfully")
      setHasPermission(true)
      return true
    } catch (error) {
      console.error("❌ Permission request failed:", error)

      let errorMessage = "Camera permission request failed"
      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera access denied. Please click 'Allow' when prompted, or enable camera access in your browser settings."
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device."
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Camera not supported in this browser."
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setHasPermission(false)
      return false
    }
  }, [checkPermissions])

  // Start camera function
  const startCamera = useCallback(async () => {
    console.log("🚀 Starting camera...")
    setIsLoading(true)
    setError(null)
    setCameraReady(false)
    setStreamActive(false)
    retryCountRef.current += 1

    try {
      checkEnvironment()

      if (!componentMounted) {
        throw new Error("Component not fully mounted yet")
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      if (!videoRef.current) {
        console.error("Video ref is null, waiting for element...")
        let attempts = 0
        while (!videoRef.current && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (!videoRef.current) {
          throw new Error("Video element not available after waiting")
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (!permissionRequested || hasPermission !== true) {
        const permissionGranted = await requestCameraPermission()
        if (!permissionGranted) {
          return
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("📹 Getting camera stream...")

      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: { ideal: "environment" },
          frameRate: { ideal: 30, min: 15 },
        },
      }

      let stream

      try {
        console.log("Trying back camera...")
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log("✅ Back camera stream obtained")
      } catch (error) {
        console.log("❌ Back camera failed, trying front camera...")
        const frontConstraints = {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: "user",
            frameRate: { ideal: 30, min: 15 },
          },
        }
        stream = await navigator.mediaDevices.getUserMedia(frontConstraints)
        console.log("✅ Front camera stream obtained")
      }

      if (!stream || !stream.active || stream.getVideoTracks().length === 0) {
        throw new Error("Failed to get valid video stream")
      }

      const videoTrack = stream.getVideoTracks()[0]
      console.log("📹 Video track details:", {
        label: videoTrack.label,
        enabled: videoTrack.enabled,
        readyState: videoTrack.readyState,
        settings: videoTrack.getSettings(),
      })

      streamRef.current = stream
      setStreamActive(true)

      const video = videoRef.current

      video.srcObject = null
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      video.controls = false

      const videoSetupPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup()
          reject(new Error("Video setup timeout after 15 seconds"))
        }, 15000)

        const cleanup = () => {
          clearTimeout(timeout)
          video.removeEventListener("loadedmetadata", onLoadedMetadata)
          video.removeEventListener("canplay", onCanPlay)
          video.removeEventListener("playing", onPlaying)
          video.removeEventListener("error", onError)
          video.removeEventListener("loadstart", onLoadStart)
        }

        const onLoadStart = () => {
          console.log("📺 Video load started")
        }

        const onLoadedMetadata = () => {
          console.log("📺 Video metadata loaded:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            duration: video.duration,
            readyState: video.readyState,
          })
        }

        const onCanPlay = () => {
          console.log("▶️ Video can play, attempting to start...")
          video.play().catch((playError) => {
            console.error("❌ Video play failed:", playError)
            cleanup()
            reject(new Error(`Video play failed: ${playError.message}`))
          })
        }

        const onPlaying = () => {
          console.log("🎬 Video is now playing!")
          setCameraReady(true)
          cleanup()
          resolve()
        }

        const onError = (event) => {
          console.error("❌ Video error:", event)
          cleanup()
          reject(new Error("Video element error"))
        }

        video.addEventListener("loadstart", onLoadStart)
        video.addEventListener("loadedmetadata", onLoadedMetadata)
        video.addEventListener("canplay", onCanPlay)
        video.addEventListener("playing", onPlaying)
        video.addEventListener("error", onError)

        console.log("🔗 Attaching stream to video element...")
        video.srcObject = stream
      })

      await videoSetupPromise

      setIsCameraActive(true)
      console.log("🎉 Camera initialization complete!")

      retryCountRef.current = 0
      startDetectionSimulation()
    } catch (err) {
      console.error("💥 Camera initialization failed:", err)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      let errorMessage = "Camera initialization failed"
      if (err.name === "NotAllowedError") {
        errorMessage = "Camera access denied. Please allow camera permissions and try again."
        setHasPermission(false)
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera found on this device."
      } else if (err.name === "NotSupportedError") {
        errorMessage = "Camera not supported in this browser."
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera is being used by another application."
      } else if (err.message) {
        errorMessage = err.message
      }

      if (retryCountRef.current < 3 && !err.message?.includes("denied")) {
        errorMessage += ` (Attempt ${retryCountRef.current}/3)`
      }

      setError(errorMessage)
      setStreamActive(false)
      setCameraReady(false)
    } finally {
      setIsLoading(false)
    }
  }, [checkEnvironment, requestCameraPermission, hasPermission, permissionRequested, componentMounted])

  // Stop camera function
  const stopCamera = useCallback(() => {
    console.log("🛑 Stopping camera...")

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log("🔌 Stopped track:", track.kind)
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load()
    }

    setIsCameraActive(false)
    setCameraReady(false)
    setStreamActive(false)
    retryCountRef.current = 0
  }, [])

  // Detection simulation with color changing frame
  const startDetectionSimulation = useCallback(() => {
    if (!videoRef.current || !detectionCanvasRef.current) return

    let detectionProgress = 0
    let lastUpdate = 0

    const detect = (timestamp) => {
      if (!videoRef.current || !detectionCanvasRef.current || !cameraReady) {
        animationRef.current = requestAnimationFrame(detect)
        return
      }

      const video = videoRef.current
      const canvas = detectionCanvasRef.current

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationRef.current = requestAnimationFrame(detect)
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Define the frame size (smaller than full screen)
      const frameWidth = Math.min(video.videoWidth * 0.8, 600) // Max width 600px or 80% of video width
      const frameHeight = frameWidth * 0.63 // Maintain aspect ratio (close to ID card)
      const frameX = (video.videoWidth - frameWidth) / 2
      const frameY = (video.videoHeight - frameHeight) / 2

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const pulse = 0.7 + 0.3 * Math.sin(timestamp / 300)

      // Simulate card detection - this would be replaced with actual detection logic
      const isCardDetected = timestamp % 5000 > 3000 // Simulates detection every 5 seconds
      setCardDetected(isCardDetected)

      // Update frame color based on detection status
      let newColor
      if (isCardDetected) {
        newColor = `rgba(34, 197, 94, ${pulse})` // Green when card detected
        setDetectionStatus("ready")
      } else {
        newColor = `rgba(239, 68, 68, ${pulse})` // Red when no card
        setDetectionStatus("position")
      }
      setFrameColor(newColor)

      // Draw the frame border
      ctx.strokeStyle = newColor
      ctx.lineWidth = 3
      ctx.setLineDash([8, 8])
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight)
      ctx.setLineDash([])

      // Corner markers
      const cornerSize = 20
      ctx.lineWidth = 4
      ctx.strokeStyle = ctx.strokeStyle.replace(/[\d.]+\)$/, "1)")

      // Draw corners
      const corners = [
        [frameX, frameY, frameX + cornerSize, frameY, frameX, frameY + cornerSize],
        [frameX + frameWidth - cornerSize, frameY, frameX + frameWidth, frameY, frameX + frameWidth, frameY + cornerSize],
        [frameX, frameY + frameHeight - cornerSize, frameX, frameY + frameHeight, frameX + cornerSize, frameY + frameHeight],
        [
          frameX + frameWidth - cornerSize,
          frameY + frameHeight,
          frameX + frameWidth,
          frameY + frameHeight,
          frameX + frameWidth,
          frameY + frameHeight - cornerSize,
        ],
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

      if (isCardDetected) {
        ctx.fillStyle = "rgba(34, 197, 94, 0.9)"
        ctx.font = "bold 18px Arial"
        ctx.fillText("Card detected! Ready to capture", video.videoWidth / 2, frameY + frameHeight + 40)
      }

      animationRef.current = requestAnimationFrame(detect)
    }

    animationRef.current = requestAnimationFrame(detect)
  }, [cameraReady])

  // Capture photo function with API calls
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
      const response1 = await axios.post(
        `https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/upload-image/`,
        formDataImage,
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
      formData.append("uploaded_by", localStorage.getItem("user") || "")
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

  const getStatusMessage = () => {
    if (!componentMounted) return "Loading interface..."
    if (!permissionRequested) return "Click 'Start Camera' to begin"
    if (!hasPermission) return "Camera permission required"
    if (!isCameraActive) return "Click 'Start Camera' to begin"
    if (isLoading) return "Starting camera..."
    if (!streamActive) return "Connecting to camera..."
    if (!cameraReady) return "Preparing video feed..."

    switch (detectionStatus) {
      case "position":
        return "Position your ID within the frame"
      case "aligned":
        return "Align your ID with the outline"
      case "ready":
        return "Perfect! Ready to capture"
      default:
        return "Position your ID"
    }
  }

  // Effects
  useEffect(() => {
    setComponentMounted(true)
    console.log("✅ Component mounted")

    checkPermissions()

    return () => {
      console.log("🧹 Component unmounting")
      stopCamera()
    }
  }, [checkPermissions, stopCamera])

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Front of ID Card</h2>
          <p className="text-sm sm:text-base text-gray-600">Ensure all details are clearly visible</p>

          {/* Progress Steps */}
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

            <div className="flex justify-between mt-2 px-1 text-center">
              {["Select", "Front", "Back", "Selfie", "Confirm"].map((label, index) => (
                <span
                  key={label}
                  className={`text-xs w-12 ${
                    index + 1 === currentStep
                      ? "font-medium text-blue-600"
                      : index + 1 < currentStep
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Notice */}
        {permissionRequested && hasPermission === false && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 mb-4 rounded-lg">
            <div className="flex items-start">
              <FiShield className="mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Camera Permission Required</p>
                <p className="text-sm mt-1">Please allow camera access when prompted by your browser.</p>
                <button
                  onClick={requestCameraPermission}
                  className="mt-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded transition-colors"
                >
                  Request Permission
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Camera/Image Display */}
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-gray-200">
          {/* Always-rendered video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive && cameraReady ? "block" : "hidden"}`}
            style={{
              transform: "scaleX(-1)", // Mirror effect for better UX
            }}
          />

          {/* Detection canvas overlay with color-changing frame */}
          {isCameraActive && cameraReady && (
            <canvas 
              ref={detectionCanvasRef} 
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                <p>Starting camera...</p>
                <p className="text-xs mt-2 opacity-75">
                  {!componentMounted ? "Loading interface..." : "Please allow camera access when prompted"}
                </p>
              </div>
            </div>
          )}

          {/* Upload progress indicator */}
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

          {/* Captured image */}
          {capturedImage && (
            <img
              src={capturedImage || "/placeholder.svg"}
              alt="Captured ID Front"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {/* Inactive camera state */}
          {!isCameraActive && !capturedImage && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center p-8">
                <FiVideo className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="mb-4 opacity-75">Camera not active</p>
                <button
                  onClick={startCamera}
                  disabled={isLoading || !componentMounted}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full flex items-center justify-center mx-auto transition-colors disabled:opacity-50"
                >
                  <FiPlay className="mr-2" /> Start Camera
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="mb-4 text-center">
          <p
            className={`text-sm font-medium ${
              capturedImage
                ? "text-green-600"
                : detectionStatus === "ready" && cameraReady
                  ? "text-green-600"
                  : detectionStatus === "aligned" && cameraReady
                    ? "text-yellow-500"
                    : "text-gray-500"
            }`}
          >
            {capturedImage ? "✅ Front captured successfully" : getStatusMessage()}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded-lg">
            <div className="flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Camera Error</p>
                <p className="text-sm mt-1">{error}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={startCamera}
                    disabled={retryCountRef.current >= 3}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {retryCountRef.current >= 3 ? "Max Retries" : "Retry Camera"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isCameraActive && !capturedImage ? (
            <>
              <button
                onClick={startCamera}
                disabled={isLoading || !componentMounted}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors ${
                  isLoading || !componentMounted
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
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
              <label className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors">
                <FiUpload className="mr-2" /> Upload Photo
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </>
          ) : capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors"
              >
                <FiRotateCw className="mr-2" /> Retake
              </button>
              <button
                onClick={() => navigate('/register/identity-verification/verification/back-document')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors"
              >
                Next <FiArrowRight className="ml-2" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors"
              >
                Stop
              </button>
              <button
                onClick={capturePhoto}
                disabled={!cameraReady || !streamActive || isSubmitting }
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors ${
                  !cameraReady || !streamActive || isSubmitting || !cardDetected
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : detectionStatus === "ready"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
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
