// import React, { useEffect, useMemo, useState } from 'react';
// import { QRCodeSVG } from 'qrcode.react';

// const defaultResources = [
//   { id: 1, title: 'Fractions Basics', type: 'PDF', link: '#' },
//   { id: 2, title: 'Intro to Science', type: 'Video', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
//   { id: 3, title: 'Weekly Reading Notes', type: 'Book', link: '#' },
// ];

// const defaultQuizzes = [
//   { id: 1, title: 'Math Quiz', status: 'Available' },
//   { id: 2, title: 'Science Exam', status: 'Pending' },
// ];

// const defaultGrades = [
//   { id: 1, title: 'Math Quiz', score: '92%', date: '2026-07-16' },
//   { id: 2, title: 'Reading Assignment', score: '88%', date: '2026-07-18' },
// ];

// const defaultAnnouncements = [
//   { id: 1, title: 'Parent meeting', body: 'Please attend the Friday parent meeting.' },
// ];

// const defaultComplaints = [
//   { id: 1, title: 'Need more practice material', status: 'Open' },
// ];

// const defaultCertificates = [
//   { id: 1, title: 'Grade 1 Completion Certificate', status: 'Ready to Download' },
// ];

// const defaultCourses = [
//   {
//     id: 1,
//     title: 'Mathematics Foundations',
//     description: 'Learn the core concepts of arithmetic and problem solving.',
//     grade: 'Grade 1',
//     subject: 'Mathematics',
//     schedule: 'Monday 10:00',
//     status: 'Active',
//     materials: ['PDF Notes', 'Video Lesson'],
//     assignments: ['Week 1 Worksheet'],
//     exams: ['Midterm Quiz'],
//     progress: '78%',
//   },
// ];

// const StudentProfile = ({ onLogout }) => {
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [resources, setResources] = useState(defaultResources);
//   const [quizzes, setQuizzes] = useState(defaultQuizzes);
//   const [grades] = useState(defaultGrades);
//   const [announcements] = useState(defaultAnnouncements);
//   const [complaints, setComplaints] = useState(defaultComplaints);
//   const [certificates] = useState(defaultCertificates);
//   const [courses] = useState(defaultCourses);
//   const [complaintForm, setComplaintForm] = useState({ title: '', status: 'Open' });

//   useEffect(() => {
//     let active = true;

//     const loadData = async () => {
//       try {
//         const response = await fetch('/api/student/profile-data');
//         if (!response.ok) throw new Error('Server returned an error');

//         const payload = await response.json();
//         const data = payload?.data || payload;

//         if (!active) return;

//         setResources(data.resources || defaultResources);
//         setQuizzes(data.quizzes || defaultQuizzes);
//         setComplaints(data.complaints || defaultComplaints);
//         setCertificates(data.certificates || defaultCertificates);
//         setIsLoaded(true);
//       } catch (error) {
//         console.error('Unable to load student profile data', error);
//         const stored = localStorage.getItem('studentProfileData');
//         if (stored) {
//           try {
//             const parsed = JSON.parse(stored);
//             if (parsed) {
//               setResources(parsed.resources || defaultResources);
//               setQuizzes(parsed.quizzes || defaultQuizzes);
//               setComplaints(parsed.complaints || defaultComplaints);
//               setCertificates(parsed.certificates || defaultCertificates);
//             }
//           } catch (parseError) {
//             console.error('Unable to parse cached student profile data', parseError);
//           }
//         }
//         if (active) {
//           setIsLoaded(true);
//         }
//       }
//     };

//     const getData = async () => {
//       const token = localStorage.getItem('token');

//       if (!token) {
//         onLogout();
//         return;
//       }

//       try {
//         const response = await fetch('/api/auth/profile', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (active) setUser(data);
//         } else {
//           localStorage.clear();
//           onLogout();
//         }
//       } catch (err) {
//         console.error('Connection failed');
//       }
//     };

//     loadData();
//     getData();
//     return () => {
//       active = false;
//     };
//   }, [onLogout]);

//   useEffect(() => {
//     if (!isLoaded) return;

//     const payload = {
//       resources,
//       quizzes,
//       grades,
//       announcements,
//       complaints,
//       certificates,
//       courses,
//     };

//     localStorage.setItem('studentProfileData', JSON.stringify(payload));

//     fetch('/api/student/profile-data', {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     }).catch((error) => {
//       console.error('Unable to save student profile data', error);
//     });
//   }, [isLoaded, resources, quizzes, grades, announcements, complaints, certificates, courses]);

//   const attendanceRate = useMemo(() => '96%', []);

//   const submitComplaint = (e) => {
//     e.preventDefault();
//     if (!complaintForm.title) return;
//     setComplaints([{ id: Date.now(), ...complaintForm }, ...complaints]);
//     setComplaintForm({ title: '', status: 'Open' });
//   };

//   if (!user) return <p className="text-center p-10 font-bold">መረጃ በመጫን ላይ... (Loading...)</p>;

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         <div className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-black">Student Portal</h1>
//             <p className="text-blue-100 mt-2">Register, learn, track progress, submit feedback, and access resources from one place.</p>
//           </div>
//           <button onClick={onLogout} className="bg-white text-blue-900 px-4 py-2 rounded-xl font-semibold">Logout</button>
//         </div>

//         <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-lg">
//           {['overview', 'profile', 'learning', 'courses', 'assessments', 'results', 'support'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-3 rounded-xl font-semibold capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {activeTab === 'overview' && (
//           <div className="grid gap-6 lg:grid-cols-3">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-2">My profile</h3>
//               <p className="text-sm text-gray-500">Update personal details, contact information, and emergency contacts.</p>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-2">Attendance</h3>
//               <p className="text-3xl font-black">{attendanceRate}</p>
//               <p className="text-sm text-gray-500">Your current attendance rate</p>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-2">Premium access</h3>
//               <p className="text-sm text-gray-500">Unlock extra videos, notes, and practice resources.</p>
//             </div>

//             <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Quick actions</h3>
//               <div className="grid gap-3 sm:grid-cols-2">
//                 <button onClick={() => setActiveTab('learning')} className="bg-blue-600 text-white py-2 rounded-lg">Open learning materials</button>
//                 <button onClick={() => setActiveTab('assessments')} className="bg-green-600 text-white py-2 rounded-lg">Take a quiz</button>
//                 <button onClick={() => setActiveTab('results')} className="bg-purple-600 text-white py-2 rounded-lg">View grades</button>
//                 <button onClick={() => setActiveTab('support')} className="bg-orange-600 text-white py-2 rounded-lg">Send feedback</button>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Announcements</h3>
//               <div className="space-y-2">
//                 {announcements.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3">
//                     <p className="font-semibold">{item.title}</p>
//                     <p className="text-sm text-gray-500">{item.body}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'profile' && (
//           <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
//             <div className="bg-white rounded-2xl p-6 shadow">
//               <h3 className="font-bold text-xl mb-4">My profile</h3>
//               <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 mb-6">
//                 <QRCodeSVG value={JSON.stringify({ studentId: user._id })} size={160} level="H" includeMargin={false} />
//                 <p className="mt-3 text-sm font-semibold text-blue-900">Scan for attendance</p>
//               </div>
//               <div className="space-y-3 text-sm">
//                 <p className="flex justify-between"><span className="text-gray-500">Full name</span><span className="font-semibold">{user.fullName}</span></p>
//                 <p className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold">{user.email}</span></p>
//                 <p className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-semibold">{user.phoneNumber || 'N/A'}</span></p>
//                 <p className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-semibold">{user.city || 'N/A'}, {user.wereda || 'N/A'}</span></p>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl p-6 shadow">
//               <h3 className="font-bold text-xl mb-4">Update profile</h3>
//               <div className="space-y-3 text-sm text-gray-600">
//                 <p>Use the school registration form to change your personal details and contact information.</p>
//                 <p className="rounded-lg bg-blue-50 p-3">Your information is protected and only visible to your authorized teacher and school admin.</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'courses' && (
//           <div className="bg-white rounded-2xl p-5 shadow">
//             <h3 className="font-bold text-lg mb-4">My enrolled courses</h3>
//             <div className="space-y-3">
//               {courses.map((course) => (
//                 <div key={course.id} className="border rounded-lg p-4">
//                   <p className="font-semibold">{course.title}</p>
//                   <p className="text-sm text-gray-500">{course.grade} • {course.subject} • {course.status}</p>
//                   <p className="text-sm mt-2">{course.description}</p>
//                   <p className="text-xs text-gray-500 mt-2">Schedule: {course.schedule} • Progress: {course.progress}</p>
//                   <div className="mt-3 text-sm text-gray-600">
//                     <p><span className="font-semibold">Materials:</span> {course.materials.join(', ')}</p>
//                     <p><span className="font-semibold">Assignments:</span> {course.assignments.join(', ')}</p>
//                     <p><span className="font-semibold">Exams:</span> {course.exams.join(', ')}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === 'learning' && (
//           <div className="bg-white rounded-2xl p-5 shadow">
//             <h3 className="font-bold text-lg mb-4">Learning materials</h3>
//             <div className="grid gap-3 md:grid-cols-2">
//               {resources.map((item) => (
//                 <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
//                   <div>
//                     <p className="font-semibold">{item.title}</p>
//                     <p className="text-sm text-gray-500">{item.type}</p>
//                   </div>
//                   <a href={item.link || '#'} className="text-blue-600">Open</a>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === 'assessments' && (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Available quizzes and exams</h3>
//               <div className="space-y-2">
//                 {quizzes.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
//                     <span className="font-semibold">{item.title}</span>
//                     <span className="text-sm text-gray-500">{item.status}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Premium learning resources</h3>
//               <p className="text-sm text-gray-600">Upgrade to premium to access extra videos, practice packs, and advanced notes.</p>
//               <button className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg">Contribute to unlock premium access</button>
//             </div>
//           </div>
//         )}

//         {activeTab === 'results' && (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Grades and progress</h3>
//               <div className="space-y-2">
//                 {grades.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3">
//                     <p className="font-semibold">{item.title}</p>
//                     <p className="text-sm text-gray-500">{item.date}</p>
//                     <p className="text-lg font-black text-green-700">{item.score}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Certificates</h3>
//               <div className="space-y-2">
//                 {certificates.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
//                     <div>
//                       <p className="font-semibold">{item.title}</p>
//                       <p className="text-sm text-gray-500">{item.status}</p>
//                     </div>
//                     <button className="bg-blue-600 text-white px-3 py-2 rounded-lg">Download</button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'support' && (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Submit a complaint or feedback</h3>
//               <form onSubmit={submitComplaint} className="space-y-3">
//                 <input value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} placeholder="Your concern or feedback" className="w-full border p-2 rounded-lg" />
//                 <button className="w-full bg-orange-600 text-white py-2 rounded-lg">Send</button>
//               </form>
//               <div className="mt-4 space-y-2">
//                 {complaints.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
//                     <span className="font-semibold">{item.title}</span>
//                     <span className="text-sm text-gray-500">{item.status}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Questions and announcements</h3>
//               <div className="space-y-2">
//                 {announcements.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3">
//                     <p className="font-semibold">{item.title}</p>
//                     <p className="text-sm text-gray-500">{item.body}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentProfile;






import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const defaultResources = [
  { id: 1, title: 'የመሠረታዊ ሂሳብ ትምህርት', type: 'PDF', link: '#' },
  { id: 2, title: 'የሳይንስ መግቢያ', type: 'Video', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 3, title: 'የሳምንቱ ንባብ ማስታወሻዎች', type: 'Book', link: '#' },
];

const defaultQuizzes = [
  { id: 1, title: 'የሂሳብ ፈተና', status: 'Available' },
  { id: 2, title: 'የሳይንስ ፈተና', status: 'Pending' },
];

const defaultGrades = [
  { id: 1, title: 'የሂሳብ ፈተና', score: '92%', date: '2026-07-16' },
  { id: 2, title: 'የንባብ የቤት ሥራ', score: '88%', date: '2026-07-18' },
];

const defaultAnnouncements = [
  { id: 1, title: 'የወላጆች ስብሰባ', body: 'እባክዎ ዓርብ በሚካሄደው የወላጆች ስብሰባ ላይ ይገኙ።' },
];

const defaultComplaints = [
  { id: 1, title: 'ተጨማሪ የመለማመጃ መረጃዎች እፈልጋለሁ', status: 'Open' },
];

const defaultCertificates = [
  { id: 1, title: 'የአንደኛ ክፍል ማጠናቀቂያ የምስክር ወረቀት', status: 'Ready to Download' },
];

const defaultCourses = [
  {
    id: 1,
    title: 'መሠረታዊ ሂሳብ',
    description: 'የቁጥሮች እና የሂሳብ አሰራር ጽንሰ-ሀሳቦችን ይማሩ።',
    grade: 'ክፍል 1 (Grade 1)',
    subject: 'ሂሳብ',
    schedule: 'ሰኞ 4:00 (Monday 10:00)',
    status: 'በሂደት ላይ (Active)',
    materials: ['PDF ማስታወሻዎች', 'የቪዲዮ ትምህርት'],
    assignments: ['የሳምንት 1 የቤት ሥራ'],
    exams: ['የአጋማሽ ፈተና'],
    progress: '78%',
  },
];

const TABS = [
  { id: 'overview', label: 'አጠቃላይ እይታ' },
  { id: 'profile', label: 'የእኔ መረጃ' },
  { id: 'learning', label: 'የመማሪያ መረጃዎች' },
  { id: 'courses', label: 'ኮርሶች' },
  { id: 'assessments', label: 'ፈተናዎች' },
  { id: 'results', label: 'ውጤቶች' },
  { id: 'support', label: 'ድጋፍ' },
];

const StudentProfile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [resources, setResources] = useState(defaultResources);
  const [quizzes, setQuizzes] = useState(defaultQuizzes);
  const [grades] = useState(defaultGrades);
  const [announcements] = useState(defaultAnnouncements);
  const [complaints, setComplaints] = useState(defaultComplaints);
  const [certificates, setCertificates] = useState(defaultCertificates);
  const [courses] = useState(defaultCourses);
  const [complaintForm, setComplaintForm] = useState({ title: '', status: 'ክፍት (Open)' });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/profile-data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Server returned an error');

        const payload = await response.json();
        const data = payload?.data || payload;

        if (!active) return;

        setResources(data.resources || defaultResources);
        setQuizzes(data.quizzes || defaultQuizzes);
        setComplaints(data.complaints || defaultComplaints);
        setCertificates(data.certificates || defaultCertificates);
        setIsLoaded(true);
      } catch (error) {
        console.error('Unable to load student profile data', error);
        const stored = localStorage.getItem('studentProfileData');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed) {
              setResources(parsed.resources || defaultResources);
              setQuizzes(parsed.quizzes || defaultQuizzes);
              setComplaints(parsed.complaints || defaultComplaints);
              setCertificates(parsed.certificates || defaultCertificates);
            }
          } catch (parseError) {
            console.error('Unable to parse cached student profile data', parseError);
          }
        }
        if (active) {
          setIsLoaded(true);
        }
      }
    };

    const getData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        onLogout();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (active) setUser(data);
        } else {
          localStorage.clear();
          onLogout();
        }
      } catch (err) {
        console.error('Connection failed');
      }
    };

    loadData();
    getData();
    return () => {
      active = false;
    };
  }, [onLogout]);

  useEffect(() => {
    if (!isLoaded) return;

    const payload = {
      resources,
      quizzes,
      grades,
      announcements,
      complaints,
      certificates,
      courses,
    };

    localStorage.setItem('studentProfileData', JSON.stringify(payload));

    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/student/profile-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error('Unable to save student profile data', error);
    });
  }, [isLoaded, resources, quizzes, grades, announcements, complaints, certificates, courses]);

  const attendanceRate = useMemo(() => '96%', []);

  const submitComplaint = (e) => {
    e.preventDefault();
    if (!complaintForm.title) return;
    setComplaints([{ id: Date.now(), ...complaintForm }, ...complaints]);
    setComplaintForm({ title: '', status: 'ክፍት (Open)' });
  };

  if (!user) return <p className="text-center p-10 font-bold">መረጃ በመጫን ላይ... (Loading...)</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">የተማሪ ገጽ (Student Portal)</h1>
            <p className="text-blue-100 mt-2">ተመዝገቡ፣ ይማሩ፣ ውጤትዎን ይከታተሉ፣ አስተያየት ይስጡ እና የትምህርት መረጃዎችን ከአንድ ቦታ ያግኙ።</p>
          </div>
          <button onClick={onLogout} className="bg-white text-blue-900 px-4 py-2 rounded-xl font-semibold">ይውጡ (Logout)</button>
        </div>

        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-lg">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl font-semibold capitalize ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-2">የእኔ መረጃ</h3>
              <p className="text-sm text-gray-500">የግል መረጃዎን፣ የመገናኛ አድራሻዎን እና የአደጋ ጊዜ ተጠሪዎን ያዘምኑ።</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-2">መገኘት (Attendance)</h3>
              <p className="text-3xl font-black">{attendanceRate}</p>
              <p className="text-sm text-gray-500">የአሁኑ የመገኘት መጠንዎ</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-2">ፕሪሚየም አገልግሎት</h3>
              <p className="text-sm text-gray-500">ተጨማሪ ቪዲዮዎችን፣ ማስታወሻዎችን እና የመለማመጃ መረጃዎችን ያግኙ።</p>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ፈጣን ማገናኛዎች</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => setActiveTab('learning')} className="bg-blue-600 text-white py-2 rounded-lg">የማስተማሪያ መረጃዎችን ይክፈቱ</button>
                <button onClick={() => setActiveTab('assessments')} className="bg-green-600 text-white py-2 rounded-lg">ፈተና ይውሰዱ</button>
                <button onClick={() => setActiveTab('results')} className="bg-purple-600 text-white py-2 rounded-lg">ውጤቶችን ይመልከቱ</button>
                <button onClick={() => setActiveTab('support')} className="bg-orange-600 text-white py-2 rounded-lg">አስተያየት ይላኩ</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ማስታወቂያዎች</h3>
              <div className="space-y-2">
                {announcements.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="font-bold text-xl mb-4">የእኔ መረጃ</h3>
              <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 mb-6">
                <QRCodeSVG value={JSON.stringify({ studentId: user._id })} size={160} level="H" includeMargin={false} />
                <p className="mt-3 text-sm font-semibold text-blue-900">ለመገኘት ስካን ያድርጉ (Scan for attendance)</p>
              </div>
              <div className="space-y-3 text-sm">
                <p className="flex justify-between"><span className="text-gray-500">ሙሉ ስም (Name)</span><span className="font-semibold">{user.fullName}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">ኢሜይል (Email)</span><span className="font-semibold">{user.email}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">ስልክ ቁጥር (Phone)</span><span className="font-semibold">{user.phoneNumber || 'N/A'}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">አድራሻ (Address)</span><span className="font-semibold">{user.city || 'N/A'}, {user.wereda || 'N/A'}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="font-bold text-xl mb-4">መረጃን ያዘምኑ</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>የግል መረጃዎን እና አድራሻዎን ለመቀየር የትምህርት ቤቱን የመመዝገቢያ ቅጽ ይጠቀሙ።</p>
                <p className="rounded-lg bg-blue-50 p-3">መረጃዎ የተጠበቀ ሲሆን ለተፈቀደላቸው መምህራን እና የትምህርት ቤቱ አስተዳዳሪዎች ብቻ የሚታይ ነው።</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl p-5 shadow">
            <h3 className="font-bold text-lg mb-4">የተመዘገቡባቸው ኮርሶች</h3>
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.grade} • {course.subject} • {course.status}</p>
                  <p className="text-sm mt-2">{course.description}</p>
                  <p className="text-xs text-gray-500 mt-2">መርሐግብር: {course.schedule} • ሂደት: {course.progress}</p>
                  <div className="mt-3 text-sm text-gray-600">
                    <p><span className="font-semibold">ማቴሪያሎች:</span> {course.materials.join(', ')}</p>
                    <p><span className="font-semibold">የቤት ሥራዎች:</span> {course.assignments.join(', ')}</p>
                    <p><span className="font-semibold">ፈተናዎች:</span> {course.exams.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="bg-white rounded-2xl p-5 shadow">
            <h3 className="font-bold text-lg mb-4">የመማሪያ መረጃዎች</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {resources.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.type}</p>
                  </div>
                  <a href={item.link || '#'} className="text-blue-600 font-bold">ክፈት (Open)</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ያሉ ፈተናዎች</h3>
              <div className="space-y-2">
                {quizzes.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-sm text-gray-500">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">የፕሪሚየም መማሪያ መረጃዎች</h3>
              <p className="text-sm text-gray-600">ተጨማሪ ቪዲዮዎችን፣ የመለማመጃ ጥያቄዎችን እና የላቁ ማስታወሻዎችን ለማግኘት ወደ ፕሪሚየም ያሳድጉ።</p>
              <button className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg">የፕሪሚየም አገልግሎትን ለማግኘት ክፍያ ይፈጽሙ</button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ውጤቶች እና ሂደት</h3>
              <div className="space-y-2">
                {grades.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                    <p className="text-lg font-black text-green-700">{item.score}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">የምስክር ወረቀቶች (Certificates)</h3>
              <div className="space-y-2">
                {certificates.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.status}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-2 rounded-lg">አውርድ (Download)</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ቅሬታ ወይም አስተያየት ያቅርቡ</h3>
              <form onSubmit={submitComplaint} className="space-y-3">
                <input value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} placeholder="የእርስዎ ቅሬታ ወይም አስተያየት (Your feedback)" className="w-full border p-2 rounded-lg" />
                <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold">ላክ (Send)</button>
              </form>
              <div className="mt-4 space-y-2">
                {complaints.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-sm text-gray-500">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ጥያቄዎች እና ማስታወቂያዎች</h3>
              <div className="space-y-2">
                {announcements.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;