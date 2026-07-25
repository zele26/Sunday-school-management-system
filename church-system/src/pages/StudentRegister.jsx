// src/pages/StudentRegister.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const StudentRegister = () => {
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    grade: 'Grade 7',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationResult, setRegistrationResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setRegistrationResult(data.registration);
        // Fetch payment info
        const piRes = await fetch(`${API_BASE_URL}/api/registrations/payment-info`);
        if (piRes.ok) {
          setPaymentInfo(await piRes.json());
        }
        setStep('success');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow text-center">
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">✅ Registration Submitted</h2>
        <p className="text-slate-600 mb-2">Your registration number is:</p>
        <p className="text-3xl font-mono font-bold text-blue-700">{registrationResult?.registrationNumber}</p>
        <p className="text-sm text-slate-500 mt-2">Status: {registrationResult?.status}</p>

        {paymentInfo && (
          <div className="mt-6 bg-slate-50 p-4 rounded-xl text-left">
            <h3 className="font-semibold text-slate-700 mb-2">Payment Instructions</h3>
            <p><strong>Contribution Fee:</strong> {paymentInfo.contributionAmount} Birr</p>
            <p><strong>Resource Fee:</strong> {paymentInfo.resourceFee} Birr</p>
            <p className="font-bold text-lg mt-2">Total: {paymentInfo.totalAmount} Birr</p>
            <p className="mt-3 text-sm text-slate-600">{paymentInfo.instructions}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">After making the payment, upload your receipt here:</p>
        <Link
          to="/continue-registration"
          className="mt-3 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold"
        >
          Complete Registration
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Student Registration</h1>
      {error && <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-xl text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold text-slate-600">Personal Information</h2>
        <input type="text" name="fullName" placeholder="Full Name *" required value={formData.fullName} onChange={handleChange} className="w-full p-2 border rounded-xl" />
        <div className="flex gap-4">
          <select name="gender" value={formData.gender} onChange={handleChange} className="p-2 border rounded-xl">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input type="date" name="dateOfBirth" placeholder="Date of Birth" value={formData.dateOfBirth} onChange={handleChange} className="p-2 border rounded-xl" />
        </div>
        <select name="grade" value={formData.grade} onChange={handleChange} className="w-full p-2 border rounded-xl">
          {['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded-xl" />

        <h2 className="font-semibold text-slate-600 mt-4">Parent / Guardian</h2>
        <input type="text" name="parentName" placeholder="Parent Full Name" value={formData.parentName} onChange={handleChange} className="w-full p-2 border rounded-xl" />
        <input type="text" name="parentPhone" placeholder="Parent Phone Number" value={formData.parentPhone} onChange={handleChange} className="w-full p-2 border rounded-xl" />
        <input type="email" name="parentEmail" placeholder="Parent Email (optional)" value={formData.parentEmail} onChange={handleChange} className="w-full p-2 border rounded-xl" />

        <h2 className="font-semibold text-slate-600 mt-4">Login Details</h2>
        <input type="email" name="email" placeholder="Email *" required value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-xl" />
        <input type="password" name="password" placeholder="Password *" required minLength={6} value={formData.password} onChange={handleChange} className="w-full p-2 border rounded-xl" />

        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-semibold hover:bg-emerald-700">
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegister;