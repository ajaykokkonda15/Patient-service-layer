'use strict';

const { Router } = require('express');
const adminService = require('../services/admin.service');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { ok, fail } = require('../helpers/response');

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

/**
 * POST /admin/create
 * Requires role: admin
 * Body: { first_name, last_name, email, password, role, phone?, address? }
 */
router.post('/create', requireRole('admin'), async (req, res) => {
  try {
    const result = await adminService.createAdmin(req.body, req.user);
    return ok(res, result, 201);
  } catch (err) {
    return fail(res, err.message, err.status || 500, req.originalUrl);
  }
});

/**
 * GET /admin/profile
 * Returns the logged-in admin's profile.
 */
router.get('/profile', async (req, res) => {
  try {
    const result = await adminService.getProfile(req.user.userId);
    return ok(res, result);
  } catch (err) {
    return fail(res, err.message, err.status || 500, req.originalUrl);
  }
});

/**
 * PUT /admin/profile
 * Body: { first_name?, last_name?, phone?, address? }
 */
router.put('/profile', async (req, res) => {
  try {
    const result = await adminService.updateProfile(req.user.userId, req.body);
    return ok(res, result);
  } catch (err) {
    return fail(res, err.message, err.status || 500, req.originalUrl);
  }
});

module.exports = router;
