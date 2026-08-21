export default function EarnCard({
  icon,
  title,
  description,
  reward,
  onClick
}) {
  return (
    <button className="earn-card" onClick={onClick}>
      <div className="earn-icon">
        {icon}
      </div>

      <div className="earn-content">
        <div className="earn-title">{title}</div>
        <div className="earn-description">
          {description}
        </div>

        {reward && (
          <div className="earn-reward">
            {reward}
          </div>
        )}
      </div>

      <div className="earn-arrow">›</div>
    </button>
  );
}
