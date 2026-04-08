import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Ensure this is installed

const StudentProfile = ({ onLogout }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        onLogout();
        return;
      }

      try {
        const response = await fetch('https://church-api-3l2c.onrender.com/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          localStorage.clear();
          onLogout();
        }
      } catch (err) {
        console.error("Connection failed");
      }
    };
    getData();
  }, [onLogout]);

  if (!user) return <p className="text-center p-10 font-bold">መረጃ በመጫን ላይ... (Loading...)</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-8 border-blue-900">
        <h1 className="text-2xl font-bold text-center mb-2">የተማሪ መረጃ (Profile)</h1>
        <p className="text-center text-gray-500 mb-6 uppercase text-xs tracking-widest">{user.role}</p>
        
        {/* --- QR CODE SECTION --- */}
        <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 mb-6">
          <QRCodeSVG 
            value={JSON.stringify({ studentId: user._id })} 
            size={160}
            level={"H"}
            includeMargin={false}
          />
          <div className="mt-4 text-center">
            <p className="text-sm font-bold text-blue-900">የመታወቂያ ኮድ (Scan Me)</p>
            <p className="text-[10px] text-gray-400 font-mono mt-1 italic">{user._id}</p>
          </div>
        </div>
        {/* ------------------------ */}

        <div className="space-y-3 border-t pt-4 text-sm">
          <p className="flex justify-between">
            <span className="text-gray-500">ሙሉ ስም:</span> 
            <span className="font-bold text-gray-700">{user.fullName}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">ኢሜይል:</span> 
            <span className="font-bold text-gray-700">{user.email}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">ስልክ:</span> 
            <span className="font-bold text-gray-700">{user.phoneNumber || "N/A"}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">አድራሻ:</span> 
            <span className="font-bold text-gray-700">{user.city}, ወረዳ {user.wereda}</span>
          </p>
        </div>

        <button 
          onClick={onLogout} 
          className="mt-8 w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition duration-200"
        >
          ውጣ (Logout)
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;