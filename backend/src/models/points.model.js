const { query } = require('../config/database');

async function findByReference(
  userId,
  type,
  referenceType,
  referenceId
) {
  const result = await query(
    `
      SELECT *
      FROM point_transactions
      WHERE user_id = $1
        AND type = $2
        AND reference_type = $3
        AND reference_id = $4
      LIMIT 1
    `,
    [userId, type, referenceType, referenceId]
  );

  return result.rows[0] || null;
}

async function getBalance(userId) {
  const result = await query(
    `
      SELECT COALESCE(SUM(amount), 0)::BIGINT AS balance
      FROM point_transactions
      WHERE user_id = $1
    `,
    [userId]
  );

  return Number(result.rows[0].balance);
}

async function createTransaction({
  userId,
  amount,
  type,
  referenceType = null,
  referenceId = null,
  description = null
}) {
  if (!userId) {
    throw new Error('userId is required');
  }

  if (!Number.isInteger(Number(amount)) || Number(amount) === 0) {
    throw new Error('Point transaction amount must be a non-zero integer');
  }

  if (!type) {
    throw new Error('Point transaction type is required');
  }

  /*
   * When a reference exists, the database unique index guarantees
   * that the same reward cannot be created twice.
   *
   * ON CONFLICT DO NOTHING makes this operation idempotent.
   */
  const result = await query(
    `
      INSERT INTO point_transactions (
        user_id,
        amount,
        type,
        reference_type,
        reference_id,
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (
        user_id,
        type,
        reference_type,
        reference_id
      )
      DO NOTHING
      RETURNING *
    `,
    [
      userId,
      Number(amount),
      type,
      referenceType,
      referenceId,
      description
    ]
  );

  return result.rows[0] || null;
}

async function getTransactions(userId, limit = 50, offset = 0) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  const safeOffset = Math.max(
    Number(offset) || 0,
    0
  );

  const result = await query(
    `
      SELECT *
      FROM point_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, safeLimit, safeOffset]
  );

  return result.rows;
}


async function transferPoints({
  senderId,
  receiverTelegramId,
  amount
}) {
  const value = Number(amount);

  if (!Number.isInteger(value)) {
    return {
      success: false,
      code: 'INVALID_AMOUNT'
    };
  }

  if (value < 100 || value > 1000) {
    return {
      success: false,
      code: 'AMOUNT_OUT_OF_RANGE'
    };
  }

  await query('BEGIN');

  try {
    const senderResult = await query(`
      SELECT
        id,
        telegram_id,
        first_name,
        telegram_username,
        status
      FROM users
      WHERE id = $1
      FOR UPDATE
    `, [senderId]);

    const sender = senderResult.rows[0];

    if (!sender || sender.status !== 'active') {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'SENDER_NOT_FOUND'
      };
    }

    const receiverResult = await query(`
      SELECT
        id,
        telegram_id,
        first_name,
        telegram_username,
        status
      FROM users
      WHERE telegram_id = $1
      FOR UPDATE
    `, [String(receiverTelegramId)]);

    const receiver = receiverResult.rows[0];

    if (!receiver || receiver.status !== 'active') {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'RECEIVER_NOT_FOUND'
      };
    }

    if (Number(sender.id) === Number(receiver.id)) {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'SELF_TRANSFER'
      };
    }

    const balanceResult = await query(`
      SELECT
        COALESCE(SUM(amount), 0)::BIGINT AS balance
      FROM point_transactions
      WHERE user_id = $1
    `, [sender.id]);

    const senderBalance =
      Number(balanceResult.rows[0].balance);

    if (senderBalance < value) {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'INSUFFICIENT_BALANCE',
        balance: senderBalance
      };
    }

    const referenceIdResult = await query(`
      SELECT nextval(
        pg_get_serial_sequence(
          'point_transactions',
          'id'
        )
      ) AS id
    `);

    const referenceId =
      Number(referenceIdResult.rows[0].id);

    await query(`
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
        'transfer',
        'transfer',
        $3,
        $4
      )
    `, [
      sender.id,
      -value,
      referenceId,
      `AVC sent to Telegram ID ${receiver.telegram_id}`
    ]);

    await query(`
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
        'transfer',
        'transfer',
        $3,
        $4
      )
    `, [
      receiver.id,
      value,
      referenceId,
      `AVC received from Telegram ID ${sender.telegram_id}`
    ]);

    await query('COMMIT');

    return {
      success: true,
      amount: value,
      sender: {
        id: sender.id,
        telegramId: String(sender.telegram_id)
      },
      receiver: {
        id: receiver.id,
        telegramId: String(receiver.telegram_id),
        firstName: receiver.first_name,
        telegramUsername: receiver.telegram_username
      },
      balance: senderBalance - value
    };
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}
module.exports = {
  findByReference,
  getBalance,
  createTransaction,
  getTransactions,
  transferPoints
};
