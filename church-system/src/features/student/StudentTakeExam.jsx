// src/features/student/StudentTakeExam.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

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

  if (loading) return <div className="py-8 text-center">Loading exam...</div>;
  if (error) return <div className="py-8 text-center text-red-500">❌ {error}</div>;
  if (submitted) return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow text-center">
      <h2 className="text-2xl font-bold text-emerald-700">Exam Submitted!</h2>
      <p className="mt-4 text-lg">Your score: <strong>{score}</strong></p>
      <button onClick={() => navigate('/dashboard/exams')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl">Back to Exams</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">{quiz?.title}</h1>
      <p className="text-sm text-slate-500 mb-6">{quiz?.description}</p>
      {questions.map((q, idx) => (
        <div key={q._id} className="bg-white p-4 rounded-xl shadow mb-4">
          <p className="font-semibold">{idx + 1}. {q.text}</p>
          {q.type === 'Multiple Choice' && q.options.map(opt => (
            <label key={opt} className="block mt-2">
              <input type="radio" name={q._id} value={opt} onChange={() => handleAnswerChange(q._id, opt)} className="mr-2" />
              {opt}
            </label>
          ))}
          {q.type === 'True/False' && (
            <div className="mt-2 space-x-4">
              <label><input type="radio" name={q._id} value="True" onChange={() => handleAnswerChange(q._id, 'True')} /> True</label>
              <label><input type="radio" name={q._id} value="False" onChange={() => handleAnswerChange(q._id, 'False')} /> False</label>
            </div>
          )}
          {(q.type === 'Short Answer' || q.type === 'Essay') && (
            <textarea className="w-full p-2 border rounded-xl mt-2" rows="3" onChange={e => handleAnswerChange(q._id, e.target.value)} />
          )}
        </div>
      ))}
      <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-semibold hover:bg-emerald-700">Submit Exam</button>
    </div>
  );
};

export default StudentTakeExam;