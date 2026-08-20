const express = require('express');

const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
  '/me',
  authenticate,
  userController.getProfile
);

router.post(
  '/',
  userController.createUser
);

router.patch(
  '/me',
  authenticate,
  userController.updateProfile
);

module.exports = router;
