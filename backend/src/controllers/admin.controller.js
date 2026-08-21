const contractModel =
  require('../models/influencer-contract.model');

const userModel =
  require('../models/user.model');

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

const createInfluencerContract = asyncHandler(async (req, res) => {
  const {
    influencerId,
    campaignId = null,
    title,
    description = null,
    targetUsers = 0,
    rewardPoints = 0,
    bonusPoints = 0
  } = req.body;

  if (!influencerId) {
    return error(res, 'influencerId is required', 400);
  }

  if (!title || !String(title).trim()) {
    return error(res, 'Contract title is required', 400);
  }

  if (
    Number(targetUsers) < 0 ||
    Number(rewardPoints) < 0 ||
    Number(bonusPoints) < 0
  ) {
    return error(res, 'Contract numeric values are invalid', 400);
  }

  const influencer =
    await userModel.findById(influencerId);

  if (!influencer) {
    return notFound(res, 'Influencer not found');
  }

  if (
    influencer.role !== 'user' &&
    influencer.role !== 'moderator'
  ) {
    return error(
      res,
      'Selected account cannot receive an influencer contract',
      400
    );
  }

  if (campaignId) {
    const campaign =
      await campaignModel.findById(campaignId);

    if (!campaign) {
      return notFound(res, 'Campaign not found');
    }
  }

  const contract =
    await contractModel.createContract({
      influencerId: Number(influencerId),
      campaignId: campaignId
        ? Number(campaignId)
        : null,
      title: String(title).trim(),
      description,
      targetUsers: Number(targetUsers),
      rewardPoints: Number(rewardPoints),
      bonusPoints: Number(bonusPoints)
    });

  return created(
    res,
    contract,
    'Influencer contract created successfully'
  );
});

const getContract = asyncHandler(async (req, res) => {
  const contract =
    await contractModel.findByIdAdmin(req.params.id);

  if (!contract) {
    return notFound(res, 'Contract not found');
  }

  return success(
    res,
    contract,
    'Contract retrieved successfully'
  );
});

module.exports = {
  createInfluencerContract,
  getContract
};
