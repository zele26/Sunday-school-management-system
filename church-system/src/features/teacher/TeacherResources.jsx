// src/features/teacher/TeacherResources.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherResources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    resourceType: 'PDF',
    fileUrl: '',
    externalLink: '',
  });

  useEffect(() => {
    fetchResources();
    fetchCourses();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/resources/my');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
        // Update stats
        setStats({
          total: data.length,
          pending: data.filter(r => r.status === 'Pending').length,
          approved: data.filter(r => r.status === 'Approved').length,
          rejected: data.filter(r => r.status === 'Rejected').length,
        });
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setMsg({ type: 'error', text: 'Failed to load resources.' });
    } finally {
      setLoading(false);
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
      console.error('Error fetching courses:', err);
    }
  };

  // ---------- File Upload ----------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/upload/resource`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, fileUrl: data.url });
        setMsg({ type: 'success', text: '✅ File uploaded successfully!' });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Upload failed.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Network error during upload.' });
    } finally {
      setUploading(false);
    }
  };

  // ---------- Submit (Create/Update) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const url = editingId ? `/api/resources/${editingId}` : '/api/resources';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setMsg({ type: 'success', text: data.message || 'Resource saved successfully!' });
        resetForm();
        fetchResources();
        setShowForm(false);
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      } else {
        const error = await res.json();
        setMsg({ type: 'error', text: error.message || 'Failed to save resource.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  // ---------- Edit ----------
  const handleEdit = (resource) => {
    setEditingId(resource._id);
    setForm({
      title: resource.title || '',
      description: resource.description || '',
      course: resource.course?._id || resource.course || '',
      resourceType: resource.resourceType || 'PDF',
      fileUrl: resource.fileUrl || '',
      externalLink: resource.externalLink || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ type: 'success', text: '✅ Resource deleted successfully!' });
        fetchResources();
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Delete failed.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- Reset Form ----------
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      course: '',
      resourceType: 'PDF',
      fileUrl: '',
      externalLink: '',
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Rejected': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    const emojis = {
      'Pending': '⏳',
      'Approved': '✅',
      'Rejected': '❌',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || 'bg-gray-100'}`}>
        {emojis[status]} {status}
      </span>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Teaching Resources
          </h2>
          <p className="text-sm text-slate-500">Upload, manage, and track teaching resources for your courses.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) resetForm();
          }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
            showForm
              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/20'
          }`}
        >
          {showForm ? '✕ Cancel' : '➕ New Resource'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-600 font-semibold uppercase">Total</p>
          <p className="text-2xl font-bold text-indigo-800">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-2xl border border-yellow-100">
          <p className="text-xs text-yellow-600 font-semibold uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase">Approved</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-r from-rose-50 to-red-50 p-4 rounded-2xl border border-rose-100">
          <p className="text-xs text-rose-600 font-semibold uppercase">Rejected</p>
          <p className="text-2xl font-bold text-rose-800">{stats.rejected}</p>
        </div>
      </div>

      {/* Messages */}
      {msg.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          <span className="text-lg">{msg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* --- Form (Expandable) --- */}
      {showForm && (
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-5 duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>{editingId ? '✏️ Edit Resource' : '📤 Upload New Resource'}</span>
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Resource title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course *</label>
                <select
                  name="course"
                  value={form.course}
                  required
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resource Type</label>
                <select
                  name="resourceType"
                  value={form.resourceType}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  <option value="PDF">📄 PDF</option>
                  <option value="Document">📝 Document</option>
                  <option value="Image">🖼️ Image</option>
                  <option value="Video">🎬 Video</option>
                  <option value="YouTube">▶️ YouTube</option>
                  <option value="Audio">🎵 Audio</option>
                  <option value="Link">🔗 Link</option>
                  <option value="Book">📚 Book</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload File</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                />
                {uploading && <p className="text-indigo-600 text-xs mt-1">Uploading...</p>}
                {form.fileUrl && (
                  <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                    ✅ File uploaded
                    <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-2">View</a>
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">External Link (YouTube, etc.)</label>
                <input
                  type="url"
                  name="externalLink"
                  placeholder="https://..."
                  value={form.externalLink}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>{editingId ? 'Update Resource' : 'Submit for Approval'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Resource List --- */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading resources...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No resources uploaded yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-indigo-600 font-semibold text-sm hover:underline"
              >
                Upload your first resource
              </button>
            </div>
          ) : (
            resources.map((r) => (
              <div key={r._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-semibold text-lg text-slate-800">{r.title}</h4>
                      {getStatusBadge(r.status)}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="font-medium">{r.resourceType}</span>
                      <span className="text-slate-300">•</span>
                      <span>{r.course?.name || 'No Course'}</span>
                    </p>
                    {r.description && <p className="text-sm text-slate-600">{r.description}</p>}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {r.fileUrl && (
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          📎 View File
                        </a>
                      )}
                      {r.externalLink && (
                        <a href={r.externalLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          🔗 Open Link
                        </a>
                      )}
                      {r.status === 'Rejected' && r.rejectionReason && (
                        <span className="text-rose-600 text-xs bg-rose-50 px-2 py-1 rounded-lg">
                          Reason: {r.rejectionReason}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Uploaded: {new Date(r.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-auto md:ml-0">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      className="text-xs bg-rose-50 text-rose-700 font-semibold px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      {deletingId === r._id ? '...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherResources;