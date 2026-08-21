import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

const API_URL =
  'https://holly-consensus-show-promo.trycloudflare.com';

export default function WalletPage({ onNavigate }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [telegramId, setTelegramId] = useState('');
  const [amount, setAmount] = useState('');

  const [mining, setMining] = useState(false);
  const [miningSession, setMiningSession] = useState(null);
  const [miningRate, setMiningRate] = useState(0);
  const [claiming, setClaiming] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  async function loadWallet() {
    try {
      const token = sessionStorage.getItem('avc_token');

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/points`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setBalance(Number(result.data?.balance || 0));
        setTransactions(result.data?.transactions || []);
      } else {
        setMessage(
          result.message || 'خطا در دریافت کیف پول'
        );
      }
    } catch (error) {
      console.error('Wallet error:', error);
      setMessage('ارتباط با سرور برقرار نشد');
    } finally {
      setLoading(false);
    }
  }

  async function loadMining() {
    try {
      const token = sessionStorage.getItem('avc_token');

      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/mining/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setMining(Boolean(result.data?.mining));
        setMiningSession(result.data?.session || null);
        setMiningRate(Number(result.data?.rate || 0));
      }
    } catch (error) {
      console.error('Mining status error:', error);
    }
  }

  useEffect(() => {
    loadWallet();
    loadMining();
  }, []);

  async function claimMining() {
    setMessage('');

    try {
      setClaiming(true);

      const token = sessionStorage.getItem('avc_token');

      const response = await fetch(
        `${API_URL}/api/mining/claim`,
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
        setMessage(
          result.message || 'Claim AVC ناموفق بود'
        );
        return;
      }

      const reward = Number(
        result.data?.reward || 0
      );

      setMessage(
        `تبریک! ${reward.toLocaleString()} AVC به کیف پول شما اضافه شد 🎉`
      );

      await loadWallet();
      await loadMining();
    } catch (error) {
      console.error('Claim error:', error);
      setMessage('ارتباط با سرور برقرار نشد');
    } finally {
      setClaiming(false);
    }
  }

  async function sendAVC(event) {
    event.preventDefault();

    setMessage('');

    const value = Number(amount);

    if (!telegramId.trim()) {
      setMessage('Telegram ID گیرنده را وارد کنید');
      return;
    }

    if (!Number.isInteger(value)) {
      setMessage('مقدار AVC باید عدد صحیح باشد');
      return;
    }

    if (value < 100 || value > 1000) {
      setMessage(
        'مقدار ارسال باید بین 100 تا 1000 AVC باشد'
      );
      return;
    }

    if (value > balance) {
      setMessage('موجودی AVC کافی نیست');
      return;
    }

    try {
      setSending(true);

      const token = sessionStorage.getItem('avc_token');

      const response = await fetch(
        `${API_URL}/api/points/transfer`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            telegramId: telegramId.trim(),
            amount: value
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message || 'ارسال AVC ناموفق بود'
        );
        return;
      }

      setMessage(
        `با موفقیت ${value} AVC ارسال شد`
      );

      setTelegramId('');
      setAmount('');

      await loadWallet();
    } catch (error) {
      console.error('Transfer error:', error);
      setMessage('ارتباط با سرور برقرار نشد');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        در حال بارگذاری کیف پول...
      </div>
    );
  }

  const canClaim =
    miningSession &&
    miningSession.endsAt &&
    new Date(miningSession.endsAt).getTime() <= Date.now();

  return (
    <div style={{ paddingBottom: 90 }}>

      <header className="tasks-header">
        <div>
          <small>AVC Network</small>
          <h1>کیف پول</h1>
        </div>

        <div className="tasks-AVC">
          🪙 AVC
        </div>
      </header>

      <section
        className="balance-card"
        style={{ marginTop: 20 }}
      >
        <div>
          <small>موجودی شما</small>

          <h2 style={{ marginTop: 8 }}>
            {balance.toLocaleString()}
          </h2>

          <span>AVC</span>
        </div>
      </section>

      <section
        className="referral-card"
        style={{ marginTop: 20 }}
      >
        <div>
          <small>وضعیت Mining</small>

          <h2 style={{ marginTop: 8 }}>
            {mining
              ? 'Mining فعال است'
              : 'Mining آماده شروع است'}
          </h2>

          <p style={{ marginTop: 8 }}>
            نرخ فعلی: {miningRate} AVC
          </p>

          {miningSession && (
            <p style={{ marginTop: 6 }}>
              پایان:
              {' '}
              {new Date(
                miningSession.endsAt
              ).toLocaleString()}
            </p>
          )}

          {mining && (
            <button
              className="task-button"
              type="button"
              onClick={claimMining}
              disabled={!canClaim || claiming}
              style={{
                width: '100%',
                padding: 14,
                marginTop: 14,
                opacity:
                  !canClaim || claiming ? 0.6 : 1
              }}
            >
              {claiming
                ? 'در حال Claim...'
                : canClaim
                  ? 'Claim AVC'
                  : 'Mining هنوز تمام نشده'}
            </button>
          )}
        </div>
      </section>

      <div className="section-title">
        <h2>ارسال AVC</h2>
      </div>

      <section className="referral-card">

        <form onSubmit={sendAVC}>

          <div style={{ marginBottom: 14 }}>
            <label>
              Telegram ID گیرنده
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={telegramId}
              onChange={(e) =>
                setTelegramId(e.target.value)
              }
              placeholder="مثلاً 100000001"
              style={{
                width: '100%',
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: '1px solid #333',
                background: '#111827',
                color: '#fff'
              }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>
              مقدار AVC
            </label>

            <input
              type="number"
              min="100"
              max="1000"
              step="1"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="100 تا 1000"
              style={{
                width: '100%',
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: '1px solid #333',
                background: '#111827',
                color: '#fff'
              }}
            />
          </div>

          {message && (
            <div
              style={{
                marginBottom: 14,
                padding: 10,
                borderRadius: 10
              }}
            >
              {message}
            </div>
          )}

          <button
            className="task-button"
            type="submit"
            disabled={sending}
            style={{
              width: '100%',
              padding: 14
            }}
          >
            {sending
              ? 'در حال ارسال...'
              : 'ارسال AVC'}
          </button>

        </form>

      </section>

      <div className="section-title">
        <h2>تاریخچه تراکنش‌ها</h2>
      </div>

      <section className="task-list">

        {transactions.map((transaction) => {
          const value =
            Number(transaction.amount || 0);

          const received = value > 0;

          return (
            <article
              className="task-card"
              key={transaction.id}
            >
              <div className="task-icon">
                {received ? '📥' : '📤'}
              </div>

              <div className="task-info">
                <h3>
                  {transaction.type === 'mining_reward'
                    ? 'پاداش Mining'
                    : received
                      ? 'دریافت AVC'
                      : 'ارسال AVC'}
                </h3>

                <p>
                  {transaction.description ||
                    transaction.type}
                </p>

                <span className="reward">
                  {received ? '+' : ''}
                  {value.toLocaleString()} AVC
                </span>
              </div>
            </article>
          );
        })}

        {transactions.length === 0 && (
          <div className="empty-tasks">
            هنوز تراکنشی ثبت نشده است.
          </div>
        )}

      </section>

      <BottomNav
        active="wallet"
        onChange={onNavigate}
      />

    </div>
  );
}
