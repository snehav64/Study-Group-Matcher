import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Matches from './pages/Matches';
import GroupDetail from './pages/GroupDetail';
import MyGroups from './pages/MyGroups';
import Sessions from './pages/Sessions';

export default function App() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isActive = (path) => pathname.startsWith(path);

  return (
    <div className="app-shell">
      <header className="notebook-cover">
        <div className="brand-row">
          <p className="brand-title">Study Group <span>Matcher</span></p>
        </div>
        <nav className="nav-row">
          <Link className={`nav-tab ${isActive('/matches') ? 'active' : ''}`} to="/matches">Matches</Link>
          <Link className={`nav-tab ${isActive('/groups') ? 'active' : ''}`} to="/groups">My Groups</Link>
          <Link className={`nav-tab ${isActive('/sessions') ? 'active' : ''}`} to="/sessions">Sessions</Link>
          <Link className={`nav-tab ${isActive('/friends') ? 'active' : ''}`} to="/friends">Friends</Link>
          <div className="nav-spacer">
            {user ? (
              <>
                <Link to="/profile" className="user-chip" style={{ textDecoration: 'none' }}>{user.name}</Link>
                <button className="btn-ghost-light" onClick={logout}>Log out</button>
              </>
            ) : (
              <Link className="nav-tab" to="/login">Log in</Link>
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/matches" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
