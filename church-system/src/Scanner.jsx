import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const startScanner = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setScanning(true);
    setError("");

    try {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: false,
        videoConstraints: {
          facingMode: "environment"
        }
      });

      scanner.render(async (decodedText) => {
        console.log("QR Decoded:", decodedText);
        scanner.clear();
        setScanning(false);

        try {
          const res = await fetch('https://church-api-3l2c.onrender.com/api/attendance/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: decodedText })
          });
          const data = await res.json();
          if (res.ok) {
            alert("ተመዝግቧል: " + (data.message || "Success"));
          } else {
            alert("Error: " + (data.message || "Failed"));
          }
        } catch (err) {
          alert("Server Error: " + err.message);
        }
      }, (errorMessage) => {
        // Silent
      });
    } catch (err) {
      setError("Camera access failed. Please allow camera permissions.");
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="reader" className="w-full max-w-sm"></div>
      {error && <p className="text-red-500">{error}</p>}
      {!scanning && (
        <button
          onClick={startScanner}
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
        >
          መረጃ ለመቀበል ዝግጁ (Ready to Scan)
        </button>
      )}
    </div>
  );
};

export default QRScanner;