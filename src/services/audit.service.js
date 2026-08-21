const { query } = require('../config/database');

async function createAuditLog({
  userId = null,
  action,
  category = 'system',
  method = null,
  path = null,
  statusCode = null,
  ipAddress = null,
  userAgent = null,
  metadata = null
}) {
  const result = await query(
    `
      INSERT INTO audit_logs (
        user_id,
        action,
        category,
        method,
        path,
        status_code,
        ip_address,
        user_agent,
        metadata
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9
      )
      RETURNING *
    `,
    [
      userId,
      action,
      category,
      method,
      path,
      statusCode,
      ipAddress,
      userAgent,
      metadata
    ]
  );

  return result.rows[0];
}

module.exports = {
  createAuditLog
};
