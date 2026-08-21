const { query, pool } = require('../config/database');

async function getConfig() {
  const result = await query(`
    SELECT *
    FROM mining_config
    WHERE is_active = TRUE
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0] || null;
}

async function getActiveUserCount() {
  const result = await query(`
    SELECT COUNT(*)::BIGINT AS count
    FROM users
    WHERE status = 'active'
  `);

  return Number(result.rows[0].count);
}

async function getRate(activeUsers) {
  const result = await query(`
    SELECT rate_per_cycle
    FROM mining_rates
    WHERE min_active_users <= $1
      AND (
        max_active_users IS NULL
        OR max_active_users >= $1
      )
    ORDER BY min_active_users DESC
    LIMIT 1
  `, [activeUsers]);

  return result.rows[0]
    ? Number(result.rows[0].rate_per_cycle)
    : 0.32;
}

async function getActiveSession(userId) {
  const result = await query(`
    SELECT *
    FROM mining_sessions
    WHERE user_id = $1
      AND status = 'active'
    ORDER BY id DESC
    LIMIT 1
  `, [userId]);

  return result.rows[0] || null;
}

async function getLatestSession(userId) {
  const result = await query(`
    SELECT *
    FROM mining_sessions
    WHERE user_id = $1
    ORDER BY id DESC
    LIMIT 1
  `, [userId]);

  return result.rows[0] || null;
}

async function createSession({
  userId,
  baseRate,
  cycleHours
}) {
  const result = await query(`
    INSERT INTO mining_sessions (
      user_id,
      started_at,
      ends_at,
      base_rate,
      status
    )
    VALUES (
      $1,
      NOW(),
      NOW() + ($2 * INTERVAL '1 hour'),
      $3,
      'active'
    )
    RETURNING *
  `, [
    userId,
    cycleHours,
    baseRate
  ]);

  return result.rows[0];
}

async function addAdView({
  sessionId,
  userId,
  adType,
  boostPercent
}) {
  const result = await query(`
    INSERT INTO mining_ad_views (
      session_id,
      user_id,
      ad_type,
      boost_percent
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [
    sessionId,
    userId,
    adType,
    boostPercent
  ]);

  return result.rows[0];
}

async function getAdStats(sessionId) {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (
        WHERE ad_type = 'required'
      )::INTEGER AS required_ads,

      COUNT(*) FILTER (
        WHERE ad_type = 'optional'
      )::INTEGER AS optional_ads,

      COALESCE(SUM(boost_percent), 0)::NUMERIC
        AS boost_percent
    FROM mining_ad_views
    WHERE session_id = $1
  `, [sessionId]);

  return result.rows[0];
}


async function claimMining(userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(`
      SELECT *
      FROM mining_sessions
      WHERE user_id = $1
        AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
    `, [userId]);

    const session = sessionResult.rows[0];

    if (!session) {
      await client.query('ROLLBACK');
      return {
        success: false,
        code: 'NO_ACTIVE_MINING'
      };
    }

    if (new Date(session.ends_at).getTime() > Date.now()) {
      await client.query('ROLLBACK');
      return {
        success: false,
        code: 'MINING_NOT_FINISHED',
        endsAt: session.ends_at
      };
    }

    const adsResult = await client.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE ad_type = 'required'
        )::INTEGER AS required_ads,

        COUNT(*) FILTER (
          WHERE ad_type = 'optional'
        )::INTEGER AS optional_ads,

        COALESCE(SUM(boost_percent), 0)::NUMERIC
          AS boost_percent
      FROM mining_ad_views
      WHERE session_id = $1
    `, [session.id]);

    const ads = adsResult.rows[0];

    const configResult = await client.query(`
      SELECT *
      FROM mining_config
      WHERE is_active = TRUE
      ORDER BY id DESC
      LIMIT 1
    `);

    const config = configResult.rows[0];

    if (!config) {
      await client.query('ROLLBACK');
      return {
        success: false,
        code: 'MINING_CONFIG_NOT_FOUND'
      };
    }

    if (
      Number(ads.required_ads) <
      Number(config.required_ads)
    ) {
      await client.query('ROLLBACK');

      return {
        success: false,
        code: 'REQUIRED_ADS_NOT_COMPLETED',
        requiredAds: Number(ads.required_ads),
        requiredAdsNeeded: Number(config.required_ads)
      };
    }

    const boostPercent = Number(ads.boost_percent);
    const baseRate = Number(session.base_rate);

    const reward = Number(
      (baseRate * (1 + boostPercent / 100)).toFixed(8)
    );

    if (!Number.isFinite(reward) || reward <= 0) {
      await client.query('ROLLBACK');

      return {
        success: false,
        code: 'INVALID_REWARD'
      };
    }

    /*
     * Register AVC in the user's Wallet.
     *
     * reference_type + reference_id identify
     * this exact mining session.
     */
    const transactionResult = await client.query(`
      INSERT INTO point_transactions (
        user_id,
        amount,
        type,
        reference_type,
        reference_id,
        description
      )
      VALUES (
        $1,
        $2,
        'mining_reward',
        'mining_session',
        $3,
        $4
      )
      ON CONFLICT (
        user_id,
        type,
        reference_type,
        reference_id
      )
      DO NOTHING
      RETURNING id
    `, [
      userId,
      reward,
      session.id,
      `Mining reward for session #${session.id}`
    ]);

    /*
     * If the transaction already existed, this session
     * has effectively been claimed before.
     */
    if (transactionResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return {
        success: false,
        code: 'ALREADY_CLAIMED'
      };
    }

    await client.query(`
      INSERT INTO mining_ledger (
        user_id,
        session_id,
        amount,
        base_rate,
        ad_boost_percent
      )
      VALUES ($1, $2, $3, $4, $5)
    `, [
      userId,
      session.id,
      reward,
      baseRate,
      boostPercent
    ]);

    await client.query(`
      UPDATE mining_sessions
      SET
        claimed_at = NOW(),
        reward_amount = $2,
        status = 'claimed',
        updated_at = NOW()
      WHERE id = $1
    `, [
      session.id,
      reward
    ]);

    await client.query('COMMIT');

    return {
      success: true,
      sessionId: String(session.id),
      baseRate,
      adBoostPercent: boostPercent,
      reward: Number(reward.toFixed(8))
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getConfig,
  getActiveUserCount,
  getRate,
  getActiveSession,
  getLatestSession,
  createSession,
  addAdView,
  getAdStats,
  claimMining
};
