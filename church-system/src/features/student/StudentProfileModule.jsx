// src/features/student/StudentProfileModule.jsx
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to load profile');
      }
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/student/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to load attendance');
      }
      const data = await res.json();
      setAttendance(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/student/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to load courses');
      }
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>⚠️ {error}</p>
        <button onClick={() => window.location.reload()} className="text-indigo-600 underline text-sm mt-2">
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">No profile data found.</div>;
  }

  const fullName = `${profile.firstName || ''} ${profile.middleName || ''} ${profile.lastName || ''}`.trim();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{fullName}</h2>
          <p className="text-sm text-slate-500">
            Grade: {profile.grade || 'N/A'} | ID: {profile._id?.slice(-6).toUpperCase()}
          </p>
          {profile.teacher && (
            <p className="text-sm text-slate-500">
              Teacher: {profile.teacher.fullName || profile.teacher.email}
            </p>
          )}
        </div>
        {profile.qrCode ? (
          <div className="bg-white p-2 rounded-xl border shadow-sm">
            <QRCodeSVG value={profile.qrCode} size={120} />
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
            QR code not generated. Ask an admin to generate one.
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Personal Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-slate-500">Email:</span> {profile.userId?.email || '-'}</div>
          <div><span className="font-medium text-slate-500">Phone:</span> {profile.studentPhone || profile.contactPhone || '-'}</div>
          <div><span className="font-medium text-slate-500">Date of Birth:</span> {profile.dob || '-'}</div>
          <div><span className="font-medium text-slate-500">Address:</span> {profile.address || '-'}</div>
          <div className="sm:col-span-2">
            <span className="font-medium text-slate-500">Emergency Contact:</span> {profile.emergencyFirstName} {profile.emergencyLastName} ({profile.relationship}) - {profile.contactPhone}
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Enrolled Courses</h3>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-400">You are not enrolled in any courses yet.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map(course => (
              <li key={course._id} className="bg-slate-50 rounded-xl px-4 py-3 text-sm">
                <span className="font-semibold text-slate-700">{course.name}</span>
                {course.grade && <span className="text-slate-500 ml-2">({course.grade})</span>}
                {course.schedule && <span className="text-slate-500 ml-2">— {course.schedule}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attendance History */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Attendance History</h3>
        {attendance.length === 0 ? (
          <p className="text-sm text-slate-400">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-400">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendance.map(record => (
                  <tr key={record._id} className="hover:bg-slate-50">
                    <td className="py-2 px-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-2 px-2">{record.course?.name || 'General'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;