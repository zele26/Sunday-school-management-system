import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    address: '',
    grade: 'Grade 7',
    regYear: new Date().getFullYear().toString(),
    emergencyFirstName: '', // Fixed to match your input fields
    emergencyMiddleName: '',
    emergencyLastName: '',
    relationship: '',
    contactPhone: '',
    contactAddress: '',
    contactEmail: ''
  });

  const updateData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    // FIX: Changed from fullName to firstName validation
    if (step === 1 && formData.firstName.trim() === "") {
        alert("Please enter at least the First Name before proceeding.");
        return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const submitData = async () => {
    try {
      // FIX: Using the correct new Render URL
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Hooray! Registration Successful.");
        navigate('/dashboard'); // Take the user back to see the updated list
      } else {
        const errorData = await response.json();
        alert("Registration failed: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the server. Please check your internet.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8">
        
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
             <button onClick={() => navigate('/dashboard')} className="text-blue-600 text-sm font-bold">← Back to Dashboard</button>
             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Step {step} of 3</span>
          </div>
          <h1 className="text-3xl font-black text-blue-900 text-center">Student Registration</h1>
        </div>

        {/* STEP 1: STUDENT DETAILS */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-bold text-slate-700 border-b pb-2">Student Personal Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="First Name" className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => updateData({ firstName: e.target.value })} value={formData.firstName} />
              <input type="text" placeholder="Middle Name" className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => updateData({ middleName: e.target.value })} value={formData.middleName} />
              <input type="text" placeholder="Last Name" className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => updateData({ lastName: e.target.value })} value={formData.lastName} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Date of Birth</label>
                <input type="date" className="border p-3 rounded-xl w-full outline-none" 
                  onChange={(e) => updateData({ dob: e.target.value })} value={formData.dob} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Grade Level</label>
                <select className="border p-3 rounded-xl w-full outline-none bg-white" onChange={(e) => updateData({ grade: e.target.value })} value={formData.grade}>
                  {[7, 8, 9, 10, 11, 12].map(g => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
                </select>
              </div>
            </div>

            <input type="text" placeholder="Current Home Address" className="border p-3 rounded-xl w-full outline-none" 
              onChange={(e) => updateData({ address: e.target.value })} value={formData.address} />

            <button onClick={nextStep} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-4 hover:bg-blue-700 transition shadow-lg">
              Continue to Emergency Contact
            </button>
          </div>
        )}

        {/* STEP 2: EMERGENCY CONTACT */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-bold text-red-600 border-b pb-2">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="First Name" className="border p-3 rounded-xl" onChange={(e) => updateData({ emergencyFirstName: e.target.value })} value={formData.emergencyFirstName} />
              <input type="text" placeholder="Middle Name" className="border p-3 rounded-xl" onChange={(e) => updateData({ emergencyMiddleName: e.target.value })} value={formData.emergencyMiddleName} />
              <input type="text" placeholder="Last Name" className="border p-3 rounded-xl" onChange={(e) => updateData({ emergencyLastName: e.target.value })} value={formData.emergencyLastName} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Relationship (e.g., Mother)" className="border p-3 rounded-xl" onChange={(e) => updateData({ relationship: e.target.value })} value={formData.relationship} />
              <input type="tel" placeholder="Contact Phone Number" className="border p-3 rounded-xl" onChange={(e) => updateData({ contactPhone: e.target.value })} value={formData.contactPhone} />
            </div>
            <input type="email" placeholder="Contact Email Address" className="w-full border p-3 rounded-xl" onChange={(e) => updateData({ contactEmail: e.target.value })} value={formData.contactEmail} />
            
            <div className="flex gap-4 mt-6">
              <button onClick={prevStep} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-slate-600">Back</button>
              <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md">Review Details</button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-blue-900 border-b pb-2">Review Summary</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Student</p>
                <p className="font-bold text-lg">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-slate-600">{formData.grade} | Born: {formData.dob}</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase">Parent/Contact</p>
                <p className="font-bold">{formData.emergencyFirstName} {formData.emergencyLastName}</p>
                <p className="text-sm text-slate-600">{formData.contactPhone} | {formData.contactEmail}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={submitData} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-green-700 transition">
                 Confirm & Save to System
               </button>
               <button onClick={() => setStep(1)} className="text-slate-400 text-sm font-bold hover:text-blue-600 transition">Edit Details</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;