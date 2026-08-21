export default function ActivityList({ transactions = [] }) {
  const items = transactions.slice(0, 4);

  return (
    <section>
      <div className="activity-header">
        <h2 className="section-title">Recent Activity</h2>
      </div>

      {items.length === 0 ? (
        <div className="empty-activity">
          No activity yet
        </div>
      ) : (
        <div className="activity-list">
          {items.map((item) => (
            <div
              className="activity-item"
              key={item.id}
            >
              <div className="activity-icon">
                +
              </div>

              <div className="activity-info">
                <div>
                  {item.description ||
                    item.type ||
                    'Point transaction'}
                </div>

                <small>
                  {item.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleDateString()
                    : ''}
                </small>
              </div>

              <strong>
                {Number(item.amount) > 0 ? '+' : ''}
                {Number(item.amount).toLocaleString()}
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
