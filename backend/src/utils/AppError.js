class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

function badRequest(message = 'Bad request', code = 'BAD_REQUEST', details = null) {
  return new AppError(message, 400, code, details);
}

function unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', details = null) {
  return new AppError(message, 401, code, details);
}

function forbidden(message = 'Access denied', code = 'FORBIDDEN', details = null) {
  return new AppError(message, 403, code, details);
}

function notFound(message = 'Resource not found', code = 'NOT_FOUND', details = null) {
  return new AppError(message, 404, code, details);
}

function conflict(message = 'Resource conflict', code = 'CONFLICT', details = null) {
  return new AppError(message, 409, code, details);
}

module.exports = {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict
};
