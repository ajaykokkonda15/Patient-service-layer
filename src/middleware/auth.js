'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../helpers/response');

/**
 * JWT authentication middleware.
 * Extracts Bearer token → verifies → attaches payload to req.user.
 * Returns 401 if token is missing or invalid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return fail(res, 'Authentication token is missing', 401, req.originalUrl);
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS512'] });
    req.user = payload;
    next();
  } catch {
    return fail(res, 'Invalid or expired authentication token', 401, req.originalUrl);
  }
}

module.exports = { requireAuth };
