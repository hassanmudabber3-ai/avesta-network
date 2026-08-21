export default function AVCCard({ balance = 0 }) {
  return (
    <section className="AVC-card">
      <div className="AVC-card-top">
        <span>AVC</span>
        <span className="AVC-badge">AVC</span>
      </div>

      <div className="AVC-balance">
        {Number(balance).toLocaleString()}
      </div>

      <div className="AVC-label">
        Available balance
      </div>

      <button className="primary-button">
        View Wallet →
      </button>
    </section>
  );
}
