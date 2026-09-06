// src/features/student/StudentResultDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';

const StudentResultDetail = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await apiFetch(`/api/student/exam-results/${resultId}`);
        if (res.ok) setResult(await res.json());
      } catch (err) {
        console.error('Failed to load exam result detail', err);
      }
      setLoading(false);
    };
    fetchResult();
  }, [resultId]);

  if (loading) return <div className="py-8 text-center text-slate-400">Loading...</div>;
  if (!result) return <div className="py-8 text-center text-rose-500 font-bold">ውጤት አልተገኘም (Result not found)</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 font-sans">
      <Link to="/dashboard/results" className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold inline-flex items-center gap-1">
        ← ወደ ውጤቶች ዝርዝር ተመለስ
      </Link>

      <Card variant="default" padding="lg" className="space-y-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle>{result.quiz?.title}</CardTitle>
            <Badge variant="gold" size="lg">
              ጠቅላላ ውጤት፡ {result.totalScore}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {result.answers.map((ans, idx) => {
            const q = ans.question;
            if (!q) return null;
            return (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {idx + 1}. {q.text}
                  </p>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{ans.pointsEarned} / {q.points} pts</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  የሰጡት መልስ፡ <span className={ans.isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{ans.selectedAnswer || '(መልስ አልተሰጠም)'}</span>
                </p>
                {!ans.isCorrect && q.correctAnswer && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">ትክክለኛው መልስ፡ <span className="font-bold text-emerald-600">{q.correctAnswer}</span></p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentResultDetail;