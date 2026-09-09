const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AvailabilityPicker({ availability, onChange }) {
  const addSlot = () => onChange([...availability, { day: 'Mon', startTime: '18:00', endTime: '20:00' }]);
  const updateSlot = (index, field, value) =>
    onChange(availability.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)));
  const removeSlot = (index) => onChange(availability.filter((_, i) => i !== index));

  return (
    <div>
      {availability.map((slot, i) => (
        <div key={i} className="field-row">
          <select className="field" style={{ flex: '0 0 90px' }} value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input className="field" type="time" value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)} />
          <span className="helper-text">to</span>
          <input className="field" type="time" value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)} />
          <button type="button" onClick={() => removeSlot(i)} className="btn-danger-outline">Remove</button>
        </div>
      ))}
      <button type="button" onClick={addSlot} className="btn-outline btn-small">+ Add time slot</button>
    </div>
  );
}
