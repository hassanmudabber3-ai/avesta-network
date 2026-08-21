const { query } = require('../config/database');

async function completeTask(taskId, userId) {
  const clientResult = await query('BEGIN');

  try {
    const taskResult = await query(`
      SELECT *
      FROM tasks
      WHERE id = $1
        AND status = 'active'
      FOR UPDATE
    `, [taskId]);

    const task = taskResult.rows[0];

    if (!task) {
      await query('ROLLBACK');
      return {
        success: false,
        code: 'TASK_NOT_FOUND'
      };
    }

    const nowResult = await query(`
      SELECT NOW() AS now
    `);

    const now = nowResult.rows[0].now;

    if (
      task.starts_at &&
      new Date(task.starts_at) > new Date(now)
    ) {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'TASK_NOT_STARTED'
      };
    }

    if (
      task.ends_at &&
      new Date(task.ends_at) < new Date(now)
    ) {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'TASK_EXPIRED'
      };
    }

    if (
      Number(task.max_completions) > 0 &&
      Number(task.completion_count) >= Number(task.max_completions)
    ) {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'TASK_LIMIT_REACHED'
      };
    }

    const existingResult = await query(`
      SELECT id
      FROM task_completions
      WHERE task_id = $1
        AND user_id = $2
      LIMIT 1
    `, [taskId, userId]);

    if (existingResult.rows.length > 0) {
      await query('ROLLBACK');

      return {
        success: false,
        code: 'ALREADY_COMPLETED'
      };
    }

    const rewardPoints = Number(task.reward_points);

    const completionResult = await query(`
      INSERT INTO task_completions (
        task_id,
        user_id,
        reward_points
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
      taskId,
      userId,
      rewardPoints
    ]);

    const completion = completionResult.rows[0];

    await query(`
      UPDATE tasks
      SET
        completion_count = completion_count + 1,
        updated_at = NOW()
      WHERE id = $1
    `, [taskId]);

    if (rewardPoints > 0) {
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
          'task_reward',
          'task',
          $3,
          $4
        )
      `, [
        userId,
        rewardPoints,
        taskId,
        `Reward for completing task: ${task.title}`
      ]);
    }

    await query('COMMIT');

    return {
      success: true,
      completion,
      rewardPoints,
      task
    };

  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}

module.exports = {
  completeTask
};
