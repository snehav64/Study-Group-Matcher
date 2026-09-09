import { useEffect, useState } from 'react';
import api from '../api/axios';

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000';

function iconFor(mimeType) {
  if (!mimeType) return '📎';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.includes('word')) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  return '📎';
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourcePanel({ groupId }) {
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get(`/resources/group/${groupId}`);
    setResources(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/resources/${groupId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addLink = async () => {
    setError('');
    if (!linkUrl.trim()) return;
    try {
      await api.post(`/resources/${groupId}/link`, { title: linkTitle, url: linkUrl });
      setLinkTitle('');
      setLinkUrl('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add link');
    }
  };

  const removeResource = async (id) => {
    await api.delete(`/resources/${id}`);
    setResources((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div>
      <label className="field-label">Resources</label>

      <div className="field-row">
        <label className="btn-outline btn-small" style={{ cursor: 'pointer', display: 'inline-block' }}>
          {uploading ? 'Uploading...' : '+ Upload PDF / Word / Image'}
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="field-row mt-16">
        <input
          className="field"
          placeholder="YouTube link title (optional)"
          value={linkTitle}
          onChange={(e) => setLinkTitle(e.target.value)}
        />
        <input
          className="field"
          placeholder="Paste YouTube link"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <button className="btn btn-small" onClick={addLink}>
          Add link
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="mt-16">
        {resources.length === 0 && <p className="helper-text">No resources shared yet.</p>}
        {resources.map((r) => (
          <div key={r._id} className="session-row">
            {r.type === 'file' ? (
              <a
                className="session-time"
                style={{ textDecoration: 'none', color: 'var(--ink)' }}
                href={`${UPLOADS_BASE}/uploads/${r.storedName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {iconFor(r.mimeType)} {r.originalName}{' '}
                <span className="helper-text">({formatSize(r.fileSize)})</span>
              </a>
            ) : (
              <a
                className="session-time"
                style={{ textDecoration: 'none', color: 'var(--ink)' }}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶️ {r.title}
              </a>
            )}
            <span className="tag">{r.uploadedBy?.name}</span>
            <button className="btn-danger-outline" onClick={() => removeResource(r._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
