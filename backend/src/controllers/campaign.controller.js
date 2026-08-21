const campaignModel =
  require('../models/campaign.model');

const asyncHandler =
  require('../utils/asyncHandler');

const {
  success,
  created,
  error,
  notFound
} = require('../utils/response');

const createCampaign = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    rewardPoints = 0,
    budgetPoints = 0,
    targetUsers = 0,
    startsAt,
    endsAt
  } = req.body;

  if (!title || !title.trim()) {
    return error(res, 'Campaign title is required', 400);
  }

  if (
    Number(rewardPoints) < 0 ||
    Number(budgetPoints) < 0 ||
    Number(targetUsers) < 0
  ) {
    return error(res, 'Campaign numeric values are invalid', 400);
  }

  const campaign = await campaignModel.createCampaign({
    title: title.trim(),
    description: description || null,
    rewardPoints: Number(rewardPoints),
    budgetPoints: Number(budgetPoints),
    targetUsers: Number(targetUsers),
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    createdBy: req.user.id
  });

  return created(
    res,
    campaign,
    'Campaign created successfully'
  );
});

const getActiveCampaigns = asyncHandler(async (req, res) => {
  const campaigns =
    await campaignModel.getActiveCampaigns();

  return success(
    res,
    campaigns,
    'Active campaigns retrieved successfully'
  );
});

const getAllCampaigns = asyncHandler(async (req, res) => {
  const campaigns =
    await campaignModel.getAllCampaigns();

  return success(
    res,
    campaigns,
    'Campaigns retrieved successfully'
  );
});

const updateCampaignStatus = asyncHandler(async (req, res) => {
  const allowed = [
    'draft',
    'active',
    'paused',
    'completed',
    'cancelled'
  ];

  const { status } = req.body;

  if (!allowed.includes(status)) {
    return error(res, 'Invalid campaign status', 400);
  }

  const campaign =
    await campaignModel.updateStatus(
      req.params.id,
      status
    );

  if (!campaign) {
    return notFound(res, 'Campaign not found');
  }

  return success(
    res,
    campaign,
    'Campaign status updated successfully'
  );
});

module.exports = {
  createCampaign,
  getActiveCampaigns,
  getAllCampaigns,
  updateCampaignStatus
};
