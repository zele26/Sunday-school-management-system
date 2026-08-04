// import React, { useState, useEffect } from 'react';
// import { apiFetch } from '../../api/apiClient';

// const AddTeacher = () => {
//   const initialForm = {
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     experience: '',
//     subject: '',
//     coursesTaught: '',
//     qualification: '',
//     city: '',
//     wereda: '',
//     kebele: '',
//     emergencyPersonName: '',
//     emergencyPhone: '',
//     bio: '',
//   };

//   const [form, setForm] = useState(initialForm);
//   const [availableCourses, setAvailableCourses] = useState([]);
//   const [selectedCourses, setSelectedCourses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState({ type: '', text: '' });

//   useEffect(() => {
//     // Fetch available courses for easy selection
//     const fetchCourses = async () => {
//       try {
//         const res = await apiFetch('/api/admin/courses');
//         if (res.ok) {
//           const data = await res.json();
//           if (Array.isArray(data)) setAvailableCourses(data);
//           else if (data.courses && Array.isArray(data.courses)) setAvailableCourses(data.courses);
//         }
//       } catch (err) {
//         console.error('Failed to fetch courses:', err);
//       }
//     };
//     fetchCourses();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const toggleCourseSelection = (courseName) => {
//     let updated;
//     if (selectedCourses.includes(courseName)) {
//       updated = selectedCourses.filter((c) => c !== courseName);
//     } else {
//       updated = [...selectedCourses, courseName];
//     }
//     setSelectedCourses(updated);
//     setForm((prev) => ({ ...prev, coursesTaught: updated.join(', ') }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMsg({ type: '', text: '' });
//     setLoading(true);

//     const payload = {
//       ...form,
//       coursesTaught: form.coursesTaught
//         ? form.coursesTaught.split(',').map((s) => s.trim()).filter(Boolean)
//         : selectedCourses,
//     };

//     try {
//       const res = await apiFetch('/api/admin/teachers', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setMsg({ type: 'success', text: 'መምህር በተሳካ ሁኔታ ተፈጥሯል (Teacher added successfully!)' });
//         setForm(initialForm);
//         setSelectedCourses([]);
//       } else {
//         setMsg({ type: 'error', text: data.message || 'ስህተት ተፈጥሯል (Failed to add teacher)' });
//       }
//     } catch {
//       setMsg({ type: 'error', text: 'የአውታረ መረብ ስህተት (Network error)' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
//       <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
//         {/* Header Banner */}
//         <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white relative">
//           <div className="flex items-center gap-4">
//             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-inner">
//               👨‍🏫
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold tracking-tight">አዲስ መምህር መፍጠሪያ (Add New Teacher)</h2>
//               <p className="text-xs text-indigo-200 mt-1 font-medium">
//                 የመምህራን መረጃ፣ ያስተማሯቸው ኮርሶች እና ልምድ ይመዝግቡ
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Content Body */}
//         <div className="p-6 sm:p-8 space-y-8">
//           {msg.text && (
//             <div
//               className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
//                 msg.type === 'success'
//                   ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
//                   : 'bg-rose-50 border border-rose-200 text-rose-700'
//               }`}
//             >
//               <span className="text-lg">{msg.type === 'success' ? '✅' : '⚠️'}</span>
//               <span>{msg.text}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* Section 1: Basic Credentials */}
//             <div className="space-y-4">
//               <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
//                 <span className="text-indigo-600 font-bold text-sm">01.</span>
//                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
//                   መሠረታዊ መረጃ (Account & Identity)
//                 </h3>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     ሙሉ ስም * (Full Name)
//                   </label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     placeholder="ለምሳሌ፡ አበበ ከበደ"
//                     value={form.fullName}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     ኢሜይል * (Email Address)
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="teacher@church.org"
//                     value={form.email}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     ስልክ ቁጥር (Phone Number)
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     placeholder="0911223344"
//                     value={form.phone}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     ፓስዎርድ * (Password)
//                   </label>
//                   <input
//                     type="password"
//                     name="password"
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 2: Teaching Experience & Courses */}
//             <div className="space-y-4">
//               <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
//                 <span className="text-indigo-600 font-bold text-sm">02.</span>
//                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
//                   የትምህርት ዝግጅትና ልምድ (Qualifications & Teaching)
//                 </h3>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     የማስተማሪያ ዘርፍ / ርዕስ (Primary Subject)
//                   </label>
//                   <input
//                     type="text"
//                     name="subject"
//                     placeholder="ለምሳሌ፡ ነገረ መለኮት"
//                     value={form.subject}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     የማስተማር ልምድ (Years of Experience)
//                   </label>
//                   <select
//                     name="experience"
//                     value={form.experience}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   >
//                     <option value="">ልምድ ይምረጡ (Select Experience)</option>
//                     <option value="Less than 1 year">ከ 1 ዓመት በታች (&lt; 1 Year)</option>
//                     <option value="1 - 3 years">1 - 3 ዓመት (1-3 Years)</option>
//                     <option value="3 - 5 years">3 - 5 ዓመት (3-5 Years)</option>
//                     <option value="5+ years">ከ 5 ዓመት በላይ (5+ Years)</option>
//                     <option value="10+ years">ከ 10 ዓመት በላይ (10+ Years)</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     የትምህርት ደረጃ (Qualification/Degree)
//                   </label>
//                   <input
//                     type="text"
//                     name="qualification"
//                     placeholder="ለምሳሌ፡ ዲፕሎማ / ዲግሪ"
//                     value={form.qualification}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>
//               </div>

//               {/* Courses Taught */}
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                   የሚያስተምሯቸው ኮርሶች (Courses He/She Teaches)
//                 </label>
//                 <input
//                   type="text"
//                   name="coursesTaught"
//                   placeholder="ኮርሶችን በኮማ ይለዩ (e.g. Church History, Bible Study)"
//                   value={form.coursesTaught}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none mb-2"
//                 />

//                 {availableCourses.length > 0 && (
//                   <div className="space-y-1.5">
//                     <p className="text-[11px] text-slate-500 font-medium">
//                       ከቀረቡት ኮርሶች ይምረጡ (Quick-select existing courses):
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       {availableCourses.map((course) => {
//                         const courseName = course.name || course.title || course;
//                         const isSelected = selectedCourses.includes(courseName);
//                         return (
//                           <button
//                             type="button"
//                             key={course._id || courseName}
//                             onClick={() => toggleCourseSelection(courseName)}
//                             className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
//                               isSelected
//                                 ? 'bg-indigo-600 text-white shadow-sm'
//                                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                             }`}
//                           >
//                             <span>{courseName}</span>
//                             <span>{isSelected ? '✓' : '+'}</span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Section 3: Address & Emergency Contact */}
//             <div className="space-y-4">
//               <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
//                 <span className="text-indigo-600 font-bold text-sm">03.</span>
//                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
//                   አድራሻ እና የአደጋ ጊዜ ተጠሪ (Address & Emergency Contact)
//                 </h3>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">ከተማ (City)</label>
//                   <input
//                     type="text"
//                     name="city"
//                     placeholder="አዲስ አበባ"
//                     value={form.city}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">ወረዳ (Wereda)</label>
//                   <input
//                     type="text"
//                     name="wereda"
//                     placeholder="ወረዳ 04"
//                     value={form.wereda}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">ቀበሌ (Kebele)</label>
//                   <input
//                     type="text"
//                     name="kebele"
//                     placeholder="ቀበሌ 08"
//                     value={form.kebele}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     የአደጋ ጊዜ ተጠሪ ስም (Emergency Contact Name)
//                   </label>
//                   <input
//                     type="text"
//                     name="emergencyPersonName"
//                     placeholder="የተጠሪ ስም"
//                     value={form.emergencyPersonName}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                     የአደጋ ጊዜ ተጠሪ ስልክ (Emergency Contact Phone)
//                   </label>
//                   <input
//                     type="tel"
//                     name="emergencyPhone"
//                     placeholder="09..."
//                     value={form.emergencyPhone}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 4: Bio / Notes */}
//             <div className="space-y-4">
//               <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
//                 <span className="text-indigo-600 font-bold text-sm">04.</span>
//                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
//                   ተጨማሪ ማስታወሻ (Bio & Notes)
//                 </h3>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1.5">
//                   ስለ መምህሩ አጭር መግለጫ (Short Bio / Notes)
//                 </label>
//                 <textarea
//                   name="bio"
//                   rows="3"
//                   placeholder="ስለ መምህሩ ተጨማሪ መረጃ ያስገቡ..."
//                   value={form.bio}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none resize-none"
//                 ></textarea>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//               >
//                 {loading ? (
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                 ) : (
//                   <>
//                     <span>መምህሩን መዝግብ (Submit Teacher)</span>
//                     <span>➔</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddTeacher;


// src/features/admin/AddTeacher.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const AddTeacher = () => {
  const initialForm = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    experience: '',
    subject: '',
    coursesTaught: '',
    qualification: '',
    address: '',
    city: '',
    wereda: '',
    kebele: '',
    emergencyPersonName: '',
    emergencyPhone: '',
    gender: '',
    dateOfBirth: '',
    bio: '',
  };

  const [form, setForm] = useState(initialForm);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/admin/courses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setAvailableCourses(data);
          else if (data.courses && Array.isArray(data.courses)) setAvailableCourses(data.courses);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleCourseSelection = (courseName) => {
    let updated;
    if (selectedCourses.includes(courseName)) {
      updated = selectedCourses.filter((c) => c !== courseName);
    } else {
      updated = [...selectedCourses, courseName];
    }
    setSelectedCourses(updated);
    setForm((prev) => ({ ...prev, coursesTaught: updated.join(', ') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    // Build payload for the new Teacher model
    const payload = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      subject: form.subject.trim(),
      qualification: form.qualification.trim(),
      experience: form.experience,
      bio: form.bio.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      // Convert coursesTaught string to array
      coursesTaught: form.coursesTaught
        ? form.coursesTaught.split(',').map((s) => s.trim()).filter(Boolean)
        : selectedCourses,
    };

    try {
      const res = await apiFetch('/api/admin/teachers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: '✅ መምህር በተሳካ ሁኔታ ተፈጥሯል (Teacher added successfully!)' });
        setForm(initialForm);
        setSelectedCourses([]);
      } else {
        setMsg({ type: 'error', text: data.message || '❌ ስህተት ተፈጥሯል (Failed to add teacher)' });
      }
    } catch {
      setMsg({ type: 'error', text: '❌ የአውታረ መረብ ስህተት (Network error)' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-inner">
              👨‍🏫
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">አዲስ መምህር መፍጠሪያ (Add New Teacher)</h2>
              <p className="text-xs text-indigo-200 mt-1 font-medium">
                የመምህራን መረጃ፣ ያስተማሯቸው ኮርሶች እና ልምድ ይመዝግቡ
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {msg.text && (
            <div
              className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              <span className="text-lg">{msg.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Identity */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-indigo-600 font-bold text-sm">01.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  መሠረታዊ መረጃ (Account & Identity)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ስም * (First Name)
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="አበበ"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    የአባት ስም (Middle Name)
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    placeholder="ከበደ"
                    value={form.middleName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    የአያት ስም * (Last Name)
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="ገላዬ"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ኢሜይል * (Email)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="teacher@church.org"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ፓስዎርድ * (Password)
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ስልክ (Phone)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0911223344"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ጾታ (Gender)</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  >
                    <option value="">ይምረጡ (Select)</option>
                    <option value="Male">ወንድ (Male)</option>
                    <option value="Female">ሴት (Female)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Teaching */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-indigo-600 font-bold text-sm">02.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  የትምህርት ዝግጅትና ልምድ (Qualifications & Teaching)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ዘርፍ / ርዕስ (Subject)
                  </label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="ነገረ መለኮት"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    የማስተማር ልምድ (Experience)
                  </label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  >
                    <option value="">ይምረጡ (Select)</option>
                    <option value="Less than 1 year">ከ 1 ዓመት በታች (&lt; 1 Year)</option>
                    <option value="1 - 3 years">1 - 3 ዓመት</option>
                    <option value="3 - 5 years">3 - 5 ዓመት</option>
                    <option value="5+ years">ከ 5 ዓመት በላይ</option>
                    <option value="10+ years">ከ 10 ዓመት በላይ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    የትምህርት ደረጃ (Qualification)
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="ዲፕሎማ / ዲግሪ"
                    value={form.qualification}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Courses Taught */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  የሚያስተምሯቸው ኮርሶች (Courses Taught)
                </label>
                <input
                  type="text"
                  name="coursesTaught"
                  placeholder="ኮርሶችን በኮማ ይለዩ (e.g. Church History, Bible Study)"
                  value={form.coursesTaught}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none mb-2"
                />

                {availableCourses.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 font-medium">
                      ከቀረቡት ኮርሶች ይምረጡ (Quick-select existing courses):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableCourses.map((course) => {
                        const courseName = course.name || course.title || course;
                        const isSelected = selectedCourses.includes(courseName);
                        return (
                          <button
                            type="button"
                            key={course._id || courseName}
                            onClick={() => toggleCourseSelection(courseName)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>{courseName}</span>
                            <span>{isSelected ? '✓' : '+'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Address & Emergency */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-indigo-600 font-bold text-sm">03.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  አድራሻ እና የአደጋ ጊዜ ተጠሪ (Address & Emergency Contact)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ከተማ (City)</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="አዲስ አበባ"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ጠቅላይ አድራሻ (Address)</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="ሙሉ አድራሻ"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    የአደጋ ጊዜ ተጠሪ ስም (Emergency Contact Name)
                  </label>
                  <input
                    type="text"
                    name="emergencyPersonName"
                    placeholder="ስም"
                    value={form.emergencyPersonName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ስልክ (Emergency Phone)
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    placeholder="09..."
                    value={form.emergencyPhone}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Bio */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-indigo-600 font-bold text-sm">04.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  ተጨማሪ ማስታወሻ (Bio & Notes)
                </h3>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ስለ መምህሩ አጭር መግለጫ (Short Bio)
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  placeholder="ስለ መምህሩ ተጨማሪ መረጃ ያስገቡ..."
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none resize-none"
                ></textarea>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>መምህሩን መዝግብ (Submit Teacher)</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;