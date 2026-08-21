const { query } = require('../config/database');

async function findByCode(code) {
  const result = await query(
    `SELECT * FROM users WHERE referral_code = $1 LIMIT 1`,
    [code]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `
      SELECT *
      FROM referrals
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function createReferral({
  referrerId,
  referredId,
  rewardPoints = 0
}) {
  const result = await query(
    `
      INSERT INTO referrals (
        referrer_id,
        referred_id,
        reward_points,
        status
      )
      VALUES ($1, $2, $3, 'pending')
      ON CONFLICT (referred_id) DO NOTHING
      RETURNING *
    `,
    [referrerId, referredId, rewardPoints]
  );

  return result.rows[0] || null;
}

async function completeReferral(id, rewardPoints) {
  const result = await query(
    `
      UPDATE referrals
      SET
        status = 'completed',
        reward_points = $2,
        completed_at = NOW()
      WHERE id = $1
        AND status = 'pending'
      RETURNING *
    `,
    [id, rewardPoints]
  );

  return result.rows[0] || null;
}

async function getMyReferrals(userId) {
  const result = await query(
    `
      SELECT
        r.id,
        r.reward_points,
        r.status,
        r.created_at,
        r.completed_at,
        u.id AS user_id,
        u.telegram_username,
        u.first_name,
        u.last_name
      FROM referrals r
      JOIN users u ON u.id = r.referred_id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

async function getReferralStats(userId) {
  const result = await query(
    `
      SELECT
        COUNT(*)::INT AS total,
        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::INT AS completed,
        COALESCE(SUM(reward_points), 0)::BIGINT AS reward_points
      FROM referrals
      WHERE referrer_id = $1
    `,
    [userId]
  );

  return result.rows[0];
}

module.exports = {
  findByCode,
  findById,
  createReferral,
  completeReferral,
  getMyReferrals,
  getReferralStats
};
