// src/features/student/StudentResultDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const StudentResultDetail = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await apiFetch(`/api/student/exam-results/${resultId}`);
        if (res.ok) setResult(await res.json());
      } catch (err) {}
      setLoading(false);
    };
    fetchResult();
  }, [resultId]);

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (!result) return <div className="py-8 text-center text-red-500">Result not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link to="/dashboard/results" className="text-blue-600 underline text-sm mb-4 inline-block">← Back to Results</Link>
      <h2 className="text-2xl font-bold mb-2">{result.quiz?.title}</h2>
      <p className="text-lg mb-6">Total Score: <strong>{result.totalScore}</strong></p>
      <div className="space-y-4">
        {result.answers.map((ans, idx) => {
          const q = ans.question;
          if (!q) return null;
          return (
            <div key={idx} className="bg-white p-4 rounded-xl shadow border">
              <p className="font-semibold">{q.text}</p>
              <p className="text-sm">Type: {q.type} | Points: {q.points}</p>
              <p className="text-sm">Your Answer: <span className={ans.isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{ans.selectedAnswer || '(not answered)'}</span></p>
              {!ans.isCorrect && <p className="text-sm text-slate-500">Correct Answer: {q.correctAnswer}</p>}
              <p className="text-sm font-medium">Points Earned: {ans.pointsEarned}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentResultDetail;