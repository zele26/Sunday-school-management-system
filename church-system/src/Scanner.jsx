import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);

  const startScanner = (e) => {
    // 1. Force prevent any parent component from stopping this click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    alert("Button logic triggered! Check if camera opens now.");
    setScanning(true);

    // We use a small delay to ensure the 'reader' div is rendered before the library looks for it
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      });

      scanner.render(async (decodedText) => {
        scanner.clear(); // Stop camera on success
        try {
          const res = await fetch('https://church-api-3l2c.onrender.com/api/attendance/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: decodedText })
          });
          const data = await res.json();
          alert("Success: " + data.message);
          setScanning(false);
        } catch (err) {
          alert("Server Error: " + err.message);
        }
      }, (err) => {
        // Silent error for failed frames
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