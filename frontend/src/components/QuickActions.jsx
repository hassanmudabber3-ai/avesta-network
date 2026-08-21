const actions = [
  { icon: '🎯', title: 'Tasks' },
  { icon: '👥', title: 'Invite' },
  { icon: '💰', title: 'Wallet' },
  { icon: '🏆', title: 'Ranking' }
];

export default function QuickActions() {
  return (
    <section>
      <h2 className="section-title">Quick Actions</h2>

      <div className="quick-actions">
        {actions.map((action) => (
          <button
            className="quick-action"
            key={action.title}
          >
            <span className="quick-icon">
              {action.icon}
            </span>

            <span>{action.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
