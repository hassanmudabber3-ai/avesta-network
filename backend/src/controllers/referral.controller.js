const crypto = require('crypto');

const userModel = require('../models/user.model');
const referralModel = require('../models/referral.model');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');

function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

async function ensureReferralCode(userId) {
  const user = await userModel.findById(userId);

  if (!user) return null;

  if (user.referral_code) {
    return user.referral_code;
  }

  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();

    try {
      const updated = await userModel.updateUser(
        userId,
        { referralCode: code }
      );

      if (updated) return code;
    } catch (err) {
      if (err.code !== '23505') throw err;
    }
  }

  throw new Error('Unable to generate referral code');
}

const getReferralInfo = asyncHandler(async (req, res) => {
  const code = await ensureReferralCode(req.user.id);

  const referrals =
    await referralModel.getMyReferrals(req.user.id);

  const stats =
    await referralModel.getReferralStats(req.user.id);

  return success(
    res,
    {
      referralCode: code,
      referrals,
      stats
    },
    'Referral information retrieved successfully'
  );
});

const applyReferral = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return error(res, 'Referral code is required', 400);
  }

  const referrer = await referralModel.findByCode(
    String(code).trim().toUpperCase()
  );

  if (!referrer) {
    return error(res, 'Invalid referral code', 404);
  }

  if (Number(referrer.id) === Number(req.user.id)) {
    return error(
      res,
      'You cannot use your own referral code',
      400
    );
  }

  const referral = await referralModel.createReferral({
    referrerId: referrer.id,
    referredId: req.user.id
  });

  if (!referral) {
    return error(
      res,
      'Referral has already been applied',
      409
    );
  }

  return success(
    res,
    referral,
    'Referral applied successfully'
  );
});

module.exports = {
  getReferralInfo,
  applyReferral
};
