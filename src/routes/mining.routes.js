const express = require('express');

const miningController =
  require('../controllers/mining.controller');

const { authenticate } =
  require('../middleware/auth.middleware');

const router = express.Router();

router.get(
  '/status',
  authenticate,
  miningController.getStatus
);

router.post(
  '/start',
  authenticate,
  miningController.startMining
);

router.post(
  '/ad',
  authenticate,
  miningController.watchAd
);

module.exports = router;
