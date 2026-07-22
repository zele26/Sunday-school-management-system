// src/features/admin/QRScanner.jsx
import React, { useState, useRef, useEffect, memo } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

// ------------------------------------------------------------------
// Stable scanner component – only renders once while scanning
// It does NOT re‑render when parent state changes, so the camera
// stays alive.
// ------------------------------------------------------------------
const CameraView = memo(({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },   // rear camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Stop after a successful scan
          scanner.stop().catch(() => {});
          onScanSuccess(decodedText);
        },
        () => {
          // Ignore non‑fatal scan errors (e.g., no QR in frame)
        }
      )
      .catch((err) => {
        onScanError(err.message || 'Camera access denied');
      });

    // Cleanup when this component unmounts (i.e., when scanning stops)
    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);   // empty dependency array → runs only once when mounted

  return <div id="reader" style={{ width: '100%', maxWidth: '400px' }} />;
});

// ------------------------------------------------------------------
// Main QR Scanner wrapper – handles buttons, messages, and
// decides when to mount the CameraView.
// ------------------------------------------------------------------
const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');

  const handleScanSuccess = async (decodedText) => {
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
    } finally {
      setScanning(false);   // camera will unmount, which triggers cleanup
    }
  };

  const handleScanError = (errorMessage) => {
    setMessage(`❌ ${errorMessage}`);
    setScanning(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Scan Student QR Code</h2>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setMessage('');
            setScanning(true);
          }}
          disabled={scanning}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Start Scanner'}
        </button>
        {scanning && (
          <button
            onClick={() => setScanning(false)}
            className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {/* Only mount the camera when scanning is true */}
      {scanning && (
        <CameraView
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
        />
      )}

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