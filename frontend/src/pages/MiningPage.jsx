import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

const API_URL =
  'https://holly-consensus-show-promo.trycloudflare.com';

export default function MiningPage({ onNavigate }) {
  const [mining, setMining] = useState(false);
  const [session, setSession] = useState(null);
  const [rate, setRate] = useState(0);
  const [cycleHours, setCycleHours] = useState(8);
  const [activeUsers, setActiveUsers] = useState(0);

  const [requiredAds, setRequiredAds] = useState(0);
  const [optionalAds, setOptionalAds] = useState(0);
  const [adBoostPercent, setAdBoostPercent] = useState(0);

  const [requiredAdsNeeded, setRequiredAdsNeeded] = useState(1);
  const [optionalAdsLimit, setOptionalAdsLimit] = useState(4);

  const [remaining, setRemaining] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState('');
  const [claimResult, setClaimResult] = useState(null);

  function getToken() {
    return sessionStorage.getItem('avc_token');
  }

  async function loadMiningStatus() {
    try {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/mining/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message || 'خطا در دریافت وضعیت Mining'
        );
        return;
      }

      const data = result.data || {};

      setMining(Boolean(data.mining));
      setSession(data.session || null);
      setRate(Number(data.rate || 0));
      setCycleHours(Number(data.cycleHours || 8));
      setActiveUsers(Number(data.activeUsers || 0));

      if (data.session) {
        setRequiredAds(
          Number(data.session.requiredAds || 0)
        );

        setOptionalAds(
          Number(data.session.optionalAds || 0)
        );

        setAdBoostPercent(
          Number(data.session.adBoostPercent || 0)
        );
      } else {
        setRequiredAds(0);
        setOptionalAds(0);
        setAdBoostPercent(0);
      }
    } catch (error) {
      console.error(
        'Mining status error:',
        error
      );

      setMessage(
        'ارتباط با سرور برقرار نشد'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMiningStatus();
  }, []);

  useEffect(() => {
    if (!session?.endsAt) {
      setRemaining('');
      return;
    }

    function updateRemaining() {
      const end =
        new Date(session.endsAt).getTime();

      const now = Date.now();

      const difference = end - now;

      if (difference <= 0) {
        setRemaining('پایان یافته');

        /*
         * Session در backend هنوز تا Claim
         * فعال است. فقط زمان را تازه می‌کنیم.
         */
        return;
      }

      const totalSeconds =
        Math.floor(difference / 1000);

      const hours =
        Math.floor(totalSeconds / 3600);

      const minutes =
        Math.floor(
          (totalSeconds % 3600) / 60
        );

      const seconds =
        totalSeconds % 60;

      setRemaining(
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`
      );
    }

    updateRemaining();

    const timer =
      setInterval(updateRemaining, 1000);

    return () => clearInterval(timer);
  }, [session]);

  async function startMining() {
    setMessage('');
    setClaimResult(null);

    try {
      setStarting(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/mining/start`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message ||
          'شروع Mining ناموفق بود'
        );
        return;
      }

      setMessage(
        'Mining با موفقیت شروع شد 🚀'
      );

      await loadMiningStatus();
    } catch (error) {
      console.error(
        'Start mining error:',
        error
      );

      setMessage(
        'ارتباط با سرور برقرار نشد'
      );
    } finally {
      setStarting(false);
    }
  }

  async function watchAd(type) {
    setMessage('');
    setClaimResult(null);

    try {
      setWatchingAd(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/mining/ad`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message ||
          'ثبت تبلیغ ناموفق بود'
        );
        return;
      }

      const data = result.data || {};

      setRequiredAds(
        Number(data.requiredAds || 0)
      );

      setOptionalAds(
        Number(data.optionalAds || 0)
      );

      setAdBoostPercent(
        Number(data.adBoostPercent || 0)
      );

      if (type === 'required') {
        setMessage(
          'تبلیغ اجباری با موفقیت ثبت شد ✅'
        );
      } else {
        setMessage(
          'تبلیغ اختیاری ثبت شد و Boost اعمال شد ⚡'
        );
      }

      await loadMiningStatus();
    } catch (error) {
      console.error(
        'Watch ad error:',
        error
      );

      setMessage(
        'ارتباط با سرور برقرار نشد'
      );
    } finally {
      setWatchingAd(false);
    }
  }

  async function claimMining() {
    setMessage('');
    setClaimResult(null);

    try {
      setClaiming(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/mining/claim`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message ||
          'Claim ناموفق بود'
        );
        return;
      }

      const data = result.data || {};

      setClaimResult(data);

      setMessage(
        `تبریک! ${Number(
          data.reward || 0
        ).toLocaleString()} AVC دریافت کردید 🎉`
      );

      /*
       * بعد از Claim، Session دیگر active نیست.
       */
      setMining(false);
      setSession(null);
      setRequiredAds(0);
      setOptionalAds(0);
      setAdBoostPercent(0);

      await loadMiningStatus();
    } catch (error) {
      console.error(
        'Claim error:',
        error
      );

      setMessage(
        'ارتباط با سرور برقرار نشد'
      );
    } finally {
      setClaiming(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        در حال بارگذاری Mining...
      </div>
    );
  }

  const miningFinished =
    session?.endsAt
      ? new Date(session.endsAt).getTime() <= Date.now()
      : false;

  const requiredAdsCompleted =
    requiredAds >= requiredAdsNeeded;

  const claimReady =
    Boolean(session) &&
    miningFinished &&
    requiredAdsCompleted;

  const effectiveRate =
    Number(rate || 0) *
    (1 + Number(adBoostPercent || 0) / 100);

  return (
    <div
      className="app-shell"
      style={{
        paddingBottom: 90
      }}
    >
      <main className="page-content">

        <header className="tasks-header">
          <div>
            <small>AVC Network</small>
            <h1>Mining</h1>
          </div>

          <div className="tasks-AVC">
            ⛏️ AVC
          </div>
        </header>

        <section
          className="balance-card"
          style={{
            marginTop: 20
          }}
        >
          <div>
            <small>
              پاداش هر چرخه
            </small>

            <h2
              style={{
                marginTop: 8
              }}
            >
              {effectiveRate.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 8
                }
              )}
            </h2>

            <span>
              AVC / {cycleHours} ساعت
            </span>
          </div>
        </section>

        <section
          className="referral-card"
          style={{
            marginTop: 16
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <strong>
              وضعیت Mining
            </strong>

            <span>
              {mining
                ? '🟢 فعال'
                : '⚪ غیرفعال'}
            </span>
          </div>

          {mining && session ? (
            <>
              <div
                style={{
                  marginBottom: 12
                }}
              >
                <small>
                  زمان باقی‌مانده
                </small>

                <h2
                  style={{
                    marginTop: 6,
                    fontSize: 28
                  }}
                >
                  {remaining}
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: 10
                }}
              >
                <div>
                  <small>
                    نرخ پایه
                  </small>

                  <div
                    style={{
                      marginTop: 4
                    }}
                  >
                    {Number(
                      session.baseRate || rate
                    ).toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 8
                      }
                    )}{' '}
                    AVC
                  </div>
                </div>

                <div>
                  <small>
                    Boost
                  </small>

                  <div
                    style={{
                      marginTop: 4
                    }}
                  >
                    +{adBoostPercent}%
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p>
              برای دریافت AVC، یک چرخه
              {` ${cycleHours} `}
              ساعته Mining را شروع کنید.
            </p>
          )}
        </section>

        <div className="section-title">
          <h2>
            تبلیغات Mining
          </h2>
        </div>

        <section className="task-list">

          <article className="task-card">

            <div className="task-icon">
              📺
            </div>

            <div className="task-info">

              <h3>
                تبلیغ اجباری
              </h3>

              <p>
                برای Claim پاداش باید
                این تبلیغ را تماشا کنید.
              </p>

              <span className="reward">
                {requiredAds}/
                {requiredAdsNeeded}
              </span>

            </div>

            <button
              className="task-button"
              type="button"
              disabled={
                !mining ||
                requiredAdsCompleted ||
                watchingAd
              }
              onClick={() =>
                watchAd('required')
              }
            >
              {requiredAdsCompleted
                ? 'تکمیل شد ✓'
                : watchingAd
                  ? 'در حال ثبت...'
                  : 'مشاهده'}
            </button>

          </article>

          <article className="task-card">

            <div className="task-icon">
              ⚡
            </div>

            <div className="task-info">

              <h3>
                تبلیغات اختیاری
              </h3>

              <p>
                هر تبلیغ اختیاری ۲٪ Boost
                به پاداش این چرخه اضافه می‌کند.
              </p>

              <span className="reward">
                {optionalAds}/
                {optionalAdsLimit}
                {' '}
                | Boost: +{adBoostPercent}%
              </span>

            </div>

            <button
              className="task-button"
              type="button"
              disabled={
                !mining ||
                optionalAds >= optionalAdsLimit ||
                watchingAd
              }
              onClick={() =>
                watchAd('optional')
              }
            >
              {optionalAds >= optionalAdsLimit
                ? 'تکمیل شد'
                : watchingAd
                  ? 'در حال ثبت...'
                  : 'مشاهده'}
            </button>

          </article>

        </section>

        {message && (
          <section
            className="referral-card"
            style={{
              marginTop: 16
            }}
          >
            <p
              style={{
                margin: 0
              }}
            >
              {message}
            </p>
          </section>
        )}

        <section
          className="referral-card"
          style={{
            marginTop: 16
          }}
        >

          {!mining && !session ? (
            <button
              className="task-button"
              type="button"
              disabled={starting}
              onClick={startMining}
              style={{
                width: '100%',
                padding: 14
              }}
            >
              {starting
                ? 'در حال شروع...'
                : `شروع Mining ${cycleHours} ساعته 🚀`}
            </button>
          ) : (
            <button
              className="task-button"
              type="button"
              disabled={
                !claimReady ||
                claiming
              }
              onClick={claimMining}
              style={{
                width: '100%',
                padding: 14
              }}
            >
              {claiming
                ? 'در حال Claim...'
                : claimReady
                  ? 'Claim پاداش AVC 🎁'
                  : miningFinished
                    ? 'تبلیغ اجباری را تکمیل کنید'
                    : 'پس از پایان چرخه Claim کنید'}
            </button>
          )}

        </section>

        {claimResult && (
          <section
            className="balance-card"
            style={{
              marginTop: 16
            }}
          >
            <small>
              پاداش Claim شده
            </small>

            <h2
              style={{
                marginTop: 8
              }}
            >
              +{Number(
                claimResult.reward || 0
              ).toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 8
                }
              )}
            </h2>

            <span>
              AVC
            </span>
          </section>
        )}

        <section
          className="referral-card"
          style={{
            marginTop: 16
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>
              کاربران فعال
            </span>

            <strong>
              {activeUsers.toLocaleString()}
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10
            }}
          >
            <span>
              چرخه
            </span>

            <strong>
              {cycleHours} ساعت
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10
            }}
          >
            <span>
              نرخ فعلی
            </span>

            <strong>
              {Number(rate).toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 8
                }
              )}{' '}
              AVC
            </strong>
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
