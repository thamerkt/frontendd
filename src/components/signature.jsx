import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ContractSigner = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [contractText, setContractText] = useState("");
  const [signerName, setSignerName] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    setContractText(`
    CONTRACT AGREEMENT

    This Agreement is made and entered into as of ${new Date().toLocaleDateString()} by and between:

    Party A: [Your Company Name]
    Party B: ${signerName || "[Signer Name]"}

    Terms & Conditions...

    Signed on: ${new Date().toLocaleDateString()}
    `);
  }, [signerName]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    const x = e.nativeEvent?.offsetX ?? e.touches[0].clientX - canvas.getBoundingClientRect().left;
    const y = e.nativeEvent?.offsetY ?? e.touches[0].clientY - canvas.getBoundingClientRect().top;
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const x = e.nativeEvent?.offsetX ?? e.touches[0].clientX - canvas.getBoundingClientRect().left;
    const y = e.nativeEvent?.offsetY ?? e.touches[0].clientY - canvas.getBoundingClientRect().top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const getSignatureImage = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL("image/png");
  };

  const handleSign = async () => {
    if (!signerName.trim()) {
      alert("Please enter your name");
      return;
    }

    const signatureBase64 = getSignatureImage();
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data;
    const isEmpty = [...imageData].every((value) => value === 0);

    if (isEmpty) {
      alert("Please provide a signature.");
      return;
    }

    const payload = {
      signer: signerName,
      contract_text: contractText,
      signature_image: signatureBase64,
    };

    try {
      const res = await axios.post("http://localhost:8000/contracts/sign-contract/", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setIsSigned(true);
      setSignatureImage(signatureBase64);
      setResponseData(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Error submitting signature.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Digital Contract Signing</h1>

      {!isSigned ? (
        <>
          <label className="block mb-2">Your Name:</label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter your full name"
          />

          <div className="border p-4 bg-gray-50 mb-4 rounded max-h-64 overflow-y-auto whitespace-pre-wrap">
            {contractText}
          </div>

          <h3 className="mb-2">Draw Your Signature:</h3>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="border bg-white mb-2"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              startDrawing(e);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(e);
            }}
            onTouchEnd={stopDrawing}
          />

          <div className="flex gap-2 mb-4">
            <button onClick={clearCanvas} className="bg-red-500 text-white px-4 py-2 rounded">
              Clear Signature
            </button>
            <button onClick={handleSign} className="bg-green-600 text-white px-4 py-2 rounded flex-1">
              Submit Signature
            </button>
          </div>
        </>
      ) : (
        <div className="bg-green-100 p-6 rounded text-center">
          <h2 className="text-green-700 text-xl mb-2">✓ Contract Signed Successfully</h2>
          <p className="mb-4">Thank you <strong>{signerName}</strong>.</p>

          <img
            src={signatureImage}
            alt="Signature"
            className="mx-auto border mt-4"
            style={{ maxHeight: "120px" }}
          />

          {responseData?.signature && (
            <pre className="text-left mt-4 p-2 bg-white border rounded overflow-x-auto text-sm">
              Signature hash: {responseData.signature.slice(0, 50)}...
            </pre>
          )}

          <button
            onClick={() => {
              setIsSigned(false);
              setSignerName("");
              setResponseData(null);
              clearCanvas();
            }}
            className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
          >
            Sign Another Contract
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractSigner;
