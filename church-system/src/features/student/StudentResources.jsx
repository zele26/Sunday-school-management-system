// features/student/StudentResources.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const StudentResources = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/resources/my?token=${token}`, { headers: { Authorization: `Bearer ${token}` } });
      setResources(await res.json());
    };
    fetchResources();
  }, []);

  return (
    <div className="space-y-4">
      {resources.map(r => (
        <div key={r._id} className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold">{r.title}</h3>
          <p className="text-xs text-slate-500">Type: {r.resourceType} | Course: {r.course?.name}</p>
          <p className="text-sm">{r.description}</p>
          <a href={r.fileUrl || r.externalLink} target="_blank" rel="noreferrer"
            className="text-blue-600 text-sm underline">Open Resource</a>
        </div>
      ))}
    </div>
  );
};

export default StudentResources;