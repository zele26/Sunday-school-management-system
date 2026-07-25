import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const ContinueRegistration = () => {
  const [search, setSearch] = useState('');
  const [registration, setRegistration] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [message, setMessage] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Fetch payment info once when component mounts (or you could fetch after lookup)
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/registrations/payment-info`);
        if (res.ok) setPaymentInfo(await res.json());
      } catch (err) {}
    };
    fetchPaymentInfo();
  }, []);

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
              <input
                type="text"
                placeholder="Transaction Reference"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full p-2 border rounded-xl mt-2"
              />
              <input
                type="text"
                placeholder="Receipt URL (upload screenshot or PDF link)"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full p-2 border rounded-xl mt-2"
              />
              <button onClick={handleUploadReceipt} className="w-full bg-green-600 text-white p-2 rounded-xl mt-2">
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