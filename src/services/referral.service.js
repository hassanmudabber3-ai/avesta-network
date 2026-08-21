const referralModel = require('../models/referral.model');
const pointsModel = require('../models/points.model');

const REFERRAL_REWARD = 100;

async function completeReferral(referralId) {
  const referral = await referralModel.findById(referralId);

  if (!referral) {
    throw new Error('Referral not found');
  }

  if (referral.status === 'completed') {
    return referral;
  }

  const transaction = await pointsModel.createTransaction({
    userId: referral.referrer_id,
    amount: REFERRAL_REWARD,
    type: 'referral_reward',
    referenceType: 'referral',
    referenceId: referral.id,
    description: 'Referral reward'
  });

  if (!transaction) {
    const existing = await pointsModel.findByReference(
      referral.referrer_id,
      'referral_reward',
      'referral',
      referral.id
    );

    if (existing) {
      return referralModel.completeReferral(
        referral.id,
        REFERRAL_REWARD
      );
    }

    throw new Error('Unable to create referral reward');
  }

  return referralModel.completeReferral(
    referral.id,
    REFERRAL_REWARD
  );
}

module.exports = {
  REFERRAL_REWARD,
  completeReferral
};
