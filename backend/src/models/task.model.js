const { query } = require('../config/database');

async function getActiveTasks() {
  const result = await query(`
    SELECT
      t.*,
      c.title AS campaign_title
    FROM tasks t
    LEFT JOIN campaigns c
      ON c.id = t.campaign_id
    WHERE t.status = 'active'
      AND (
        t.starts_at IS NULL
        OR t.starts_at <= NOW()
      )
      AND (
        t.ends_at IS NULL
        OR t.ends_at >= NOW()
      )
      AND (
        t.max_completions = 0
        OR t.completion_count < t.max_completions
      )
      AND (
        t.campaign_id IS NULL
        OR c.status = 'active'
      )
    ORDER BY t.created_at DESC
  `);

  return result.rows;
}

async function findById(id) {
  const result = await query(`
    SELECT
      t.*,
      c.title AS campaign_title
    FROM tasks t
    LEFT JOIN campaigns c
      ON c.id = t.campaign_id
    WHERE t.id = $1
    LIMIT 1
  `, [id]);

  return result.rows[0] || null;
}

module.exports = {
  getActiveTasks,
  findById
};
