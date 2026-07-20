// import React, { useState, useEffect } from 'react';
// import { Html5QrcodeScanner } from 'html5-qrcode';

// const QRScanner = () => {
//   const [scanning, setScanning] = useState(false);
//   const [error, setError] = useState("");

//   const startScanner = async (e) => {
//     if (e) {
//       e.preventDefault();
//       e.stopPropagation();
//     }

//     setScanning(true);
//     setError("");

//     try {
//       const scanner = new Html5QrcodeScanner("reader", {
//         fps: 10,
//         qrbox: { width: 250, height: 250 },
//         rememberLastUsedCamera: false,
//         videoConstraints: {
//           facingMode: "environment"
//         }
//       });

//       scanner.render(async (decodedText) => {
//         console.log("QR Decoded:", decodedText);
//         scanner.clear();
//         setScanning(false);

//         try {
//           const res = await fetch('http://localhost:5000/api/attendance/scan', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ studentId: decodedText })
//           });
//           const data = await res.json();
//           if (res.ok) {
//             alert("ተመዝግቧል: " + (data.message || "Success"));
//           } else {
//             alert("Error: " + (data.message || "Failed"));
//           }
//         } catch (err) {
//           alert("Server Error: " + err.message);
//         }
//       }, (errorMessage) => {
//         // Silent
//       });
//     } catch (err) {
//       setError("Camera access failed. Please allow camera permissions.");
//       setScanning(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center space-y-4">
//       <div id="reader" className="w-full max-w-sm"></div>
//       {error && <p className="text-red-500">{error}</p>}
//       {!scanning && (
//         <button
//           onClick={startScanner}
//           className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
//         >
//           መረጃ ለመቀበል ዝግጁ (Ready to Scan)
//         </button>
//       )}
//     </div>
//   );
// };

// export default QRScanner;

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);

  const startScanner = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setScanning(true);
    setError("");

    // Use setTimeout to ensure <div id="reader"> is rendered in the DOM before attaching scanner
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: false,
          videoConstraints: {
            facingMode: "environment" // Uses back camera on mobile phones
          }
        });

        scannerRef.current = scanner;

        scanner.render(
          async (decodedText) => {
            console.log("QR Decoded:", decodedText);

            // Stop scanner once a code is successfully captured
            try {
              await scanner.clear();
            } catch (err) {
              console.warn("Scanner cleanup issue:", err);
            }
            setScanning(false);

            // Send decoded data to your live Render API endpoint
            try {
              const res = await fetch('https://church-api-3l2c.onrender.com/api/attendance/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: decodedText })
              });

              const data = await res.json();
              if (res.ok) {
                alert(data.message || "ተመዝግቧል (Success)");
              } else {
                alert("ስህተት (Error): " + (data.message || "Failed"));
              }
            } catch (err) {
              alert("የሰርቨር ስህተት (Server Error): " + err.message);
            }
          },
          (errorMessage) => {
            // Ignore frame-by-frame scanning errors silently
          }
        );
      } catch (err) {
        console.error("Scanner startup error:", err);
        setError("ካሜራ መክፈት አልተቻለም። እባክዎ ለካሜራ ፈቃድ ይስጡ። (Camera permission denied)");
        setScanning(false);
      }
    }, 100);
  };

  // Cleanup camera stream if the component closes or user navigates away
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div id="reader" className="w-full max-w-sm rounded-xl overflow-hidden"></div>
      
      {error && <p className="text-red-500 font-medium text-center">{error}</p>}
      
      {!scanning && (
        <button
          onClick={startScanner}
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition duration-200"
        >
          መረጃ ለመቀበል ዝግጁ (Ready to Scan)
        </button>
      )}
    </div>
  );
};

export default QRScanner;