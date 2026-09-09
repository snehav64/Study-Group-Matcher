import { useEffect, useState } from 'react';
import api from '../api/axios';
import GroupCard from '../components/GroupCard';

export default function MyGroups() {
  const [tab, setTab] = useState('mine');
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [form, setForm] = useState({ name: '', subject: '', maxMembers: 6 });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [mine, all] = await Promise.all([api.get('/groups/mine'), api.get('/groups')]);
    setMyGroups(mine.data);
    setAllGroups(all.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    await api.post('/groups', form);
    setForm({ name: '', subject: '', maxMembers: 6 });
    setShowForm(false);
    loadAll();
  };

  const myGroupIds = new Set(myGroups.map((g) => g._id));
  const browsableGroups = allGroups.filter((g) => !myGroupIds.has(g._id));

  return (
    <div>
      <div className="card-top mt-16" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Groups</h2>
        <button className="btn btn-small" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Create group'}</button>
      </div>

      {showForm && (
        <form onSubmit={createGroup} className="index-card">
          <label className="field-label">Group name</label>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label className="field-label">Subject</label>
          <input className="field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <label className="field-label">Max members</label>
          <input className="field" type="number" min={2} max={30} value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: Number(e.target.value) })} />
          <button className="btn mt-16" type="submit">Create</button>
        </form>
      )}

      <div className="pill-tabs">
        <button className={`pill-tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>My groups ({myGroups.length})</button>
        <button className={`pill-tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse all ({browsableGroups.length})</button>
      </div>

      {loading && <p className="empty-state">Loading groups...</p>}

      {!loading && tab === 'mine' && (myGroups.length === 0 ? (
        <p className="empty-state">You haven't joined any groups yet. Try "Browse all" to find one.</p>
      ) : (myGroups.map((g) => <GroupCard key={g._id} group={g} />)))}

      {!loading && tab === 'browse' && (browsableGroups.length === 0 ? (
        <p className="empty-state">No other groups yet — be the first to create one.</p>
      ) : (browsableGroups.map((g) => <GroupCard key={g._id} group={g} showJoinButton onRequestSent={loadAll} />)))}
    </div>
  );
}
