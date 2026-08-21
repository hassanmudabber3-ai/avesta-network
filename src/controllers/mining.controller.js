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

module.exports = {
  getStatus,
  startMining,
  watchAd
};
