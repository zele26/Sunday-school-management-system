import React, { useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const ContinueRegistration = () => {
  const [search, setSearch] = useState('');
  const [registration, setRegistration] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleLookup = async () => {
    const res = await fetch(`${API_BASE_URL}/api/registrations/lookup?registrationNumber=${search}`);
    const data = await res.json();
    if (res.ok) {
      setRegistration(data);
    } else {
      setMessage(data.message || 'Registration not found');
    }
  };

  const handleUploadReceipt = async () => {
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
    setMessage(data.message || 'Receipt uploaded');
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
          <button onClick={handleLookup} className="w-full bg-blue-600 text-white p-2 rounded-xl">Find Registration</button>
        </div>
      ) : (
        <div>
          <p><strong>Name:</strong> {registration.fullName}</p>
          <p><strong>Reg Number:</strong> {registration.registrationNumber}</p>
          <p><strong>Status:</strong> {registration.status}</p>

          {registration.status === 'Pending Payment' && (
            <div className="mt-4">
              <h3 className="font-semibold">Payment Instructions</h3>
              <p>Contribution: 100 Birr | Resource Fee: 50 Birr | Total: 150 Birr</p>
              <p>Pay via Telebirr / CBE Birr / Bank</p>
              <input
                type="text"
                placeholder="Transaction Reference"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full p-2 border rounded-xl mt-2"
              />
              <input
                type="text"
                placeholder="Receipt URL"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full p-2 border rounded-xl mt-2"
              />
              <button onClick={handleUploadReceipt} className="w-full bg-green-600 text-white p-2 rounded-xl mt-2">Submit Receipt</button>
            </div>
          )}
        </div>
      )}
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
};

export default ContinueRegistration;