const express = require('express');

const authController = require('../controllers/auth.controller');
const { authRateLimit } = require('../middleware/rateLimit.middleware');

const router = express.Router();

router.post(
  '/login',
  authRateLimit,
  authController.login
);

module.exports = router;
