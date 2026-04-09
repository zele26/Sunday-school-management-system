import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);

  const startScanner = (e) => {
    // Prevent the page from refreshing if it's inside a form
    e.preventDefault(); 
    
    console.log("Scanner starting...");
    setScanning(true);

    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    });

    scanner.render(onScanSuccess, (err) => {
      // We don't log errors here to keep the console clean
    });

    async function onScanSuccess(decodedText) {
      scanner.clear(); // Stop scanning after success
      try {
        const response = await fetch('https://church-api-3l2c.onrender.com/api/attendance/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: decodedText })
        });
        const data = await response.json();
        alert("ተመዝግቧል: " + data.message);
        setScanning(false);
      } catch (err) {
        alert("Error sending scan to server");
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* 1. The Camera Box - Make sure this is NOT overlapping the button */}
      <div id="reader" style={{ width: '100%', maxWidth: '400px', minHeight: scanning ? '300px' : '0px' }}></div>

      {/* 2. The Button - High Z-Index to stay on top */}
      {!scanning && (
        <button 
          onClick={startScanner}
          style={{ 
            position: 'relative', 
            zIndex: 9999, 
            cursor: 'pointer',
            marginTop: '20px',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
          className="hover:bg-blue-700 active:scale-95 shadow-lg"
        >
          መረጃ ለመቀበል ዝግጁ (Ready to Scan)
        </button>
      )}
    </div>
  );
};

export default QRScanner;