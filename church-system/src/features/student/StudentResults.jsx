// src/features/student/StudentResults.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';
import { Link } from 'react-router-dom';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';
import { Award } from 'lucide-react';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await apiFetch('/api/student/exam-results');
        if (res.ok) setResults(await res.json());
      } catch (err) {
        console.error('Failed to load results', err);
      }
      setLoading(false);
    };
    fetchResults();
  }, []);

  if (loading) return <div className="py-8 text-center text-slate-400">ውጤቶች በመጫን ላይ ናቸው...</div>;

  return (
    <Card variant="default" padding="lg" className="space-y-6 font-sans">
      <CardHeader>
        <CardTitle>የፈተና ውጤቶች</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            ምንም የፈተና ውጤት አልተመዘገበም።
          </div>
        ) : (
          <div className="grid gap-3">
            {results.map(r => (
              <Link key={r._id} to={`/dashboard/results/${r._id}`} className="block">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">{r.quiz?.title || 'ፈተና'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatEthiopianDate(r.submittedAt)}</p>
                    </div>
                  </div>
                  <Badge variant="gold" size="md">
                    {r.totalScore} ነጥብ
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentResults;