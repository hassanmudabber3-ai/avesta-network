import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

const API_URL =
  'https://holly-consensus-show-promo.trycloudflare.com';

export default function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadProfile() {
    try {
      const token = sessionStorage.getItem('avc_token');

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.data);

        sessionStorage.setItem(
          'avc_user',
          JSON.stringify(result.data)
        );
      } else {
        setMessage(
          result.message || 'خطا در دریافت پروفایل'
        );
      }
    } catch (error) {
      console.error('Profile error:', error);
      setMessage('ارتباط با سرور برقرار نشد');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function logout() {
    sessionStorage.removeItem('avc_token');
    sessionStorage.removeItem('avc_user');

    window.location.reload();
  }

  if (loading) {
    return (
      <div className="loading-screen">
        در حال بارگذاری پروفایل...
      </div>
    );
  }

  const name =
    user?.first_name ||
    user?.telegram_username ||
    'کاربر';

  const username =
    user?.telegram_username
      ? `@${user.telegram_username}`
      : '---';

  return (
    <div style={{ paddingBottom: 90 }}>

      <header className="tasks-header">
        <div>
          <small>AVC Network</small>
          <h1>پروفایل</h1>
        </div>
      </header>

      {message && (
        <div
          style={{
            margin: 20,
            padding: 12,
            borderRadius: 10
          }}
        >
          {message}
        </div>
      )}

      <section
        className="balance-card"
        style={{ marginTop: 20 }}
      >
        <div className="user-box">

          <div className="user-avatar">
            {String(name).charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <small>حساب AVC</small>

            <strong>
              {name}
            </strong>

            <span>
              {username}
            </span>
          </div>

        </div>
      </section>

      <div className="section-title">
        <h2>اطلاعات حساب</h2>
      </div>

      <section className="task-list">

        <div className="task-card">
          <div className="task-icon">
            🆔
          </div>

          <div className="task-info">
            <h3>Telegram ID</h3>

            <p>
              {user?.telegram_id || '---'}
            </p>
          </div>
        </div>

        <div className="task-card">
          <div className="task-icon">
            👤
          </div>

          <div className="task-info">
            <h3>Username</h3>

            <p>
              {username}
            </p>
          </div>
        </div>

        <div className="task-card">
          <div className="task-icon">
            📝
          </div>

          <div className="task-info">
            <h3>نام</h3>

            <p>
              {user?.first_name || '---'}
              {user?.last_name
                ? ` ${user.last_name}`
                : ''}
            </p>
          </div>
        </div>

        <div className="task-card">
          <div className="task-icon">
            🌐
          </div>

          <div className="task-info">
            <h3>زبان</h3>

            <p>
              {user?.language || '---'}
            </p>
          </div>
        </div>

        <div className="task-card">
          <div className="task-icon">
            🛡️
          </div>

          <div className="task-info">
            <h3>وضعیت حساب</h3>

            <p>
              {user?.status || '---'}
            </p>
          </div>
        </div>

      </section>

      <button
        className="task-button"
        type="button"
        onClick={logout}
        style={{
          width: '100%',
          marginTop: 20,
          padding: 14
        }}
      >
        خروج از حساب
      </button>

      <BottomNav
        active="profile"
        onChange={onNavigate}
      />

    </div>
  );
}
