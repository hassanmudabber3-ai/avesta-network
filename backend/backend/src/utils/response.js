function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function created(res, data = null, message = 'Created successfully') {
  return success(res, data, message, 201);
}

function error(
  res,
  message = 'Request failed',
  statusCode = 400,
  errors = []
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

function unauthorized(res, message = 'Authentication required') {
  return error(res, message, 401);
}

function forbidden(res, message = 'Access denied') {
  return error(res, message, 403);
}

function notFound(res, message = 'Resource not found') {
  return error(res, message, 404);
}

module.exports = {
  success,
  created,
  error,
  unauthorized,
  forbidden,
  notFound
};
