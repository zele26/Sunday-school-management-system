// src/features/teacher/TeacherResults.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const TeacherResults = () => {
  const [searchParams] = useSearchParams();
  const initialQuizId = searchParams.get('quizId') || '';

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(initialQuizId);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Auto‑fetch results when a quizId is already present in the URL
  useEffect(() => {
    if (initialQuizId) {
      fetchResults(initialQuizId);
    }
  }, [initialQuizId]);

  const fetchQuizzes = async () => {
    try {
      const res = await apiFetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        // Make sure data is an array
        setQuizzes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchResults = async (quizIdOverride) => {
    const quizIdToUse = quizIdOverride || selectedQuiz;
    if (!quizIdToUse) return;

    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/quizzes/${quizIdToUse}/results`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch results');
      }
      const data = await res.json();
      // Ensure the expected shape exists
      setResultsData({
        results: Array.isArray(data.results) ? data.results : [],
        questions: Array.isArray(data.questions) ? data.questions : [],
      });
    } catch (err) {
      setError(err.message || 'Could not load results');
      setResultsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnswers = (r) => {
    if (!resultsData || !resultsData.questions) return;
    const detail = r.answers.map((a) => {
      const question = resultsData.questions.find((q) => q._id === a.question);
      return {
        question: question?.text || 'Unknown',
        selected: a.selectedAnswer,
        correct: question?.correctAnswer,
        points: a.pointsEarned,
      };
    });
    alert(JSON.stringify(detail, null, 2));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Exam Results</h2>

      <div className="flex gap-4 items-end">
        <select
          value={selectedQuiz}
          onChange={(e) => setSelectedQuiz(e.target.value)}
          className="p-2 border rounded-xl text-sm"
        >
          <option value="">Select Exam</option>
          {quizzes.map((q) => (
            <option key={q._id} value={q._id}>
              {q.title}
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchResults()}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"
        >
          View Results
        </button>
      </div>

      {loading && (
        <div className="py-8 text-center text-slate-400">
          Loading results...
        </div>
      )}

      {error && (
        <div className="py-4 text-center text-red-500">
          ❌ {error}
        </div>
      )}

      {!loading && !error && resultsData && resultsData.results.length === 0 && (
        <p className="text-slate-500">
          No students have taken this exam yet.
        </p>
      )}

      {!loading && !error && resultsData && resultsData.results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Student</th>
                <th className="py-2 px-2">Score</th>
                <th className="py-2 px-2">Submitted</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resultsData.results.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2">
                    {r.student?.firstName} {r.student?.lastName}
                  </td>
                  <td className="py-2 px-2 font-semibold">{r.totalScore}</td>
                  <td className="py-2 px-2">
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleViewAnswers(r)}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                    >
                      View Answers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherResults;