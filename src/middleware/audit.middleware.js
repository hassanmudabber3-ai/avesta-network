const { createAuditLog } = require('../services/audit.service');

function auditMiddleware(req, res, next) {
  res.on('finish', () => {
    const userId = req.user?.id || null;

    createAuditLog({
      userId,
      action: `${req.method} ${req.path}`,
      category: req.path.startsWith('/api/auth')
        ? 'authentication'
        : 'api',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      ipAddress: req.ip || null,
      userAgent: req.get('user-agent') || null
    }).catch((error) => {
      console.error('Audit log error:', error.message);
    });
  });

  next();
}

module.exports = {
  auditMiddleware
};
