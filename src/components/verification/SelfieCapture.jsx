"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { motion } from "framer-motion"
import axios from "axios"
import Cookies from "js-cookie"
import { FiCamera, FiRotateCw, FiCheck, FiAlertCircle, FiUser, FiPlay, FiVideo, FiShield } from "react-icons/fi"
import { removeImage } from "../redux/selfieSlice" // Adjust path as needed

const SelfieCapture = ({ onComplete, onRetake, currentStep = 4, totalSteps = 5 }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // State management
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("registrationProgress")) || {}
    } catch {
      return {}
    }
  })

  const [image, setImage] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [faceStatus, setFaceStatus] = useState("position")
  const [imageId, setImageId] = useState(null)
  const [ip, setIP] = useState(Cookies.get("local_ip"))
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [streamActive, setStreamActive] = useState(false)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const [componentMounted, setComponentMounted] = useState(false)

  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionCanvasRef = useRef(null)
  const animationRef = useRef(null)
  const retryCountRef = useRef(0)

  // Configuration for face detection zone
  const DETECTION_CONFIG = {
    width: 60, // % of video width
    height: 70, // % of video height
    x: 20, // % offset from left
    y: 15, // % offset from top
  }

  // Status messages and colors
  const STATUS_CONFIG = {
    position: {
      message: "Move your face into the frame",
      hint: "Make sure your entire face is visible",
      color: "red",
    },
    centered: {
      message: "Center your face in the frame",
      hint: "Keep your face aligned with the outline",
      color: "yellow",
    },
    ready: {
      message: "Perfect! Hold still",
      hint: "Ready to capture your selfie",
      color: "green",
    },
  }

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

      // Now try to get the actual stream - for selfie, we want front camera
      console.log("📹 Getting camera stream...")

      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user", // Front camera for selfie
          frameRate: { ideal: 30, min: 15 },
        },
      }

      let stream

      try {
        console.log("Trying front camera...")
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log("✅ Front camera stream obtained")
      } catch (error) {
        console.log("❌ Front camera failed, trying any available camera...")
        const anyConstraints = {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
        }
        stream = await navigator.mediaDevices.getUserMedia(anyConstraints)
        console.log("✅ Camera stream obtained")
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

      // Start face detection simulation
      startFaceDetectionSimulation()
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

  // Face detection simulation
  const startFaceDetectionSimulation = useCallback(() => {
    if (!videoRef.current || !detectionCanvasRef.current || !cameraReady) return

    let detectionState = 0
    let lastUpdate = 0

    const detectFace = (timestamp) => {
      if (!videoRef.current || !detectionCanvasRef.current || !cameraReady) {
        animationRef.current = requestAnimationFrame(detectFace)
        return
      }

      const video = videoRef.current
      const canvas = detectionCanvasRef.current

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationRef.current = requestAnimationFrame(detectFace)
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Calculate detection zone
      const { width, height, x, y } = DETECTION_CONFIG
      const zoneWidth = (video.videoWidth * width) / 100
      const zoneHeight = (video.videoHeight * height) / 100
      const zoneX = (video.videoWidth * x) / 100
      const zoneY = (video.videoHeight * y) / 100

      // Clear and draw detection zone
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const pulse = 0.7 + 0.3 * Math.sin(timestamp / 300)
      const statusColor = STATUS_CONFIG[faceStatus].color

      ctx.strokeStyle =
        statusColor === "red"
          ? `rgba(239, 68, 68, ${pulse})`
          : statusColor === "yellow"
            ? `rgba(234, 179, 8, ${pulse})`
            : `rgba(16, 185, 129, ${pulse})`

      ctx.lineWidth = 3
      ctx.setLineDash([8, 8])
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight)
      ctx.setLineDash([])

      // Draw face oval guide
      const centerX = zoneX + zoneWidth / 2
      const centerY = zoneY + zoneHeight / 2
      const radiusX = zoneWidth * 0.4
      const radiusY = zoneHeight * 0.5

      ctx.beginPath()
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
      ctx.strokeStyle = ctx.strokeStyle.replace(/[\d.]+\)$/, "0.6)")
      ctx.stroke()

      // Corner markers for better visual guidance
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

      // Simulate face detection states
      if (timestamp - lastUpdate > 2000) {
        detectionState = (detectionState + 1) % 3
        lastUpdate = timestamp
        setFaceStatus(["position", "centered", "ready"][detectionState])
      }

      animationRef.current = requestAnimationFrame(detectFace)
    }

    animationRef.current = requestAnimationFrame(detectFace)
  }, [faceStatus, cameraReady, DETECTION_CONFIG])

  // Capture photo function
  const capturePhoto = async () => {
    if (!isCameraActive || !cameraReady || !streamActive) {
      setError("Camera is not ready. Please wait or restart the camera.")
      return
    }

    if (faceStatus !== "ready") {
      setError("Please align your face properly before capturing")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Video stream is not ready. Please wait and try again.")
      return
    }

    let newImageId = null
    try {
      setIsSubmitting(true)
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
      try {
        const formData = new FormData()
        formData.append("selfie", file)

        const response = await axios.post(`https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/selfie/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (response.data?.status !== "success") {
          console.warn("API returned non-success status:", response.data)
        }

        // Upload document metadata
        const documentFormData = new FormData()
        documentFormData.append("document_name", "Selfie")
        documentFormData.append("status", "pending")
        documentFormData.append("document_url", file)
        documentFormData.append("uploaded_by", localStorage.getItem("user"))
        documentFormData.append("document_type", "1")
        documentFormData.append("submission_date", new Date().toISOString())
        documentFormData.append("file", file)

        const documentResponse = await axios.post(
          `https://kong-7e283b39dauspilq0.kongcloud.dev/ocr/document/`,
          documentFormData,
          { headers: { "Content-Type": "multipart/form-data" } },
        )

        console.log("Upload successful:", documentResponse.data)
      } catch (apiError) {
        console.error("API Error:", apiError)
        setError("Failed to upload to server, but your selfie has been saved locally.")
      }

      // Success handling
      setImage(imageData)
      stopCamera()
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "An error occurred while capturing")
      if (newImageId) {
        localStorage.removeItem("selfie")
        setImageId(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const retakePhoto = () => {
    if (imageId) {
      dispatch(removeImage(imageId))
    }
    setImage(null)
    setError(null)
    setImageId(null)
    if (onRetake) onRetake()
    startCamera()
  }

  const handleContinue = () => {
    onComplete?.(image)
    const updatedProgress = {
      step: 5,
      subStep: 5,
      phase: "identity_verification",
      subPhase: "complete",
    }
    localStorage.setItem("registrationProgress", JSON.stringify(updatedProgress))
    setProgress(updatedProgress)
    navigate("/register/identity-verification/verification/verification-complete")
  }

  // Get current status configuration
  const currentStatus = STATUS_CONFIG[faceStatus] || STATUS_CONFIG.position

  // Effects
  useEffect(() => {
    // Mark component as mounted
    setComponentMounted(true)
    console.log("✅ Component mounted")

    // Get IP from URL if available
    const url = new URL(window.location.href)
    const hostname = url.hostname
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/
    if (ipv4Regex.test(hostname)) {
      setIP(hostname)
    }

    // Check permissions
    checkPermissions()

    return () => {
      console.log("🧹 Component unmounting")
      stopCamera()
    }
  }, [checkPermissions, stopCamera])

  // Start camera automatically when component is mounted
  useEffect(() => {
    if (componentMounted && !image && !isCameraActive && !isLoading) {
      startCamera()
    }
  }, [componentMounted, image, isCameraActive, isLoading, startCamera])

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      >
        {/* Header and Progress Stepper */}
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Face Verification</h2>
          <p className="text-sm sm:text-base text-gray-600">Align your face with the outline</p>

          <div className="mt-6 overflow-x-auto px-2">
            <div className="flex justify-center min-w-max">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
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

                  {step < totalSteps && (
                    <div className={`h-1 w-6 ${step < currentStep ? "bg-green-100" : "bg-gray-200"}`} />
                  )}
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

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Camera Preview */}
        <div className="relative aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-gray-200">
          {/* Always-rendered video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive && cameraReady ? "block" : "hidden"}`}
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
          {image && (
            <img
              src={image || "/placeholder.svg"}
              alt="Captured selfie"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Inactive camera state */}
          {!isCameraActive && !image && !isLoading && (
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

        {/* Status Indicator */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            currentStatus.color === "red"
              ? "bg-red-50 border-l-4 border-red-500"
              : currentStatus.color === "yellow"
                ? "bg-yellow-50 border-l-4 border-yellow-500"
                : "bg-green-50 border-l-4 border-green-500"
          }`}
        >
          <div className="flex items-start">
            {faceStatus === "ready" ? (
              <FiCheck
                className={`${
                  currentStatus.color === "red"
                    ? "text-red-500"
                    : currentStatus.color === "yellow"
                      ? "text-yellow-500"
                      : "text-green-500"
                } mr-3 mt-0.5`}
              />
            ) : (
              <FiUser
                className={`${
                  currentStatus.color === "red"
                    ? "text-red-500"
                    : currentStatus.color === "yellow"
                      ? "text-yellow-500"
                      : "text-green-500"
                } mr-3 mt-0.5`}
              />
            )}
            <div>
              <p
                className={`font-medium ${
                  currentStatus.color === "red"
                    ? "text-red-700"
                    : currentStatus.color === "yellow"
                      ? "text-yellow-700"
                      : "text-green-700"
                }`}
              >
                {currentStatus.message}
              </p>
              {currentStatus.hint && <p className="text-sm text-gray-600 mt-1">{currentStatus.hint}</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {!image ? (
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || !cameraReady || !streamActive || faceStatus !== "ready" || isSubmitting}
              className={`py-3 px-6 rounded-lg flex items-center justify-center transition-colors ${
                !isCameraActive || !cameraReady || !streamActive || faceStatus !== "ready" || isSubmitting
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiCamera className="mr-2" />
                  Capture Photo
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FiRotateCw className="mr-2" />
                Retake Photo
              </button>
              <button
                onClick={handleContinue}
                className="py-3 px-6 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
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
