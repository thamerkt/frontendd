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
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"

const BackCaptureWithFrame = ({
  onNext,
  onCapture,
  onRetake,
  initialImage = null,
  currentStep = 3,
  totalSteps = 5,
}) => {
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
  const [showUploadOption, setShowUploadOption] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionCanvasRef = useRef(null)
  const animationRef = useRef(null)
  const fileInputRef = useRef(null)
  const retryCountRef = useRef(0)
  const navigate = useNavigate()
  const [ip, setIP] = useState(Cookies.get("local_ip"))

  const [progress, setProgress] = useState(() => {
    const savedProgress = JSON.parse(localStorage.getItem("registrationProgress") || "{}")
    return savedProgress
  })

  const activeStep = currentStep || progress?.step || 3

  // Enhanced environment check
  const checkEnvironment = useCallback(() => {
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("vusercontent.net")

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
        setHasPermission(permission.state === "granted")

        permission.onchange = () => {
          setHasPermission(permission.state === "granted")
        }

        return permission.state
      }
    } catch (error) {
      setHasPermission(null)
      return "unknown"
    }
  }, [])

  // Request camera permission explicitly
  const requestCameraPermission = useCallback(async () => {
    setPermissionRequested(true)
    setError(null)

    try {
      const currentPermission = await checkPermissions()

      if (currentPermission === "granted") {
        return true
      }

      if (currentPermission === "denied") {
        throw new Error("Camera permission was denied. Please enable camera access in your browser settings.")
      }

      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      })

      tempStream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
      return true
    } catch (error) {
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
      setShowUploadOption(true)
      return false
    }
  }, [checkPermissions])

  // Start camera function
  const startCamera = useCallback(async () => {
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
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (error) {
        const frontConstraints = {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: "user",
            frameRate: { ideal: 30, min: 15 },
          },
        }
        stream = await navigator.mediaDevices.getUserMedia(frontConstraints)
      }

      if (!stream || !stream.active || stream.getVideoTracks().length === 0) {
        throw new Error("Failed to get valid video stream")
      }

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
        }

        const onLoadedMetadata = () => {
          console.log("Video metadata loaded")
        }

        const onCanPlay = () => {
          video.play().catch((playError) => {
            cleanup()
            reject(new Error(`Video play failed: ${playError.message}`))
          })
        }

        const onPlaying = () => {
          setCameraReady(true)
          cleanup()
          resolve()
        }

        const onError = (event) => {
          cleanup()
          reject(new Error("Video element error"))
        }

        video.addEventListener("loadedmetadata", onLoadedMetadata)
        video.addEventListener("canplay", onCanPlay)
        video.addEventListener("playing", onPlaying)
        video.addEventListener("error", onError)

        video.srcObject = stream
      })

      await videoSetupPromise

      setIsCameraActive(true)
      retryCountRef.current = 0
      startDetectionSimulation()
    } catch (err) {
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
      setShowUploadOption(true)
    } finally {
      setIsLoading(false)
    }
  }, [checkEnvironment, requestCameraPermission, hasPermission, permissionRequested, componentMounted])

  // Stop camera function
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
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

  // Enhanced detection simulation with prominent red frame
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

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate frame dimensions for ID card back
      const frameWidth = (canvas.width * 75) / 100 // 75% of video width
      const frameHeight = (canvas.height * 50) / 100 // 50% of video height
      const frameX = (canvas.width - frameWidth) / 2
      const frameY = (canvas.height - frameHeight) / 2

      // Animation pulse effect
      const pulse = 0.8 + 0.2 * Math.sin(timestamp / 400)

      // Determine frame color based on detection status
      let frameColor
      switch (detectionStatus) {
        case "ready":
          frameColor = `rgba(34, 197, 94, ${pulse})` // Green
          break
        case "aligned":
          frameColor = `rgba(251, 191, 36, ${pulse})` // Yellow
          break
        default:
          frameColor = `rgba(239, 68, 68, ${pulse})` // Red
      }

      // Draw main frame rectangle with thick red lines
      ctx.strokeStyle = frameColor
      ctx.lineWidth = 4
      ctx.setLineDash([])
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight)

      // Draw corner brackets for better visual guidance
      const cornerLength = 30
      const cornerThickness = 6

      ctx.lineWidth = cornerThickness
      ctx.strokeStyle = frameColor.replace(/[\d.]+\)$/, "1)") // Full opacity for corners

      // Top-left corner
      ctx.beginPath()
      ctx.moveTo(frameX, frameY + cornerLength)
      ctx.lineTo(frameX, frameY)
      ctx.lineTo(frameX + cornerLength, frameY)
      ctx.stroke()

      // Top-right corner
      ctx.beginPath()
      ctx.moveTo(frameX + frameWidth - cornerLength, frameY)
      ctx.lineTo(frameX + frameWidth, frameY)
      ctx.lineTo(frameX + frameWidth, frameY + cornerLength)
      ctx.stroke()

      // Bottom-left corner
      ctx.beginPath()
      ctx.moveTo(frameX, frameY + frameHeight - cornerLength)
      ctx.lineTo(frameX, frameY + frameHeight)
      ctx.lineTo(frameX + cornerLength, frameY + frameHeight)
      ctx.stroke()

      // Bottom-right corner
      ctx.beginPath()
      ctx.moveTo(frameX + frameWidth - cornerLength, frameY + frameHeight)
      ctx.lineTo(frameX + frameWidth, frameY + frameHeight)
      ctx.lineTo(frameX + frameWidth, frameY + frameHeight - cornerLength)
      ctx.stroke()

      // Add center crosshairs for alignment
      const centerX = frameX + frameWidth / 2
      const centerY = frameY + frameHeight / 2
      const crosshairLength = 20

      ctx.lineWidth = 2
      ctx.strokeStyle = frameColor.replace(/[\d.]+\)$/, "0.6)")

      // Horizontal crosshair
      ctx.beginPath()
      ctx.moveTo(centerX - crosshairLength, centerY)
      ctx.lineTo(centerX + crosshairLength, centerY)
      ctx.stroke()

      // Vertical crosshair
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - crosshairLength)
      ctx.lineTo(centerX, centerY + crosshairLength)
      ctx.stroke()

      // Add text overlay for guidance
      ctx.font = "16px Arial"
      ctx.fillStyle = frameColor.replace(/[\d.]+\)$/, "0.9)")
      ctx.textAlign = "center"

      const instructionText =
        detectionStatus === "ready"
          ? "READY TO CAPTURE"
          : detectionStatus === "aligned"
            ? "ALIGN ID CARD"
            : "POSITION ID CARD"

      ctx.fillText(instructionText, centerX, frameY - 20)

      // Simulate detection state changes
      if (timestamp - lastUpdate > 2000) {
        detectionProgress = (detectionProgress + 0.33) % 1
        lastUpdate = timestamp

        if (detectionProgress < 0.33) {
          setDetectionStatus("position")
        } else if (detectionProgress < 0.66) {
          setDetectionStatus("aligned")
        } else {
          setDetectionStatus("ready")
        }
      }

      animationRef.current = requestAnimationFrame(detect)
    }

    animationRef.current = requestAnimationFrame(detect)
  }, [detectionStatus, cameraReady])

  // Capture photo function
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
        formData.append("uploaded_by", localStorage.getItem("user"))
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

  const handleRetake = () => {
    setCapturedImage(null)
    if (onRetake) onRetake()
    stopCamera()
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const result = event.target.result

        try {
          const blob = await (await fetch(result)).blob()
          const apiFile = new File([blob], "national_id_backend.jpg", { type: "image/jpeg" })

          const formData = new FormData()
          formData.append("document_name", "National ID Back")
          formData.append("status", "pending")
          formData.append("document_url", apiFile)
          formData.append("uploaded_by", localStorage.getItem("user"))
          formData.append("document_type", "1")
          formData.append("submission_date", new Date().toISOString())
          formData.append("file", apiFile)

          await axios.post(`https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/document/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        } catch (err) {
          console.error("Document API error:", err.response?.data || err.message)
          setError("Failed to save document. Please try again.")
        }

        setCapturedImage(result)
        if (onCapture) onCapture(result)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("File upload error:", err)
      setError("Failed to process uploaded file.")
    } finally {
      setIsLoading(false)
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
        return "Position the back of your ID within the red frame"
      case "aligned":
        return "Align the ID card with the frame outline"
      case "ready":
        return "Perfect! Ready to capture"
      default:
        return "Position your ID back"
    }
  }

  const handleNext = () => {
    navigate("/register/identity-verification/verification/selfie")
  }

  // Effects
  useEffect(() => {
    setComponentMounted(true)
    checkPermissions()

    const url = new URL(window.location.href)
    const hostname = url.hostname
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/
    if (ipv4Regex.test(hostname)) {
      setIP(hostname)
    }

    return () => {
      stopCamera()
    }
  }, [checkPermissions, stopCamera])

  useEffect(() => {
    if (!capturedImage && componentMounted && !isCameraActive && !isLoading) {
      startCamera()
    }
  }, [capturedImage, componentMounted, isCameraActive, isLoading, startCamera])

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
          <p className="text-sm sm:text-base text-gray-600">Position your ID within the red frame</p>

          {/* Progress Stepper */}
          <div className="mt-6 overflow-x-auto px-2">
            <div className="flex justify-center min-w-max">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step < activeStep
                        ? "bg-green-100 text-green-600"
                        : step === activeStep
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step < activeStep ? <FiCheck size={14} /> : step}
                  </div>
                  {step < 5 && <div className={`h-1 w-6 ${step < activeStep ? "bg-green-100" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-2 px-1 text-center">
              {["Select", "Front", "Back", "Selfie", "Confirm"].map((label, index) => (
                <span
                  key={label}
                  className={`text-xs w-12 ${
                    index + 1 === activeStep
                      ? "font-medium text-blue-600"
                      : index + 1 < activeStep
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

        {/* Camera/Image Display with Red Frame Overlay */}
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-gray-200">
          {/* Always-rendered video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive && cameraReady ? "block" : "hidden"}`}
          />

          {/* Red Frame Detection Canvas Overlay */}
          {isCameraActive && cameraReady && (
            <canvas ref={detectionCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-75 z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                <p>Starting camera...</p>
                <p className="text-xs mt-2 opacity-75">
                  {!componentMounted ? "Loading interface..." : "Please allow camera access when prompted"}
                </p>
              </div>
            </div>
          )}

          {/* Captured image */}
          {capturedImage && (
            <img
              src={capturedImage || "/placeholder.svg"}
              alt="Captured ID Back"
              className="absolute inset-0 w-full h-full object-contain z-10"
            />
          )}

          {/* Inactive camera state */}
          {!isCameraActive && !capturedImage && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white z-20">
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
                    : "text-red-500"
            }`}
          >
            {capturedImage ? "✅ Back captured successfully" : getStatusMessage()}
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
          {(!isCameraActive && !capturedImage) || showUploadOption ? (
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
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors"
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
                disabled={!cameraReady || !streamActive || isSubmitting || detectionStatus !== "ready"}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors ${
                  !cameraReady || !streamActive || isSubmitting || detectionStatus !== "ready"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
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
                    <FiCamera className="mr-2" /> Capture Back
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

export default BackCaptureWithFrame
