// src/pages/ContinueRegistration.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const ContinueRegistration = () => {
  const [search, setSearch] = useState('');
  const [registration, setRegistration] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');   // filled after file upload
  const [message, setMessage] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch payment info on mount
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/registrations/payment-info`);
        if (res.ok) setPaymentInfo(await res.json());
      } catch (err) {}
    };
    fetchPaymentInfo();
  }, []);

  // Look up registration by number
  const handleLookup = async () => {
    setMessage('');
    const res = await fetch(`${API_BASE_URL}/api/registrations/lookup?registrationNumber=${search}`);
    const data = await res.json();
    if (res.ok) {
      setRegistration(data);
    } else {
      setMessage(data.message || 'Registration not found');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
    setMessage('');
  };

  // Upload the selected file to Cloudinary via our backend
  const handleFileUpload = async () => {
    if (!receiptFile) {
      return setMessage('Please select a file to upload.');
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', receiptFile);

      const res = await fetch(`${API_BASE_URL}/api/upload/receipt`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setReceiptUrl(data.url);
        setMessage('Receipt uploaded successfully!');
      } else {
        setMessage(data.message || 'File upload failed.');
      }
    } catch (err) {
      setMessage('Network error during upload.');
    } finally {
      setUploading(false);
    }
  };

  // Submit the receipt and transaction reference to complete registration
  const handleUploadReceipt = async () => {
    if (!receiptUrl) {
      return setMessage('Please upload the receipt file first.');
    }

    const res = await fetch(`${API_BASE_URL}/api/registrations/upload-receipt`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationNumber: registration.registrationNumber,
        transactionRef,
        receiptUrl,
      }),
    });
    const data = await res.json();
    setMessage(data.message || 'Receipt submitted');
    if (data.success) {
      setRegistration({ ...registration, status: 'Pending Verification' });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Complete Registration</h2>

      {!registration ? (
        <div>
          <input
            type="text"
            placeholder="Enter Registration Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded-xl mb-2"
          />
          <button onClick={handleLookup} className="w-full bg-blue-600 text-white p-2 rounded-xl">
            Find Registration
          </button>
        </div>
      ) : (
        <div>
          <p><strong>Name:</strong> {registration.fullName}</p>
          <p><strong>Reg Number:</strong> {registration.registrationNumber}</p>
          <p><strong>Status:</strong> {registration.status}</p>

          {registration.status === 'Pending Payment' && (
            <div className="mt-4">
              {paymentInfo ? (
                <div className="bg-slate-50 p-3 rounded-xl mb-3">
                  <p><strong>Contribution:</strong> {paymentInfo.contributionAmount} Birr</p>
                  <p><strong>Resource Fee:</strong> {paymentInfo.resourceFee} Birr</p>
                  <p className="font-semibold">Total: {paymentInfo.totalAmount} Birr</p>
                  <p className="text-sm mt-1">{paymentInfo.instructions}</p>
                </div>
              ) : (
                <p>Loading payment instructions...</p>
              )}

              {/* Transaction Reference */}
              <input
                type="text"
                placeholder="Transaction Reference"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full p-2 border rounded-xl mt-2"
              />

              {/* File Upload Section */}
              <div className="mt-3">
                <label className="text-sm font-medium">Upload Receipt (Image or PDF)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-xl mt-1"
                />
                <button
                  onClick={handleFileUpload}
                  disabled={uploading || !receiptFile}
                  className="w-full bg-blue-600 text-white p-2 rounded-xl mt-2 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
                {receiptUrl && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✅ File uploaded. <a href={receiptUrl} target="_blank" rel="noreferrer" className="underline">Preview</a>
                  </p>
                )}
              </div>

              {/* Submit Receipt */}
              <button
                onClick={handleUploadReceipt}
                className="w-full bg-green-600 text-white p-2 rounded-xl mt-3"
              >
                Submit Receipt
              </button>
            </div>
          )}

          {registration.status === 'Pending Verification' && (
            <p className="text-emerald-600 mt-4">Your receipt has been received. Awaiting verification.</p>
          )}
          {registration.status === 'Approved' && (
            <p className="text-emerald-600 mt-4">Your registration has been approved! You can now log in.</p>
          )}
        </div>
      )}
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
};

export default ContinueRegistration;