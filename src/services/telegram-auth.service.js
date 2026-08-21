const crypto = require('crypto');
const config = require('../config');

function validateTelegramWebAppInitData(initData) {
  if (!config.telegram.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  if (!initData || typeof initData !== 'string') {
    throw new Error('Telegram initData is required');
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get('hash');

  if (!receivedHash) {
    throw new Error('Telegram initData hash is missing');
  }

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(config.telegram.botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const receivedBuffer = Buffer.from(receivedHash, 'hex');
  const calculatedBuffer = Buffer.from(calculatedHash, 'hex');

  if (
    receivedBuffer.length !== calculatedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, calculatedBuffer)
  ) {
    throw new Error('Invalid Telegram initData signature');
  }

  const authDate = Number(params.get('auth_date'));

  if (!Number.isFinite(authDate)) {
    throw new Error('Telegram auth_date is missing or invalid');
  }

  const maxAge = 24 * 60 * 60;
  const age = Math.floor(Date.now() / 1000) - authDate;

  if (age < 0 || age > maxAge) {
    throw new Error('Telegram initData has expired');
  }

  const userRaw = params.get('user');

  if (!userRaw) {
    throw new Error('Telegram user data is missing');
  }

  let user;

  try {
    user = JSON.parse(userRaw);
  } catch {
    throw new Error('Telegram user data is invalid');
  }

  if (!user.id) {
    throw new Error('Telegram user ID is missing');
  }

  return {
    user,
    authDate
  };
}

module.exports = {
  validateTelegramWebAppInitData
};
