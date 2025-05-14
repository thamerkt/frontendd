import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiEdit2, FiDownload, FiPenTool } from "react-icons/fi";
import { FaSignature } from "react-icons/fa";
import ContractService from "../services/contractService";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20 },
};

const ContractSigner = () => {
  const canvasRef = useRef(null);
  const [contractText, setContractText] = useState("");
  const [signerName, setSignerName] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [contractData, setContractData] = useState(null);

  // Parse HTML to plain text
  const parseHtmlToText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove style and script elements
    const styles = tempDiv.getElementsByTagName('style');
    while (styles[0]) {
      styles[0].parentNode.removeChild(styles[0]);
    }
    
    const scripts = tempDiv.getElementsByTagName('script');
    while (scripts[0]) {
      scripts[0].parentNode.removeChild(scripts[0]);
    }
    
    // Replace divs with newlines
    const divs = tempDiv.getElementsByTagName('div');
    for (let i = 0; i < divs.length; i++) {
      if (divs[i].className !== 'signature-zone') {
        divs[i].insertAdjacentHTML('afterend', '\n\n');
      }
    }
    
    // Replace paragraphs with newlines
    const paragraphs = tempDiv.getElementsByTagName('p');
    for (let i = 0; i < paragraphs.length; i++) {
      paragraphs[i].insertAdjacentHTML('afterend', '\n\n');
    }
    
    // Get text content and clean up
    let text = tempDiv.textContent || tempDiv.innerText || '';
    text = text.replace(/\n{3,}/g, '\n\n'); // Replace multiple newlines with double newlines
    text = text.replace(/^\s+|\s+$/g, ''); // Trim whitespace
    
    return text;
  };

  // Fetch contract data on component mount
  useEffect(() => {
    const fetchContract = async () => {
      setIsLoading(true);
      try {
        const response = await ContractService.fetchContractById(6);
        setContractData(response);
        
        // Parse HTML contract text to plain text
        const plainText = parseHtmlToText(response.contract_text);
        setContractText(plainText);
      } catch (err) {
        console.error("Error fetching contract:", err);
        setError("Failed to load contract. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, []);

  // Initialize canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  // Signature drawing handlers
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
    }
    return [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
  };

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    const [x, y] = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const [x, y] = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignatureImage(null);
  };

  // Handle contract signing
  const handleSign = async () => {
    if (!signerName.trim()) return setError("Please enter your name.");

    const signatureBase64 = canvasRef.current.toDataURL("image/png");
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data;
    const isEmpty = [...imageData].every((val, i) => (i + 1) % 4 !== 0 ? val === 255 : true);

    if (isEmpty) return setError("Please draw your signature.");

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        status: "active",
        signed_date: new Date().toISOString().split('T')[0],
        client_name: contractData.client_name,
        owner_name: contractData.owner_name,
        total_value: contractData.total_value,
        start_date: contractData.start_date,
        end_date: contractData.end_date,
        signature_image: signatureBase64,
        owner_name: signerName
      };

      const res = await ContractService.updateContract(6, updateData);
      console.log(res);
      
      setIsSigned(true);
      setSignatureImage(signatureBase64);
      setResponseData(res);
      setContractData(prev => ({ ...prev, ...updateData }));
      console.log(contractData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error submitting signature.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadContract = () => {
    if (!contractText) return setError("No contract available to download.");

    const blob = new Blob([contractText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contract_${signerName || 'unsigned'}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setIsSigned(false);
    setSignerName("");
    setSignatureImage(null);
    setResponseData(null);
    clearCanvas();
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
          <motion.h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Digital Contract Signing
          </motion.h1>
          <p className="text-lg text-gray-600">Sign your documents securely online</p>
        </div>

        {isLoading && !contractData ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-12 w-12 text-teal-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Loading contract...</p>
          </div>
        ) : error && !contractData ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
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
                  {/* Contract Info */}
                  {contractData && (
                    <div className="mb-6 p-4 bg-teal-50 rounded-lg">
                      <h3 className="text-lg font-medium text-teal-800 mb-2">Contract Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Client:</span> {contractData.client_name}
                        </div>
                        <div>
                          <span className="text-gray-600">Value:</span> {contractData.total_value} TND
                        </div>
                        <div>
                          <span className="text-gray-600">Start Date:</span> {contractData.start_date}
                        </div>
                        <div>
                          <span className="text-gray-600">End Date:</span> {contractData.end_date}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signer Name */}
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

                  {/* Contract Preview */}
                  {contractText && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Contract Preview</h3>
                        <button 
                          onClick={downloadContract}
                          className="text-sm text-teal-600 hover:text-teal-800 flex items-center transition-colors"
                          aria-label="Download contract"
                        >
                          <FiDownload className="mr-1" /> Download
                        </button>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 h-64 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                        {contractText}
                      </div>
                    </div>
                  )}

                  {/* Signature Canvas */}
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

                  {/* Error Message */}
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

                  {/* Sign Button */}
                  <motion.button
                    onClick={handleSign}
                    disabled={isLoading || !signerName}
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

                  {contractData && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Contract Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Client:</span> {contractData.client_name}
                        </div>
                        <div>
                          <span className="text-gray-600">Value:</span> {contractData.total_value} TND
                        </div>
                        <div>
                          <span className="text-gray-600">Signed Date:</span> {contractData.signed_date}
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span> <span className="capitalize">{contractData.status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                      onClick={resetForm}
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
        )}
      </motion.div>
    </div>
  );
};

export default ContractSigner;