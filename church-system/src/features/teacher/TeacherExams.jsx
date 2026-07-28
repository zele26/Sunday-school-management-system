// src/features/teacher/TeacherExams.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';
import { Link } from 'react-router-dom';

const TeacherExams = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', courseId: '', quizType: 'Weekly Quiz' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    const res = await apiFetch('/api/quizzes');
    if (res.ok) setQuizzes(await res.json());
  };

  const fetchCourses = async () => {
    const res = await apiFetch('/api/teacher/my-courses');
    if (res.ok) setCourses(await res.json());
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: quizForm.title,
        description: quizForm.description,
        course: quizForm.courseId,
        quizType: quizForm.quizType,
      }),
    });
    if (res.ok) {
      setQuizForm({ title: '', description: '', courseId: '', quizType: 'Weekly Quiz' });
      setShowForm(false);
      fetchQuizzes();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Exam Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">
          {showForm ? 'Cancel' : '+ New Exam'}
        </button>
      </div>
      {message && <div className="p-2 bg-slate-100 rounded-xl text-sm">{message}</div>}
      {showForm && (
        <form onSubmit={handleCreateQuiz} className="bg-white p-4 rounded-xl shadow space-y-3">
          <input type="text" placeholder="Exam Title" required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} className="w-full p-2 border rounded-xl" />
          <textarea placeholder="Description" value={quizForm.description} onChange={e => setQuizForm({...quizForm, description: e.target.value})} className="w-full p-2 border rounded-xl" />
          <select value={quizForm.courseId} required onChange={e => setQuizForm({...quizForm, courseId: e.target.value})} className="w-full p-2 border rounded-xl">
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={quizForm.quizType} onChange={e => setQuizForm({...quizForm, quizType: e.target.value})} className="w-full p-2 border rounded-xl">
            <option value="Weekly Quiz">Weekly Quiz</option>
            <option value="Mid-Term Exam">Mid-Term Exam</option>
            <option value="Final Exam">Final Exam</option>
          </select>
          <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded-xl">Create Exam</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {quizzes.map(q => (
          <div key={q._id} className="p-4 bg-white rounded-xl shadow border hover:shadow-md transition">
            <h3 className="font-semibold">{q.title}</h3>
            <p className="text-xs text-slate-500">{q.quizType} – {q.course?.name}</p>
            <div className="mt-2 flex gap-2">
              <Link to={`/teacher/exams/${q._id}`} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">Manage Questions</Link>
              <Link to={`/teacher/results?quizId=${q._id}`} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">View Results</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherExams;