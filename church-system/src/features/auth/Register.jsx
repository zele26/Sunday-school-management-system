import React, { useState } from 'react';

const Register = () => {
  // 1. STATE: This tracks which page of the form we are on
  const [step, setStep] = useState(1);

  // 2. STATE: This holds all the data the student types in
  const [formData, setFormData] = useState({
    // student info
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    address: '',
    grade: 'Grade 7',
    regYear: new Date().getFullYear().toString(),
    // parent info
    emergencyContactName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    relationship: '',
    contactPhone: '',
    contactAddress: '',
    contactEmail: ''
  });

  // 3. LOGIC: Helper to update the data object without losing old values
  const updateData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  // 4. FLOW CONTROL: Moving forward and backward
  const nextStep = () => {
    if (step == 1 && formData.fullName === "") {
        alert("Please enter your full name before proceeding.")
        return;
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const submitData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData) // Sending our "Data Bucket"
    });

    if (response.ok) {
      alert("Hooray! You are now registered in the Church System.");
    }
  } catch (error) {
    console.error("Connection Error:", error);
  }
};
return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8">
      
      {/* Progress Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900 text-center">Student Registration</h1>
        <p className="text-center text-slate-500">Step {step} of 2</p>
      </div>

      {/* STEP 1: STUDENT PERSONAL INFORMATION */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Student Details</h2>
          
          {/* Name Grid: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="First Name" className="border p-3 rounded-lg w-full" 
              onChange={(e) => updateData({ firstName: e.target.value })} />
            <input type="text" placeholder="Middle Name" className="border p-3 rounded-lg w-full" 
              onChange={(e) => updateData({ middleName: e.target.value })} />
            <input type="text" placeholder="Last Name" className="border p-3 rounded-lg w-full" 
              onChange={(e) => updateData({ lastName: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600 block mb-1">Date of Birth</label>
              <input type="date" className="border p-3 rounded-lg w-full" 
                onChange={(e) => updateData({ dob: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Grade Level</label>
              <select className="border p-3 rounded-lg w-full" onChange={(e) => updateData({ grade: e.target.value })}>
                {[7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Current Home Address" className="border p-3 rounded-lg w-full" 
              onChange={(e) => updateData({ address: e.target.value })} />
            <select className="border p-3 rounded-lg w-full" onChange={(e) => updateData({ regYear: e.target.value })}>
              <option value="2025">Year: 2025</option>
              <option value="2026">Year: 2026</option>
            </select>
          </div>

          <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4 hover:bg-blue-700 transition">
            Continue to Emergency Contact
          </button>
        </div>
      )}

      {/* STEP 2: EMERGENCY CONTACT INFORMATION */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-red-600">Emergency Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="First Name" className="border p-3 rounded-lg" onChange={(e) => updateData({ emergencyFirstName: e.target.value })} />
            <input type="text" placeholder="Middle Name" className="border p-3 rounded-lg" onChange={(e) => updateData({ emergencyMiddleName: e.target.value })} />
            <input type="text" placeholder="Last Name" className="border p-3 rounded-lg" onChange={(e) => updateData({ emergencyLastName: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Relationship (e.g., Mother)" className="border p-3 rounded-lg" onChange={(e) => updateData({ relationship: e.target.value })} />
            <input type="tel" placeholder="Contact Phone Number" className="border p-3 rounded-lg" onChange={(e) => updateData({ contactPhone: e.target.value })} />
          </div>

          <input type="email" placeholder="Contact Email Address" className="w-full border p-3 rounded-lg" onChange={(e) => updateData({ contactEmail: e.target.value })} />
          <input type="text" placeholder="Contact Home Address" className="w-full border p-3 rounded-lg" onChange={(e) => updateData({ contactAddress: e.target.value })} />

          <div className="flex gap-4 mt-6">
            <button onClick={prevStep} className="flex-1 bg-slate-200 py-3 rounded-lg font-semibold">Back</button>
            <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold">
             Review Details
            </button>
          </div>
        </div>
      )}
      {/* STEP 3: REVIEW & CONFIRM */}
{step === 3 && (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-blue-900 border-b pb-2">Review Your Details</h2>
    
    <div className="bg-slate-50 p-6 rounded-xl space-y-4 text-sm">
      {/* Student Summary */}
      <section>
        <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-2">Student</h3>
        <p><strong>Name:</strong> {formData.firstName} {formData.middleName} {formData.lastName}</p>
        <p><strong>Grade & Year:</strong> Grade {formData.grade} ({formData.regYear})</p>
        <p><strong>DOB:</strong> {formData.dob}</p>
        <p><strong>Address:</strong> {formData.address}</p>
      </section>

      <hr className="border-slate-200" />

      {/* Emergency Summary */}
      <section>
        <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-2">Emergency Contact</h3>
        <p><strong>Contact:</strong> {formData.emergencyFirstName} {formData.emergencyLastName} ({formData.relationship})</p>
        <p><strong>Phone:</strong> {formData.contactPhone}</p>
        <p><strong>Email:</strong> {formData.contactEmail}</p>
      </section>
    </div>

    <div className="flex flex-col gap-3">
      <button 
        onClick={() => setStep(1)} 
        className="w-full py-3 text-blue-600 font-semibold hover:underline"
      >
        ← Something is wrong? Edit Information
      </button>
      
      <button 
        onClick={submitData} 
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 transition"
      >
        Confirm & Submit Registration
      </button>
      
      <button onClick={prevStep} className="text-slate-400 text-sm">Back to Emergency Contact</button>
    </div>
  </div>
)}
    </div>
  </div>
);
};

export default Register;