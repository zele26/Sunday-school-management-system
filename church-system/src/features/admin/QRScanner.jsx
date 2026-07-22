// src/features/admin/QRScanner.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const QRScanner = () => {
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setMessage('');
    try {
      const scanner = new Html5Qrcode(videoRef.current.id);
      scannerRef.current = scanner;
      setScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Scan successful
          await scanner.stop();
          setScanning(false);
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/attendance/scan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ qrCode: decodedText }),
            });
            const data = await res.json();
            if (data.success) {
              setMessage(`✅ ${data.message} - ${data.student.name}`);
            } else {
              setMessage(`❌ ${data.message}`);
            }
          } catch (err) {
            setMessage('❌ Network error');
          }
        },
        () => {} // ignore errors
      );
    } catch (err) {
      setScanning(false);
      setMessage('❌ Camera access denied or not available. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {}
      scannerRef.current = null;
      setScanning(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Scan Student QR Code</h2>

      <div className="flex gap-3 mb-4">
        <button
          onClick={startScanner}
          disabled={scanning}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Start Scanner'}
        </button>
        {scanning && (
          <button
            onClick={stopScanner}
            className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {/* Video element – always rendered but hidden when not scanning */}
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <video
          id="qr-video"
          ref={videoRef}
          style={{
            width: '100%',
            height: scanning ? 'auto' : '0px',
            borderRadius: '12px',
            display: scanning ? 'block' : 'none',
          }}
          playsInline
          muted
        />
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-xl text-sm font-semibold ${
            message.startsWith('✅')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : message.startsWith('❌')
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-slate-50 text-slate-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default QRScanner;