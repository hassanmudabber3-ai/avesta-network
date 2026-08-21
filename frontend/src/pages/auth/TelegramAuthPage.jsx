import { useEffect, useState } from 'react';

const API_URL = 'https://alternatives-intensity-cadillac-productions.trycloudflare.com';

export default function TelegramAuthPage() {
  const [status, setStatus] = useState('در حال اتصال به Telegram...');

  useEffect(() => {
    const loginWithTelegram = async () => {
      try {
        if (!window.Telegram?.WebApp) {
          throw new Error(
            'این صفحه باید داخل Telegram Mini App اجرا شود.'
          );
        }

        const webApp = window.Telegram.WebApp;

        webApp.ready();
        webApp.expand();

        const initData = webApp.initData;

        if (!initData) {
          throw new Error(
            'Telegram initData دریافت نشد.'
          );
        }

        setStatus('در حال اعتبارسنجی Telegram...');

        const response = await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              initData
            })
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Telegram login failed'
          );
        }

        sessionStorage.setItem(
          'avc_token',
          result.data.token
        );

        sessionStorage.setItem(
          'avc_user',
          JSON.stringify(result.data.user)
        );

        setStatus('ورود با موفقیت انجام شد.');

        console.log(
          'AVC Telegram Login:',
          result.data.user
        );
      } catch (err) {
        console.error('Telegram login error:', err);

        setStatus(
          err.message || 'خطا در ورود به سیستم'
        );
      }
    };

    loginWithTelegram();
  }, []);

  return (
    <div>
      <h1>Avesta Network</h1>
      <p>{status}</p>
    </div>
  );
}
