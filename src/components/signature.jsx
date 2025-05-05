import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiEdit2, FiDownload, FiPenTool } from "react-icons/fi";
import { FaSignature } from "react-icons/fa";
import EquipmentService from "../services/EquipmentService";
import mammoth from "mammoth";
import { pdfjs } from 'react-pdf';






const ContractSigner = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [contractText, setContractText] = useState("");
  const [signerName, setSignerName] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20 }
  };

  const scaleUp = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } }
  };

  useEffect(() => {
    const fetchContractFromFile = async () => {
      try {
        const res2 = await EquipmentService.fetchRentalsmanagementbyid(30);
        const filePath = res2?.contract_required;
    
        if (!filePath) {
          setContractText("No contract file found.");
          return;
        }
    
        const extension = filePath.split(".").pop().toLowerCase();
    
        if (extension === "txt") {
          const fileRes = await axios.get(filePath, { responseType: "text" });
          let text = fileRes.data;
          if (signerName) text = text.replace(/\[Signer Name\]/g, signerName);
          setContractText(text);
    
        } else if (extension === "pdf") {
          const fileRes = await axios.get(filePath, { responseType: "arraybuffer" });
          const pdf = await pdfjs.getDocument({ data: fileRes.data }).promise;
    
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(" ");
            text += pageText + "\n\n";
          }
    
          if (signerName) text = text.replace(/\[Signer Name\]/g, signerName);
          setContractText(text);
    
        } else if (extension === "docx") {
          const fileRes = await axios.get(filePath, { responseType: "arraybuffer" });
          const result = await mammoth.extractRawText({ arrayBuffer: fileRes.data });
          let text = result.value;
          if (signerName) text = text.replace(/\[Signer Name\]/g, signerName);
          setContractText(text);
    
        } else {
          setContractText("Unsupported file format.");
        }
    
      } catch (err) {
        console.error("Failed to fetch contract from file:", err);
        setContractText("Error loading contract. Please try again later.");
      }
    };
    
    fetchContractFromFile();
  }, [signerName]);

  useEffect(() => {
    // Initialize canvas context
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    
    let x, y;
    if (e.nativeEvent) {
      x = e.nativeEvent.offsetX || e.nativeEvent.layerX - canvas.offsetLeft;
      y = e.nativeEvent.offsetY || e.nativeEvent.layerY - canvas.offsetTop;
    } else if (e.touches) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    let x, y;
    if (e.nativeEvent) {
      x = e.nativeEvent.offsetX || e.nativeEvent.layerX - canvas.offsetLeft;
      y = e.nativeEvent.offsetY || e.nativeEvent.layerY - canvas.offsetTop;
    } else if (e.touches) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0d9488"; // Teal color
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const getSignatureImage = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.toDataURL("image/png") : "";
  };

  const handleSign = async () => {
    if (!signerName.trim()) {
      setError("Please enter your name");
      return;
    }

    const signatureBase64 = getSignatureImage();
    if (!signatureBase64) {
      setError("Please provide a signature");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Signature canvas not available");
      return;
    }

    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const isEmpty = [...imageData].every((value) => value === 0 || value === 255);

    if (isEmpty) {
      setError("Please provide a signature");
      return;
    }

    setError(null);
    setIsLoading(true);

    const payload = {
      signer: signerName,
      contract_text: contractText,
      signature_image: signatureBase64,
    };

    try {
      const res = await axios.post("https://674c-165-50-136-134.ngrok-free.app/contracts/sign-contract/", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setIsSigned(true);
      setSignatureImage(signatureBase64);
      setResponseData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error submitting signature.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadContract = () => {
    if (!contractText) {
      setError("No contract text available to download");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([contractText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `contract_${signerName || 'unsigned'}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-3xl font-extrabold text-gray-900 mb-2"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Digital Contract Signing
          </motion.h1>
          <p className="text-lg text-gray-600">Sign your documents securely online</p>
        </div>

        <AnimatePresence mode="wait">
          {!isSigned ? (
            <motion.div
              key="sign-form"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white shadow-xl rounded-lg overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <label htmlFor="signer-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Full Name
                  </label>
                  <input
                    id="signer-name"
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition placeholder-gray-400"
                    placeholder="Enter your full name as it appears on the contract"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Contract Agreement</h3>
                    <button 
                      onClick={downloadContract}
                      className="text-sm text-teal-600 hover:text-teal-800 flex items-center transition-colors"
                      aria-label="Download contract"
                    >
                      <FiDownload className="mr-1" /> Download
                    </button>
                  </div>
                  <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 h-64 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                    {contractText || "Loading contract..."}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaSignature className="mr-2 text-teal-600" />
                      Draw Your Signature
                    </h3>
                    <button 
                      onClick={clearCanvas}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center transition-colors"
                      aria-label="Clear signature"
                    >
                      <FiX className="mr-1" /> Clear
                    </button>
                  </div>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="w-full h-48 border-2 border-gray-200 rounded-lg bg-white touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      aria-label="Signature canvas"
                    />
                    {!isDrawing && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-gray-400">Draw your signature above</p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  onClick={handleSign}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-lg shadow-md ${
                    isLoading ? 'bg-teal-400' : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600'
                  } transition-all disabled:opacity-70 flex items-center justify-center`}
                  aria-label={isLoading ? "Processing signature" : "Sign contract"}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FiPenTool className="mr-2" />
                      Sign Contract
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-white shadow-xl rounded-lg overflow-hidden text-center"
            >
              <div className="p-8">
                <motion.div 
                  className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FiCheck className="w-10 h-10 text-teal-600" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Signed Successfully</h2>
                <p className="text-gray-600 mb-6">Thank you <span className="font-semibold text-teal-600">{signerName}</span> for signing the contract.</p>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Your Signature</h3>
                  <div className="inline-block border-2 border-teal-100 rounded-lg p-2">
                    <img
                      src={signatureImage}
                      alt={`Signature of ${signerName}`}
                      className="h-20"
                    />
                  </div>
                </div>

                {responseData?.signature && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Digital Signature Hash</h3>
                    <p className="font-mono text-sm text-gray-800 break-all">
                      {responseData.signature.slice(0, 50)}...
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    onClick={() => {
                      setIsSigned(false);
                      setSignerName("");
                      setResponseData(null);
                      clearCanvas();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                    aria-label="Sign another contract"
                  >
                    <FiEdit2 className="mr-2" /> Sign Another Contract
                  </motion.button>
                  <motion.button
                    onClick={downloadContract}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    aria-label="Download signed contract"
                  >
                    <FiDownload className="mr-2" /> Download Contract
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ContractSigner;