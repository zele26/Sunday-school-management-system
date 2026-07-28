// src/features/teacher/TeacherExamDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

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

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await apiFetch(`/api/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data.quiz);
        setQuestions(data.questions);
      }
    } catch (err) {}
    setLoading(false);
  };

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
    if (!window.confirm('Delete this question?')) return;
    await apiFetch(`/api/quizzes/${quizId}/questions/${id}`, { method: 'DELETE' });
    fetchQuiz();
  };

  if (loading) return <div className="py-8 text-center">Loading exam details...</div>;
  if (!quiz) return <div className="py-8 text-center text-red-500">Exam not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <p className="text-sm text-slate-500">{quiz.quizType} – {quiz.course?.name}</p>
        </div>
        <Link to="/teacher/exams" className="text-blue-600 underline">Back to Exams</Link>
      </div>

      {message && <div className="p-2 bg-slate-100 rounded-xl text-sm">{message}</div>}

      {/* Question form */}
      <form onSubmit={handleAddOrUpdate} className="bg-white p-4 rounded-xl shadow space-y-3">
        <h3 className="font-semibold">{editingId ? 'Edit Question' : 'Add Question'}</h3>
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full p-2 border rounded-xl">
          <option value="Multiple Choice">Multiple Choice</option>
          <option value="True/False">True/False</option>
          <option value="Short Answer">Short Answer</option>
          <option value="Essay">Essay</option>
        </select>
        <textarea placeholder="Question text" value={form.text} onChange={e => setForm({...form, text: e.target.value})} className="w-full p-2 border rounded-xl" required />
        {form.type === 'Multiple Choice' && (
          <div className="space-y-1">
            {form.options.map((opt, i) => (
              <input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                const newOpts = [...form.options];
                newOpts[i] = e.target.value;
                setForm({...form, options: newOpts});
              }} className="w-full p-2 border rounded-xl" />
            ))}
          </div>
        )}
        <input type="text" placeholder="Correct Answer" value={form.correctAnswer} onChange={e => setForm({...form, correctAnswer: e.target.value})} className="w-full p-2 border rounded-xl" />
        <input type="number" placeholder="Points" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)})} className="w-full p-2 border rounded-xl" />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-xl">
          {editingId ? 'Update Question' : 'Add Question'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ type: 'Multiple Choice', text: '', options: ['', '', '', ''], correctAnswer: '', points: 1 }); }} className="w-full mt-1 bg-slate-200 p-2 rounded-xl">Cancel Edit</button>}
      </form>

      {/* Questions list */}
      <div className="space-y-3">
        <h3 className="font-semibold">Questions ({questions.length})</h3>
        {questions.map((q, idx) => (
          <div key={q._id} className="bg-white p-3 rounded-xl shadow border flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">{idx+1}. {q.text}</p>
              <p className="text-xs text-slate-500">Type: {q.type} | Answer: {q.correctAnswer} | Points: {q.points}</p>
              {q.options.length > 0 && <p className="text-xs text-slate-400">Options: {q.options.join(', ')}</p>}
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => startEdit(q)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(q._id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherExamDetail;