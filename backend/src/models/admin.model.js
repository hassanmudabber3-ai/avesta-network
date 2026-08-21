const { query } = require('../config/database');

async function createInfluencerContract({
  influencerId,
  campaignId = null,
  title,
  description = null,
  targetUsers = 0,
  rewardPoints = 0,
  bonusPoints = 0
}) {
  const result = await query(
    `
      INSERT INTO influencer_contracts (
        influencer_id,
        campaign_id,
        title,
        description,
        target_users,
        reward_points,
        bonus_points,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
      RETURNING *
    `,
    [
      influencerId,
      campaignId,
      title,
      description,
      targetUsers,
      rewardPoints,
      bonusPoints
    ]
  );

  return result.rows[0];
}

async function findUserById(userId) {
  const result = await query(
    `
      SELECT id, telegram_id, telegram_username,
             first_name, last_name, role, status
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createInfluencerContract,
  findUserById
};
