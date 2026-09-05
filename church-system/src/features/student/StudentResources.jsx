// // src/features/student/StudentResources.jsx
// import React, { useState, useEffect } from 'react';
// import { apiFetch } from '../../api/apiClient';

// const StudentResources = () => {
//   const [resources, setResources] = useState([]);

//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const res = await apiFetch('/api/resources/my');
//         if (res.ok) {
//           const data = await res.json();
//           setResources(data);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchResources();
//   }, []);

//   return (
//     <div className="space-y-4">
//       {resources.map(r => (
//         <div key={r._id} className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold">{r.title}</h3>
//           <p className="text-xs text-slate-500">Type: {r.resourceType} | Course: {r.course?.name}</p>
//           <p className="text-sm">{r.description}</p>
//           <a href={r.fileUrl || r.externalLink} target="_blank" rel="noreferrer"
//             className="text-blue-600 text-sm underline">Open Resource</a>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StudentResources;



// church-system/src/features/student/StudentResources.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';

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

  if (loading) return <div className="p-4 text-center">Loading resources...</div>;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">📚 Learning Resources</h2>
      
      {resources.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center text-gray-400">
          No resources available for your enrolled courses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((r) => (
            <div key={r._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <span className="text-2xl">
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
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{r.title}</h3>
                  <p className="text-sm text-gray-500">{r.course?.name}</p>
                  {r.description && (
                    <p className="text-gray-600 mt-2">{r.description}</p>
                  )}
                  <div className="flex gap-4 mt-3">
                    {r.fileUrl && (
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline text-sm font-medium">
                        📎 Open Resource
                      </a>
                    )}
                    {r.externalLink && (
                      <a href={r.externalLink} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline text-sm font-medium">
                        🔗 Open Link
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Posted: {formatEthiopianDate(r.uploadDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResources;