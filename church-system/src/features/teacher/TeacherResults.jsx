// src/features/teacher/TeacherResults.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const TeacherResults = () => {
  const [searchParams] = useSearchParams();
  const initialQuizId = searchParams.get('quizId') || '';

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(initialQuizId);
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => { fetchQuizzes(); }, []);

  useEffect(() => {
    if (initialQuizId) fetchResults(initialQuizId);
  }, [initialQuizId]);

  const fetchQuizzes = async () => {
    try {
      const res = await apiFetch('/api/quizzes');
      if (res.ok) setQuizzes(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchResults = async (quizIdOverride) => {
    const quizIdToUse = quizIdOverride || selectedQuiz;
    if (!quizIdToUse) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/quizzes/${quizIdToUse}/results`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const data = await res.json();
      setResults(data.results || []);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage and correct/incorrect count
  const getPerformance = (result) => {
    const totalQuestions = questions.length;
    const correct = result.answers.filter(a => a.isCorrect).length;
    const incorrect = totalQuestions - correct;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    return { correct, incorrect, percentage };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">የፈተና ውጤቶች (Exam Results)</h2>

      <div className="flex gap-4 items-end">
        <select
          value={selectedQuiz}
          onChange={(e) => setSelectedQuiz(e.target.value)}
          className="p-2 border rounded-xl text-sm"
        >
          <option value="">ፈተና ይምረጡ</option>
          {quizzes.map((q) => (
            <option key={q._id} value={q._id}>{q.title}</option>
          ))}
        </select>
        <button onClick={() => fetchResults()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">
          ውጤቶችን አሳይ
        </button>
      </div>

      {loading && <div className="py-8 text-center text-slate-400">በመጫን ላይ…</div>}
      {error && <div className="py-4 text-center text-red-500">❌ {error}</div>}

      {!loading && !error && results.length === 0 && (
        <p className="text-slate-500">ማንም ተማሪ ይህን ፈተና አልወሰደም።</p>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">የተማሪ ስም</th>
                <th className="py-2 px-2">የተማሪ መለያ</th>
                <th className="py-2 px-2">ኮርስ</th>
                <th className="py-2 px-2">ውጤት (%)</th>
                <th className="py-2 px-2">ዝርዝር</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((r) => {
                const perf = getPerformance(r);
                return (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="py-2 px-2">{r.student?.firstName} {r.student?.lastName}</td>
                    <td className="py-2 px-2 font-mono text-xs">{r.student?.studentId || '-'}</td>
                    <td className="py-2 px-2">{r.courseName || 'N/A'}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${perf.percentage >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {perf.percentage}%
                        </span>
                        <span className="text-xs text-slate-400">
                          ({perf.correct}/{questions.length} ትክክል)
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => setSelectedResult(r)}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-200"
                      >
                        መልሶችን ይመልከቱ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for detailed answers */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">
                  የ{selectedResult.student?.firstName} {selectedResult.student?.lastName} መልሶች
                </h3>
                <p className="text-xs text-slate-500">
                  የተማሪ መለያ: {selectedResult.student?.studentId} | ኮርስ: {selectedResult.courseName || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">
                  ጠቅላላ ውጤት: {selectedResult.totalScore} | {getPerformance(selectedResult).percentage}% ({getPerformance(selectedResult).correct}/{questions.length} ትክክል)
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {selectedResult.answers.map((ans, idx) => {
                const question = questions.find(q => q._id === ans.question);
                return (
                  <div key={idx} className={`p-3 rounded-xl border ${ans.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <p className="font-semibold text-sm">{question?.text || 'ጥያቄ አልተገኘም'}</p>
                    <p className="text-xs mt-1">
                      <span className="text-slate-500">የተማሪው መልስ:</span>{' '}
                      <span className={ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                        {ans.selectedAnswer || 'አልተመለሰም'}
                      </span>
                    </p>
                    {!ans.isCorrect && (
                      <p className="text-xs text-slate-500">
                        ትክክለኛው መልስ: {question?.correctAnswer}
                      </p>
                    )}
                    <p className="text-xs font-medium mt-1">ነጥብ: {ans.pointsEarned}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherResults;