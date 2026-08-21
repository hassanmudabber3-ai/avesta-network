function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
}

function errorHandler(err, req, res, next) {
  console.error('[ERROR]', {
    message: err.message,
    method: req.method,
    path: req.originalUrl,
    stack:
      process.env.NODE_ENV === 'production'
        ? undefined
        : err.stack
  });

  const statusCode =
    Number.isInteger(err.statusCode) && err.statusCode >= 400
      ? err.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
