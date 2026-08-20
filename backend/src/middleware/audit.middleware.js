function audit(action, options = {}) {
  const {
    category = 'system',
    includeBody = false
  } = options;

  return (req, res, next) => {
    const startedAt = Date.now();

    res.on('finish', () => {
      const userId = req.user?.id || null;

      const auditRecord = {
        action,
        category,
        userId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        ip:
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress ||
          null,
        userAgent: req.headers['user-agent'] || null,
        timestamp: new Date().toISOString()
      };

      if (includeBody) {
        auditRecord.body = sanitizeBody(req.body);
      }

      console.log('[AUDIT]', JSON.stringify(auditRecord));
    });

    next();
  };
}

function sanitizeBody(body = {}) {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'jwt',
    'secret',
    'apiKey',
    'privateKey'
  ];

  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

module.exports = {
  audit
};
