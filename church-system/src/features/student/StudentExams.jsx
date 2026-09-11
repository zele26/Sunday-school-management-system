// src/features/student/StudentExams.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, ActionCard } from '../../components/ui';
import { FileQuestion } from 'lucide-react';

const StudentExams = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/quizzes').then(res => res.json()).then(data => {
      setQuizzes(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-8 text-center text-slate-400">ፈተናዎች በመጫን ላይ ናቸው...</div>;

  return (
    <Card variant="default" padding="lg" className="space-y-6 font-sans">
      <CardHeader>
        <CardTitle>የፈተናዎች ዝርዝር</CardTitle>
      </CardHeader>
      <CardContent>
        {quizzes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            ምንም የሚወሰዱ ፈተናዎች የሉም።
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {quizzes.map(q => (
              <Link key={q._id} to={`/dashboard/exams/${q._id}`} className="block">
                <ActionCard
                  icon={FileQuestion}
                  title={q.title}
                  description={`${q.quizType} – ${q.course?.name || ''}`}
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentExams;