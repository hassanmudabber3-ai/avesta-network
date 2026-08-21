const taskModel = require('../models/task.model');
const taskService = require('../services/task.service');

const asyncHandler = require('../utils/asyncHandler');

const {
  success,
  notFound,
  error
} = require('../utils/response');

const getActiveTasks = asyncHandler(async (req, res) => {
  const tasks = await taskModel.getActiveTasks();

  return success(
    res,
    tasks,
    'Active tasks retrieved successfully'
  );
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskModel.findById(req.params.id);

  if (!task) {
    return notFound(res, 'Task not found');
  }

  return success(
    res,
    task,
    'Task retrieved successfully'
  );
});

const completeTask = asyncHandler(async (req, res) => {
  const result = await taskService.completeTask(
    req.params.id,
    req.user.id
  );

  if (!result.success) {
    const messages = {
      TASK_NOT_FOUND: 'Task not found or inactive',
      TASK_NOT_STARTED: 'Task has not started yet',
      TASK_EXPIRED: 'Task has expired',
      TASK_LIMIT_REACHED: 'Task completion limit has been reached',
      ALREADY_COMPLETED: 'You have already completed this task'
    };

    const statusCodes = {
      TASK_NOT_FOUND: 404,
      TASK_NOT_STARTED: 400,
      TASK_EXPIRED: 400,
      TASK_LIMIT_REACHED: 400,
      ALREADY_COMPLETED: 409
    };

    return error(
      res,
      messages[result.code] || 'Task could not be completed',
      statusCodes[result.code] || 400
    );
  }

  return success(
    res,
    {
      completion: result.completion,
      rewardPoints: result.rewardPoints,
      task: result.task
    },
    'Task completed successfully'
  );
});

module.exports = {
  getActiveTasks,
  getTask,
  completeTask
};
