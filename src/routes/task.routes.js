const express = require('express');

const controller =
  require('../controllers/task.controller');

const {
  authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
  '/active',
  authenticate,
  controller.getActiveTasks
);

router.get(
  '/:id',
  authenticate,
  controller.getTask
);

router.post(
  '/:id/complete',
  authenticate,
  controller.completeTask
);

module.exports = router;
