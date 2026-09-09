import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket/socket';
import ResourcePanel from '../components/ResourcePanel';

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sessions, setSessions] = useState([]);
  const [proposedTime, setProposedTime] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const socketRef = useRef(null);

  const isCreator = group && user && String(group.createdBy?._id) === String(user._id);

  const load = async () => {
    const { data } = await api.get(`/groups/${id}`);
    setGroup(data);
    const { data: sessionData } = await api.get(`/sessions/group/${id}`);
    setSessions(sessionData);

    const { data: history } = await api.get(`/messages/group/${id}`);
    setMessages(history.map((m) => ({ userId: m.sender._id, name: m.sender.name, text: m.text, sentAt: m.createdAt })));

    if (data.createdBy?._id === user._id) {
      const { data: requests } = await api.get(`/requests/group/${id}`);
      setPendingRequests(requests);
    }
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit('joinGroup', id);
    socket.on('receiveMessage', (msg) => setMessages((prev) => [...prev, msg]));
    return () => {
      socket.emit('leaveGroup', id);
      socket.off('receiveMessage');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const message = { userId: user._id, name: user.name, text, sentAt: new Date().toISOString() };
    socketRef.current.emit('sendMessage', { groupId: id, message });
    setMessages((prev) => [...prev, message]);
    setText('');
  };

  const proposeSession = async () => {
    if (!proposedTime) return;
    const { data } = await api.post('/sessions', { groupId: id, proposedTime });
    setSessions((prev) => [...prev, data]);
    setProposedTime('');
  };

  const rsvp = async (sessionId, value) => {
    const { data } = await api.patch(`/sessions/${sessionId}/rsvp`, { rsvp: value });
    setSessions((prev) => prev.map((s) => (s._id === sessionId ? data : s)));
  };

  const respondToRequest = async (requestId, status) => {
    await api.patch(`/requests/${requestId}`, { status });
    setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    if (status === 'approved') load();
  };

  if (!group) return <p className="empty-state">Loading group...</p>;

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.proposedTime) >= now);
  const history = sessions.filter((s) => new Date(s.proposedTime) < now);

  return (
    <div>
      <div className="index-card">
        <h2 className="card-title">{group.name}</h2>
        <p className="card-subtitle">{group.subject} · {group.members.length}/{group.maxMembers} members</p>

        <label className="field-label">Members</label>
        <ul className="member-list">
          {group.members.map((m) => <li key={m._id}>{m.name}</li>)}
        </ul>

        {isCreator && pendingRequests.length > 0 && (
          <>
            <label className="field-label">Pending join requests</label>
            {pendingRequests.map((r) => (
              <div key={r._id} className="session-row">
                <span className="session-time">{r.user.name} — {r.user.university || 'no university listed'}</span>
                <button className="btn-outline btn-small" onClick={() => respondToRequest(r._id, 'approved')}>Approve</button>
                <button className="btn-danger-outline" onClick={() => respondToRequest(r._id, 'rejected')}>Reject</button>
              </div>
            ))}
          </>
        )}

        <label className="field-label">Group chat</label>
        <div className="chat-box">
          {messages.length === 0 && <p className="helper-text">No messages yet — say hello.</p>}
          {messages.map((m, i) => (
            <div key={i} className="chat-msg"><strong>{m.name}: </strong>{m.text}</div>
          ))}
        </div>
        <div className="chat-input-row">
          <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
          <button className="btn btn-small" onClick={sendMessage}>Send</button>
        </div>

        <label className="field-label">Upcoming sessions</label>
        {upcoming.length === 0 && <p className="helper-text">No sessions proposed yet.</p>}
        {upcoming.map((s) => (
          <div key={s._id} className="session-row">
            <span className="session-time">{new Date(s.proposedTime).toLocaleString()}</span>
            <button className="btn-outline btn-small" onClick={() => rsvp(s._id, 'yes')}>Yes</button>
            <button className="btn-outline btn-small" onClick={() => rsvp(s._id, 'maybe')}>Maybe</button>
            <button className="btn-danger-outline" onClick={() => rsvp(s._id, 'no')}>No</button>
          </div>
        ))}
        <div className="field-row mt-16">
          <input className="field" type="datetime-local" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)} />
          <button className="btn btn-small" onClick={proposeSession}>Propose session</button>
        </div>

        {history.length > 0 && (
          <>
            <label className="field-label">Session history</label>
            {history.map((s) => (
              <div key={s._id} className="session-row">
                <span className="session-time">{new Date(s.proposedTime).toLocaleString()}</span>
                <span className="tag">{s.status}</span>
              </div>
            ))}
          </>
        )}

        <ResourcePanel groupId={id} />
      </div>
    </div>
  );
}
