'use strict';

const { Router } = require('express');
const authService = require('../services/auth.service');
const { requireAuth } = require('../middleware/auth');
const { ok, fail } = require('../helpers/response');

const router = Router();

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return ok(res, result);
  } catch (err) {
    return fail(res, err.message, err.status || 500, req.originalUrl);
  }
});

/**
 * POST /auth/logout
 * Requires: Bearer token
 */
router.post('/logout', requireAuth, (req, res) => {
  const result = authService.logout();
  return ok(res, result);
});

module.exports = router;
