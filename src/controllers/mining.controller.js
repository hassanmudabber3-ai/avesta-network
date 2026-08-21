const miningModel = require('../models/mining.model');
const asyncHandler = require('../utils/asyncHandler');

const getStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const config = await miningModel.getConfig();

  if (!config) {
    return res.status(500).json({
      success: false,
      message: 'Mining configuration not found'
    });
  }

  const activeUsers = await miningModel.getActiveUserCount();
  const rate = await miningModel.getRate(activeUsers);

  let session = await miningModel.getActiveSession(userId);

  if (session) {
    const ads = await miningModel.getAdStats(session.id);

    return res.json({
      success: true,
      data: {
        mining: true,
        session: {
          id: session.id,
          startedAt: session.started_at,
          endsAt: session.ends_at,
          baseRate: Number(session.base_rate),
          adBoostPercent: Number(ads.boost_percent),
          requiredAds: Number(ads.required_ads),
          optionalAds: Number(ads.optional_ads)
        },
        rate,
        cycleHours: Number(config.cycle_hours),
        activeUsers
      }
    });
  }

  return res.json({
    success: true,
    data: {
      mining: false,
      session: null,
      rate,
      cycleHours: Number(config.cycle_hours),
      activeUsers
    }
  });
});

const startMining = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const config = await miningModel.getConfig();

  if (!config || !config.is_active) {
    return res.status(503).json({
      success: false,
      message: 'Mining is currently unavailable'
    });
  }

  const existing = await miningModel.getActiveSession(userId);

  if (existing) {
    return res.status(400).json({
      success: false,
      code: 'MINING_ALREADY_ACTIVE',
      message: 'Mining is already active',
      session: {
        id: existing.id,
        startedAt: existing.started_at,
        endsAt: existing.ends_at
      }
    });
  }

  const activeUsers = await miningModel.getActiveUserCount();
  const rate = await miningModel.getRate(activeUsers);

  const session = await miningModel.createSession({
    userId,
    baseRate: rate,
    cycleHours: Number(config.cycle_hours)
  });

  return res.status(201).json({
    success: true,
    message: 'Mining started successfully',
    data: {
      session: {
        id: session.id,
        startedAt: session.started_at,
        endsAt: session.ends_at,
        baseRate: Number(session.base_rate)
      },
      rate,
      cycleHours: Number(config.cycle_hours),
      activeUsers
    }
  });
});

const watchAd = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type } = req.body;

  if (!['required', 'optional'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid advertisement type'
    });
  }

  const session = await miningModel.getActiveSession(userId);

  if (!session) {
    return res.status(400).json({
      success: false,
      code: 'NO_ACTIVE_MINING',
      message: 'No active mining session'
    });
  }

  const config = await miningModel.getConfig();
  const ads = await miningModel.getAdStats(session.id);

  if (type === 'required') {
    if (Number(ads.required_ads) >= Number(config.required_ads)) {
      return res.status(400).json({
        success: false,
        code: 'REQUIRED_AD_ALREADY_WATCHED',
        message: 'Required advertisement already watched'
      });
    }

    await miningModel.addAdView({
      sessionId: session.id,
      userId,
      adType: 'required',
      boostPercent: 0
    });
  }

  if (type === 'optional') {
    if (Number(ads.optional_ads) >= Number(config.optional_ads)) {
      return res.status(400).json({
        success: false,
        code: 'OPTIONAL_AD_LIMIT_REACHED',
        message: 'Optional advertisement limit reached'
      });
    }

    await miningModel.addAdView({
      sessionId: session.id,
      userId,
      adType: 'optional',
      boostPercent: Number(config.ad_boost_percent)
    });
  }

  const updatedAds = await miningModel.getAdStats(session.id);

  return res.json({
    success: true,
    message: 'Advertisement recorded successfully',
    data: {
      requiredAds: Number(updatedAds.required_ads),
      optionalAds: Number(updatedAds.optional_ads),
      adBoostPercent: Number(updatedAds.boost_percent)
    }
  });
});


const claimMining = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await miningModel.claimMining(userId);

  if (!result.success) {
    const messages = {
      NO_ACTIVE_MINING:
        'Mining فعال برای Claim وجود ندارد',

      MINING_NOT_FINISHED:
        'هنوز زمان Mining به پایان نرسیده است',

      REQUIRED_ADS_NOT_COMPLETED:
        'تبلیغ اجباری Mining تکمیل نشده است',

      MINING_CONFIG_NOT_FOUND:
        'تنظیمات Mining پیدا نشد',

      INVALID_REWARD:
        'مقدار پاداش Mining نامعتبر است',

      ALREADY_CLAIMED:
        'این Mining قبلاً Claim شده است'
    };

    const status =
      result.code === 'MINING_CONFIG_NOT_FOUND' ? 500 :
      result.code === 'NO_ACTIVE_MINING' ? 400 :
      result.code === 'MINING_NOT_FINISHED' ? 400 :
      result.code === 'REQUIRED_ADS_NOT_COMPLETED' ? 400 :
      result.code === 'ALREADY_CLAIMED' ? 400 :
      400;

    return res.status(status).json({
      success: false,
      code: result.code,
      message: messages[result.code] || 'Mining claim failed',
      ...(result.endsAt ? { endsAt: result.endsAt } : {}),
      ...(result.requiredAds !== undefined ? {
        requiredAds: result.requiredAds,
        requiredAdsNeeded: result.requiredAdsNeeded
      } : {})
    });
  }

  return res.json({
    success: true,
    message: 'Mining reward claimed successfully',
    data: {
      sessionId: result.sessionId,
      baseRate: result.baseRate,
      adBoostPercent: result.adBoostPercent,
      reward: result.reward,
      token: 'AVC'
    }
  });
});

module.exports = {
  getStatus,
  startMining,
  watchAd,
  claimMining
};
