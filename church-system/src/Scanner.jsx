import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const Scanner = () => {
  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    });

    scanner.render(onScanSuccess, onScanError);
  };

  async function onScanSuccess(decodedText) {
    // This sends the ID to your new Render URL!
    const response = await fetch('https://church-api-3l2c.onrender.com/api/attendance/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: decodedText })
    });
    const data = await response.json();
    alert(data.message);
  }

  return (
    <div className="flex flex-col items-center">
      <div id="reader" className="w-full max-w-md"></div>
      <button 
  onClick={startScanner} 
  style={{ position: 'relative', zIndex: 999, cursor: 'pointer' }}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-4"
>
  መረጃ ለመቀበል ዝግጁ (Ready to Scan)
</button>
    </div>
  );
};