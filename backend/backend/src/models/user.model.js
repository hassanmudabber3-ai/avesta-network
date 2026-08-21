const { query } = require('../config/database');

async function createUser({
  telegramId,
  telegramUsername = null,
  firstName = null,
  lastName = null,
  language = 'en'
}) {
  const result = await query(
    `
      INSERT INTO users (
        telegram_id,
        telegram_username,
        first_name,
        last_name,
        language
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      telegramId,
      telegramUsername,
      firstName,
      lastName,
      language
    ]
  );

  return result.rows[0];
}

async function findById(id) {
  const result = await query(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function findByTelegramId(telegramId) {
  const result = await query(
    `
      SELECT *
      FROM users
      WHERE telegram_id = $1
      LIMIT 1
    `,
    [telegramId]
  );

  return result.rows[0] || null;
}

async function updateUser(id, fields = {}) {
  const allowedFields = {
    telegramUsername: 'telegram_username',
    firstName: 'first_name',
    lastName: 'last_name',
    language: 'language',
    role: 'role',
    status: 'status',
    isVerified: 'is_verified'
  };

  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!Object.prototype.hasOwnProperty.call(allowedFields, key)) {
      continue;
    }

    values.push(value);
    updates.push(`${allowedFields[key]} = $${values.length}`);
  }

  if (updates.length === 0) {
    return findById(id);
  }

  values.push(id);

  const result = await query(
    `
      UPDATE users
      SET
        ${updates.join(', ')},
        updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *
    `,
    values
  );

  return result.rows[0] || null;
}

async function updateLastLogin(id) {
  const result = await query(
    `
      UPDATE users
      SET
        last_login_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function setStatus(id, status) {
  const result = await query(
    `
      UPDATE users
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
  createUser,
  findById,
  findByTelegramId,
  updateUser,
  updateLastLogin,
  setStatus
};
