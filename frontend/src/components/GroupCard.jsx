import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';

export default function GroupCard({ group, showJoinButton, onRequestSent }) {
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');

  const requestJoin = async () => {
    setError('');
    try {
      await api.post(`/requests/${group._id}`);
      setRequested(true);
      onRequestSent?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send request');
    }
  };

  return (
    <div className="index-card">
      <div className="card-top">
        <h3 className="card-title">{group.name}</h3>
        <span className="score-badge">
          {group.members?.length ?? group.memberCount ?? 0}/{group.maxMembers}
        </span>
      </div>
      <p className="card-subtitle">{group.subject}</p>
      {group.tags?.length > 0 && (
        <div className="tag-row">
          {group.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
      <div className="field-row mt-16">
        <Link to={`/groups/${group._id}`} className="btn btn-small" style={{ textDecoration: 'none' }}>
          View group
        </Link>
        {showJoinButton && (
          <button type="button" className="btn-outline btn-small" onClick={requestJoin} disabled={requested}>
            {requested ? 'Request sent' : 'Request to join'}
          </button>
        )}
      </div>
    </div>
  );
}
