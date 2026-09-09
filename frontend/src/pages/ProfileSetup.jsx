import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AvailabilityPicker from '../components/AvailabilityPicker';

export default function ProfileSetup() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([{ subject: '', courseCode: '', skillLevel: 'intermediate' }]);
  const [availability, setAvailability] = useState([]);
  const [studyPreference, setStudyPreference] = useState('mixed');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const updateCourse = (i, field, value) => setCourses(courses.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  const addCourse = () => setCourses([...courses, { subject: '', courseCode: '', skillLevel: 'intermediate' }]);
  const removeCourse = (i) => setCourses(courses.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.put('/users/profile', { courses, availability, studyPreference, bio });
      setUser(data);
      navigate('/matches');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile');
    }
  };

  return (
    <div className="index-card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 className="card-title">Set up your study profile</h2>
      <form onSubmit={handleSubmit}>
        <label className="field-label">Courses / subjects</label>
        {courses.map((c, i) => (
          <div key={i} className="field-row">
            <input className="field" placeholder="Subject (e.g. Data Structures)" value={c.subject} onChange={(e) => updateCourse(i, 'subject', e.target.value)} required />
            <input className="field" placeholder="Course code" value={c.courseCode} onChange={(e) => updateCourse(i, 'courseCode', e.target.value)} />
            <select className="field" style={{ flex: '0 0 130px' }} value={c.skillLevel} onChange={(e) => updateCourse(i, 'skillLevel', e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button type="button" onClick={() => removeCourse(i)} className="btn-danger-outline">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addCourse} className="btn-outline btn-small">+ Add course</button>

        <label className="field-label">Weekly availability</label>
        <AvailabilityPicker availability={availability} onChange={setAvailability} />

        <label className="field-label">Study preference</label>
        <select className="field" value={studyPreference} onChange={(e) => setStudyPreference(e.target.value)}>
          <option value="solo-review">Solo review</option>
          <option value="discussion-heavy">Discussion heavy</option>
          <option value="exam-prep">Exam prep</option>
          <option value="mixed">Mixed</option>
        </select>

        <label className="field-label">Bio</label>
        <textarea className="field" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} />

        {error && <p className="error-text">{error}</p>}
        <button className="btn mt-16" type="submit">Save profile</button>
      </form>
    </div>
  );
}
