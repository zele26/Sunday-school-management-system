// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const defaultClasses = [
//   {
//     id: 1,
//     name: 'Grade 1A',
//     subject: 'Mathematics',
//     students: [
//       { id: 1, name: 'Selam Tadesse', attendance: 'Present', performance: 92 },
//       { id: 2, name: 'Mulugeta Bekele', attendance: 'Absent', performance: 78 },
//     ],
//   },
//   {
//     id: 2,
//     name: 'Grade 5B',
//     subject: 'Science',
//     students: [
//       { id: 3, name: 'Hana Bekele', attendance: 'Present', performance: 88 },
//     ],
//   },
// ];

// const defaultLessons = [
//   { id: 1, title: 'Fractions Basics', className: 'Grade 1A', topic: 'Numeracy', status: 'Planned' },
//   { id: 2, title: 'Human Body Systems', className: 'Grade 5B', topic: 'Science', status: 'Ready' },
// ];

// const defaultAssignments = [
//   { id: 1, title: 'Math Practice Worksheet', className: 'Grade 1A', dueDate: '2026-07-24', status: 'Active' },
// ];

// const defaultQuizzes = [
//   { id: 1, title: 'Quick Quiz: Fractions', className: 'Grade 1A', status: 'Draft' },
// ];

// const defaultExams = [
//   { id: 1, title: 'Midterm Exam', className: 'Grade 5B', status: 'Pending Approval' },
// ];

// const defaultMaterials = [
//   { id: 1, title: 'Algebra Notes', type: 'PDF', link: '#' },
// ];

// const defaultAnnouncements = [
//   { id: 1, title: 'Parent meeting reminder', body: 'Please confirm your attendance for Friday.', date: '2026-07-19' },
// ];

// const defaultCourses = [
//   {
//     id: 1,
//     title: 'Mathematics Foundations',
//     description: 'Build arithmetic, problem solving, and confidence.',
//     grade: 'Grade 1',
//     subject: 'Mathematics',
//     teacher: 'Teacher A',
//     duration: '8 weeks',
//     startDate: '2026-07-01',
//     endDate: '2026-08-26',
//     schedule: 'Monday 10:00',
//     status: 'Active',
//     maxStudents: 30,
//     materials: ['PDF Notes', 'Video Lesson'],
//     assignments: ['Week 1 Worksheet'],
//     exams: ['Midterm Quiz'],
//     prerequisites: 'None',
//   },
// ];

// const defaultGrades = [
//   { id: 1, student: 'Selam Tadesse', title: 'Math Practice Worksheet', score: '92', feedback: 'Excellent work and clear reasoning.' },
// ];

// const TeacherDashboard = ({ onLogout }) => {
//   const navigate = useNavigate();
//   const [teacher, setTeacher] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [students, setStudents] = useState([]);
//   const [classes, setClasses] = useState(defaultClasses);
//   const [lessons, setLessons] = useState(defaultLessons);
//   const [assignments, setAssignments] = useState(defaultAssignments);
//   const [quizzes, setQuizzes] = useState(defaultQuizzes);
//   const [exams, setExams] = useState(defaultExams);
//   const [materials, setMaterials] = useState(defaultMaterials);
//   const [announcements, setAnnouncements] = useState(defaultAnnouncements);
//   const [courses, setCourses] = useState(defaultCourses);
//   const [grades, setGrades] = useState(defaultGrades);
//   const [selectedClass, setSelectedClass] = useState(defaultClasses[0]?.name || '');
//   const [lessonForm, setLessonForm] = useState({ title: '', className: 'Grade 1A', topic: '', status: 'Planned' });
//   const [assignmentForm, setAssignmentForm] = useState({ title: '', className: 'Grade 1A', dueDate: '', status: 'Active' });
//   const [quizForm, setQuizForm] = useState({ title: '', className: 'Grade 1A', status: 'Draft' });
//   const [examForm, setExamForm] = useState({ title: '', className: 'Grade 1A', status: 'Pending Approval' });
//   const [materialForm, setMaterialForm] = useState({ title: '', type: 'PDF', link: '' });
//   const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
//   const [courseForm, setCourseForm] = useState({
//     title: '',
//     description: '',
//     grade: 'Grade 1',
//     subject: '',
//     teacher: 'Teacher A',
//     duration: '',
//     startDate: '',
//     endDate: '',
//     schedule: '',
//     status: 'Draft',
//     maxStudents: '',
//     materials: '',
//     assignments: '',
//     exams: '',
//     prerequisites: '',
//   });
//   const [gradeForm, setGradeForm] = useState({ student: '', title: '', score: '', feedback: '' });

//   const API_BASE_URL = 'http://localhost:5000';

//   useEffect(() => {
//     let active = true;

//     const loadData = async () => {
//       try {
//         const response = await fetch('/api/teacher/dashboard-data');
//         if (!response.ok) throw new Error('Server returned an error');

//         const payload = await response.json();
//         const data = payload?.data || payload;

//         if (!active) return;

//         setClasses(data.classes || defaultClasses);
//         setLessons(data.lessons || defaultLessons);
//         setAssignments(data.assignments || defaultAssignments);
//         setQuizzes(data.quizzes || defaultQuizzes);
//         setExams(data.exams || defaultExams);
//         setMaterials(data.materials || defaultMaterials);
//         setAnnouncements(data.announcements || defaultAnnouncements);
//         setCourses(data.courses || defaultCourses);
//         setGrades(data.grades || defaultGrades);
//         setIsLoaded(true);
//       } catch (error) {
//         console.error('Unable to load teacher dashboard data', error);
//         const stored = localStorage.getItem('teacherDashboardData');
//         if (stored) {
//           try {
//             const parsed = JSON.parse(stored);
//             if (parsed) {
//               setClasses(parsed.classes || defaultClasses);
//               setLessons(parsed.lessons || defaultLessons);
//               setAssignments(parsed.assignments || defaultAssignments);
//               setQuizzes(parsed.quizzes || defaultQuizzes);
//               setExams(parsed.exams || defaultExams);
//               setMaterials(parsed.materials || defaultMaterials);
//               setAnnouncements(parsed.announcements || defaultAnnouncements);
//               setCourses(parsed.courses || defaultCourses);
//               setGrades(parsed.grades || defaultGrades);
//             }
//           } catch (parseError) {
//             console.error('Unable to parse cached teacher dashboard data', parseError);
//           }
//         }
//         if (active) {
//           setIsLoaded(true);
//         }
//       }
//     };

//     const fetchTeacherData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         if (res.ok) setTeacher(data);
//       } catch (err) {
//         console.error('Error fetching teacher data:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchStudents = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/students`);
//         const data = await res.json();
//         setStudents(data);
//       } catch (err) {
//         console.error('Error fetching students:', err);
//       }
//     };

//     loadData();
//     fetchTeacherData();
//     fetchStudents();
//     return () => {
//       active = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (!isLoaded) return;

//     const payload = {
//       classes,
//       lessons,
//       assignments,
//       quizzes,
//       exams,
//       materials,
//       announcements,
//       courses,
//       grades,
//     };

//     localStorage.setItem('teacherDashboardData', JSON.stringify(payload));

//     fetch('/api/teacher/dashboard-data', {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     }).catch((error) => {
//       console.error('Unable to save teacher dashboard data', error);
//     });
//   }, [isLoaded, classes, lessons, assignments, quizzes, exams, materials, announcements, courses, grades]);

//   const activeClass = classes.find((item) => item.name === selectedClass) || classes[0];

//   const addLesson = (e) => {
//     e.preventDefault();
//     if (!lessonForm.title) return;
//     setLessons([{ id: Date.now(), ...lessonForm }, ...lessons]);
//     setLessonForm({ title: '', className: lessonForm.className, topic: '', status: 'Planned' });
//   };

//   const addAssignment = (e) => {
//     e.preventDefault();
//     if (!assignmentForm.title) return;
//     setAssignments([{ id: Date.now(), ...assignmentForm }, ...assignments]);
//     setAssignmentForm({ title: '', className: assignmentForm.className, dueDate: '', status: 'Active' });
//   };

//   const addQuiz = (e) => {
//     e.preventDefault();
//     if (!quizForm.title) return;
//     setQuizzes([{ id: Date.now(), ...quizForm }, ...quizzes]);
//     setQuizForm({ title: '', className: quizForm.className, status: 'Draft' });
//   };

//   const publishExam = (id) => {
//     setExams(exams.map((item) => item.id === id ? { ...item, status: 'Published' } : item));
//   };

//   const addMaterial = (e) => {
//     e.preventDefault();
//     if (!materialForm.title) return;
//     setMaterials([{ id: Date.now(), ...materialForm }, ...materials]);
//     setMaterialForm({ title: '', type: 'PDF', link: '' });
//   };

//   const addAnnouncement = (e) => {
//     e.preventDefault();
//     if (!announcementForm.title) return;
//     setAnnouncements([{ id: Date.now(), title: announcementForm.title, body: announcementForm.body, date: new Date().toISOString().slice(0, 10) }, ...announcements]);
//     setAnnouncementForm({ title: '', body: '' });
//   };

//   const addCourse = (e) => {
//     e.preventDefault();
//     if (!courseForm.title) return;
//     setCourses([{ id: Date.now(), ...courseForm, materials: courseForm.materials.split(','), assignments: courseForm.assignments.split(','), exams: courseForm.exams.split(',') }, ...courses]);
//     setCourseForm({
//       title: '',
//       description: '',
//       grade: 'Grade 1',
//       subject: '',
//       teacher: 'Teacher A',
//       duration: '',
//       startDate: '',
//       endDate: '',
//       schedule: '',
//       status: 'Draft',
//       maxStudents: '',
//       materials: '',
//       assignments: '',
//       exams: '',
//       prerequisites: '',
//     });
//   };

//   const addGrade = (e) => {
//     e.preventDefault();
//     if (!gradeForm.student || !gradeForm.title) return;
//     setGrades([{ id: Date.now(), ...gradeForm }, ...grades]);
//     setGradeForm({ student: '', title: '', score: '', feedback: '' });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <p className="text-gray-500 text-lg">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 shadow-lg flex justify-between items-center">
//         <h1 className="font-bold text-lg italic">ተክለሳዊሮስ መምህራን መድረክ</h1>
//         <button
//           onClick={() => { onLogout(); navigate('/'); }}
//           className="bg-red-500 px-4 py-1 rounded-lg text-sm hover:bg-red-600 transition"
//         >
//           ውጣ (Logout)
//         </button>
//       </nav>

//       <div className="p-6 max-w-7xl mx-auto">
//         <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8 flex items-center gap-6">
//           <div className="text-5xl">👨‍🏫</div>
//           <div>
//             <h2 className="text-3xl font-bold text-gray-800">
//               እንኳን ደህና መጡ፣ መምህር {teacher?.fullName?.split(' ')[0] || 'Teacher'}!
//             </h2>
//             <p className="text-gray-500">Manage classes, learning materials, assessments, attendance, and communication from one workspace.</p>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-lg">
//           {['overview', 'classes', 'courses', 'content', 'grading', 'communication', 'reports'].map((tab) => (
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
//           <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <p className="text-sm text-gray-500">Assigned Classes</p>
//               <p className="text-3xl font-black mt-2">{classes.length}</p>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <p className="text-sm text-gray-500">Students</p>
//               <p className="text-3xl font-black mt-2">{students.length}</p>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <p className="text-sm text-gray-500">Assignments</p>
//               <p className="text-3xl font-black mt-2">{assignments.length}</p>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <p className="text-sm text-gray-500">Pending Exams</p>
//               <p className="text-3xl font-black mt-2">{exams.filter((item) => item.status !== 'Published').length}</p>
//             </div>

//             <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-3">Recent class activity</h3>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li>• Created a new lesson plan for Grade 1A.</li>
//                 <li>• Published a reminder announcement for parents.</li>
//                 <li>• Reviewed student performance and uploaded new materials.</li>
//               </ul>
//             </div>

//             <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-3">Quick tasks</h3>
//               <div className="grid gap-3 sm:grid-cols-2">
//                 <button onClick={() => setActiveTab('content')} className="bg-blue-600 text-white py-2 rounded-lg">Create lesson or assessment</button>
//                 <button onClick={() => setActiveTab('grading')} className="bg-green-600 text-white py-2 rounded-lg">Grade submissions</button>
//                 <button onClick={() => setActiveTab('communication')} className="bg-purple-600 text-white py-2 rounded-lg">Send announcement</button>
//                 <button onClick={() => setActiveTab('reports')} className="bg-orange-600 text-white py-2 rounded-lg">Generate report</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'classes' && (
//           <div className="grid gap-6 lg:grid-cols-3">
//             <div className="lg:col-span-2 space-y-4">
//               {classes.map((item) => (
//                 <div key={item.id} className="bg-white rounded-2xl p-5 shadow">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-xl font-bold">{item.name}</h3>
//                       <p className="text-sm text-gray-500">{item.subject}</p>
//                     </div>
//                     <button onClick={() => setSelectedClass(item.name)} className="bg-blue-600 text-white px-3 py-2 rounded-lg">View roster</button>
//                   </div>
//                   <div className="mt-4">
//                     {item.students.map((student) => (
//                       <div key={student.id} className="flex justify-between border rounded-lg p-3 mb-2">
//                         <div>
//                           <p className="font-semibold">{student.name}</p>
//                           <p className="text-sm text-gray-500">Attendance: {student.attendance}</p>
//                         </div>
//                         <span className="text-sm font-semibold text-green-700">Performance: {student.performance}%</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Current class focus</h3>
//               <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border p-2 rounded-lg mb-4">
//                 {classes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
//               </select>
//               {activeClass && (
//                 <div>
//                   <p className="font-semibold">{activeClass.name}</p>
//                   <p className="text-sm text-gray-500">{activeClass.subject}</p>
//                   <p className="mt-3 text-sm">Use this view to monitor student attendance and performance for the selected class.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {activeTab === 'courses' && (
//           <div className="bg-white rounded-2xl p-5 shadow">
//             <h3 className="font-bold text-lg mb-4">Manage assigned courses</h3>
//             <form onSubmit={addCourse} className="space-y-3 mb-4">
//               <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Course title" className="w-full border p-2 rounded-lg" />
//               <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Description and objectives" className="w-full border p-2 rounded-lg" rows="3" />
//               <div className="grid md:grid-cols-2 gap-3">
//                 <input value={courseForm.grade} onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })} placeholder="Grade/Class" className="border p-2 rounded-lg" />
//                 <input value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} placeholder="Subject" className="border p-2 rounded-lg" />
//                 <input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="Duration" className="border p-2 rounded-lg" />
//                 <input value={courseForm.schedule} onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })} placeholder="Weekly schedule" className="border p-2 rounded-lg" />
//                 <input value={courseForm.startDate} type="date" onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })} className="border p-2 rounded-lg" />
//                 <input value={courseForm.endDate} type="date" onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })} className="border p-2 rounded-lg" />
//                 <input value={courseForm.maxStudents} onChange={(e) => setCourseForm({ ...courseForm, maxStudents: e.target.value })} placeholder="Max students" className="border p-2 rounded-lg" />
//                 <input value={courseForm.materials} onChange={(e) => setCourseForm({ ...courseForm, materials: e.target.value })} placeholder="Materials" className="border p-2 rounded-lg" />
//                 <input value={courseForm.assignments} onChange={(e) => setCourseForm({ ...courseForm, assignments: e.target.value })} placeholder="Assignments" className="border p-2 rounded-lg" />
//                 <input value={courseForm.exams} onChange={(e) => setCourseForm({ ...courseForm, exams: e.target.value })} placeholder="Exams" className="border p-2 rounded-lg" />
//               </div>
//               <input value={courseForm.prerequisites} onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })} placeholder="Prerequisites" className="w-full border p-2 rounded-lg" />
//               <button className="w-full bg-blue-700 text-white py-2 rounded-lg">Save course</button>
//             </form>
//             <div className="space-y-2">
//               {courses.map((course) => (
//                 <div key={course.id} className="border rounded-lg p-3">
//                   <p className="font-semibold">{course.title}</p>
//                   <p className="text-sm text-gray-500">{course.grade} • {course.subject} • {course.status}</p>
//                   <p className="text-sm mt-1">{course.description}</p>
//                   <p className="text-xs text-gray-500 mt-1">Schedule: {course.schedule || 'TBD'} • Materials: {course.materials?.join(', ') || 'None'}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === 'content' && (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Create lesson plan</h3>
//               <form onSubmit={addLesson} className="space-y-3">
//                 <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className="w-full border p-2 rounded-lg" />
//                 <input value={lessonForm.topic} onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })} placeholder="Topic" className="w-full border p-2 rounded-lg" />
//                 <select value={lessonForm.className} onChange={(e) => setLessonForm({ ...lessonForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
//                   {classes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
//                 </select>
//                 <button className="w-full bg-blue-600 text-white py-2 rounded-lg">Save lesson</button>
//               </form>
//               <div className="mt-4 space-y-2">
//                 {lessons.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3">
//                     <p className="font-semibold">{item.title}</p>
//                     <p className="text-sm text-gray-500">{item.className} • {item.topic} • {item.status}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div className="bg-white rounded-2xl p-5 shadow">
//                 <h3 className="font-bold text-lg mb-4">Assignments</h3>
//                 <form onSubmit={addAssignment} className="space-y-3">
//                   <input value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} placeholder="Assignment title" className="w-full border p-2 rounded-lg" />
//                   <input value={assignmentForm.dueDate} type="date" onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} className="w-full border p-2 rounded-lg" />
//                   <select value={assignmentForm.className} onChange={(e) => setAssignmentForm({ ...assignmentForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
//                     {classes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
//                   </select>
//                   <button className="w-full bg-green-600 text-white py-2 rounded-lg">Create assignment</button>
//                 </form>
//                 <div className="mt-4 space-y-2">
//                   {assignments.map((item) => (
//                     <div key={item.id} className="border rounded-lg p-3">
//                       <p className="font-semibold">{item.title}</p>
//                       <p className="text-sm text-gray-500">{item.className} • Due {item.dueDate || 'TBD'} • {item.status}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl p-5 shadow">
//                 <h3 className="font-bold text-lg mb-4">Quizzes and exams</h3>
//                 <form onSubmit={addQuiz} className="space-y-3 mb-4">
//                   <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="Quiz title" className="w-full border p-2 rounded-lg" />
//                   <select value={quizForm.className} onChange={(e) => setQuizForm({ ...quizForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
//                     {classes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
//                   </select>
//                   <button className="w-full bg-purple-600 text-white py-2 rounded-lg">Save quiz</button>
//                 </form>
//                 <form onSubmit={(e) => { e.preventDefault(); if (!examForm.title) return; setExams([{ id: Date.now(), ...examForm }, ...exams]); setExamForm({ title: '', className: examForm.className, status: 'Pending Approval' }); }} className="space-y-3">
//                   <input value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} placeholder="Exam title" className="w-full border p-2 rounded-lg" />
//                   <select value={examForm.className} onChange={(e) => setExamForm({ ...examForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
//                     {classes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
//                   </select>
//                   <button className="w-full bg-orange-600 text-white py-2 rounded-lg">Create exam</button>
//                 </form>
//                 <div className="mt-4 space-y-2">
//                   {exams.map((item) => (
//                     <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
//                       <div>
//                         <p className="font-semibold">{item.title}</p>
//                         <p className="text-sm text-gray-500">{item.className} • {item.status}</p>
//                       </div>
//                       {item.status !== 'Published' && <button onClick={() => publishExam(item.id)} className="bg-green-600 text-white px-3 py-2 rounded-lg">Publish</button>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'grading' && (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Grade submissions</h3>
//               <form onSubmit={addGrade} className="space-y-3">
//                 <input value={gradeForm.student} onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })} placeholder="Student name" className="w-full border p-2 rounded-lg" />
//                 <input value={gradeForm.title} onChange={(e) => setGradeForm({ ...gradeForm, title: e.target.value })} placeholder="Assessment title" className="w-full border p-2 rounded-lg" />
//                 <input value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })} placeholder="Score" className="w-full border p-2 rounded-lg" />
//                 <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Feedback" className="w-full border p-2 rounded-lg" rows="3" />
//                 <button className="w-full bg-green-700 text-white py-2 rounded-lg">Save grade</button>
//               </form>
//             </div>

//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Results and feedback</h3>
//               <div className="space-y-2">
//                 {grades.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3">
//                     <p className="font-semibold">{item.student} • {item.title}</p>
//                     <p className="text-sm text-gray-500">Score: {item.score}</p>
//                     <p className="text-sm mt-1">{item.feedback}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'communication' && (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Announcements and notifications</h3>
//               <form onSubmit={addAnnouncement} className="space-y-3">
//                 <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Title" className="w-full border p-2 rounded-lg" />
//                 <textarea value={announcementForm.body} onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })} placeholder="Message" className="w-full border p-2 rounded-lg" rows="4" />
//                 <button className="w-full bg-purple-700 text-white py-2 rounded-lg">Post announcement</button>
//               </form>
//               <div className="mt-4 space-y-2">
//                 {announcements.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3">
//                     <p className="font-semibold">{item.title}</p>
//                     <p className="text-sm text-gray-500">{item.date}</p>
//                     <p className="text-sm mt-1">{item.body}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Upload learning materials</h3>
//               <form onSubmit={addMaterial} className="space-y-3">
//                 <input value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} placeholder="Material title" className="w-full border p-2 rounded-lg" />
//                 <input value={materialForm.type} onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })} placeholder="Type (PDF, Video, Note)" className="w-full border p-2 rounded-lg" />
//                 <input value={materialForm.link} onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })} placeholder="Link or file name" className="w-full border p-2 rounded-lg" />
//                 <button className="w-full bg-indigo-700 text-white py-2 rounded-lg">Upload material</button>
//               </form>
//               <div className="mt-4 space-y-2">
//                 {materials.map((item) => (
//                   <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
//                     <div>
//                       <p className="font-semibold">{item.title}</p>
//                       <p className="text-sm text-gray-500">{item.type}</p>
//                     </div>
//                     <a href={item.link || '#'} className="text-blue-600 text-sm">Open</a>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'reports' && (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Student performance snapshot</h3>
//               <div className="space-y-2">
//                 {students.slice(0, 5).map((student, index) => (
//                   <div key={student._id || index} className="border rounded-lg p-3 flex justify-between">
//                     <span>{student.firstName || student.fullName} {student.lastName || ''}</span>
//                     <span className="font-semibold text-green-700">{student.grade || 'N/A'}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl p-5 shadow">
//               <h3 className="font-bold text-lg mb-4">Class report summary</h3>
//               <div className="space-y-3">
//                 <div className="border rounded-lg p-3">
//                   <p className="text-sm text-gray-500">Attendance</p>
//                   <p className="text-2xl font-black">94%</p>
//                 </div>
//                 <div className="border rounded-lg p-3">
//                   <p className="text-sm text-gray-500">Average assignment score</p>
//                   <p className="text-2xl font-black">86%</p>
//                 </div>
//                 <div className="border rounded-lg p-3">
//                   <p className="text-sm text-gray-500">Pending follow-up</p>
//                   <p className="text-2xl font-black">3 Students</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeacherDashboard;







import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const defaultClasses = [
  {
    id: 1,
    name: 'ክፍል 1ሀ (Grade 1A)',
    subject: 'ሂሳብ (Mathematics)',
    students: [
      { id: 1, name: 'ሰላም ታደሰ', attendance: 'ተገኝቷል/ች (Present)', performance: 92 },
      { id: 2, name: 'ሙሉጌታ በቀለ', attendance: 'አልተገኘም/ች (Absent)', performance: 78 },
    ],
  },
  {
    id: 2,
    name: 'ክፍል 5ለ (Grade 5B)',
    subject: 'ሳይንስ (Science)',
    students: [
      { id: 3, name: 'ሃና በቀለ', attendance: 'ተገኝቷል/ች (Present)', performance: 88 },
    ],
  },
];

const defaultLessons = [
  { id: 1, title: 'የመሠረታዊ ክፍልፋዮች ትምህርት', className: 'ክፍል 1ሀ (Grade 1A)', topic: 'ቁጥሮች', status: 'ታቅዷል (Planned)' },
  { id: 2, title: 'የሰውነት ክፍሎች እና ሥርዓቶች', className: 'ክፍል 5ለ (Grade 5B)', topic: 'ሳይንስ', status: 'ዝግጁ ነው (Ready)' },
];

const defaultAssignments = [
  { id: 1, title: 'የሂሳብ መለማመጃ ወረቀት', className: 'ክፍል 1ሀ (Grade 1A)', dueDate: '2026-07-24', status: 'ንቁ (Active)' },
];

const defaultQuizzes = [
  { id: 1, title: 'አጭር ፈተና፡ ክፍልፋዮች', className: 'ክፍል 1ሀ (Grade 1A)', status: 'ረቂቅ (Draft)' },
];

const defaultExams = [
  { id: 1, title: 'የአጋማሽ ፈተና', className: 'ክፍል 5ለ (Grade 5B)', status: 'ማጽደቅን በመጠበቅ ላይ (Pending Approval)' },
];

const defaultMaterials = [
  { id: 1, title: 'የአልጀብራ ማስታወሻዎች', type: 'PDF', link: '#' },
];

const defaultAnnouncements = [
  { id: 1, title: 'የወላጆች ስብሰባ ማስታወሻ', body: 'እባክዎ ለዓርብ ስብሰባ መገኘትዎን ያረጋግጡ።', date: '2026-07-19' },
];

const defaultCourses = [
  {
    id: 1,
    title: 'መሠረታዊ ሂሳብ',
    description: 'የቁጥር፣ የችግር መፍታት እና በራስ የመተማመን ክህሎትን ማሳደግ።',
    grade: 'ክፍል 1 (Grade 1)',
    subject: 'ሂሳብ',
    teacher: 'መምህር ሀ',
    duration: '8 ሳምንታት',
    startDate: '2026-07-01',
    endDate: '2026-08-26',
    schedule: 'ሰኞ 4:00 (Monday 10:00)',
    status: 'በሂደት ላይ (Active)',
    maxStudents: 30,
    materials: ['PDF ማስታወሻዎች', 'የቪዲዮ ትምህርት'],
    assignments: ['የሳምንት 1 የቤት ሥራ'],
    exams: ['የአጋማሽ ፈተና'],
    prerequisites: 'የለም',
  },
];

const defaultGrades = [
  { id: 1, student: 'ሰላም ታደሰ', title: 'የሂሳብ መለማመጃ ወረቀት', score: '92', feedback: 'በጣም ጥሩ ሥራ እና ግልጽ ማብራሪያ።' },
];

const TABS = [
  { id: 'overview', label: 'አጠቃላይ እይታ (Overview)' },
  { id: 'classes', label: 'ክፍሎች (Classes)' },
  { id: 'courses', label: 'ኮርሶች (Courses)' },
  { id: 'content', label: 'ይዘት እና ፈተናዎች (Content)' },
  { id: 'grading', label: 'ውጤት መስጫ (Grading)' },
  { id: 'communication', label: 'ግንኙነት (Communication)' },
  { id: 'reports', label: 'ሪፖርቶች (Reports)' },
];

const TeacherDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState(defaultClasses);
  const [lessons, setLessons] = useState(defaultLessons);
  const [assignments, setAssignments] = useState(defaultAssignments);
  const [quizzes, setQuizzes] = useState(defaultQuizzes);
  const [exams, setExams] = useState(defaultExams);
  const [materials, setMaterials] = useState(defaultMaterials);
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [courses, setCourses] = useState(defaultCourses);
  const [grades, setGrades] = useState(defaultGrades);
  const [selectedClass, setSelectedClass] = useState(defaultClasses[0]?.name || '');
  const [lessonForm, setLessonForm] = useState({ title: '', className: 'ክፍል 1ሀ (Grade 1A)', topic: '', status: 'ታቅዷል (Planned)' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', className: 'ክፍል 1ሀ (Grade 1A)', dueDate: '', status: 'ንቁ (Active)' });
  const [quizForm, setQuizForm] = useState({ title: '', className: 'ክፍል 1ሀ (Grade 1A)', status: 'ረቂቅ (Draft)' });
  const [examForm, setExamForm] = useState({ title: '', className: 'ክፍል 1ሀ (Grade 1A)', status: 'ማጽደቅን በመጠበቅ ላይ (Pending Approval)' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'PDF', link: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    grade: 'ክፍል 1',
    subject: '',
    teacher: 'መምህር ሀ',
    duration: '',
    startDate: '',
    endDate: '',
    schedule: '',
    status: 'ረቂቅ (Draft)',
    maxStudents: '',
    materials: '',
    assignments: '',
    exams: '',
    prerequisites: '',
  });
  const [gradeForm, setGradeForm] = useState({ student: '', title: '', score: '', feedback: '' });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/dashboard-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Server returned an error');

        const payload = await response.json();
        const data = payload?.data || payload;

        if (!active) return;

        setClasses(data.classes || defaultClasses);
        setLessons(data.lessons || defaultLessons);
        setAssignments(data.assignments || defaultAssignments);
        setQuizzes(data.quizzes || defaultQuizzes);
        setExams(data.exams || defaultExams);
        setMaterials(data.materials || defaultMaterials);
        setAnnouncements(data.announcements || defaultAnnouncements);
        setCourses(data.courses || defaultCourses);
        setGrades(data.grades || defaultGrades);
        setIsLoaded(true);
      } catch (error) {
        console.error('Unable to load teacher dashboard data', error);
        const stored = localStorage.getItem('teacherDashboardData');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed) {
              setClasses(parsed.classes || defaultClasses);
              setLessons(parsed.lessons || defaultLessons);
              setAssignments(parsed.assignments || defaultAssignments);
              setQuizzes(parsed.quizzes || defaultQuizzes);
              setExams(parsed.exams || defaultExams);
              setMaterials(parsed.materials || defaultMaterials);
              setAnnouncements(parsed.announcements || defaultAnnouncements);
              setCourses(parsed.courses || defaultCourses);
              setGrades(parsed.grades || defaultGrades);
            }
          } catch (parseError) {
            console.error('Unable to parse cached teacher dashboard data', parseError);
          }
        }
        if (active) {
          setIsLoaded(true);
        }
      }
    };

    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          onLogout();
          navigate('/');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && active) {
          setTeacher(data);
        } else {
          localStorage.clear();
          onLogout();
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching teacher data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (active) setStudents(data);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

    loadData();
    fetchTeacherData();
    fetchStudents();
    return () => {
      active = false;
    };
  }, [navigate, onLogout]);

  useEffect(() => {
    if (!isLoaded) return;

    const payload = {
      classes,
      lessons,
      assignments,
      quizzes,
      exams,
      materials,
      announcements,
      courses,
      grades,
    };

    localStorage.setItem('teacherDashboardData', JSON.stringify(payload));

    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/teacher/dashboard-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error('Unable to save teacher dashboard data', error);
    });
  }, [isLoaded, classes, lessons, assignments, quizzes, exams, materials, announcements, courses, grades]);

  const activeClass = classes.find((item) => item.name === selectedClass) || classes[0];

  const addLesson = (e) => {
    e.preventDefault();
    if (!lessonForm.title) return;
    setLessons([{ id: Date.now(), ...lessonForm }, ...lessons]);
    setLessonForm({ title: '', className: lessonForm.className, topic: '', status: 'ታቅዷል (Planned)' });
  };

  const addAssignment = (e) => {
    e.preventDefault();
    if (!assignmentForm.title) return;
    setAssignments([{ id: Date.now(), ...assignmentForm }, ...assignments]);
    setAssignmentForm({ title: '', className: assignmentForm.className, dueDate: '', status: 'ንቁ (Active)' });
  };

  const addQuiz = (e) => {
    e.preventDefault();
    if (!quizForm.title) return;
    setQuizzes([{ id: Date.now(), ...quizForm }, ...quizzes]);
    setQuizForm({ title: '', className: quizForm.className, status: 'ረቂቅ (Draft)' });
  };

  const publishExam = (id) => {
    setExams(exams.map((item) => (item.id === id ? { ...item, status: 'ታትሟል (Published)' } : item)));
  };

  const addMaterial = (e) => {
    e.preventDefault();
    if (!materialForm.title) return;
    setMaterials([{ id: Date.now(), ...materialForm }, ...materials]);
    setMaterialForm({ title: '', type: 'PDF', link: '' });
  };

  const addAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementForm.title) return;
    setAnnouncements([{ id: Date.now(), title: announcementForm.title, body: announcementForm.body, date: new Date().toISOString().slice(0, 10) }, ...announcements]);
    setAnnouncementForm({ title: '', body: '' });
  };

  const addCourse = (e) => {
    e.preventDefault();
    if (!courseForm.title) return;
    setCourses([
      {
        id: Date.now(),
        ...courseForm,
        materials: courseForm.materials ? courseForm.materials.split(',') : [],
        assignments: courseForm.assignments ? courseForm.assignments.split(',') : [],
        exams: courseForm.exams ? courseForm.exams.split(',') : [],
      },
      ...courses,
    ]);
    setCourseForm({
      title: '',
      description: '',
      grade: 'ክፍል 1',
      subject: '',
      teacher: 'መምህር ሀ',
      duration: '',
      startDate: '',
      endDate: '',
      schedule: '',
      status: 'ረቂቅ (Draft)',
      maxStudents: '',
      materials: '',
      assignments: '',
      exams: '',
      prerequisites: '',
    });
  };

  const addGrade = (e) => {
    e.preventDefault();
    if (!gradeForm.student || !gradeForm.title) return;
    setGrades([{ id: Date.now(), ...gradeForm }, ...grades]);
    setGradeForm({ student: '', title: '', score: '', feedback: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg font-bold">መረጃ በመጫን ላይ... (Loading...)</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="font-bold text-lg italic">ተክለሳዊሮስ መምህራን መድረክ (Teachers Portal)</h1>
        <button
          onClick={() => {
            onLogout();
            navigate('/');
          }}
          className="bg-red-500 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
        >
          ይውጡ (Logout)
        </button>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8 flex items-center gap-6">
          <div className="text-5xl">👨‍🏫</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              እንኳን ደህና መጡ፣ መምህር {teacher?.fullName?.split(' ')[0] || ''}!
            </h2>
            <p className="text-gray-500 mt-1">ክፍሎችን፣ የትምህርት ቁሳቁሶችን፣ ፈተናዎችን፣ መገኘትን እና ግንኙነቶችን ከአንድ ቦታ ያስዳድሩ።</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-lg">
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="bg-white rounded-2xl p-5 shadow">
              <p className="text-sm text-gray-500">የተመደቡ ክፍሎች</p>
              <p className="text-3xl font-black mt-2">{classes.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <p className="text-sm text-gray-500">ተማሪዎች</p>
              <p className="text-3xl font-black mt-2">{students.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <p className="text-sm text-gray-500">የቤት ሥራዎች</p>
              <p className="text-3xl font-black mt-2">{assignments.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow">
              <p className="text-sm text-gray-500">የሚጠበቁ ፈተናዎች</p>
              <p className="text-3xl font-black mt-2">{exams.filter((item) => item.status !== 'ታትሟል (Published)').length}</p>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-3">የቅርብ ጊዜ የክፍል እንቅስቃሴዎች</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• ለክፍል 1ሀ አዲስ የትምህርት እቅድ ተዘጋጅቷል።</li>
                <li>• ለወላጆች የማስታወሻ መረጃ ተልኳል።</li>
                <li>• የተማሪዎች ውጤት ተገምግሞ አዲስ የመማሪያ ማስታወሻ ተጭኗል።</li>
              </ul>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-3">ፈጣን ተግባራት</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => setActiveTab('content')} className="bg-blue-600 text-white py-2 rounded-lg font-semibold">ትምህርት ወይም ፈተና ያዘጋጁ</button>
                <button onClick={() => setActiveTab('grading')} className="bg-green-600 text-white py-2 rounded-lg font-semibold">የተማሪዎች ሥራዎችን ይገምግሙ</button>
                <button onClick={() => setActiveTab('communication')} className="bg-purple-600 text-white py-2 rounded-lg font-semibold">ማስታወቂያ ይላኩ</button>
                <button onClick={() => setActiveTab('reports')} className="bg-orange-600 text-white py-2 rounded-lg font-semibold">ሪፖርት ያውጡ</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {classes.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.subject}</p>
                    </div>
                    <button onClick={() => setSelectedClass(item.name)} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold">የተማሪዎችን ዝርዝር ይመልከቱ</button>
                  </div>
                  <div className="mt-4">
                    {item.students.map((student) => (
                      <div key={student.id} className="flex justify-between border rounded-lg p-3 mb-2">
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-gray-500">መገኘት: {student.attendance}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-700">ውጤት/አፈጻጸም: {student.performance}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">የተመረጠው ክፍል</h3>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border p-2 rounded-lg mb-4">
                {classes.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              {activeClass && (
                <div>
                  <p className="font-semibold">{activeClass.name}</p>
                  <p className="text-sm text-gray-500">{activeClass.subject}</p>
                  <p className="mt-3 text-sm text-gray-600">ይህንን ገጽ በመጠቀም የተመረጠውን ክፍል የተማሪዎች መገኘት እና ውጤት መከታተል ይችላሉ።</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl p-5 shadow">
            <h3 className="font-bold text-lg mb-4">የተመደቡ ኮርሶችን ያስዳድሩ</h3>
            <form onSubmit={addCourse} className="space-y-3 mb-4">
              <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="የኮርሱ ርዕስ (Course title)" className="w-full border p-2 rounded-lg" />
              <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="መግለጫ እና ዓላማዎች (Description)" className="w-full border p-2 rounded-lg" rows="3" />
              <div className="grid md:grid-cols-2 gap-3">
                <input value={courseForm.grade} onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })} placeholder="ክፍል (Grade/Class)" className="border p-2 rounded-lg" />
                <input value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} placeholder="ትምህርት (Subject)" className="border p-2 rounded-lg" />
                <input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="የቆይታ ጊዜ (Duration)" className="border p-2 rounded-lg" />
                <input value={courseForm.schedule} onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })} placeholder="ሳምንታዊ መርሃግብር (Schedule)" className="border p-2 rounded-lg" />
                <input value={courseForm.startDate} type="date" onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })} className="border p-2 rounded-lg" />
                <input value={courseForm.endDate} type="date" onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })} className="border p-2 rounded-lg" />
                <input value={courseForm.maxStudents} onChange={(e) => setCourseForm({ ...courseForm, maxStudents: e.target.value })} placeholder="ከፍተኛ የተማሪዎች ብዛት" className="border p-2 rounded-lg" />
                <input value={courseForm.materials} onChange={(e) => setCourseForm({ ...courseForm, materials: e.target.value })} placeholder="ማቴሪያሎች (በኮማ የተለዩ)" className="border p-2 rounded-lg" />
                <input value={courseForm.assignments} onChange={(e) => setCourseForm({ ...courseForm, assignments: e.target.value })} placeholder="የቤት ሥራዎች" className="border p-2 rounded-lg" />
                <input value={courseForm.exams} onChange={(e) => setCourseForm({ ...courseForm, exams: e.target.value })} placeholder="ፈተናዎች" className="border p-2 rounded-lg" />
              </div>
              <input value={courseForm.prerequisites} onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })} placeholder="ቅድመ-ሁኔታዎች (Prerequisites)" className="w-full border p-2 rounded-lg" />
              <button className="w-full bg-blue-700 text-white py-2 rounded-lg font-bold">ኮርሱን አስቀምጥ (Save course)</button>
            </form>
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-3">
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.grade} • {course.subject} • {course.status}</p>
                  <p className="text-sm mt-1">{course.description}</p>
                  <p className="text-xs text-gray-500 mt-1">መርሃግብር: {course.schedule || 'TBD'} • ማቴሪያሎች: {course.materials?.join(', ') || 'የለም'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">የትምህርት እቅድ ያዘጋጁ</h3>
              <form onSubmit={addLesson} className="space-y-3">
                <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="የትምህርቱ ርዕስ (Lesson title)" className="w-full border p-2 rounded-lg" />
                <input value={lessonForm.topic} onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })} placeholder="ርዕሰ ጉዳይ (Topic)" className="w-full border p-2 rounded-lg" />
                <select value={lessonForm.className} onChange={(e) => setLessonForm({ ...lessonForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
                  {classes.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">ትምህርቱን አስቀምጥ (Save lesson)</button>
              </form>
              <div className="mt-4 space-y-2">
                {lessons.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.className} • {item.topic} • {item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow">
                <h3 className="font-bold text-lg mb-4">የቤት ሥራዎች (Assignments)</h3>
                <form onSubmit={addAssignment} className="space-y-3">
                  <input value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} placeholder="የቤት ሥራው ርዕስ" className="w-full border p-2 rounded-lg" />
                  <input value={assignmentForm.dueDate} type="date" onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} className="w-full border p-2 rounded-lg" />
                  <select value={assignmentForm.className} onChange={(e) => setAssignmentForm({ ...assignmentForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
                    {classes.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold">የቤት ሥራ ፍጠር (Create assignment)</button>
                </form>
                <div className="mt-4 space-y-2">
                  {assignments.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.className} • የሚያበቃበት ቀን: {item.dueDate || 'TBD'} • {item.status}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow">
                <h3 className="font-bold text-lg mb-4">አጫጭር ጥያቄዎች እና ፈተናዎች</h3>
                <form onSubmit={addQuiz} className="space-y-3 mb-4">
                  <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="የአጭር ፈተና (Quiz) ርዕስ" className="w-full border p-2 rounded-lg" />
                  <select value={quizForm.className} onChange={(e) => setQuizForm({ ...quizForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
                    {classes.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold">አጭር ፈተና አስቀምጥ</button>
                </form>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!examForm.title) return;
                    setExams([{ id: Date.now(), ...examForm }, ...exams]);
                    setExamForm({ title: '', className: examForm.className, status: 'ማጽደቅን በመጠበቅ ላይ (Pending Approval)' });
                  }}
                  className="space-y-3"
                >
                  <input value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} placeholder="የዋና ፈተና (Exam) ርዕስ" className="w-full border p-2 rounded-lg" />
                  <select value={examForm.className} onChange={(e) => setExamForm({ ...examForm, className: e.target.value })} className="w-full border p-2 rounded-lg">
                    {classes.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold">ፈተና ፍጠር</button>
                </form>
                <div className="mt-4 space-y-2">
                  {exams.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.className} • {item.status}</p>
                      </div>
                      {item.status !== 'ታትሟል (Published)' && (
                        <button onClick={() => publishExam(item.id)} className="bg-green-600 text-white px-3 py-2 rounded-lg font-semibold">
                          አትም (Publish)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grading' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ውጤት እና አስተያየት ይስጡ</h3>
              <form onSubmit={addGrade} className="space-y-3">
                <input value={gradeForm.student} onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })} placeholder="የተማሪ ስም" className="w-full border p-2 rounded-lg" />
                <input value={gradeForm.title} onChange={(e) => setGradeForm({ ...gradeForm, title: e.target.value })} placeholder="የፈተናው/የሥራው ርዕስ" className="w-full border p-2 rounded-lg" />
                <input value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })} placeholder="ውጤት (Score)" className="w-full border p-2 rounded-lg" />
                <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="አስተያየት (Feedback)" className="w-full border p-2 rounded-lg" rows="3" />
                <button className="w-full bg-green-700 text-white py-2 rounded-lg font-bold">ውጤት አስቀምጥ (Save grade)</button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ውጤቶች እና የተሰጡ አስተያየቶች</h3>
              <div className="space-y-2">
                {grades.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <p className="font-semibold">{item.student} • {item.title}</p>
                    <p className="text-sm text-gray-500">ውጤት: {item.score}</p>
                    <p className="text-sm mt-1">{item.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">ማስታወቂያዎች እና መልእክቶች</h3>
              <form onSubmit={addAnnouncement} className="space-y-3">
                <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="ርዕስ (Title)" className="w-full border p-2 rounded-lg" />
                <textarea value={announcementForm.body} onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })} placeholder="መልእክት (Message)" className="w-full border p-2 rounded-lg" rows="4" />
                <button className="w-full bg-purple-700 text-white py-2 rounded-lg font-bold">ማስታወቂያ ለጥፍ (Post announcement)</button>
              </form>
              <div className="mt-4 space-y-2">
                {announcements.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                    <p className="text-sm mt-1">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">የትምህርት መረጃዎችን ይጫኑ</h3>
              <form onSubmit={addMaterial} className="space-y-3">
                <input value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} placeholder="የመረጃው ርዕስ" className="w-full border p-2 rounded-lg" />
                <input value={materialForm.type} onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })} placeholder="ዓይነት (PDF, Video, Note)" className="w-full border p-2 rounded-lg" />
                <input value={materialForm.link} onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })} placeholder="አስፈንጣሪ (Link) ወይም የፋይል ስም" className="w-full border p-2 rounded-lg" />
                <button className="w-full bg-indigo-700 text-white py-2 rounded-lg font-bold">መረጃ ጫን (Upload material)</button>
              </form>
              <div className="mt-4 space-y-2">
                {materials.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.type}</p>
                    </div>
                    <a href={item.link || '#'} className="text-blue-600 font-bold text-sm">ክፈት (Open)</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">የተማሪዎች አፈጻጸም ማጠቃለያ</h3>
              <div className="space-y-2">
                {students.slice(0, 5).map((student, index) => (
                  <div key={student._id || index} className="border rounded-lg p-3 flex justify-between">
                    <span>{student.firstName || student.fullName} {student.lastName || ''}</span>
                    <span className="font-semibold text-green-700">{student.grade || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-lg mb-4">የክፍል ሪፖርት ማጠቃለያ</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <p className="text-sm text-gray-500">የመገኘት መጠን (Attendance)</p>
                  <p className="text-2xl font-black">94%</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-sm text-gray-500">አማካኝ የቤት ሥራ ውጤት</p>
                  <p className="text-2xl font-black">86%</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-sm text-gray-500">ክትትል የሚሹ ተማሪዎች</p>
                  <p className="text-2xl font-black">3 ተማሪዎች</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;