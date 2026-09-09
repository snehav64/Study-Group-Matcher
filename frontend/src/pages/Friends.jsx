import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [friendsRes, pendingRes] = await Promise.all([api.get('/friends'), api.get('/friends/pending')]);
    setFriends(friendsRes.data);
    setPending(pendingRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    await api.patch(`/friends/${id}`, { status });
    load();
  };

  if (loading) return <p className="empty-state">Loading friends...</p>;

  return (
    <div>
      <h2>Friends</h2>
      {pending.length > 0 && (
        <>
          <label className="field-label">Pending requests</label>
          {pending.map((r) => (
            <div key={r._id} className="index-card">
              <div className="card-top">
                <div>
                  <h3 className="card-title">{r.from.name}</h3>
                  <p className="card-subtitle">{r.from.university || 'No university listed'}</p>
                </div>
              </div>
              <div className="field-row mt-16">
                <button className="btn-outline btn-small" onClick={() => respond(r._id, 'accepted')}>Accept</button>
                <button className="btn-danger-outline" onClick={() => respond(r._id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </>
      )}
      <label className="field-label">Your friends ({friends.length})</label>
      {friends.length === 0 ? (
        <p className="empty-state">No friends yet — send a request from the Matches page.</p>
      ) : (
        friends.map((f) => (
          <div key={f._id} className="index-card">
            <h3 className="card-title">{f.name}</h3>
            <p className="card-subtitle">{f.university || 'No university listed'}</p>
          </div>
        ))
      )}
    </div>
  );
}
