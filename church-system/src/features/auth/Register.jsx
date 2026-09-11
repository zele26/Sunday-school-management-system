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
    if (step === 1 && formData.firstName.trim() === "") {
        alert("እባክዎ ከመቀጠልዎ በፊት ቢያንስ ስም ያስገቡ።");
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
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("ምዝገባው በተሳካ ሁኔታ ተጠናቋል።");
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        alert("ምዝገባው አልተሳካም፦ " + (errorData.message || "ስህተት ተከስቷል"));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("ከአገልጋዩ ጋር መገናኘት አልተቻለም። እባክዎ የኔትወርክ ግንኙነትዎን ያረጋግጡ።");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8">
        
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
             <button onClick={() => navigate('/dashboard')} className="text-blue-600 text-sm font-bold">← ወደ መቆጣጠሪያ ሰሌዳ ተመለስ</button>
             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">ደረጃ {step} ከ 3</span>
          </div>
          <h1 className="text-3xl font-black text-blue-900 text-center">የተማሪዎች ምዝገባ</h1>
        </div>

        {/* STEP 1: STUDENT DETAILS */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-bold text-slate-700 border-b pb-2">የተማሪው የግል መረጃ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="ስም" className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => updateData({ firstName: e.target.value })} value={formData.firstName} />
              <input type="text" placeholder="የአባት ስም" className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => updateData({ middleName: e.target.value })} value={formData.middleName} />
              <input type="text" placeholder="የአያት ስም" className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => updateData({ lastName: e.target.value })} value={formData.lastName} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">የትውልድ ቀን</label>
                <input type="date" className="border p-3 rounded-xl w-full outline-none" 
                  onChange={(e) => updateData({ dob: e.target.value })} value={formData.dob} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">የትምህርት ክፍል</label>
                <select className="border p-3 rounded-xl w-full outline-none bg-white" onChange={(e) => updateData({ grade: e.target.value })} value={formData.grade}>
                  {[7, 8, 9, 10, 11, 12].map(g => <option key={g} value={`Grade ${g}`}>{g}ኛ ክፍል</option>)}
                </select>
              </div>
            </div>

            <input type="text" placeholder="የአሁን የመኖሪያ አድራሻ" className="border p-3 rounded-xl w-full outline-none" 
              onChange={(e) => updateData({ address: e.target.value })} value={formData.address} />

            <button onClick={nextStep} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-4 hover:bg-blue-700 transition shadow-lg">
              ወደ አደጋ ጊዜ ተጠሪ ቀጥል
            </button>
          </div>
        )}

        {/* STEP 2: EMERGENCY CONTACT */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-bold text-red-600 border-b pb-2">የአደጋ ጊዜ ተጠሪ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="ስም" className="border p-3 rounded-xl" onChange={(e) => updateData({ emergencyFirstName: e.target.value })} value={formData.emergencyFirstName} />
              <input type="text" placeholder="የአባት ስም" className="border p-3 rounded-xl" onChange={(e) => updateData({ emergencyMiddleName: e.target.value })} value={formData.emergencyMiddleName} />
              <input type="text" placeholder="የአያት ስም" className="border p-3 rounded-xl" onChange={(e) => updateData({ emergencyLastName: e.target.value })} value={formData.emergencyLastName} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="ዝምድና (ምሳሌ፡ እናት)" className="border p-3 rounded-xl" onChange={(e) => updateData({ relationship: e.target.value })} value={formData.relationship} />
              <input type="tel" placeholder="የተጠሪ ስልክ ቁጥር" className="border p-3 rounded-xl" onChange={(e) => updateData({ contactPhone: e.target.value })} value={formData.contactPhone} />
            </div>
            <input type="email" placeholder="የተጠሪ ኢሜይል አድራሻ" className="w-full border p-3 rounded-xl" onChange={(e) => updateData({ contactEmail: e.target.value })} value={formData.contactEmail} />
            
            <div className="flex gap-4 mt-6">
              <button onClick={prevStep} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-slate-600">ተመለስ</button>
              <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md">መረጃውን ገምግም</button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-blue-900 border-b pb-2">የምዝገባ ማጠቃለያ ግምገማ</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">ተማሪ</p>
                <p className="font-bold text-lg">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-slate-600">{formData.grade} | የትውልድ ቀን፦ {formData.dob}</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase">ወላጅ / አሳዳጊ / ተጠሪ</p>
                <p className="font-bold">{formData.emergencyFirstName} {formData.emergencyLastName}</p>
                <p className="text-sm text-slate-600">{formData.contactPhone} | {formData.contactEmail}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={submitData} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-green-700 transition">
                 አረጋግጥና መረጃውን መዝግብ
               </button>
               <button onClick={() => setStep(1)} className="text-slate-400 text-sm font-bold hover:text-blue-600 transition">መረጃውን አሻሽል</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;