const express = require('express');

const pointsController =
  require('../controllers/points.controller');

const { authenticate } =
  require('../middleware/auth.middleware');

const router = express.Router();

router.get(
  '/',
  authenticate,
  pointsController.getPoints
);

router.post(
  '/transfer',
  authenticate,
  pointsController.transferPoints
);

module.exports = router;
