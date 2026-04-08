import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("መረጃ ለመቀበል ዝግጁ (Ready to Scan)");

  useEffect(() => {
    // 1. Initialize the Scanner
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText) {
      try {
        // Parse the JSON from the QR code
        const data = JSON.parse(decodedText);
        const studentId = data.studentId;

        setStatus("በመመዝገብ ላይ... (Saving...)");

        // 2. Send the scan to the Backend
        const response = await fetch('https://sunday-school-management-system.onrender.com/api/attendance/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId })
        });

        const result = await response.json();

        if (response.ok) {
          setScanResult(result.message);
          setStatus("ተሳክቷል! (Success)");
          // Beep sound or alert could go here
          setTimeout(() => {
            setScanResult(null);
            setStatus("ቀጣይ ተማሪ ይጠበቃል... (Waiting for next...)");
          }, 3000);
        } else {
          setStatus("ስህተት: " + result.message);
        }
      } catch (err) {
        console.error("Invalid QR Code");
      }
    }

    function onScanError(err) {
      // We don't want to alert every error, it scans many times per second
    }

    return () => scanner.clear(); // Cleanup when leaving page
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">የQR መገኘት መቆጣጠሪያ</h1>
      
      {/* The Camera Window */}
      <div id="reader" className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"></div>

      <div className="mt-8 w-full max-w-sm">
        <div className={`p-4 rounded-xl text-center font-bold ${scanResult ? 'bg-green-500' : 'bg-blue-600'}`}>
          {scanResult || status}
        </div>
        
        <p className="text-xs text-gray-400 mt-4 text-center">
          ጠቃሚ ምክር፦ ካሜራው እንዲሰራ ፍቃድ (Allow) ይስጡ
        </p>
      </div>
    </div>
  );
};

export default Scanner;