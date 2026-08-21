import { useEffect, useState } from 'react';

const API_URL =
  'https://holly-consensus-show-promo.trycloudflare.com';

const categories = [
  { key: 'all', label: 'همه' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'referral', label: 'دعوت' },
  { key: 'daily', label: 'روزانه' },
  { key: 'general', label: 'عمومی' }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [message, setMessage] = useState(null);

  async function loadTasks() {
    try {
      const token = sessionStorage.getItem('avc_token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [tasksResponse, AVCResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/tasks/active`, { headers }),
          fetch(`${API_URL}/api/AVC`, { headers })
        ]);

      const tasksData = await tasksResponse.json();
      const AVCData = await AVCResponse.json();

      if (!tasksResponse.ok || !tasksData.success) {
        throw new Error(
          tasksData.message || 'خطا در دریافت وظایف'
        );
      }

      setTasks(tasksData.data || []);

      if (AVCResponse.ok && AVCData.success) {
        setBalance(
          Number(AVCData.data?.balance || 0)
        );
      }
    } catch (error) {
      console.error('Tasks loading error:', error);

      setMessage({
        type: 'error',
        text: error.message || 'خطا در دریافت اطلاعات'
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function completeTask(task) {
    if (completingId) return;

    setMessage(null);
    setCompletingId(task.id);

    try {
      const token = sessionStorage.getItem('avc_token');

      const response = await fetch(
        `${API_URL}/api/tasks/${task.id}/complete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'انجام وظیفه ناموفق بود'
        );
      }

      const reward = Number(
        result.data?.rewardAVC || 0
      );

      setBalance((previous) => previous + reward);

      setTasks((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(task.id)
        )
      );

      setMessage({
        type: 'success',
        text: `وظیفه انجام شد و ${reward} AVC دریافت کردی 🎉`
      });
    } catch (error) {
      console.error('Complete task error:', error);

      setMessage({
        type: 'error',
        text: error.message || 'خطا در انجام وظیفه'
      });
    } finally {
      setCompletingId(null);
    }
  }

  const filteredTasks =
    selectedCategory === 'all'
      ? tasks
      : tasks.filter(
          (task) =>
            String(task.category).toLowerCase() ===
            selectedCategory
        );

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="tasks-loading">
          <div className="loading-spinner">⟳</div>
          <p>در حال دریافت وظایف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <main className="tasks-content">

        <header className="tasks-header">
          <div>
            <small>AVC Network</small>
            <h1>وظایف</h1>
          </div>

          <div className="tasks-AVC">
            <span>⭐</span>
            <strong>
              {balance.toLocaleString()}
            </strong>
          </div>
        </header>

        {message && (
          <div
            className={
              message.type === 'success'
                ? 'task-message success'
                : 'task-message error'
            }
          >
            {message.text}
          </div>
        )}

        <section className="tasks-hero">
          <div className="tasks-hero-icon">
            🎯
          </div>

          <div>
            <h2>AVC بیشتری جمع کن</h2>
            <p>
              وظایف را انجام بده و موجودی AVC خود را افزایش بده.
            </p>
          </div>
        </section>

        <div className="task-categories">
          {categories.map((category) => (
            <button
              key={category.key}
              className={
                selectedCategory === category.key
                  ? 'category active'
                  : 'category'
              }
              onClick={() =>
                setSelectedCategory(category.key)
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        <section className="task-list">

          {filteredTasks.map((task) => {
            const isCompleting =
              String(completingId) === String(task.id);

            return (
              <article
                className="task-card"
                key={task.id}
              >
                <div className="task-icon">
                  {task.icon || '🎯'}
                </div>

                <div className="task-info">
                  <div className="task-title-row">
                    <h3>{task.title}</h3>

                    <span className="task-reward">
                      +{Number(
                        task.reward_AVC || 0
                      ).toLocaleString()}
                    </span>
                  </div>

                  {task.description && (
                    <p>{task.description}</p>
                  )}

                  {task.campaign_title && (
                    <small className="campaign-label">
                      کمپین: {task.campaign_title}
                    </small>
                  )}

                  <div className="task-bottom">
                    <span className="task-category">
                      {task.category}
                    </span>

                    {task.target_url ? (
                      <button
                        className="task-button"
                        disabled={isCompleting}
                        onClick={() => {
                          window.open(
                            task.target_url,
                            '_blank',
                            'noopener,noreferrer'
                          );
                        }}
                      >
                        مشاهده
                      </button>
                    ) : (
                      <button
                        className="task-button"
                        disabled={isCompleting}
                        onClick={() =>
                          completeTask(task)
                        }
                      >
                        {isCompleting
                          ? 'در حال ثبت...'
                          : 'انجام'}
                      </button>
                    )}
                  </div>

                  {task.target_url && (
                    <button
                      className="complete-after-link"
                      disabled={isCompleting}
                      onClick={() =>
                        completeTask(task)
                      }
                    >
                      {isCompleting
                        ? 'در حال ثبت...'
                        : 'انجام دادم ✓'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="empty-tasks">
              <div>🎉</div>
              <h3>فعلاً وظیفه‌ای وجود ندارد</h3>
              <p>
                به‌زودی وظایف جدید اضافه می‌شوند.
              </p>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}
