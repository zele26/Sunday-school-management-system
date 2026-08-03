// // src/features/teacher/TeacherResources.jsx
// import React, { useState, useEffect } from 'react';
// import { apiFetch } from '../../api/apiClient';

// const TeacherResources = () => {
//   const [resources, setResources] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [form, setForm] = useState({
//     title: '',
//     description: '',
//     course: '',
//     resourceType: 'PDF',
//     fileUrl: '',
//     externalLink: '',
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchResources();
//     fetchCourses();
//   }, []);

//   const fetchResources = async () => {
//     try {
//       const res = await apiFetch('/api/resources');
//       if (res.ok) {
//         const data = await res.json();
//         setResources(data);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchCourses = async () => {
//     try {
//       const res = await apiFetch('/api/teacher/my-courses');
//       if (res.ok) {
//         const data = await res.json();
//         setCourses(data);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await apiFetch('/api/resources', {
//         method: 'POST',
//         body: JSON.stringify(form),
//       });
//       if (res.ok) {
//         setForm({
//           title: '',
//           description: '',
//           course: '',
//           resourceType: 'PDF',
//           fileUrl: '',
//           externalLink: '',
//         });
//         fetchResources();
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   return (
//     <div className="space-y-6">
//       {/* Upload Form */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h3 className="font-bold mb-3">Upload New Resource</h3>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <input
//             type="text"
//             name="title"
//             placeholder="Title"
//             required
//             value={form.title}
//             onChange={handleChange}
//             className="p-2 border rounded-xl"
//           />
//           <select
//             name="course"
//             value={form.course}
//             required
//             onChange={handleChange}
//             className="p-2 border rounded-xl"
//           >
//             <option value="">Select Course</option>
//             {courses.map((c) => (
//               <option key={c._id} value={c._id}>
//                 {c.name}
//               </option>
//             ))}
//           </select>
//           <select
//             name="resourceType"
//             value={form.resourceType}
//             onChange={handleChange}
//             className="p-2 border rounded-xl"
//           >
//             <option value="PDF">PDF</option>
//             <option value="Video">Video</option>
//             <option value="YouTube">YouTube</option>
//             <option value="Audio">Audio</option>
//             <option value="Link">Link</option>
//             <option value="Book">Book</option>
//             <option value="Image">Image</option>
//             <option value="Document">Document</option>
//             <option value="Other">Other</option>
//           </select>
//           <input
//             type="text"
//             name="fileUrl"
//             placeholder="File URL or drive link"
//             value={form.fileUrl}
//             onChange={handleChange}
//             className="p-2 border rounded-xl md:col-span-2"
//           />
//           <input
//             type="text"
//             name="externalLink"
//             placeholder="External Link (YouTube, etc.)"
//             value={form.externalLink}
//             onChange={handleChange}
//             className="p-2 border rounded-xl md:col-span-2"
//           />
//           <textarea
//             name="description"
//             placeholder="Description"
//             value={form.description}
//             onChange={handleChange}
//             className="p-2 border rounded-xl md:col-span-2"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-blue-600 text-white p-2 rounded-xl md:col-span-2"
//           >
//             Upload Resource
//           </button>
//         </form>
//       </div>

//       {/* Resource List */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h3 className="font-bold mb-3">All Resources</h3>
//         {resources.length === 0 ? (
//           <p className="text-sm text-slate-400">No resources uploaded yet.</p>
//         ) : (
//           resources.map((r) => (
//             <div key={r._id} className="border-b py-2 flex justify-between items-center">
//               <div>
//                 <p className="font-medium">{r.title}</p>
//                 <p className="text-xs text-slate-500">
//                   {r.resourceType} – {r.course?.name}
//                 </p>
//               </div>
//               <a
//                 href={r.fileUrl || r.externalLink}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="text-blue-600 text-sm"
//               >
//                 View
//               </a>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeacherResources;




// church-system/src/features/teacher/TeacherResources.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherResources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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
    try {
      const res = await apiFetch('/api/resources/my');
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/upload/resource`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, fileUrl: data.url });
        alert('File uploaded successfully!');
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId 
        ? `/api/resources/${editingId}` 
        : '/api/resources';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Resource saved successfully');
        setForm({
          title: '',
          description: '',
          course: '',
          resourceType: 'PDF',
          fileUrl: '',
          externalLink: '',
        });
        setEditingId(null);
        fetchResources();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save resource');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving resource');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource._id);
    setForm({
      title: resource.title,
      description: resource.description || '',
      course: resource.course._id || resource.course,
      resourceType: resource.resourceType,
      fileUrl: resource.fileUrl || '',
      externalLink: resource.externalLink || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await apiFetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Resource deleted');
        fetchResources();
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4">
          {editingId ? 'Edit Resource' : 'Upload New Resource'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Resource Title *"
              required
              value={form.title}
              onChange={handleChange}
              className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              name="course"
              value={form.course}
              required
              onChange={handleChange}
              className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Course *</option>
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
              className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
            
            {/* File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (PDF, Word, Excel, Images, etc.)
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full p-2 border rounded-xl"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
              />
              {uploading && <p className="text-blue-600 mt-1">Uploading...</p>}
              {form.fileUrl && (
                <p className="text-green-600 text-sm mt-1">✅ File uploaded: {form.fileUrl}</p>
              )}
            </div>

            <input
              type="text"
              name="externalLink"
              placeholder="External Link (YouTube, etc.)"
              value={form.externalLink}
              onChange={handleChange}
              className="md:col-span-2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="md:col-span-2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update Resource' : 'Submit for Approval'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: '', description: '', course: '', resourceType: 'PDF', fileUrl: '', externalLink: '' });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Resource List */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4">My Resources</h3>
        {resources.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No resources uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {resources.map((r) => (
              <div key={r._id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-semibold text-lg">{r.title}</h4>
                      {getStatusBadge(r.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {r.resourceType} • {r.course?.name || 'No Course'}
                    </p>
                    {r.description && (
                      <p className="text-gray-600 mt-2">{r.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      {r.fileUrl && (
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          📎 View File
                        </a>
                      )}
                      {r.externalLink && (
                        <a href={r.externalLink} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline">
                          🔗 Open Link
                        </a>
                      )}
                      {r.status === 'Rejected' && r.rejectionReason && (
                        <span className="text-red-600 text-sm">
                          Reason: {r.rejectionReason}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Uploaded: {new Date(r.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherResources;
