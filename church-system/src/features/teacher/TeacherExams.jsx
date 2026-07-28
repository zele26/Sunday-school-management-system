// src/features/teacher/TeacherExams.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherExams = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', courseId: '', quizType: 'Weekly Quiz' });
  const [questionForm, setQuestionForm] = useState({
    type: 'Multiple Choice',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    const res = await apiFetch('/api/quizzes');
    if (res.ok) setQuizzes(await res.json());
  };

  const fetchCourses = async () => {
    const res = await apiFetch('/api/teacher/my-courses');
    if (res.ok) setCourses(await res.json());
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: quizForm.title,
        description: quizForm.description,
        course: quizForm.courseId,
        quizType: quizForm.quizType,
      }),
    });
    if (res.ok) {
      setQuizForm({ title: '', description: '', courseId: '', quizType: 'Weekly Quiz' });
      setShowForm(false);
      fetchQuizzes();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error creating quiz');
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedQuiz) return;
    const res = await apiFetch(`/api/quizzes/${selectedQuiz._id}/questions`, {
      method: 'POST',
      body: JSON.stringify({
        type: questionForm.type,
        text: questionForm.text,
        options: questionForm.type === 'Multiple Choice' ? questionForm.options.filter(o => o.trim()) : [],
        correctAnswer: questionForm.correctAnswer,
        points: questionForm.points,
      }),
    });
    if (res.ok) {
      setQuestionForm({ type: 'Multiple Choice', text: '', options: ['', '', '', ''], correctAnswer: '', points: 1 });
      setMessage('Question added!');
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Exam Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">
          {showForm ? 'Cancel' : '+ New Exam'}
        </button>
      </div>

      {message && <div className="p-2 bg-slate-100 rounded-xl text-sm">{message}</div>}

      {showForm && (
        <form onSubmit={handleCreateQuiz} className="bg-white p-4 rounded-xl shadow space-y-3">
          <input type="text" placeholder="Exam Title" required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} className="w-full p-2 border rounded-xl" />
          <textarea placeholder="Description" value={quizForm.description} onChange={e => setQuizForm({...quizForm, description: e.target.value})} className="w-full p-2 border rounded-xl" />
          <select value={quizForm.courseId} required onChange={e => setQuizForm({...quizForm, courseId: e.target.value})} className="w-full p-2 border rounded-xl">
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={quizForm.quizType} onChange={e => setQuizForm({...quizForm, quizType: e.target.value})} className="w-full p-2 border rounded-xl">
            <option value="Weekly Quiz">Weekly Quiz</option>
            <option value="Mid-Term Exam">Mid-Term Exam</option>
            <option value="Final Exam">Final Exam</option>
          </select>
          <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded-xl">Create Exam</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {quizzes.map(q => (
          <div key={q._id} className={`p-4 bg-white rounded-xl shadow cursor-pointer border ${selectedQuiz?._id === q._id ? 'border-indigo-500' : ''}`} onClick={() => setSelectedQuiz(q)}>
            <h3 className="font-semibold">{q.title}</h3>
            <p className="text-xs text-slate-500">{q.quizType} – {q.course?.name}</p>
          </div>
        ))}
      </div>

      {selectedQuiz && (
        <div className="bg-white p-4 rounded-xl shadow space-y-3">
          <h3 className="font-semibold">Add Question to: {selectedQuiz.title}</h3>
          <select value={questionForm.type} onChange={e => setQuestionForm({...questionForm, type: e.target.value})} className="w-full p-2 border rounded-xl">
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="True/False">True/False</option>
            <option value="Short Answer">Short Answer</option>
            <option value="Essay">Essay</option>
          </select>
          <textarea placeholder="Question text" value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} className="w-full p-2 border rounded-xl" required />
          {questionForm.type === 'Multiple Choice' && (
            <div className="space-y-1">
              {questionForm.options.map((opt, i) => (
                <input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                  const newOpts = [...questionForm.options];
                  newOpts[i] = e.target.value;
                  setQuestionForm({...questionForm, options: newOpts});
                }} className="w-full p-2 border rounded-xl" />
              ))}
            </div>
          )}
          <input type="text" placeholder="Correct Answer (for auto-grading)" value={questionForm.correctAnswer} onChange={e => setQuestionForm({...questionForm, correctAnswer: e.target.value})} className="w-full p-2 border rounded-xl" />
          <input type="number" placeholder="Points" value={questionForm.points} onChange={e => setQuestionForm({...questionForm, points: e.target.value})} className="w-full p-2 border rounded-xl" />
          <button onClick={handleAddQuestion} className="w-full bg-indigo-600 text-white p-2 rounded-xl">Add Question</button>
        </div>
      )}
    </div>
  );
};

export default TeacherExams;