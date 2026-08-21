const { query } = require('../config/database');

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

module.exports = {
  getConfig,
  getActiveUserCount,
  getRate,
  getActiveSession,
  getLatestSession,
  createSession,
  addAdView,
  getAdStats
};
