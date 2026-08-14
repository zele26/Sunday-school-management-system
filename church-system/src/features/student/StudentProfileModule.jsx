// src/features/student/StudentProfileModule.jsx
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchAttendance();
    fetchCourses();
  }, []);

  const fetchProfile = async () => {
    try {
      // Ensure we have a fresh token before calling the profile endpoint
      let token = useAuthStore.getState().accessToken;
      if (!token) {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          useAuthStore.getState().login(refreshData.accessToken, refreshData.user);
          token = refreshData.accessToken;
        } else {
          throw new Error('Session expired – please log in again');
        }
      }

      const res = await apiFetch('/api/student/profile');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await apiFetch('/api/student/attendance');
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('/api/student/my-courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Courses fetch error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center font-sans">
        <div className="text-center text-slate-600">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center font-sans">
        <div className="p-8 text-center text-red-600 bg-white rounded-3xl shadow-xl border border-red-100">
          <p className="font-semibold">⚠️ {error}</p>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="text-blue-600 underline text-sm mt-2"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center font-sans">
        <p className="text-slate-500">No profile data found.</p>
      </div>
    );
  }

  const fullName = `${profile.firstName || ''} ${profile.middleName || ''} ${profile.lastName || ''}`.trim();
  const emergencyName = [
    profile.emergencyFirstName || profile.parentName || '',
    profile.emergencyMiddleName || '',
    profile.emergencyLastName || '',
  ].filter(Boolean).join(' ').trim();
  const emergencyPhone = profile.emergencyPhone || profile.parentPhone || profile.contactPhone || '';
  const emergencyEmail = profile.emergencyEmail || profile.parentEmail || profile.contactEmail || '';
  const studentType = profile.studentType || 'regular';
  const batch = profile.batch || profile.grade || 'N/A';
  const registrationNumber = profile.registrationNumber || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{fullName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${studentType === 'distance' ? 'bg-yellow-400 text-slate-900' : 'bg-emerald-400 text-emerald-950'
                    }`}>
                    {studentType}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                    {studentType === 'distance' ? `Batch: ${batch}` : `Grade: ${batch}`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100 uppercase tracking-wider">School ID</p>
                <p className="text-lg font-mono font-bold bg-white/10 px-3 py-1 rounded-lg">{profile.studentId || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
              {profile.qrCode ? (
                <>
                  <div className="bg-white p-2 rounded-xl shadow-md border border-blue-100">
                    <QRCodeSVG value={profile.qrCode} size={140} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Your QR Code</p>
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
                  QR code not generated. Ask an admin to generate one.
                </div>
              )}
            </div>
            {/* Quick Info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="font-medium text-slate-500">Application No.</span>
                <span className="font-mono font-bold text-slate-700">{registrationNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="font-medium text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-800">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="font-medium text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800">{profile.gender || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="font-medium text-slate-500">Date of Birth</span>
                <span className="font-semibold text-slate-800">{profile.dob || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Address</span>
                <span className="font-semibold text-slate-800 text-right">{profile.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">👤</span>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">First Name</span>
              <span className="font-semibold text-slate-800">{profile.firstName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Middle Name</span>
              <span className="font-semibold text-slate-800">{profile.middleName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Last Name</span>
              <span className="font-semibold text-slate-800">{profile.lastName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Education Level</span>
              <span className="font-semibold text-slate-800">{profile.educationLevel || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Profession</span>
              <span className="font-semibold text-slate-800">{profile.profession || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Phone</span>
              <span className="font-semibold text-slate-800">{profile.studentPhone || profile.contactPhone || profile.phone || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Email</span>
              <span className="font-semibold text-slate-800">{profile.userId?.email || profile.email || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Teacher</span>
              <span className="font-semibold text-slate-800">
                {profile.teacher ? (profile.teacher.fullName || profile.teacher.email) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center">📞</span>
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Name</span>
              <span className="font-semibold text-slate-800">{emergencyName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Relationship</span>
              <span className="font-semibold text-slate-800">{profile.relationship || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Phone</span>
              <span className="font-semibold text-slate-800">{emergencyPhone || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 block mb-0.5">Email</span>
              <span className="font-semibold text-slate-800">{emergencyEmail || '-'}</span>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">📚</span>
            Enrolled Courses
          </h3>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-400">You are not enrolled in any courses yet.</p>
          ) : (
            <ul className="space-y-2">
              {courses.map(course => (
                <li key={course._id} className="bg-slate-50 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">{course.name}</span>
                    {course.grade && <span className="text-slate-500 ml-2">({course.grade})</span>}
                    {course.schedule && <span className="text-slate-500 ml-2">— {course.schedule}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center">📅</span>
            Attendance History
          </h3>
          {attendance.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-400">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Check-in</th>
                    <th className="py-2 px-2">Course</th>
                    <th className="py-2 px-2">Teacher</th>
                    <th className="py-2 px-2">Grade</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Acad. Year</th>
                    <th className="py-2 px-2">Semester</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendance.map(record => {
                    const dateObj = new Date(record.date);
                    const checkIn = record.checkInTime
                      ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '-';
                    return (
                      <tr key={record._id} className="hover:bg-slate-50">
                        <td className="py-2 px-2">{dateObj.toLocaleDateString()}</td>
                        <td className="py-2 px-2">{checkIn}</td>
                        <td className="py-2 px-2">{record.courseName || 'General'}</td>
                        <td className="py-2 px-2">{record.teacherName || 'N/A'}</td>
                        <td className="py-2 px-2">{record.grade || '-'}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                              record.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-2 px-2">{record.academicYear || '-'}</td>
                        <td className="py-2 px-2">{record.semester || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;