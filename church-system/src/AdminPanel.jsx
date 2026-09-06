import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from './api/apiClient';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui';
import { StatCard } from './components/shared/StatCard';

const defaultUsers = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'Active', permissions: ['All'] },
  { id: 2, name: 'Teacher A', email: 'teacher@example.com', role: 'teacher', status: 'Active', permissions: ['Attendance', 'Classes'] },
  { id: 3, name: 'Student One', email: 'student@example.com', role: 'student', status: 'Pending', permissions: ['Profile'] },
];

const defaultApprovals = [
  { id: 1, name: 'Mulugeta Bekele', type: 'Teacher Account', status: 'Pending' },
  { id: 2, name: 'Selam Tadesse', type: 'Student Registration', status: 'Pending' },
];

const defaultClasses = [
  { id: 1, name: 'Grade 1A', department: 'Primary', year: '2026/27', teacher: 'Teacher A' },
  { id: 2, name: 'Grade 5B', department: 'Middle', year: '2026/27', teacher: 'Teacher B' },
];

const defaultCourses = [
  {
    id: 1,
    title: 'Mathematics Foundations',
    description: 'Build number sense, arithmetic, and problem solving.',
    objectives: 'Solve word problems and master core operations.',
    grade: 'Grade 1',
    subject: 'Mathematics',
    teacher: 'Teacher A',
    duration: '8 weeks',
    startDate: '2026-07-01',
    endDate: '2026-08-26',
    schedule: 'Monday 10:00',
    status: 'Active',
    maxStudents: 30,
    materials: ['PDF Notes', 'Video Lesson'],
    assignments: ['Week 1 Worksheet'],
    exams: ['Midterm Quiz'],
    prerequisites: 'None',
  },
];

const defaultAnnouncements = [
  { id: 1, title: 'Term Opening', type: 'Announcement', body: 'School opens on Monday.' },
];

const defaultResources = [
  { id: 1, title: 'Math Workbook', type: 'PDF', link: '#' },
];

const defaultAttendance = [
  { id: 1, student: 'Selam Tadesse', status: 'Present', date: '2026-07-19' },
  { id: 2, student: 'Mulugeta Bekele', status: 'Absent', date: '2026-07-19' },
];

const defaultReports = [
  { label: 'Active Students', value: '128' },
  { label: 'Teachers', value: '16' },
  { label: 'Attendance Rate', value: '94%' },
];

const defaultComplaints = [
  { id: 1, title: 'Library access issue', status: 'Open' },
];

const defaultCertificates = [
  { id: 1, name: 'Selam Tadesse', status: 'Ready' },
];

const defaultSettings = [
  { key: 'Registration Approval', enabled: true },
  { key: 'Teacher Assignment', enabled: true },
  { key: 'Announcements', enabled: true },
];

const defaultAuditLogs = [
  { id: 1, action: 'Approved teacher account', actor: 'Admin User', time: '09:20' },
  { id: 2, action: 'Assigned teacher to Grade 1A', actor: 'Admin User', time: '10:05' },
];

const AdminPanel = ({ onLogout }) => {
  const [users, setUsers] = useState(defaultUsers);
  const [approvals, setApprovals] = useState(defaultApprovals);
  const [classes, setClasses] = useState(defaultClasses);
  const [courses, setCourses] = useState(defaultCourses);
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [resources, setResources] = useState(defaultResources);
  const [attendance, setAttendance] = useState(defaultAttendance);
  const [reports] = useState(defaultReports);
  const [complaints, setComplaints] = useState(defaultComplaints);
  const [certificates, setCertificates] = useState(defaultCertificates);
  const [settings, setSettings] = useState(defaultSettings);
  const [auditLogs] = useState(defaultAuditLogs);
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();
  const activePage = location.pathname === '/admin' || location.pathname === '/admin/' ? 'overview' : location.pathname.split('/').filter(Boolean).pop() || 'overview';
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'teacher' });
  const [classForm, setClassForm] = useState({ name: '', department: '', year: '', teacher: '' });
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    objectives: '',
    grade: '',
    subject: '',
    teacher: '',
    duration: '',
    startDate: '',
    endDate: '',
    schedule: '',
    status: 'Draft',
    maxStudents: '',
    materials: '',
    assignments: '',
    exams: '',
    prerequisites: '',
  });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', type: 'Announcement', body: '' });
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'PDF', link: '' });
  const [complaintForm, setComplaintForm] = useState({ title: '', status: 'Open' });
  const [certificateForm, setCertificateForm] = useState({ name: '', status: 'Ready' });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/panel-data`);
        if (!response.ok) throw new Error('Server returned an error');

        const payload = await response.json();
        const data = payload?.data || payload;

        if (!active) return;

        setUsers(data.users || defaultUsers);
        setApprovals(data.approvals || defaultApprovals);
        setClasses(data.classes || defaultClasses);
        setCourses(data.courses || defaultCourses);
        setAnnouncements(data.announcements || defaultAnnouncements);
        setResources(data.resources || defaultResources);
        setAttendance(data.attendance || defaultAttendance);
        setComplaints(data.complaints || defaultComplaints);
        setCertificates(data.certificates || defaultCertificates);
        setSettings(data.settings || defaultSettings);
        setIsLoaded(true);
      } catch (error) {
        console.error('Unable to load admin panel data', error);
        const stored = localStorage.getItem('adminPanelData');
        if (!active && !stored) return;

        try {
          const parsed = stored ? JSON.parse(stored) : {};
          setUsers(parsed.users || defaultUsers);
          setApprovals(parsed.approvals || defaultApprovals);
          setClasses(parsed.classes || defaultClasses);
          setCourses(parsed.courses || defaultCourses);
          setAnnouncements(parsed.announcements || defaultAnnouncements);
          setResources(parsed.resources || defaultResources);
          setAttendance(parsed.attendance || defaultAttendance);
          setComplaints(parsed.complaints || defaultComplaints);
          setCertificates(parsed.certificates || defaultCertificates);
          setSettings(parsed.settings || defaultSettings);
          setIsLoaded(true);
        } catch (parseError) {
          console.error('Failed to parse local admin panel data', parseError);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const payload = {
      users,
      approvals,
      classes,
      courses,
      announcements,
      resources,
      attendance,
      complaints,
      certificates,
      settings,
    };

    try {
      localStorage.setItem('adminPanelData', JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to persist admin panel data locally', error);
    }

    fetch(`${API_BASE_URL}/api/admin/panel-data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error('Unable to save admin panel data', error);
    });
  }, [isLoaded, users, approvals, classes, courses, announcements, resources, attendance, complaints, certificates, settings]);

  const summaryCards = useMemo(() => [
    { label: 'Users', value: users.length, icon: '👤' },
    { label: 'Pending Approvals', value: approvals.filter((item) => item.status === 'Pending').length, icon: '✅' },
    { label: 'Classes', value: classes.length, icon: '🏫' },
    { label: 'Courses', value: courses.length, icon: '📚' },
    { label: 'Active Complaints', value: complaints.filter((item) => item.status === 'Open').length, icon: '⚠️' },
  ], [users, approvals, classes, courses, complaints]);

  const addUser = (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;
    setUsers([...users, { id: Date.now(), ...userForm, status: 'Active', permissions: ['Basic'] }]);
    setUserForm({ name: '', email: '', role: 'teacher' });
  };

  const approve = (id) => {
    setApprovals(approvals.map((item) => item.id === id ? { ...item, status: 'Approved' } : item));
  };

  const addClass = (e) => {
    e.preventDefault();
    if (!classForm.name) return;
    setClasses([...classes, { id: Date.now(), ...classForm }]);
    setClassForm({ name: '', department: '', year: '', teacher: '' });
  };

  const addCourse = (e) => {
    e.preventDefault();
    if (!courseForm.title) return;
    setCourses([{ id: Date.now(), ...courseForm, materials: courseForm.materials.split(','), assignments: courseForm.assignments.split(','), exams: courseForm.exams.split(',') }, ...courses]);
    setCourseForm({
      title: '',
      description: '',
      objectives: '',
      grade: '',
      subject: '',
      teacher: '',
      duration: '',
      startDate: '',
      endDate: '',
      schedule: '',
      status: 'Draft',
      maxStudents: '',
      materials: '',
      assignments: '',
      exams: '',
      prerequisites: '',
    });
  };

  const assignTeacher = (e) => {
    e.preventDefault();
    if (!classForm.name || !classForm.teacher) return;
    setClasses(classes.map((item) => item.name === classForm.name ? { ...item, teacher: classForm.teacher } : item));
  };

  const addAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementForm.title) return;
    setAnnouncements([{ id: Date.now(), ...announcementForm }, ...announcements]);
    setAnnouncementForm({ title: '', type: 'Announcement', body: '' });
  };

  const addResource = (e) => {
    e.preventDefault();
    if (!resourceForm.title) return;
    setResources([{ id: Date.now(), ...resourceForm }, ...resources]);
    setResourceForm({ title: '', type: 'PDF', link: '' });
  };

  const addComplaint = (e) => {
    e.preventDefault();
    if (!complaintForm.title) return;
    setComplaints([{ id: Date.now(), ...complaintForm }, ...complaints]);
    setComplaintForm({ title: '', status: 'Open' });
  };

  const addCertificate = (e) => {
    e.preventDefault();
    if (!certificateForm.name) return;
    setCertificates([{ id: Date.now(), ...certificateForm }, ...certificates]);
    setCertificateForm({ name: '', status: 'Ready' });
  };

  const toggleSetting = (key) => {
    setSettings(settings.map((item) => item.key === key ? { ...item, enabled: !item.enabled } : item));
  };

  const pages = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'approvals', label: 'Approvals', icon: '✅' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'resources', label: 'Resources', icon: '📄' },
    { id: 'attendance', label: 'Attendance', icon: '📝' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'complaints', label: 'Complaints', icon: '⚠️' },
    { id: 'certificates', label: 'Certificates', icon: '🎓' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'audit', label: 'Audit Logs', icon: '🧾' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'users':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Manage Users & Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addUser} className="grid md:grid-cols-3 gap-3">
                <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Name" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <input value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="Email" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm">
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="md:col-span-3 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Add User</button>
              </form>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email} • {user.role}</p>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-1 rounded-lg">{user.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'approvals':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Approve Registrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {approvals.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.type}</p>
                    </div>
                    {item.status === 'Pending' ? (
                      <button onClick={() => approve(item.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 text-xs rounded-lg transition-colors">Approve</button>
                    ) : (
                      <span className="text-green-700 dark:text-green-400 font-bold text-xs">Approved</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'classes':
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Manage Classes, Grades & Departments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={addClass} className="grid md:grid-cols-2 gap-3">
                  <input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="Class / Grade" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={classForm.department} onChange={(e) => setClassForm({ ...classForm, department: e.target.value })} placeholder="Department" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={classForm.year} onChange={(e) => setClassForm({ ...classForm, year: e.target.value })} placeholder="Academic Year" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={classForm.teacher} onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })} placeholder="Assigned Teacher" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <button className="md:col-span-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Add Class</button>
                </form>
                <div className="space-y-2">
                  {classes.map((item) => (
                    <div key={item.id} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.department} • {item.year} • Teacher: {item.teacher}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Assign Teachers to Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={assignTeacher} className="space-y-3">
                  <input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="Class / Grade" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={classForm.teacher} onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })} placeholder="Teacher Name" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <button className="bg-purple-700 hover:bg-purple-800 text-white font-bold w-full py-2.5 rounded-xl transition-colors text-sm">Assign Teacher</button>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      case 'courses':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addCourse} className="space-y-3">
                <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Course title" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Description" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" rows="2" />
                <textarea value={courseForm.objectives} onChange={(e) => setCourseForm({ ...courseForm, objectives: e.target.value })} placeholder="Learning objectives" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" rows="2" />
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={courseForm.grade} onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })} placeholder="Grade/Class" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} placeholder="Subject" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.teacher} onChange={(e) => setCourseForm({ ...courseForm, teacher: e.target.value })} placeholder="Assigned teacher" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="Duration" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.startDate} type="date" onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.endDate} type="date" onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.schedule} onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })} placeholder="Weekly schedule" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <select value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm">
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                  <input value={courseForm.maxStudents} onChange={(e) => setCourseForm({ ...courseForm, maxStudents: e.target.value })} placeholder="Max students" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.materials} onChange={(e) => setCourseForm({ ...courseForm, materials: e.target.value })} placeholder="Materials (comma separated)" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.assignments} onChange={(e) => setCourseForm({ ...courseForm, assignments: e.target.value })} placeholder="Assignments" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                  <input value={courseForm.exams} onChange={(e) => setCourseForm({ ...courseForm, exams: e.target.value })} placeholder="Exams" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                </div>
                <input value={courseForm.prerequisites} onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })} placeholder="Prerequisites" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold w-full py-2.5 rounded-xl transition-colors text-sm">Create Course</button>
              </form>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div key={course.id} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{course.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{course.grade} • {course.subject} • {course.teacher}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{course.description}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Status: {course.status} • Schedule: {course.schedule || 'TBD'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'announcements':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Announcements, Events, Brochures & Notices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addAnnouncement} className="space-y-3">
                <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Title" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <input value={announcementForm.type} onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })} placeholder="Type" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <textarea value={announcementForm.body} onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })} placeholder="Body" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" rows="3" />
                <button className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold w-full py-2.5 rounded-xl transition-colors text-sm">Publish</button>
              </form>
              <div className="space-y-2">
                {announcements.map((item) => (
                  <div key={item.id} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.type}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'resources':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addResource} className="space-y-3">
                <input value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="Resource Title" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <input value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} placeholder="Type" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <input value={resourceForm.link} onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })} placeholder="Link" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold w-full py-2.5 rounded-xl transition-colors text-sm">Add Resource</button>
              </form>
              <div className="space-y-2">
                {resources.map((item) => (
                  <div key={item.id} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.type}</p>
                    </div>
                    <Link to={item.link || '#'} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold">Open</Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'attendance':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Attendance & Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {attendance.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.student}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
                    </div>
                    <span className={item.status === 'Present' ? 'text-green-600 dark:text-green-400 font-bold text-xs' : 'text-red-600 dark:text-red-400 font-bold text-xs'}>{item.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'reports':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                {reports.map((report) => (
                  <div key={report.label} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center sm:text-left">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{report.label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{report.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'complaints':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Complaints & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addComplaint} className="space-y-3">
                <input value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} placeholder="Complaint title" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <button className="bg-amber-700 hover:bg-amber-800 text-white font-bold w-full py-2.5 rounded-xl transition-colors text-sm">Log Complaint</button>
              </form>
              <div className="space-y-2">
                {complaints.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</p>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'certificates':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Certificates & Graduation Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addCertificate} className="space-y-3">
                <input value={certificateForm.name} onChange={(e) => setCertificateForm({ ...certificateForm, name: e.target.value })} placeholder="Student name" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <input value={certificateForm.status} onChange={(e) => setCertificateForm({ ...certificateForm, status: e.target.value })} placeholder="Status" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-sm" />
                <button className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-bold w-full py-2.5 rounded-xl transition-colors text-sm">Add Certificate</button>
              </form>
              <div className="space-y-2">
                {certificates.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {settings.map((item) => (
                  <div key={item.key} className="flex justify-between items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.key}</p>
                    <button onClick={() => toggleSetting(item.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${item.enabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'audit':
        return (
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Audit Logs & Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {auditLogs.map((item) => (
                  <div key={item.id} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.actor} • {item.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            <StatCard stats={summaryCards} gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
            <div className="grid lg:grid-cols-2 gap-6">
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle>Quick access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pages.filter((page) => page.id !== 'overview').map((page) => (
                      <Link
                        key={page.id}
                        to={page.id === 'overview' ? '/admin' : `/admin/${page.id}`}
                        className="block border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-left hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-200 transition-colors"
                      >
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{page.icon} {page.label}</p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {auditLogs.map((item) => (
                    <div key={item.id} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.action}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.actor} • {item.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Control Center</h1>
            <p className="text-blue-100 mt-1 text-sm">Navigate each administration area through its own dedicated page.</p>
          </div>
          <button onClick={onLogout} className="bg-white text-blue-900 hover:bg-slate-100 px-5 py-2.5 rounded-2xl font-bold text-sm transition-colors shadow-xs">Logout</button>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm h-fit">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 px-2">Admin Pages</h2>
            <div className="space-y-1">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  to={page.id === 'overview' ? '/admin' : `/admin/${page.id}`}
                  className={`block w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${activePage === page.id ? 'bg-[#1657b8] text-white shadow-xs' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  {page.icon} {page.label}
                </Link>
              ))}
            </div>
          </aside>

          <div>{renderPage()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;