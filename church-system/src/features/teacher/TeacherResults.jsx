// src/features/teacher/TeacherResults.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherResults = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    const res = await apiFetch('/api/quizzes');
    if (res.ok) setQuizzes(await res.json());
  };

  const fetchResults = async () => {
    if (!selectedQuiz) return;
    setLoading(true);
    const res = await apiFetch(`/api/quizzes/${selectedQuiz}/results`);
    if (res.ok) setResults(await res.json());
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Exam Results</h2>
      <div className="flex gap-4 items-end">
        <select value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)} className="p-2 border rounded-xl">
          <option value="">Select Exam</option>
          {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
        </select>
        <button onClick={fetchResults} className="bg-blue-600 text-white px-4 py-2 rounded-xl">View Results</button>
      </div>
      {loading ? <div className="py-8 text-center text-slate-400">Loading...</div> : results.length === 0 ? <p>No results yet.</p> : (
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="border-b"><th>Student</th><th>Score</th><th>Submitted</th></tr></thead>
          <tbody>{results.map(r => (
            <tr key={r._id} className="border-b">
              <td className="py-2">{r.student?.firstName} {r.student?.lastName}</td>
              <td className="py-2">{r.totalScore}</td>
              <td className="py-2">{new Date(r.submittedAt).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherResults;