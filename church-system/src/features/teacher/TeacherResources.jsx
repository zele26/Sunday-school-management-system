// src/features/teacher/TeacherResources.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherResources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    resourceType: 'PDF',
    fileUrl: '',
    externalLink: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchCourses();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await apiFetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('/api/teacher/my-courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/resources', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({
          title: '',
          description: '',
          course: '',
          resourceType: 'PDF',
          fileUrl: '',
          externalLink: '',
        });
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-3">Upload New Resource</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            name="title"
            placeholder="Title"
            required
            value={form.title}
            onChange={handleChange}
            className="p-2 border rounded-xl"
          />
          <select
            name="course"
            value={form.course}
            required
            onChange={handleChange}
            className="p-2 border rounded-xl"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="resourceType"
            value={form.resourceType}
            onChange={handleChange}
            className="p-2 border rounded-xl"
          >
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
          <input
            type="text"
            name="fileUrl"
            placeholder="File URL or drive link"
            value={form.fileUrl}
            onChange={handleChange}
            className="p-2 border rounded-xl md:col-span-2"
          />
          <input
            type="text"
            name="externalLink"
            placeholder="External Link (YouTube, etc.)"
            value={form.externalLink}
            onChange={handleChange}
            className="p-2 border rounded-xl md:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="p-2 border rounded-xl md:col-span-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-xl md:col-span-2"
          >
            Upload Resource
          </button>
        </form>
      </div>

      {/* Resource List */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-3">All Resources</h3>
        {resources.length === 0 ? (
          <p className="text-sm text-slate-400">No resources uploaded yet.</p>
        ) : (
          resources.map((r) => (
            <div key={r._id} className="border-b py-2 flex justify-between items-center">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-slate-500">
                  {r.resourceType} – {r.course?.name}
                </p>
              </div>
              <a
                href={r.fileUrl || r.externalLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm"
              >
                View
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherResources;