const express = require('express');

const controller =
  require('../controllers/admin.controller');

const {
  authenticate
} = require('../middleware/auth.middleware');

const {
  requireMinimumRole
} = require('../middleware/rbac.middleware');

const router = express.Router();

router.post(
  '/influencer-contracts',
  authenticate,
  requireMinimumRole('admin'),
  controller.createInfluencerContract
);

router.get(
  '/influencer-contracts/:id',
  authenticate,
  requireMinimumRole('admin'),
  controller.getContract
);

module.exports = router;
