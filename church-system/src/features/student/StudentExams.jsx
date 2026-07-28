// src/features/student/StudentExams.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const StudentExams = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/quizzes').then(res => res.json()).then(data => {
      setQuizzes(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-8 text-center text-slate-400">Loading exams...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Available Exams</h2>
      {quizzes.length === 0 ? <p>No exams available.</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {quizzes.map(q => (
            <Link key={q._id} to={`/dashboard/exams/${q._id}`} className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition">
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm text-slate-500">{q.quizType} – {q.course?.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExams;