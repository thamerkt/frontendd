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

  // Enhanced debug function
  const debugCameraState = useCallback(() => {
    const info = {
      componentMounted,
      isCameraActive,
      cameraReady,
      streamActive,
      hasPermission,
      permissionRequested,
      videoElement: !!videoRef.current,
      streamRef: !!streamRef.current,
      retryCount: retryCountRef.current,
      environment: {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 100),
      },
    }

    if (videoRef.current) {
      const video = videoRef.current
      info.video = {
        paused: video.paused,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        srcObject: !!video.srcObject,
        autoplay: video.autoplay,
        muted: video.muted,
        playsInline: video.playsInline,
        offsetWidth: video.offsetWidth,
        offsetHeight: video.offsetHeight,
        style: video.style.cssText,
      }
    } else {
      info.video = "Video element not found"
    }

    if (streamRef.current) {
      info.stream = {
        active: streamRef.current.active,
        tracks: streamRef.current.getVideoTracks().map((track) => ({
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings(),
        })),
      }
    }

    console.group("🎥 Camera Debug Info")
    console.table(info)
    console.groupEnd()

    setDebugInfo(JSON.stringify(info, null, 2))
    return info
  }, [componentMounted, isCameraActive, cameraReady, streamActive, hasPermission, permissionRequested])

  // Request camera permission explicitly
  const requestCameraPermission = useCallback(async () => {
    console.log("🔐 Requesting camera permission explicitly...")
    setPermissionRequested(true)
    setError(null)

    try {
      // First check current permission state
      const currentPermission = await checkPermissions()

      if (currentPermission === "granted") {
        console.log("✅ Permission already granted")
        return true
      }

      if (currentPermission === "denied") {
        throw new Error("Camera permission was denied. Please enable camera access in your browser settings.")
      }

      // Try to get user media to trigger permission prompt
      console.log("📱 Triggering permission prompt...")
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      })

      // Immediately stop the temporary stream
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
      // Environment check
      checkEnvironment()

      // Check if component is mounted
      if (!componentMounted) {
        throw new Error("Component not fully mounted yet")
      }

      // Wait a bit for DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check video element availability
      if (!videoRef.current) {
        console.error("Video ref is null, waiting for element...")
        // Try to wait for the element
        let attempts = 0
        while (!videoRef.current && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (!videoRef.current) {
          throw new Error("Video element not available after waiting")
        }
      }

      console.log("✅ Video element confirmed available:", {
        element: !!videoRef.current,
        offsetWidth: videoRef.current.offsetWidth,
        offsetHeight: videoRef.current.offsetHeight,
      })

      // Clear any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Check/request permission first
      if (!permissionRequested || hasPermission !== true) {
        const permissionGranted = await requestCameraPermission()
        if (!permissionGranted) {
          return // Error already set in requestCameraPermission
        }
      }

      // Wait a bit for permission to settle
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Now try to get the actual stream
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

      // Verify stream
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

      // Store stream
      streamRef.current = stream
      setStreamActive(true)

      // Get video element reference
      const video = videoRef.current

      // Reset and configure video element
      video.srcObject = null
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      video.controls = false

      // Create promise for video setup
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

        // Add event listeners
        video.addEventListener("loadstart", onLoadStart)
        video.addEventListener("loadedmetadata", onLoadedMetadata)
        video.addEventListener("canplay", onCanPlay)
        video.addEventListener("playing", onPlaying)
        video.addEventListener("error", onError)

        // Set the stream
        console.log("🔗 Attaching stream to video element...")
        video.srcObject = stream
      })

      await videoSetupPromise

      setIsCameraActive(true)
      console.log("🎉 Camera initialization complete!")

      // Reset retry count on success
      retryCountRef.current = 0

      // Start detection simulation
      startDetectionSimulation()
    } catch (err) {
      console.error("💥 Camera initialization failed:", err)

      // Clean up on error
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

      // Add retry suggestion for certain errors
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

  // Detection simulation
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

      const zoneWidth = (video.videoWidth * 80) / 100
      const zoneHeight = (video.videoHeight * 60) / 100
      const zoneX = (video.videoWidth - zoneWidth) / 2
      const zoneY = (video.videoHeight - zoneHeight) / 2

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const pulse = 0.7 + 0.3 * Math.sin(timestamp / 300)

      ctx.strokeStyle =
        detectionStatus === "ready"
          ? `rgba(34, 197, 94, ${pulse})`
          : detectionStatus === "aligned"
            ? `rgba(234, 179, 8, ${pulse})`
            : `rgba(239, 68, 68, ${pulse})`

      ctx.lineWidth = 3
      ctx.setLineDash([8, 8])
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight)
      ctx.setLineDash([])

      // Corner markers
      const cornerSize = 20
      ctx.lineWidth = 4
      ctx.strokeStyle = ctx.strokeStyle.replace(/[\d.]+\)$/, "1)")

      // Draw corners
      const corners = [
        [zoneX, zoneY, zoneX + cornerSize, zoneY, zoneX, zoneY + cornerSize],
        [zoneX + zoneWidth - cornerSize, zoneY, zoneX + zoneWidth, zoneY, zoneX + zoneWidth, zoneY + cornerSize],
        [zoneX, zoneY + zoneHeight - cornerSize, zoneX, zoneY + zoneHeight, zoneX + cornerSize, zoneY + zoneHeight],
        [
          zoneX + zoneWidth - cornerSize,
          zoneY + zoneHeight,
          zoneX + zoneWidth,
          zoneY + zoneHeight,
          zoneX + zoneWidth,
          zoneY + zoneHeight - cornerSize,
        ],
      ]

      corners.forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.stroke()
      })

      if (timestamp - lastUpdate > 1500) {
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
      setCapturedImage(imageData)

      if (onCapture) onCapture(imageData)

      console.log("📸 Photo captured successfully")
    } catch (err) {
      console.error("📸 Capture failed:", err)
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

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      setCapturedImage(result)
      if (onCapture) onCapture(result)
    }
    reader.readAsDataURL(file)
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
    // Mark component as mounted
    setComponentMounted(true)
    console.log("✅ Component mounted")

    // Check permissions
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

          {/* Detection canvas overlay */}
          {isCameraActive && cameraReady && (
            <canvas ref={detectionCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
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
                  <button
                    onClick={debugCameraState}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    Debug Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <details className="mb-4">
            <summary className="text-xs text-gray-500 cursor-pointer">Debug Information</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-32">{debugInfo}</pre>
          </details>
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
                onClick={() => {
                  if (onNext) onNext()
                }}
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
                disabled={!cameraReady || !streamActive || isSubmitting}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center font-medium transition-colors ${
                  !cameraReady || !streamActive || isSubmitting
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
