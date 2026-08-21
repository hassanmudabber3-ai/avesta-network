import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

const API_URL =
  'https://holly-consensus-show-promo.trycloudflare.com';

export default function HomePage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [AVC, setAVC] = useState(null);
  const [referral, setReferral] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token =
          sessionStorage.getItem('avc_token');

        const savedUser =
          sessionStorage.getItem('avc_user');

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        if (!token) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [
          AVCResponse,
          referralResponse,
          campaignsResponse
        ] = await Promise.all([
          fetch(`${API_URL}/api/AVC`, { headers }),
          fetch(`${API_URL}/api/referrals`, { headers }),
          fetch(`${API_URL}/api/campaigns/active`, {
            headers
          })
        ]);

        if (AVCResponse.ok) {
          const data =
            await AVCResponse.json();

          if (data.success) {
            setAVC(data.data);
          }
        }

        if (referralResponse.ok) {
          const data =
            await referralResponse.json();

          if (data.success) {
            setReferral(data.data);
          }
        }

        if (campaignsResponse.ok) {
          const data =
            await campaignsResponse.json();

          if (data.success) {
            setCampaigns(
              Array.isArray(data.data)
                ? data.data
                : []
            );
          }
        }
      } catch (error) {
        console.error(
          'Dashboard error:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        در حال بارگذاری AVC...
      </div>
    );
  }

  const firstName =
    user?.firstName ||
    user?.telegramUsername ||
    'کاربر';

  const balance =
    Number(AVC?.balance || 0);

  const referralCode =
    referral?.referralCode || '---';

  return (
    <div className="app-shell home-page">
      <main className="page-content">

        <header className="home-header">
          <div className="home-user">
            <div className="avatar">
              {firstName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">
              <small>خوش آمدید 👋</small>
              <strong>{firstName}</strong>
            </div>
          </div>

          <button
            className="notification-button"
            type="button"
          >
            🔔
          </button>
        </header>

        <section className="balance-card">
          <div className="balance-label">
            موجودی AVC
          </div>

          <div className="balance-value">
            {balance.toLocaleString()}
            <span className="balance-symbol">
              PTS
            </span>
          </div>

          <div className="balance-footer">
            <span>
              AVC قابل استفاده شما
            </span>

            <button
              className="balance-action"
              type="button"
              onClick={() =>
                onNavigate?.('wallet')
              }
            >
              کیف پول
            </button>
          </div>
        </section>

        <section className="quick-actions">

          <button
            className="quick-action"
            onClick={() =>
              onNavigate?.('tasks')
            }
          >
            <span className="quick-action-icon">
              🎯
            </span>
            <span className="quick-action-label">
              وظایف
            </span>
          </button>

          <button
            className="quick-action"
            onClick={() =>
              onNavigate?.('mining')
            }
          >
            <span className="quick-action-icon">
              ⛏️
            </span>
            <span className="quick-action-label">
              Mining
            </span>
          </button>

          <button
            className="quick-action"
            onClick={() =>
              onNavigate?.('referrals')
            }
          >
            <span className="quick-action-icon">
              👥
            </span>
            <span className="quick-action-label">
              دعوت دوستان
            </span>
          </button>

          <button
            className="quick-action"
            onClick={() =>
              onNavigate?.('leaderboard')
            }
          >
            <span className="quick-action-icon">
              🏆
            </span>
            <span className="quick-action-label">
              رتبه‌بندی
            </span>
          </button>

          <button
            className="quick-action"
            onClick={() =>
              onNavigate?.('profile')
            }
          >
            <span className="quick-action-icon">
              👤
            </span>
            <span className="quick-action-label">
              پروفایل
            </span>
          </button>

        </section>

        <section className="section">

          <div className="section-header">
            <h2>
              کمپین‌های فعال
            </h2>

            <button
              onClick={() =>
                onNavigate?.('tasks')
              }
            >
              مشاهده همه
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="campaign-card">
              <div className="campaign-top">
                <div className="campaign-icon">
                  🎯
                </div>

                <div className="campaign-info">
                  <h3>
                    کمپین جدید به‌زودی
                  </h3>

                  <p>
                    در حال حاضر کمپین فعالی
                    برای نمایش وجود ندارد.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            campaigns
              .slice(0, 3)
              .map((campaign) => (
                <article
                  className="campaign-card"
                  key={campaign.id}
                >
                  <div className="campaign-top">

                    <div className="campaign-icon">
                      📢
                    </div>

                    <div className="campaign-info">
                      <h3>
                        {campaign.title}
                      </h3>

                      <p>
                        {campaign.description ||
                          'کمپین فعال AVC'}
                      </p>
                    </div>

                    <span className="campaign-reward">
                      +{Number(
                        campaign.reward_AVC || 0
                      ).toLocaleString()}
                    </span>

                  </div>
                </article>
              ))
          )}

        </section>

        <section className="section">

          <div className="section-header">
            <h2>
              دعوت دوستان
            </h2>

            <button
              onClick={() =>
                onNavigate?.('referrals')
              }
            >
              جزئیات
            </button>
          </div>

          <div className="referral-card">

            <h3>
              دوستانت را به AVC دعوت کن 🚀
            </h3>

            <p>
              با دعوت کاربران جدید می‌توانی
              AVC بیشتری دریافت کنی.
            </p>

            <div className="referral-code">
              <strong>
                {referralCode}
              </strong>

              <button
                type="button"
                onClick={() => {
                  if (
                    navigator.clipboard &&
                    referralCode !== '---'
                  ) {
                    navigator.clipboard.writeText(
                      referralCode
                    );
                  }
                }}
              >
                کپی
              </button>
            </div>

          </div>

        </section>

      </main>

      <BottomNav
        active="home"
        onNavigate={onNavigate}
      />
    </div>
  );
}
