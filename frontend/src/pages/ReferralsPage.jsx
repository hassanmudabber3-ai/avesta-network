import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

const API_URL =
  'https://holly-consensus-show-promo.trycloudflare.com';

export default function ReferralsPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReferrals() {
      try {
        const token = sessionStorage.getItem('avc_token');

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/referrals`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Referral error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReferrals();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        در حال بارگذاری دعوت‌ها...
      </div>
    );
  }

  const stats = data?.stats || {};
  const referrals = data?.referrals || [];
  const referralCode = data?.referralCode || '---';

  async function copyReferralCode() {
    if (!data?.referralCode) return;

    try {
      await navigator.clipboard.writeText(
        data.referralCode
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error('Copy error:', error);
    }
  }

  return (
    <div>
      <header className="tasks-header">
        <div>
          <small>AVC Network</small>
          <h1>دعوت دوستان</h1>
        </div>

        <div className="tasks-AVC">
          👥 {stats.total ?? 0}
        </div>
      </header>

      <section
        className="referral-card"
        style={{ marginTop: 20 }}
      >
        <div className="referral-top">
          <strong>
            کد دعوت شما
          </strong>

          <span>
            🎁
          </span>
        </div>

        <div className="referral-code">
          <strong>
            {referralCode}
          </strong>

          <button
            className="copy-button"
            type="button"
            onClick={copyReferralCode}
          >
            {copied ? 'کپی شد ✓' : 'کپی'}
          </button>
        </div>
      </section>

      <div className="section-title">
        <h2>
          آمار دعوت
        </h2>
      </div>

      <section className="quick-grid">

        <div className="quick-card">
          <span className="quick-icon">
            👥
          </span>

          <span>
            کل دعوت‌ها
          </span>

          <strong>
            {stats.total ?? 0}
          </strong>
        </div>

        <div className="quick-card">
          <span className="quick-icon">
            ✅
          </span>

          <span>
            تکمیل‌شده
          </span>

          <strong>
            {stats.completed ?? 0}
          </strong>
        </div>

        <div className="quick-card">
          <span className="quick-icon">
            ⭐
          </span>

          <span>
            پاداش
          </span>

          <strong>
            {Number(
              stats.reward_AVC ?? 0
            ).toLocaleString()}
          </strong>
        </div>

        <div className="quick-card">
          <span className="quick-icon">
            🚀
          </span>

          <span>
            رشد شبکه
          </span>

          <strong>
            AVC
          </strong>
        </div>

      </section>

      <div className="section-title">
        <h2>
          دعوت‌های اخیر
        </h2>
      </div>

      <section className="task-list">

        {referrals.map((referral) => {
          const name =
            referral.first_name ||
            referral.firstName ||
            referral.telegram_username ||
            referral.telegramUsername ||
            'کاربر';

          const reward =
            Number(
              referral.reward_AVC ?? 0
            );

          return (
            <article
              className="task-card"
              key={referral.id}
            >
              <div className="task-icon">
                👤
              </div>

              <div className="task-info">
                <h3>
                  {name}
                </h3>

                <p>
                  وضعیت:{' '}
                  {referral.status || 'active'}
                </p>

                <span className="reward">
                  +{reward.toLocaleString()} AVC
                </span>
              </div>
            </article>
          );
        })}

        {referrals.length === 0 && (
          <div className="empty-tasks">
            هنوز کسی با کد دعوت شما وارد نشده است.
          </div>
        )}

      </section>

      <BottomNav
        active="referrals"
        onChange={onNavigate}
      />
    </div>
  );
}
