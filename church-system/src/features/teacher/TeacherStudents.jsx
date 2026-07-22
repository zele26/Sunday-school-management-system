// src/features/teacher/TeacherStudents.jsx
import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyStudents();
  }, []);

  const fetchMyStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/teacher/my-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h2 className="text-xl font-bold text-slate-800">My Students</h2>
      {loading ? (
        <div className="text-center text-slate-400 py-8">Loading students...</div>
      ) : students.length === 0 ? (
        <p className="text-slate-500">No students assigned to you yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Grade</th>
                <th className="py-2 px-2">Email</th>
                <th className="py-2 px-2">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {students.map(student => (
                <tr key={student._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium">{student.firstName} {student.lastName}</td>
                  <td className="py-2 px-2">{student.grade}</td>
                  <td className="py-2 px-2">{student.userId?.email || '-'}</td>
                  <td className="py-2 px-2">{student.studentPhone || student.contactPhone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;