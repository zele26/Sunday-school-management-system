// src/features/student/StudentResults.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';
import { Link } from 'react-router-dom';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <div className="grid gap-3">
          {results.map(r => (
            <Link key={r._id} to={`/dashboard/results/${r._id}`} className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition flex justify-between items-center">
              <div>
                <p className="font-semibold">{r.quiz?.title || 'N/A'}</p>
                <p className="text-xs text-slate-500">{new Date(r.submittedAt).toLocaleDateString()}</p>
              </div>
              <span className="text-lg font-bold text-indigo-600">{r.totalScore}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResults;