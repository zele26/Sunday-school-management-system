import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const TeacherResources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', course: '', resourceType: 'PDF', fileUrl: '', externalLink: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchCourses();
  }, []);

  const fetchResources = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/resources?token=${token}`, { headers: { Authorization: `Bearer ${token}` } });
    setResources(await res.json());
  };

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/teacher/my-courses?token=${token}`, { headers: { Authorization: `Bearer ${token}` } });
    setCourses(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', description: '', course: '', resourceType: 'PDF', fileUrl: '', externalLink: '' });
      fetchResources();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-3">Upload New Resource</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="Title" required value={form.title}
            onChange={e => setForm({...form, title: e.target.value})} className="p-2 border rounded-xl" />
          <select value={form.course} required onChange={e => setForm({...form, course: e.target.value})}
            className="p-2 border rounded-xl">
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={form.resourceType} onChange={e => setForm({...form, resourceType: e.target.value})}
            className="p-2 border rounded-xl">
            <option value="PDF">PDF</option>
            <option value="Video">Video</option>
            <option value="YouTube">YouTube</option>
            <option value="Audio">Audio</option>
            <option value="Link">Link</option>
            <option value="Book">Book</option>
            <option value="Image">Image</option>
            <option value="Document">Document</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" placeholder="File URL or drive link" value={form.fileUrl}
            onChange={e => setForm({...form, fileUrl: e.target.value})} className="p-2 border rounded-xl md:col-span-2" />
          <input type="text" placeholder="External Link (YouTube, etc.)" value={form.externalLink}
            onChange={e => setForm({...form, externalLink: e.target.value})} className="p-2 border rounded-xl md:col-span-2" />
          <textarea placeholder="Description" value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} className="p-2 border rounded-xl md:col-span-2" />
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-xl md:col-span-2">Upload Resource</button>
        </form>
      </div>

      {/* Resource List */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-3">All Resources</h3>
        {resources.map(r => (
          <div key={r._id} className="border-b py-2 flex justify-between items-center">
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-slate-500">{r.resourceType} – {r.course?.name}</p>
            </div>
            <a href={r.fileUrl || r.externalLink} target="_blank" rel="noreferrer"
              className="text-blue-600 text-sm">View</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherResources;