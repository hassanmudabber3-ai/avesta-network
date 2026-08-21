const jwt = require('jsonwebtoken');

const config = require('../config');
const userModel = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const {
  success,
  error
} = require('../utils/response');

const {
  validateTelegramWebAppInitData
} = require('../services/telegram-auth.service');

function createToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      id: user.id,
      telegramId: String(user.telegram_id),
      role: user.role
    },
    config.auth.jwtSecret,
    {
      expiresIn: config.auth.jwtExpiresIn
    }
  );
}

const login = asyncHandler(async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return error(res, 'Telegram initData is required', 400);
  }

  if (!config.auth.jwtSecret) {
    return error(
      res,
      'Authentication service is not configured',
      500
    );
  }

  let telegram;

  try {
    telegram = validateTelegramWebAppInitData(initData);
  } catch (validationError) {
    return error(
      res,
      validationError.message,
      401
    );
  }

  const telegramUser = telegram.user;

  const telegramId = String(telegramUser.id);

  const telegramUsername =
    telegramUser.username || null;

  const firstName =
    telegramUser.first_name || null;

  const lastName =
    telegramUser.last_name || null;

  const language =
    telegramUser.language_code || 'en';

  let user = await userModel.findByTelegramId(telegramId);

  if (!user) {
    user = await userModel.createUser({
      telegramId,
      telegramUsername,
      firstName,
      lastName,
      language
    });
  } else {
    user = await userModel.updateUser(user.id, {
      telegramUsername,
      firstName,
      lastName,
      language
    });
  }

  await userModel.updateLastLogin(user.id);

  const token = createToken(user);

  return success(
    res,
    {
      token,
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        telegramUsername: user.telegram_username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        language: user.language
      }
    },
    'Login successful'
  );
});

module.exports = {
  login
};
