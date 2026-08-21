const ROLE_LEVELS = Object.freeze({
  user: 10,
  moderator: 20,
  admin: 30,
  super_admin: 40
});

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';

    if (!ROLE_LEVELS[userRole]) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

function requireMinimumRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';

    const userLevel = ROLE_LEVELS[userRole];
    const requiredLevel = ROLE_LEVELS[minimumRole];

    if (!userLevel || !requiredLevel) {
      return res.status(403).json({
        success: false,
        message: 'Invalid role configuration'
      });
    }

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

module.exports = {
  ROLE_LEVELS,
  requireRole,
  requireMinimumRole
};
