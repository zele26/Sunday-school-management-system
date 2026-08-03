// church-system/src/features/admin/ResourceApproval.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const ResourceApproval = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await apiFetch('/api/resources/admin/all?status=Pending');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this resource?')) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/resources/admin/approve/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        alert('Resource approved!');
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    setLoading(true);
    try {
      const res = await apiFetch(`/api/resources/admin/approve/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
      });
      if (res.ok) {
        alert('Resource rejected');
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Resource Approval</h2>
      <p className="text-gray-500">Review and approve teacher-submitted resources</p>

      {resources.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center text-gray-400">
          No pending resources for approval
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <div key={r._id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{r.title}</h3>
                  <p className="text-sm text-gray-500">
                    {r.resourceType} • {r.course?.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{r.description}</p>
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
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Uploaded by: {r.uploadedBy?.fullName} • {new Date(r.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(r._id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(r._id)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceApproval;