const { query } = require('../config/database');

async function createContract({
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

async function getMyContracts(influencerId) {
  const result = await query(
    `
      SELECT
        ic.*,
        c.title AS campaign_title,
        c.description AS campaign_description
      FROM influencer_contracts ic
      LEFT JOIN campaigns c ON c.id = ic.campaign_id
      WHERE ic.influencer_id = $1
      ORDER BY ic.created_at DESC
    `,
    [influencerId]
  );

  return result.rows;
}

async function findById(id, influencerId) {
  const result = await query(
    `
      SELECT *
      FROM influencer_contracts
      WHERE id = $1
        AND influencer_id = $2
      LIMIT 1
    `,
    [id, influencerId]
  );

  return result.rows[0] || null;
}

async function findByIdAdmin(id) {
  const result = await query(
    `
      SELECT
        ic.*,
        u.telegram_id,
        u.telegram_username,
        u.first_name,
        u.last_name,
        c.title AS campaign_title
      FROM influencer_contracts ic
      JOIN users u ON u.id = ic.influencer_id
      LEFT JOIN campaigns c ON c.id = ic.campaign_id
      WHERE ic.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function accept(id, influencerId) {
  const result = await query(
    `
      UPDATE influencer_contracts
      SET
        status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND influencer_id = $2
        AND status = 'pending'
      RETURNING *
    `,
    [id, influencerId]
  );

  return result.rows[0] || null;
}

async function reject(id, influencerId) {
  const result = await query(
    `
      UPDATE influencer_contracts
      SET
        status = 'rejected',
        updated_at = NOW()
      WHERE id = $1
        AND influencer_id = $2
        AND status = 'pending'
      RETURNING *
    `,
    [id, influencerId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createContract,
  getMyContracts,
  findById,
  findByIdAdmin,
  accept,
  reject
};
