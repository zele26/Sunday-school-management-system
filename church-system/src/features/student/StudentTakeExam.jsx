// src/features/student/StudentTakeExam.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, HelpCircle, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../../components/ui';

const StudentTakeExam = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await apiFetch(`/api/quizzes/${quizId}/take`);
        if (!res.ok) throw new Error('Failed to load exam');
        const data = await res.json();
        setQuiz(data.quiz);
        setQuestions(data.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));

    try {
      const res = await apiFetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: answerArray }),
      });
      const data = await res.json();
      if (data.success) {
        setScore(data.totalScore);
        setSubmitted(true);
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (loading) return <div className="py-16 text-center text-slate-400 font-semibold text-sm">ፈተና በመጫን ላይ... (Loading exam...)</div>;
  if (error) return <div className="py-16 text-center text-rose-500 font-semibold text-sm">❌ {error}</div>;

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 p-4">
        <Card variant="elevated" padding="lg" className="text-center space-y-4 border-emerald-200 dark:border-emerald-800">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">ፈተናው በተሳካ ሁኔታ ተልኳል!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Exam submitted successfully</p>
          
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">የተገኘው ውጤት (Score)</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{score}</p>
          </div>

          <Button onClick={() => navigate('/dashboard/exams')} className="w-full font-bold">
            ወደ ፈተናዎች ተመለስ (Back to Exams)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Card variant="default" padding="lg">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">{quiz?.title}</CardTitle>
          {quiz?.description && (
            <CardDescription className="text-sm mt-1">{quiz?.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6 p-0 pt-6">
          {questions.map((q, idx) => (
            <Card key={q._id} variant="subtle" padding="md" className="space-y-3">
              <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {idx + 1}. {q.text}
              </p>

              {q.type === 'Multiple Choice' && (
                <div className="space-y-2 pt-1">
                  {q.options.map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        answers[q._id] === opt
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[var(--brand-primary)] text-blue-900 dark:text-blue-100 font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        value={opt}
                        checked={answers[q._id] === opt}
                        onChange={() => handleAnswerChange(q._id, opt)}
                        className="text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'True/False' && (
                <div className="flex gap-4 pt-1">
                  {['True', 'False'].map(val => (
                    <label
                      key={val}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        answers[q._id] === val
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[var(--brand-primary)] text-blue-900 dark:text-blue-100 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        value={val}
                        checked={answers[q._id] === val}
                        onChange={() => handleAnswerChange(q._id, val)}
                        className="text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                      />
                      <span className="text-sm">{val === 'True' ? 'እውነት (True)' : 'ሐሰት (False)'}</span>
                    </label>
                  ))}
                </div>
              )}

              {(q.type === 'Short Answer' || q.type === 'Essay') && (
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                  placeholder="መልስዎን እዚህ ይጻፉ..."
                  value={answers[q._id] || ''}
                  onChange={e => handleAnswerChange(q._id, e.target.value)}
                />
              )}
            </Card>
          ))}

          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full font-black text-base shadow-lg"
          >
            ፈተናውን አስገባ (Submit Exam)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTakeExam;