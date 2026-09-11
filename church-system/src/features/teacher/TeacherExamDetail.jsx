// src/features/teacher/TeacherExamDetail.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../../components/ui';

const TeacherExamDetail = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'Multiple Choice',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchQuiz = React.useCallback(async () => {
    try {
      const res = await apiFetch(`/api/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data.quiz);
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
    }
    setLoading(false);
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `/api/quizzes/${quizId}/questions/${editingId}`
      : `/api/quizzes/${quizId}/questions`;
    const method = editingId ? 'PUT' : 'POST';
    const body = {
      type: form.type,
      text: form.text,
      options: form.type === 'Multiple Choice' ? form.options.filter(o => o.trim()) : [],
      correctAnswer: form.correctAnswer,
      points: form.points,
    };

    const res = await apiFetch(url, { method, body: JSON.stringify(body) });
    if (res.ok) {
      setForm({ type: 'Multiple Choice', text: '', options: ['', '', '', ''], correctAnswer: '', points: 1 });
      setEditingId(null);
      fetchQuiz();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
  };

  const startEdit = (q) => {
    setEditingId(q._id);
    setForm({
      type: q.type,
      text: q.text,
      options: q.type === 'Multiple Choice' ? q.options : ['', '', '', ''],
      correctAnswer: q.correctAnswer || '',
      points: q.points,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ይህን ጥያቄ መሰረዝ ይፈልጋሉ?')) return;
    await apiFetch(`/api/quizzes/${quizId}/questions/${id}`, { method: 'DELETE' });
    fetchQuiz();
  };

  if (loading) return <div className="py-12 text-center text-slate-400 font-semibold text-sm">የፈተና ዝርዝር በመጫን ላይ ነው...</div>;
  if (!quiz) return <div className="py-12 text-center text-rose-500 font-semibold text-sm">ፈተናው አልተገኘም።</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{quiz.title}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{quiz.quizType} • {quiz.course?.name}</p>
        </div>
        <Link to="/teacher/exams" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>ወደ ፈተናዎች ተመለስ</span>
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-200 text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Question Form */}
      <Card variant="default" padding="lg">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>{editingId ? 'ጥያቄ አርትዕ' : 'አዲስ ጥያቄ ጨምር'}</span>
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleAddOrUpdate} className="space-y-4">
          <select
            value={form.type}
            onChange={e => setForm({...form, type: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Multiple Choice">ምርጫ</option>
            <option value="True/False">እውነት / ሐሰት</option>
            <option value="Short Answer">አጭር መልስ</option>
            <option value="Essay">ድርሰት / ማብራሪያ</option>
          </select>

          <textarea
            placeholder="የጥያቄው ጽሑፍ"
            value={form.text}
            onChange={e => setForm({...form, text: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={3}
            required
          />

          {form.type === 'Multiple Choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`ምርጫ ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={e => {
                    const newOpts = [...form.options];
                    newOpts[i] = e.target.value;
                    setForm({...form, options: newOpts});
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="ትክክለኛ መልስ"
              value={form.correctAnswer}
              onChange={e => setForm({...form, correctAnswer: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              type="number"
              placeholder="ነጥብ"
              value={form.points}
              onChange={e => setForm({...form, points: parseInt(e.target.value) || 1})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="sm" className="font-bold">
              {editingId ? 'ጥያቄውን አዘምን' : 'ጥያቄውን ጨምር'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  setForm({ type: 'Multiple Choice', text: '', options: ['', '', '', ''], correctAnswer: '', points: 1 });
                }}
              >
                ይቅር
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Questions list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>የተመዘገቡ ጥያቄዎች ({questions.length})</span>
          </h3>
        </div>

        {questions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            ምንም የተመዘገበ ጥያቄ የለም።
          </p>
        ) : (
          questions.map((q, idx) => (
            <Card key={q._id} variant="default" padding="sm" className="flex justify-between items-start">
              <div className="flex-1 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{idx + 1}. {q.text}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <Badge variant="subtle" size="sm">
                    {q.type === 'Multiple Choice' ? 'ምርጫ' : q.type === 'True/False' ? 'እውነት/ሐሰት' : q.type === 'Short Answer' ? 'አጭር መልስ' : 'ድርሰት'}
                  </Badge>
                  <span className="text-slate-500 dark:text-slate-400">መልስ፡ <strong className="text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</strong></span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 dark:text-slate-400">{q.points} ነጥብ</span>
                </div>
                {q.options?.length > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    ምርጫዎች፡ {q.options.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="xs" variant="neutral" onClick={() => startEdit(q)} className="flex items-center gap-1">
                  <Edit2 className="w-3 h-3" />
                  <span>አርትዕ</span>
                </Button>
                <Button size="xs" variant="destructive" onClick={() => handleDelete(q._id)} className="flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  <span>ሰርዝ</span>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherExamDetail;