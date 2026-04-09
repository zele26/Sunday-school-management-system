import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);

  const startScanner = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setScanning(true);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: false, // Set to false to force fresh settings
        // THIS IS THE KEY FIX FOR BACK CAMERA
        videoConstraints: {
          facingMode: "environment" 
        }
      });

      scanner.render(async (decodedText) => {
        // Success Logic
        console.log("QR Decoded:", decodedText);
        scanner.clear(); // Stop the camera
        
        try {
          const res = await fetch('https://church-api-3l2c.onrender.com/api/attendance/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: decodedText })
          });
          const data = await res.json();
          alert("ተመዝግቧል: " + (data.message || "Success"));
          setScanning(false);
        } catch (err) {
          alert("የአገልጋይ ስህተት (Server Error): " + err.message);
          setScanning(false);
        }
      }, (errorMessage) => {
        // Silent: This prevents "Scan Failed" alerts from popping up 
        // while the camera is still searching for a code.
      });
    }, 100);
  };

  return (
    <div style={{ position: 'relative', width: '100%', textAlign: 'center', padding: '20px' }}>
      {/* The Camera Box */}
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>

      {/* The Button - Guaranteed to be on top */}
      {!scanning && (
        <button 
          onClick={startScanner}
          style={{ 
            position: 'fixed', // Fixed makes it ignore other divs blocking it
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999, // Extremely high Z-index
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            border: 'none',
            display: 'block'
          }}
        >
          መረጃ ለመቀበል ዝግጁ (Ready to Scan)
        </button>
      )}
    </div>
  );
};

export default QRScanner;