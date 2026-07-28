// src/features/teacher/TeacherResults.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherResults = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [resultsData, setResultsData] = useState(null);
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
    if (res.ok) setResultsData(await res.json());
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

      {loading ? <div className="py-8 text-center text-slate-400">Loading...</div> :
      resultsData && resultsData.results.length === 0 ? <p>No results yet.</p> :
      resultsData && (
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
              {resultsData.results.map(r => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2">{r.student?.firstName} {r.student?.lastName}</td>
                  <td className="py-2 px-2">{r.totalScore}</td>
                  <td className="py-2 px-2">{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => {
                        // We'll show a modal with answers – simplified version
                        const detail = r.answers.map(a => {
                          const question = resultsData.questions.find(q => q._id === a.question);
                          return { question: question?.text, selected: a.selectedAnswer, correct: question?.correctAnswer, points: a.pointsEarned };
                        });
                        alert(JSON.stringify(detail, null, 2));
                      }}
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