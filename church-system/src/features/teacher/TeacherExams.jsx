// src/features/teacher/TeacherExams.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';

const TeacherExams = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', courseId: '', quizType: 'Weekly Quiz' });
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
    try {
      const res = await apiFetch('/api/teacher/my-courses');
      if (!res.ok) {
        setCourses([]);
        return;
      }

      const data = await res.json().catch(() => []);
      const normalized = Array.isArray(data) ? data : (data.courses || data.data || []);
      setCourses(normalized);
      if (!Array.isArray(normalized) || normalized.length === 0) {
        setMessage('ለእርስዎ አካውንት የተመደበ ኮርስ አልተገኘም። ቢያንስ ለአንድ ኮርስ መመደብዎን ያረጋግጡ።');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
    }
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
      const data = await res.json().catch(() => ({}));
      setMessage(data.message || 'ፈተና መፍጠር አልተሳካም');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <CardTitle>የፈተና አስተዳደር</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ፈተናዎችንና የፈተና ጥያቄዎችን ያዘጋጁ</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1657b8] hover:bg-[#124796] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors shadow-xs"
          >
            {showForm ? 'ሰርዝ' : '+ አዲስ ፈተና'}
          </button>
        </div>

        {message && (
          <div className="p-3 my-4 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs">
            {message}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateQuiz} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5 my-4">
            <input
              type="text"
              placeholder="የፈተና ርዕስ"
              required
              value={quizForm.title}
              onChange={e => setQuizForm({...quizForm, title: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm"
            />
            <textarea
              placeholder="መግለጫ"
              value={quizForm.description}
              onChange={e => setQuizForm({...quizForm, description: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm"
              rows="2"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={quizForm.courseId}
                required
                onChange={e => setQuizForm({...quizForm, courseId: e.target.value})}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm"
              >
                <option value="">ኮርስ ይምረጡ</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select
                value={quizForm.quizType}
                onChange={e => setQuizForm({...quizForm, quizType: e.target.value})}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm"
              >
                <option value="Weekly Quiz">ሳምንታዊ ፈተና</option>
                <option value="Mid-Term Exam">የግማሽ ዓመት ፈተና</option>
                <option value="Final Exam">የማጠቃለያ ፈተና</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl text-sm transition-colors">
              ፈተናውን ፍጠር
            </button>
          </form>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {quizzes.map(q => (
            <Card key={q._id} variant="default" padding="md" className="hover:border-blue-300 transition-colors flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{q.title}</h3>
                  <Badge variant="neutral" size="xs">
                    {q.quizType === 'Weekly Quiz' ? 'ሳምንታዊ ፈተና' : q.quizType === 'Mid-Term Exam' ? 'የግማሽ ዓመት ፈተና' : q.quizType === 'Final Exam' ? 'የማጠቃለያ ፈተና' : q.quizType}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{q.course?.name}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link to={`/teacher/exams/${q._id}`} className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                  ጥያቄዎችን አስተዳድር
                </Link>
                <Link to={`/teacher/results?quizId=${q._id}`} className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  ውጤቶችን ተመልከት
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TeacherExams;