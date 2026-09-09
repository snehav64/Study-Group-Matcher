import { useEffect, useState } from 'react';
import api from '../api/axios';
import MatchCard from '../components/MatchCard';

export default function Matches() {
  const [userMatches, setUserMatches] = useState([]);
  const [groupMatches, setGroupMatches] = useState([]);
  const [tab, setTab] = useState('peers');
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data } = await api.get('/matches');
        setUserMatches(data.userMatches);
        setGroupMatches(data.groupMatches);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const sendFriendRequest = async (userId) => {
    try {
      await api.post(`/friends/${userId}`);
    } finally {
      setSentRequests((prev) => new Set(prev).add(userId));
    }
  };

  if (loading) return <p className="empty-state">Finding your matches...</p>;

  return (
    <div>
      <h2>Your suggested matches</h2>
      <div className="pill-tabs">
        <button className={`pill-tab ${tab === 'peers' ? 'active' : ''}`} onClick={() => setTab('peers')}>Peers ({userMatches.length})</button>
        <button className={`pill-tab ${tab === 'groups' ? 'active' : ''}`} onClick={() => setTab('groups')}>Groups ({groupMatches.length})</button>
      </div>

      {tab === 'peers' && (userMatches.length === 0 ? (
        <p className="empty-state">No peer matches yet — add more courses or availability to your profile.</p>
      ) : (
        userMatches.map((m) => (
          <MatchCard
            key={m.user._id}
            name={m.user.name}
            subtitle={m.user.university}
            score={m.score}
            breakdown={m.breakdown}
            onAction={() => sendFriendRequest(m.user._id)}
            actionLabel={sentRequests.has(m.user._id) ? 'Request sent' : 'Add friend'}
          />
        ))
      ))}

      {tab === 'groups' && (groupMatches.length === 0 ? (
        <p className="empty-state">No group matches yet.</p>
      ) : (
        groupMatches.map((m) => (
          <MatchCard key={m.group._id} name={m.group.name} subtitle={`${m.group.subject} · ${m.group.memberCount}/${m.group.maxMembers} members`} score={m.score} breakdown={m.breakdown} />
        ))
      ))}
    </div>
  );
}
