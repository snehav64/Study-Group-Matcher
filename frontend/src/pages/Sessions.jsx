import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/sessions/mine');
      setSessions(data);
    };
    load();
  }, []);

  const rsvp = async (id, value) => {
    const { data } = await api.patch(`/sessions/${id}/rsvp`, { rsvp: value });
    setSessions((prev) => prev.map((s) => (s._id === id ? data : s)));
  };

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.proposedTime) >= now);
  const history = sessions.filter((s) => new Date(s.proposedTime) < now);
  const list = tab === 'upcoming' ? upcoming : history;

  return (
    <div>
      <h2>Sessions</h2>
      <div className="pill-tabs">
        <button className={`pill-tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming ({upcoming.length})</button>
        <button className={`pill-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History ({history.length})</button>
      </div>

      {list.length === 0 ? (
        <p className="empty-state">{tab === 'upcoming' ? 'No sessions scheduled.' : 'No past sessions yet.'}</p>
      ) : (
        list.map((s) => (
          <div key={s._id} className="index-card">
            <h3 className="card-title">{s.group?.name}</h3>
            <p className="card-subtitle">{s.group?.subject}</p>
            <p className="session-time">{new Date(s.proposedTime).toLocaleString()}</p>
            {tab === 'upcoming' ? (
              <div className="field-row mt-16">
                <button className="btn-outline btn-small" onClick={() => rsvp(s._id, 'yes')}>Yes</button>
                <button className="btn-outline btn-small" onClick={() => rsvp(s._id, 'maybe')}>Maybe</button>
                <button className="btn-danger-outline" onClick={() => rsvp(s._id, 'no')}>No</button>
              </div>
            ) : (
              <span className="tag mt-16" style={{ display: 'inline-block' }}>{s.status}</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
