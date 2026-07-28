// src/features/student/StudentResults.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We'll use the student's exam results. There's no dedicated student results endpoint yet,
    // but we can fetch all quizzes they've taken via /api/quizzes and check.
    // Simpler: create a backend endpoint GET /api/student/exam-results
    // For now, we'll call a placeholder. We need to add this endpoint.
    // I'll provide the backend route below.
    const fetchResults = async () => {
      try {
        const res = await apiFetch('/api/student/exam-results');
        if (res.ok) setResults(await res.json());
      } catch (err) {}
      setLoading(false);
    };
    fetchResults();
  }, []);

  if (loading) return <div className="py-8 text-center">Loading results...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Exam Results</h2>
      {results.length === 0 ? <p>No results yet.</p> : (
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="border-b"><th>Exam</th><th>Score</th><th>Date</th></tr></thead>
          <tbody>{results.map(r => (
            <tr key={r._id} className="border-b">
              <td className="py-2">{r.quiz?.title || 'N/A'}</td>
              <td className="py-2">{r.totalScore}</td>
              <td className="py-2">{new Date(r.submittedAt).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
};

export default StudentResults;