export default function BottomNav({
  active = 'home',
  onNavigate
}) {
  const items = [
    {
      id: 'home',
      icon: '⌂',
      label: 'خانه'
    },
    {
      id: 'tasks',
      icon: '✓',
      label: 'وظایف'
    },
    {
      id: 'mining',
      icon: '⛏️',
      label: 'Mining'
    },
    {
      id: 'wallet',
      icon: '◆',
      label: 'کیف پول'
    },
    {
      id: 'profile',
      icon: '●',
      label: 'پروفایل'
    }
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={
            active === item.id
              ? 'bottom-nav-item active'
              : 'bottom-nav-item'
          }
          onClick={() =>
            onNavigate?.(item.id)
          }
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
