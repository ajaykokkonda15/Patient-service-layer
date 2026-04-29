'use strict';

const { fail } = require('../helpers/response');

/**
 * Role-based access control middleware factory.
 * Usage: router.use(requireRole('admin'))
 *        router.post('/create', requireRole('admin', 'manager'), handler)
 *
 * Expects req.user to have been set by requireAuth middleware first.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return fail(res, 'Access denied: user role not found', 403, req.originalUrl);
    }

    if (!roles.includes(req.user.role)) {
      return fail(
        res,
        `Access denied: requires one of [${roles.join(', ')}]`,
        403,
        req.originalUrl
      );
    }

    next();
  };
}

module.exports = { requireRole };
