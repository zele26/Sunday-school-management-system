import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const QRScanner = () => {
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleScanSuccess = async (decodedText) => {
    // Stop scanner after first scan
    const scanner = document.getElementById('reader');
    if (scanner) scanner.innerHTML = '';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/attendance/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ qrCode: decodedText })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message} - ${data.student.name}`);
      } else {
        setMessage(`❌ ${data.message}`);
      }
      setResult(data);
    } catch (err) {
      setMessage('Network error');
    }
  };

  const startScanner = () => {
    setMessage('');
    setResult(null);
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scanner.render(handleScanSuccess, (err) => console.warn(err));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Scan Student QR Code</h2>
      <button onClick={startScanner} className="bg-blue-600 text-white px-4 py-2 rounded-xl mb-4">
        Start Scanner
      </button>
      <div id="reader" style={{ width: '300px' }}></div>
      {message && <div className="mt-4 p-3 rounded-xl text-sm font-semibold">{message}</div>}
    </div>
  );
};

export default QRScanner;