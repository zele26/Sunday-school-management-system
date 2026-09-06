// src/features/student/StudentResources.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { Card, Badge } from '../../components/ui';

const StudentResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await apiFetch('/api/resources/student/my');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading resources...</div>;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            📚 የመማሪያ ማቴሪያሎች (Learning Resources)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            የተመደቡ የፒዲኤፍ ማስታወሻዎች፣ የድምፅና የቪዲዮ ትምህርቶች
          </p>
        </div>
        <Badge variant="gold" size="sm">
          {resources.length} ማቴሪያሎች
        </Badge>
      </div>

      {resources.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center text-slate-400 py-12">
          ምንም የተመደቡ የመማሪያ ማቴሪያሎች አልተገኙም።
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((r) => (
            <Card
              key={r._id}
              variant="default"
              padding="lg"
              className="hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {r.resourceType === 'PDF' && '📄'}
                  {r.resourceType === 'Video' && '🎬'}
                  {r.resourceType === 'YouTube' && '▶️'}
                  {r.resourceType === 'Audio' && '🎵'}
                  {r.resourceType === 'Link' && '🔗'}
                  {r.resourceType === 'Book' && '📚'}
                  {r.resourceType === 'Image' && '🖼️'}
                  {r.resourceType === 'Document' && '📝'}
                  {r.resourceType === 'Other' && '📦'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{r.title}</h3>
                    <Badge variant="neutral" size="xs">{r.resourceType || 'File'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{r.course?.name}</p>
                  {r.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{r.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold flex items-center gap-1"
                      >
                        📎 ማውረድ (Download)
                      </a>
                    )}
                    {r.externalLink && (
                      <a
                        href={r.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold flex items-center gap-1"
                      >
                        🔗 መመልከት (Open Link)
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    የተጫነበት ቀን፡ {formatEthiopianDate(r.uploadDate)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResources;