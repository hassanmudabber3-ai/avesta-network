export default function Header({ user }) {
  const name =
    user?.firstName ||
    user?.telegramUsername ||
    'کاربر';

  return (
    <header className="avc-header">
      <div>
        <div className="avc-brand">AVC</div>
        <div className="avc-subtitle">Network</div>
      </div>

      <div className="avc-user">
        <div className="avc-user-name">
          سلام، {name} 👋
        </div>
        <div className="avc-user-status">
          Welcome back
        </div>
      </div>

      <button className="avc-icon-button" aria-label="Notifications">
        🔔
      </button>
    </header>
  );
}
