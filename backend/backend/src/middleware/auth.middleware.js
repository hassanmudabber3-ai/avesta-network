const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing'
    });
  }

  if (!config.auth.jwtSecret) {
    console.error('JWT_SECRET is not configured');

    return res.status(500).json({
      success: false,
      message: 'Authentication service is not configured'
    });
  }

  try {
    const payload = jwt.verify(token, config.auth.jwtSecret);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
}

module.exports = {
  authenticate
};
