# AVC Project Status

## Current progress

- Backend: Node.js/Express
- Backend port: 3000
- Frontend: React + Vite
- Frontend port: 5173
- Telegram WebApp SDK added to frontend/index.html
- Telegram initData validation implemented in backend
- Telegram login endpoint: POST /api/auth/login
- Frontend build: SUCCESS

## Current Backend Tunnel

https://alternatives-intensity-cadillac-productions.trycloudflare.com

Note: Cloudflare Quick Tunnel URLs are temporary and may change.

## Frontend Telegram Login

File:
frontend/src/pages/auth/TelegramAuthPage.jsx

It sends:
POST /api/auth/login

with:
{
  "initData": Telegram.WebApp.initData
}

## Next steps

1. Start frontend on port 5173.
2. Create Cloudflare tunnel for frontend.
3. Open frontend through the public tunnel.
4. Open it as a Telegram Mini App.
5. Test real Telegram initData.
6. Test login and JWT.
7. Verify /api/users/me.
8. Continue AVC application development.
