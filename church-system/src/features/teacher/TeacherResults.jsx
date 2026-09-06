// src/features/teacher/TeacherResults.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Eye, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../../components/ui';

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

  const fetchQuizzes = async () => {
    try {
      const res = await apiFetch('/api/quizzes');
      if (res.ok) setQuizzes(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchResults = React.useCallback(async (quizIdOverride) => {
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
  }, [selectedQuiz]);

  useEffect(() => { fetchQuizzes(); }, []);

  useEffect(() => {
    if (initialQuizId) fetchResults(initialQuizId);
  }, [initialQuizId, fetchResults]);

  // Calculate percentage and correct/incorrect count
  const getPerformance = (result) => {
    const totalQuestions = questions.length;
    const correct = result.answers.filter(a => a.isCorrect).length;
    const incorrect = totalQuestions - correct;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    return { correct, incorrect, percentage };
  };

  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የፈተና ውጤቶች (Exam Results)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-0">
        <div className="flex flex-wrap gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">ፈተና ይምረጡ (Select Exam)</label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- ፈተና ይምረጡ --</option>
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>{q.title}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => fetchResults()} size="sm" className="font-bold">
            ውጤቶችን አሳይ (Show Results)
          </Button>
        </div>

        {loading && <div className="py-8 text-center text-slate-400 text-sm">ውጤት በመጫን ላይ…</div>}
        {error && <div className="py-4 text-center text-rose-500 font-semibold text-sm">❌ {error}</div>}

        {!loading && !error && results.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-6 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
            ማንም ተማሪ ይህን ፈተና አልወሰደም (No student has taken this exam yet)
          </p>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <th className="py-3 px-4 font-bold">የተማሪ ስም</th>
                  <th className="py-3 px-4 font-bold">የተማሪ መለያ</th>
                  <th className="py-3 px-4 font-bold">ኮርስ</th>
                  <th className="py-3 px-4 font-bold">ውጤት (%)</th>
                  <th className="py-3 px-4 font-bold text-right">ዝርዝር</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((r) => {
                  const perf = getPerformance(r);
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{r.student?.firstName} {r.student?.lastName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">{r.student?.studentId || '-'}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.courseName || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={perf.percentage >= 50 ? 'success' : 'destructive'} size="sm">
                            {perf.percentage}%
                          </Badge>
                          <span className="text-xs text-slate-400">
                            ({perf.correct}/{questions.length} ትክክል)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="xs"
                          variant="neutral"
                          onClick={() => setSelectedResult(r)}
                          className="flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>መልሶችን ይመልከቱ</span>
                        </Button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <Card variant="elevated" padding="lg" className="max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    የ{selectedResult.student?.firstName} {selectedResult.student?.lastName} መልሶች
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    የተማሪ መለያ: {selectedResult.student?.studentId} • ኮርስ: {selectedResult.courseName || 'N/A'}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    ጠቅላላ ውጤት: {selectedResult.totalScore} | {getPerformance(selectedResult).percentage}% ({getPerformance(selectedResult).correct}/{questions.length} ትክክል)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {selectedResult.answers.map((ans, idx) => {
                  const question = questions.find(q => q._id === ans.question);
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        ans.isCorrect
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{question?.text || 'ጥያቄ አልተገኘም'}</p>
                      <p className="text-xs mt-1.5">
                        <span className="text-slate-500 dark:text-slate-400">የተማሪው መልስ:</span>{' '}
                        <span className={`font-bold ${ans.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                          {ans.selectedAnswer || 'አልተመለሰም'}
                        </span>
                      </p>
                      {!ans.isCorrect && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          ትክክለኛው መልስ: <strong className="text-emerald-600 dark:text-emerald-400">{question?.correctAnswer}</strong>
                        </p>
                      )}
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">ነጥብ: {ans.pointsEarned}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherResults;