const userModel = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const {
  success,
  created,
  notFound,
  error
} = require('../utils/response');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    return notFound(res, 'User not found');
  }

  return success(res, user, 'Profile retrieved successfully');
});

const createUser = asyncHandler(async (req, res) => {
  const {
    telegramId,
    telegramUsername,
    firstName,
    lastName,
    language
  } = req.body;

  if (!telegramId) {
    return error(res, 'telegramId is required', 400);
  }

  const existingUser = await userModel.findByTelegramId(telegramId);

  if (existingUser) {
    return success(res, existingUser, 'User already exists');
  }

  const user = await userModel.createUser({
    telegramId,
    telegramUsername,
    firstName,
    lastName,
    language
  });

  return created(res, user, 'User created successfully');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userModel.updateUser(
    req.user.id,
    {
      telegramUsername: req.body.telegramUsername,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      language: req.body.language
    }
  );

  if (!user) {
    return notFound(res, 'User not found');
  }

  return success(res, user, 'Profile updated successfully');
});

module.exports = {
  getProfile,
  createUser,
  updateProfile
};
