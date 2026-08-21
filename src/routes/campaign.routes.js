const express = require('express');

const controller =
  require('../controllers/campaign.controller');

const { authenticate } =
  require('../middleware/auth.middleware');

const { requireMinimumRole } =
  require('../middleware/rbac.middleware');

const router = express.Router();

/*
 * Public authenticated users:
 * Can see currently active campaigns.
 */
router.get(
  '/active',
  authenticate,
  controller.getActiveCampaigns
);

/*
 * Admin area:
 * Campaign management is restricted.
 */
router.get(
  '/',
  authenticate,
  requireMinimumRole('admin'),
  controller.getAllCampaigns
);

router.post(
  '/',
  authenticate,
  requireMinimumRole('admin'),
  controller.createCampaign
);

router.patch(
  '/:id/status',
  authenticate,
  requireMinimumRole('admin'),
  controller.updateCampaignStatus
);

module.exports = router;
