'use strict';

const { Admin } = require('../models/admin.model');
const roleService = require('./role.service');

/**
 * Create a new admin.
 * @param {{ first_name, last_name, email, phone?, address?, password, role }} data
 * @param {{ userId, role, is_master }} currentUser - the authenticated caller
 */
async function createAdmin(data, currentUser) {
  const { role: roleName, ...adminData } = data;

  // Only a master admin can create another admin-role user
  if (roleName === 'admin' && !currentUser?.is_master) {
    const err = new Error('Only a master admin can create other admin users');
    err.status = 403;
    throw err;
  }

  const existing = await Admin.findOne({ email: adminData.email.toLowerCase() });
  if (existing) {
    const err = new Error('Admin with this email already exists');
    err.status = 409;
    throw err;
  }

  const role = await roleService.findByName(roleName);
  if (!role) {
    const err = new Error(`Role '${roleName}' not found`);
    err.status = 404;
    throw err;
  }

  const newAdmin = new Admin({ ...adminData, role: role._id });
  const saved = await newAdmin.save();

  const result = saved.toObject();
  delete result.password;
  return result;
}

/**
 * Get the profile of an admin by their MongoDB ObjectId string.
 * @param {string} adminId
 */
async function getProfile(adminId) {
  const admin = await Admin.findById(adminId).populate('role', 'name permissions');
  if (!admin) {
    const err = new Error('Admin profile not found');
    err.status = 404;
    throw err;
  }
  const result = admin.toObject();
  delete result.password;
  return result;
}

/**
 * Update a limited set of profile fields for an admin.
 * @param {string} adminId
 * @param {{ first_name?, last_name?, phone?, address? }} updateData
 */
async function updateProfile(adminId, updateData) {
  // Whitelist allowed update fields
  const allowed = ['first_name', 'last_name', 'phone', 'address'];
  const safeUpdate = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) safeUpdate[key] = updateData[key];
  }

  const updated = await Admin.findByIdAndUpdate(
    adminId,
    { $set: safeUpdate },
    { new: true, runValidators: true }
  ).populate('role', 'name permissions');

  if (!updated) {
    const err = new Error('Admin profile not found');
    err.status = 404;
    throw err;
  }

  const result = updated.toObject();
  delete result.password;
  return result;
}

/**
 * Find an admin by email (case-insensitive), with role populated.
 * @param {string} email
 */
function findByEmail(email) {
  return Admin.findOne({ email: email.toLowerCase() }).populate('role', 'name');
}

module.exports = { createAdmin, getProfile, updateProfile, findByEmail };
