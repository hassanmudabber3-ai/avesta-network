const express = require('express');

const controller =
  require('../controllers/influencer.controller');

const {
  authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
  '/contracts',
  authenticate,
  controller.getMyContracts
);

router.post(
  '/contracts/:id/accept',
  authenticate,
  controller.acceptContract
);

router.post(
  '/contracts/:id/reject',
  authenticate,
  controller.rejectContract
);

module.exports = router;
