const { query } = require('../config/database');

async function createCampaign({
  title,
  description = null,
  rewardPoints = 0,
  budgetPoints = 0,
  targetUsers = 0,
  startsAt = null,
  endsAt = null,
  createdBy
}) {
  const result = await query(
    `
      INSERT INTO campaigns (
        title,
        description,
        reward_points,
        budget_points,
        target_users,
        starts_at,
        ends_at,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `,
    [
      title,
      description,
      rewardPoints,
      budgetPoints,
      targetUsers,
      startsAt,
      endsAt,
      createdBy
    ]
  );

  return result.rows[0];
}

async function findById(id) {
  const result = await query(
    `
      SELECT *
      FROM campaigns
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function getActiveCampaigns() {
  const result = await query(
    `
      SELECT *
      FROM campaigns
      WHERE status = 'active'
        AND (
          starts_at IS NULL
          OR starts_at <= NOW()
        )
        AND (
          ends_at IS NULL
          OR ends_at >= NOW()
        )
      ORDER BY created_at DESC
    `
  );

  return result.rows;
}

async function getAllCampaigns() {
  const result = await query(
    `
      SELECT *
      FROM campaigns
      ORDER BY created_at DESC
    `
  );

  return result.rows;
}

async function updateStatus(id, status) {
  const result = await query(
    `
      UPDATE campaigns
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [status, id]
  );

  return result.rows[0] || null;
}

module.exports = {
  createCampaign,
  findById,
  getActiveCampaigns,
  getAllCampaigns,
  updateStatus
};
