import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/matches');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="form-page">
      <div className="index-card">
        <h2 className="card-title">Log in</h2>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input className="field" type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label className="field-label">Password</label>
          <input className="field" type="password" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" style={{ width: '100%', marginTop: 6 }}>Log in</button>
        </form>
        <p className="helper-text mt-16">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
