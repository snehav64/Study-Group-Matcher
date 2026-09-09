export default function MatchCard({ name, subtitle, score, breakdown, onAction, actionLabel }) {
  return (
    <div className="index-card">
      <div className="card-top">
        <div>
          <h3 className="card-title">{name}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        <span className="score-badge">{score}% match</span>
      </div>
      {breakdown && (
        <ul className="score-breakdown">
          <li>Subject {breakdown.subjectScore}%</li>
          <li>Availability {breakdown.availabilityScore}%</li>
          <li>Skill fit {breakdown.skillLevelScore}%</li>
          <li>Style fit {breakdown.preferenceScore}%</li>
        </ul>
      )}
      {onAction && (
        <button className="btn btn-small mt-16" onClick={onAction}>
          {actionLabel || 'Connect'}
        </button>
      )}
    </div>
  );
}
