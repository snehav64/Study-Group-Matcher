import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', university: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/profile-setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-page">
      <div className="index-card">
        <h2 className="card-title">Create account</h2>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Full name</label>
          <input className="field" placeholder="Sneha V" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label className="field-label">Email</label>
          <input className="field" type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label className="field-label">Password</label>
          <input className="field" type="password" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <label className="field-label">University</label>
          <input className="field" placeholder="Optional" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} />
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" style={{ width: '100%', marginTop: 6 }}>Register</button>
        </form>
        <p className="helper-text mt-16">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
